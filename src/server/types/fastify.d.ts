import 'fastify'

declare module 'fastify' {
  interface FastifyContextConfig {
    cache?: {
      ttl?: number // In seconds (defaults to 24h / 86400s)
      keyGenerator?: (request: FastifyRequest) => string
      cacheControl?: string // Custom Cache-Control header value (e.g., 'public, max-age=3600')
      static?: boolean // If true, manages client-side/CDN headers instead of server-side Redis caching
    }
  }

  interface FastifyRequest {
    _cacheKey?: string
  }
}
