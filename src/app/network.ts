export interface QueryOptions extends RequestInit {
  cacheTtl?: number // TTL in milliseconds
  cacheMethods?: string[] // HTTP methods allowed for caching
  bypassCache?: boolean // If true, forces a network request and updates the cache
}

interface CacheEntry {
  response: Response
  expiry: number
}

const cacheStore = new Map<string, CacheEntry>()

/**
 * Generates a unique cache key based on the URL, HTTP method, and request body.
 */
export function generateCacheKey(url: string, init?: RequestInit): string {
  const method = (init?.method || 'GET').toUpperCase()
  let bodyStr = ''

  if (init?.body) {
    if (typeof init.body === 'string') {
      bodyStr = init.body
    } else if (init.body instanceof URLSearchParams) {
      bodyStr = init.body.toString()
    } else if (init.body instanceof FormData) {
      const parts: string[] = []
      init.body.forEach((value, key) => {
        parts.push(`${key}=${value}`)
      })
      bodyStr = parts.sort().join('&')
    } else {
      try {
        bodyStr = JSON.stringify(init.body)
      } catch {
        bodyStr = String(init.body)
      }
    }
  }

  return `${method}:${url}:${bodyStr}`
}

/**
 * A wrapper around the global fetch API that caches responses in-memory.
 *
 * Defaults:
 * - cacheTtl: 1 hour (3,600,000 ms)
 * - cacheMethods: ['GET', 'POST']
 */
export async function query(url: string, options?: QueryOptions): Promise<Response> {
  const method = (options?.method || 'GET').toUpperCase()
  const cacheTtl = options?.cacheTtl ?? 3600000 // 1 hour in ms
  const cacheMethods = (options?.cacheMethods ?? ['GET', 'POST']).map(m => m.toUpperCase())
  const bypassCache = options?.bypassCache ?? false

  const shouldCache = cacheMethods.includes(method)

  if (!shouldCache) {
    return fetch(url, options)
  }

  const cacheKey = generateCacheKey(url, options)

  if (!bypassCache) {
    const cachedEntry = cacheStore.get(cacheKey)
    if (cachedEntry && cachedEntry.expiry > Date.now()) {
      // Return a cloned response so it can be read multiple times by different callers
      return cachedEntry.response.clone()
    }
  }

  const response = await fetch(url, options)

  // Only cache successful/valid responses (status 2xx or 3xx)
  if (response.ok) {
    cacheStore.set(cacheKey, {
      response: response.clone(),
      expiry: Date.now() + cacheTtl
    })
  }

  return response
}

/**
 * Invalidates cache storage.
 *
 * - If key is 'all', clears the entire cache.
 * - Otherwise, removes any entries matching or containing the provided URL/key.
 */
export function clearCache(key: string): void {
  if (key === 'all') {
    cacheStore.clear()
    return
  }

  for (const cacheKey of cacheStore.keys()) {
    // Check if the key matches the exact cache key, is part of the URL, or matches without method prefixes
    if (
      cacheKey === key ||
      cacheKey.includes(`:${key}:`) ||
      cacheKey.includes(`:${key}`) ||
      cacheKey.startsWith(`GET:${key}`) ||
      cacheKey.startsWith(`POST:${key}`)
    ) {
      cacheStore.delete(cacheKey)
    }
  }
}

/**
 * Helper to get the current size of the cache store.
 * Primarily useful for testing and debugging.
 */
export function getCacheSize(): number {
  return cacheStore.size
}
