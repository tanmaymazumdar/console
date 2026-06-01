import fastifyCompress from '@fastify/compress'
import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import Fastify from 'fastify'

import type { FastifyRequest, FastifyReply } from 'fastify'

import cachingPlugin from './plugins/caching.js'

const fastify = Fastify({
  logger: {
    transport: {
      target: '@fastify/one-line-logger'
    }
  },
  disableRequestLogging: true
})

fastify.addHook('onResponse', (request: FastifyRequest, reply: FastifyReply, done: (err?: Error) => void) => {
  const loggerFormat = `${request.url} - ${reply.statusCode} - ${reply.elapsedTime.toFixed(2)}ms`
  fastify.log.info(loggerFormat)
  done()
})

const cookieSecret = process.env.COOKIE_SECRET || 'default_super_secure_cookie_signature_secret_key_32_chars'

// 1. Register Cookie Plugin (Must be registered first for onRequest cookie parsing)
await fastify.register(fastifyCookie, {
  secret: cookieSecret
})

// 2. Register CORS Plugin (Must be registered early to handle OPTIONS preflights)
await fastify.register(fastifyCors, {
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true)
      return
    }

    const allowedList = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim().toLowerCase())
      : []

    const originLower = origin.toLowerCase()
    if (allowedList.includes(originLower)) {
      callback(null, true)
      return
    }

    try {
      const url = new URL(origin)
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        callback(null, true)
        return
      }
    } catch {
      // ignore parsing errors
    }

    callback(new Error('Not allowed by CORS'), false)
  },
  credentials: true
})

// 3. Register Caching Plugin (Global Hooks & Connection manager)
await fastify.register(cachingPlugin)

// 4. Register Compression Plugin (Global Hooks & Threshold configuration)
await fastify.register(fastifyCompress, {
  threshold: 1024
})

// 5. Simple root check route
fastify.get('/', async (_req: FastifyRequest, res: FastifyReply) => {
  return res.code(200).send({ status: 'ok', service: 'SaaS API' })
})

try {
  await fastify.listen({
    port: parseInt(process.env.PORT ?? '4000'),
    host: process.env.HOST ?? '127.0.0.1'
  })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
