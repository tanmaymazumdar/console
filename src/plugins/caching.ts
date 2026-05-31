import { createRequire } from 'module'

import 'fastify'
import fastifyCaching from '@fastify/caching'
import fp from 'fastify-plugin'
import { Redis } from 'ioredis'

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

const require = createRequire(import.meta.url)
const abstractCache = require('abstract-cache')

interface CacheItem {
  statusCode: number
  headers: Record<string, string | string[] | number | undefined>
  payload: string | Buffer
}

interface CacheStore {
  get: (key: string, callback: (err: Error | null, result?: { item: CacheItem } | null) => void) => void
  set: (key: string, value: CacheItem, ttl: number, callback: (err: Error | null) => void) => void
}

export default fp(async function cachingPlugin(fastify: FastifyInstance) {
  // A. Initialize Cache Store (Redis with Resilient Fallback)
  const REDIS_ENABLED = process.env.REDIS_ENABLED !== 'false'
  const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1'
  const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379

  let cacheStore: CacheStore | undefined

  if (REDIS_ENABLED) {
    try {
      const redis = new Redis({
        host: REDIS_HOST,
        port: REDIS_PORT,
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        connectTimeout: 2000
      })

      redis.on('error', (err: Error) => {
        fastify.log.debug(`Redis error: ${err.message}`)
      })

      await redis.connect().catch((err: Error) => {
        fastify.log.warn(`Redis connection failed: ${err.message}. Falling back to in-memory LRU cache.`)
        try {
          redis.disconnect()
        } catch {
          // ignore
        }
      })

      if (redis.status === 'ready' || redis.status === 'connecting') {
        fastify.log.info(`Connected to Redis cache at ${REDIS_HOST}:${REDIS_PORT}`)
        cacheStore = abstractCache({
          driver: {
            name: 'abstract-cache-redis',
            options: { client: redis }
          }
        }) as CacheStore
      }
    } catch (err) {
      fastify.log.warn(`Redis setup failed: ${(err as Error).message}. Falling back to in-memory LRU cache.`)
    }
  }

  if (!cacheStore) {
    cacheStore = abstractCache({
      driver: {
        name: 'abstract-cache'
      }
    }) as CacheStore
    fastify.log.info('Using in-memory LRU cache store.')
  }

  // B. Register @fastify/caching
  await fastify.register(fastifyCaching, {
    cache: cacheStore as never
  })

  // C. Promise wrappers
  const getCachedItem = (key: string): Promise<{ item: CacheItem } | null | undefined> => {
    return new Promise((resolve, reject) => {
      if (!fastify.cache) {
        resolve(null)
        return
      }
      ;(fastify.cache as unknown as CacheStore).get(key, (err, result) => {
        if (err) reject(err)
        else resolve(result)
      })
    })
  }

  const setCachedItem = (key: string, value: CacheItem, ttlInMs: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!fastify.cache) {
        resolve()
        return
      }
      ;(fastify.cache as unknown as CacheStore).set(key, value, ttlInMs, err => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  // D. Default Key Generator
  function defaultKeyGenerator(request: FastifyRequest): string {
    const parts = [request.method, request.url.split('?')[0]]

    if (request.query && typeof request.query === 'object') {
      const queryObj = request.query as Record<string, unknown>
      const sortedQuery = Object.keys(queryObj)
        .sort()
        .map(key => `${key}=${JSON.stringify(queryObj[key])}`)
        .join('&')
      if (sortedQuery) parts.push(`q:${sortedQuery}`)
    }

    const volatileHeaders = [
      'host',
      'user-agent',
      'connection',
      'content-length',
      'cookie',
      'authorization',
      'x-request-id',
      'accept-encoding'
    ]
    const relevantHeaders = Object.keys(request.headers)
      .filter(h => !volatileHeaders.includes(h.toLowerCase()))
      .sort()
      .map(h => `${h}=${request.headers[h]}`)
      .join(',')
    if (relevantHeaders) parts.push(`h:${relevantHeaders}`)

    if (request.body && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
      parts.push(`b:${JSON.stringify(request.body)}`)
    }

    return parts.join('|')
  }

  // E. preHandler Hook
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    const cacheConfig = request.routeOptions.config.cache
    if (!cacheConfig) return

    const ttlInSeconds = cacheConfig.ttl ?? 86400

    if (cacheConfig.static) {
      try {
        const cacheControlHeader = cacheConfig.cacheControl || `public, max-age=${ttlInSeconds}`
        reply.header('Cache-Control', cacheControlHeader)

        const expiresDate = new Date(Date.now() + ttlInSeconds * 1000)
        reply.header('Expires', expiresDate.toUTCString())

        const etagValue = `"${request.url}-v1"`
        reply.header('ETag', etagValue)

        const ifNoneMatch = request.headers['if-none-match']
        if (ifNoneMatch === etagValue) {
          reply.code(304).send()
          return reply
        }
      } catch (err) {
        request.log.error(err, 'Failed to set static cache headers')
      }
      return
    }

    reply.header('X-Cache', 'MISS')

    if (!fastify.cache) {
      request.log.warn('fastify.cache is not available. Skipping server-side cache lookup.')
      return
    }

    const keyGen = cacheConfig.keyGenerator || defaultKeyGenerator
    const cacheKey = keyGen(request)
    request._cacheKey = cacheKey

    try {
      const cached = await getCachedItem(cacheKey)
      if (cached?.item) {
        const { statusCode, headers, payload } = cached.item

        if (headers) {
          for (const [key, value] of Object.entries(headers)) {
            reply.header(key, value)
          }
        }

        reply.header('X-Cache', 'HIT')
        reply.code(statusCode).send(payload)
        return reply
      }
    } catch (err) {
      request.log.error({ err, cacheKey }, 'Failed to retrieve item from cache')
    }
  })

  // F. onSend Hook
  fastify.addHook('onSend', async (request: FastifyRequest, reply: FastifyReply, payload: string | Buffer) => {
    const cacheConfig = request.routeOptions.config.cache
    if (!cacheConfig || cacheConfig.static) {
      return payload
    }

    const cacheKey = request._cacheKey
    if (!cacheKey) {
      return payload
    }

    if (!fastify.cache) {
      return payload
    }

    if (
      reply.statusCode >= 200 &&
      reply.statusCode < 300 &&
      (typeof payload === 'string' || Buffer.isBuffer(payload))
    ) {
      const ttlInSeconds = cacheConfig.ttl ?? 86400

      const transientHeaders = ['connection', 'content-length', 'transfer-encoding', 'date', 'x-cache']
      const headersToCache: Record<string, string | string[] | number | undefined> = {}
      for (const [key, value] of Object.entries(reply.getHeaders())) {
        if (!transientHeaders.includes(key.toLowerCase()) && value !== undefined && value !== null) {
          headersToCache[key] = value as string | string[] | number
        }
      }

      try {
        await setCachedItem(
          cacheKey,
          {
            statusCode: reply.statusCode,
            headers: headersToCache,
            payload
          },
          ttlInSeconds * 1000
        )
      } catch (err) {
        request.log.error({ err, cacheKey }, 'Failed to store item in cache')
      }
    }

    return payload
  })
})
