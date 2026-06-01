import type { FastifyCorsOptions } from '@fastify/cors'

export const corsConfig: FastifyCorsOptions = {
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
}
