import type { FastifyRequest, FastifyReply } from 'fastify'

export const logger = (request: FastifyRequest, reply: FastifyReply, done: (err?: Error) => void): void => {
  const loggerFormat = `${request.url} - ${reply.statusCode} - ${reply.elapsedTime.toFixed(2)}ms`
  request.log.info(loggerFormat)
  done()
}
