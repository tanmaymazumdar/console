import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import fastifyCompress from '@fastify/compress'
import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import fastifyFormbody from '@fastify/formbody'
import fastifyHelmet from '@fastify/helmet'
import fastifyStatic from '@fastify/static'
import Fastify from 'fastify'

import type { FastifyRequest, FastifyReply } from 'fastify'

import { config } from './server/config.js'
import v1Routes from './server/controllers/v1/index.js'
import { logger } from './server/hooks/logger.js'
import cachingPlugin from './server/plugins/caching.js'
import { corsConfig } from './server/plugins/cors.js'

const isProd = process.env.NODE_ENV === 'production'

const fastify = Fastify(config)

fastify.addHook('onResponse', logger)

const secret = process.env.COOKIE_SECRET || 'default_super_secure_cookie_signature_secret_key_32_chars'

// 1. Register Cookie Plugin (Must be registered first for onRequest cookie parsing)
await fastify.register(fastifyCookie, { secret })

// 2. Register CORS Plugin (Must be registered early to handle OPTIONS preflights)
await fastify.register(fastifyCors, corsConfig)

// 3. Register Helmet Security Headers Plugin (Applies standard HTTP security headers globally)
await fastify.register(fastifyHelmet)

// 4. Register Formbody Parser Plugin (Parses application/x-www-form-urlencoded payloads)
await fastify.register(fastifyFormbody)

// 5. Register Caching Plugin (Global Hooks & Connection manager)
await fastify.register(cachingPlugin)

// 6. Register Compression Plugin (Global Hooks & Threshold configuration)
await fastify.register(fastifyCompress, { threshold: 1024 })

if (isProd) {
  // 7. Register Static Plugin
  fastify.register(fastifyStatic, {
    root: join(import.meta.dirname, 'client'), // import.meta.dirname node.js >= v20.11.0
    // By default all assets are immutable and can be cached for a long period due to cache bursting techniques
    maxAge: '1y',
    immutable: true,
    etag: true,
    preCompressed: true,
    serveDotFiles: false
  })
}

// 8. Register Routes
await fastify.register(v1Routes, { prefix: '/api/v1' })

// 9. Simple root check route
fastify.get('/api/v1/health', async (_req: FastifyRequest, res: FastifyReply) => {
  return res.code(200).send({ status: 'ok', service: 'SaaS API' })
})

// Catch-all handler for Single Page Application (SPA) fallback serving
fastify.setNotFoundHandler(async (request, reply) => {
  // Never serve HTML fallback for API endpoints
  if (request.url.startsWith('/api/')) {
    return reply.code(404).send({
      error: 'Not Found',
      message: `Route ${request.method}:${request.url} not found`
    })
  }

  if (isProd) {
    // In production, serve the index.html via @fastify/static
    return reply.sendFile('index.html', { maxAge: 0, immutable: false })
  } else {
    // In development, read and serve the src/index.html directly
    try {
      const html = await readFile(join(import.meta.dirname, 'index.html'), 'utf8')
      return reply.type('text/html').send(html)
    } catch {
      return reply.code(404).send({
        error: 'Not Found',
        message: 'index.html not found in development'
      })
    }
  }
})

try {
  await fastify.listen({ port: 4000, host: '127.0.0.1' })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
