import Fastify from 'fastify'

const fastify = Fastify({
  logger: {
    transport: {
      target: '@fastify/one-line-logger'
    }
  },
  disableRequestLogging: true
})

fastify.addHook('onResponse', (request, reply, done) => {
  const loggerFormat = `${request.url} - ${reply.statusCode} - ${reply.elapsedTime.toFixed(2)}ms`

  fastify.log.info(loggerFormat)
  done()
})

fastify.get('/', async (_req, res) => {
  res.code(200).send({ name: 'SaaS' })
})

try {
  await fastify.listen({ port: 4000, host: '127.0.0.1' })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
