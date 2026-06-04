import type { FastifyInstance } from 'fastify'

import authController from './auth/index.js'

export default async function v1Routes(fastify: FastifyInstance): Promise<void> {
  await fastify.register(authController, { prefix: '/auth' })
}
