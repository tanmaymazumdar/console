import fastifyCompress from '@fastify/compress'
import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import fastifyFormbody from '@fastify/formbody'
import fastifyHelmet from '@fastify/helmet'
import Fastify from 'fastify'

import type { FastifyRequest, FastifyReply } from 'fastify'

import { config } from './server/config.js'
import { logger } from './server/hooks/logger.js'
import cachingPlugin from './server/plugins/caching.js'
import { corsConfig } from './server/plugins/cors.js'

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

// 7. Simple root check route
fastify.get('/api/v1/health', async (_req: FastifyRequest, res: FastifyReply) => {
  return res.code(200).send({ status: 'ok', service: 'SaaS API' })
})

try {
  await fastify.listen({ port: 4000, host: '127.0.0.1' })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
