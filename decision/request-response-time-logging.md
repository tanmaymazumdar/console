# Decision Record: Request Response Time Logging

This document outlines the context, architecture decisions, final implementation, and verification outcomes for adding response time logging to the Fastify server.

---

## Context & Motivation

In the development of the SaaS backend, we required clear visibility into the response times of individual requests. The server uses `@fastify/one-line-logger` (built on top of `pino-pretty`) to format logs into clean, single-line messages.

We wanted a highly focused and non-intrusive logging format that:

1. Logs only on response completion (no "incoming request" start logs).
2. Follows a strict minimal format: `<date_and_time_in_iso_format> - <level> - <route> - <status_code> - <response_time>`.
3. Integrates cleanly with Fastify v5 using the newer `reply.elapsedTime` property.

---

## Architectural Decisions

### 1. Disable Built-in Request Logging

We configured the Fastify server options with `disableRequestLogging: true`. This prevents duplicate, unformatted, and verbose logs from polluting the console.

### 2. Leverage Fastify v5 standard (`reply.elapsedTime`)

We utilized `reply.elapsedTime` to read the precise duration of the request in milliseconds, ensuring future-proof compatibility with Fastify v5+.

### 3. Custom Response Hook and Formatting

Instead of request-specific log context (which automatically attaches request IDs and headers), we used the root logger **`fastify.log`** within the **`onResponse`** hook.

- By using `fastify.log.info` rather than `request.log.info`, we bypass request ID injection (`req-1 - `).
- By logging a formatted string message with the route path (`request.url`), response status (`reply.statusCode`), and elapsed time (`reply.elapsedTime`), we match the exact pattern: `<date_and_time_in_iso_format> - <level> - <route> - <status_code> - <response_time>`.
- We removed the `onRequest` hook entirely, so the server remains silent when a request first hits, only logging a single line when the response is fully completed.

### 4. Explicit Interface Binding

We explicitly added `host: "127.0.0.1"` to the `fastify.listen()` options. This resolves common binding conflicts (`EADDRINUSE`) on macOS when listening on `localhost` (which resolves to both IPv4 and IPv6 loopback addresses).

---

## Implementation Details

The following changes were made in [src/index.ts](file:///Users/tanmay/Documents/poc/saas/src/index.ts):

```typescript
import Fastify from 'fastify'

const fastify = Fastify({
  logger: {
    transport: {
      target: '@fastify/one-line-logger'
    }
  },
  disableRequestLogging: true // 1. Disabled default logging
})

// 2. Custom onResponse hook to log request completion in exact format
fastify.addHook('onResponse', (request, reply, done) => {
  fastify.log.info(`${request.url} - ${reply.statusCode} - ${reply.elapsedTime.toFixed(2)}ms`)
  done()
})

fastify.get('/', async (_req, res) => {
  res.headers({ 'x-origin-app-name': 'SaaS' })
  res.code(200)
  res.send({ name: 'SaaS' })
})

try {
  // 3. Explicitly bound to 127.0.0.1
  await fastify.listen({ port: 4000, host: '127.0.0.1' })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
```

---

## Outcomes & Verification

We validated the setup by running the development server and making HTTP requests. The logs format exactly as requested:

```text
2026-05-31 22:17:00.201+0530 - info - Server listening at http://127.0.0.1:4000
2026-05-31 22:17:06.148+0530 - info - / - 200 - 3.20ms
```

### Impact

- **Zero Noise:** No start logs are printed when a request is made, keeping the development console extremely tidy.
- **Strict Format Compliance:** Matches `<date_and_time_in_iso_format> - <level> - <route> - <status_code> - <response_time>` perfectly.
- **No Performance Overhead:** Leverages Fastify's native lifecycle hooks for optimal request/response processing speeds.
