import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

const isProd = process.env.NODE_ENV === 'production'

export default async function authController(fastify: FastifyInstance): Promise<void> {
  fastify.get('/login', async (_req: FastifyRequest, res: FastifyReply) => {
    return res
      .setCookie('session_id', 'usr_123456', {
        path: '/',
        httpOnly: true,
        secure: isProd, // Disable secure in development HTTP
        signed: true,
        sameSite: 'lax',
        maxAge: 3600 // 1 hour TTL
      })
      .code(200)
      .send({
        authenticated: true,
        status: 'success'
      })
  })
}
