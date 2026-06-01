import fastifyCompress from '@fastify/compress'
import fastifyCookie from '@fastify/cookie'
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

// 2. Register Caching Plugin (Global Hooks & Connection manager)
await fastify.register(cachingPlugin)

// 3. Register Compression Plugin (Global Hooks & Threshold configuration)
await fastify.register(fastifyCompress, {
  threshold: 1024
})

// 4. Simple root check route
fastify.get('/', async (_req: FastifyRequest, res: FastifyReply) => {
  return res.code(200).send({ status: 'ok', service: 'SaaS API' })
})

try {
  await fastify.listen({ port: 4000, host: '127.0.0.1' })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
