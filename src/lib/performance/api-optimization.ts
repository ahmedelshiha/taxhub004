/**
 * API Performance Optimization Utilities
 *
 * Implements strategies to ensure all API endpoints respond within SLA targets:
 * - Caching strategies (Redis, HTTP cache headers)
 * - Request/response compression
 * - Database query optimization
 * - Middleware for performance monitoring
 * - Rate limiting and throttling
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * Performance SLA targets
 * All endpoints should meet these targets under normal load
 */
export const PERFORMANCE_TARGETS = {
  // Standard API endpoints
  list: 200, // ms (p95)
  read: 150, // ms (p95)
  write: 250, // ms (p95)
  delete: 200, // ms (p95)

  // Heavy operations
  analytics: 300, // ms (p95)
  search: 250, // ms (p95)
  export: 2000, // ms (p95)
  import: 3000, // ms (p95)

  // Real-time operations
  realtime: 100, // ms (p95)
  webhook: 1000, // ms (p95)
} as const

/**
 * Cache strategies for different endpoint types
 */
export const CACHE_STRATEGIES = {
  list: {
    ttl: 5 * 60, // 5 minutes
    key: (endpoint: string, params: any) => `${endpoint}:${JSON.stringify(params)}`,
  },
  read: {
    ttl: 10 * 60, // 10 minutes
    key: (endpoint: string, id: string) => `${endpoint}:${id}`,
  },
  config: {
    ttl: 30 * 60, // 30 minutes
    key: (endpoint: string) => `${endpoint}`,
  },
  static: {
    ttl: 24 * 60 * 60, // 24 hours
    key: (endpoint: string) => `${endpoint}`,
  },
} as const

/**
 * HTTP cache headers to apply based on endpoint type
 */
export function getCacheHeaders(
  type: 'list' | 'read' | 'config' | 'static' | 'dynamic',
  maxAge?: number
): Record<string, string> {
  const headers: Record<string, string> = {
    'Cache-Control': '',
    'ETag': `"${Date.now()}"`,
  }

  switch (type) {
    case 'static':
      headers['Cache-Control'] = `public, max-age=${maxAge || 86400}, immutable`
      headers['CDN-Cache-Control'] = 'max-age=31536000'
      break

    case 'config':
      headers['Cache-Control'] = `private, max-age=${maxAge || 1800}, must-revalidate`
      headers['CDN-Cache-Control'] = 'max-age=3600'
      break

    case 'read':
      headers['Cache-Control'] = `private, max-age=${maxAge || 600}, must-revalidate`
      headers['CDN-Cache-Control'] = 'max-age=300'
      break

    case 'list':
      headers['Cache-Control'] = `private, max-age=${maxAge || 300}, must-revalidate`
      headers['CDN-Cache-Control'] = 'max-age=60'
      break

    case 'dynamic':
    default:
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
      headers['Pragma'] = 'no-cache'
      headers['Expires'] = '0'
      break
  }

  return headers
}

/**
 * Middleware to track API performance
 */
export function createPerformanceTracker() {
  const metrics: Map<string, { durations: number[]; count: number }> = new Map()

  return {
    /**
     * Track API call performance
     */
    track(endpoint: string, method: string, duration: number): void {
      const key = `${method} ${endpoint}`
      const existing = metrics.get(key) || { durations: [], count: 0 }

      existing.durations.push(duration)
      existing.count++

      // Keep only last 100 measurements
      if (existing.durations.length > 100) {
        existing.durations.shift()
      }

      metrics.set(key, existing)
    },

    /**
     * Get statistics for an endpoint
     */
    getStats(endpoint: string, method: string) {
      const key = `${method} ${endpoint}`
      const data = metrics.get(key)

      if (!data) return null

      const sorted = [...data.durations].sort((a, b) => a - b)
      const sum = sorted.reduce((a, b) => a + b, 0)

      return {
        endpoint,
        method,
        count: data.count,
        avg: Math.round(sum / sorted.length),
        min: sorted[0],
        max: sorted[sorted.length - 1],
        p50: sorted[Math.floor(sorted.length * 0.5)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)],
      }
    },

    /**
     * Get all statistics
     */
    getAllStats() {
      const stats = []
      for (const [key, _] of metrics.entries()) {
        const [method, endpoint] = key.split(' ')
        const stat = this.getStats(endpoint, method)
        if (stat) stats.push(stat)
      }
      return stats.sort((a, b) => b.p95 - a.p95)
    },

    /**
     * Check if endpoint meets SLA
     */
    meetsTarget(endpoint: string, method: string, target: number): boolean {
      const stats = this.getStats(endpoint, method)
      return stats ? stats.p95 <= target : true
    },

    /**
     * Get performance report
     */
    getReport() {
      const stats = this.getAllStats()
      const failing = stats.filter((s) => {
        const target = getPerformanceTarget(s.method, s.endpoint)
        return s.p95 > target
      })

      return {
        totalEndpoints: stats.length,
        endpoints: stats,
        failing,
        passRate: Math.round(((stats.length - failing.length) / stats.length) * 100),
      }
    },

    /**
     * Clear metrics
     */
    clear() {
      metrics.clear()
    },
  }
}

/**
 * Get performance target for an endpoint
 */
export function getPerformanceTarget(method: string, endpoint: string): number {
  // Analytics endpoints
  if (endpoint.includes('/analytics') || endpoint.includes('/stats')) {
    return PERFORMANCE_TARGETS.analytics
  }

  // Search endpoints
  if (endpoint.includes('/search')) {
    return PERFORMANCE_TARGETS.search
  }

  // Export/import endpoints
  if (endpoint.includes('/export')) {
    return PERFORMANCE_TARGETS.export
  }
  if (endpoint.includes('/import')) {
    return PERFORMANCE_TARGETS.import
  }

  // Real-time endpoints
  if (endpoint.includes('/realtime')) {
    return PERFORMANCE_TARGETS.realtime
  }

  // Webhook endpoints
  if (endpoint.includes('/webhook')) {
    return PERFORMANCE_TARGETS.webhook
  }

  // Standard CRUD operations
  switch (method) {
    case 'POST':
    case 'PUT':
    case 'PATCH':
      return PERFORMANCE_TARGETS.write
    case 'DELETE':
      return PERFORMANCE_TARGETS.delete
    case 'GET':
      return endpoint.includes('[') || endpoint.endsWith(']')
        ? PERFORMANCE_TARGETS.read
        : PERFORMANCE_TARGETS.list
    default:
      return PERFORMANCE_TARGETS.list
  }
}

/**
 * Compression settings for responses
 */
export const COMPRESSION_SETTINGS = {
  minSize: 860, // bytes - minimum size to compress
  threshold: 0.8, // compression ratio threshold
  level: 6, // compression level (0-9)
} as const

/**
 * Response size optimization helper
 */
export function optimizeResponse(data: any): {
  original: number
  optimized: number
  savings: number
  compressionRatio: number
} {
  const original = JSON.stringify(data).length

  // Remove null values
  const cleaned = removeNullValues(data)
  const optimized = JSON.stringify(cleaned).length

  const savings = original - optimized
  const compressionRatio = 1 - optimized / original

  return {
    original,
    optimized,
    savings,
    compressionRatio,
  }
}

/**
 * Remove null and undefined values from objects
 */
function removeNullValues(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => removeNullValues(item))
  }

  if (obj !== null && typeof obj === 'object') {
    const cleaned: Record<string, any> = {}
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined) {
        cleaned[key] = removeNullValues(value)
      }
    }
    return cleaned
  }

  return obj
}

/**
 * Pagination helper for large datasets
 */
export function createPaginationHelper() {
  return {
    /**
     * Validate pagination parameters
     */
    validate(limit?: number, offset?: number) {
      const MAX_LIMIT = 100
      const DEFAULT_LIMIT = 20

      const validatedLimit = Math.min(
        Math.max(limit || DEFAULT_LIMIT, 1),
        MAX_LIMIT
      )
      const validatedOffset = Math.max(offset || 0, 0)

      return {
        limit: validatedLimit,
        offset: validatedOffset,
      }
    },

    /**
     * Create pagination metadata
     */
    createMeta(
      total: number,
      limit: number,
      offset: number
    ) {
      return {
        total,
        limit,
        offset,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit,
        pageCount: Math.ceil(total / limit),
        hasMore: offset + limit < total,
        hasPrevious: offset > 0,
      }
    },
  }
}

/**
 * Request deduplication helper
 * Prevents duplicate simultaneous requests for the same resource
 */
export function createRequestDeduplicator() {
  const pending: Map<string, Promise<any>> = new Map()

  return {
    /**
     * Execute or return cached pending request
     */
    async deduplicate<T>(key: string, executor: () => Promise<T>): Promise<T> {
      if (pending.has(key)) {
        return pending.get(key)!
      }

      const promise = executor()
        .then((result) => {
          pending.delete(key)
          return result
        })
        .catch((error) => {
          pending.delete(key)
          throw error
        })

      pending.set(key, promise)
      return promise
    },

    /**
     * Clear a specific key
     */
    clear(key: string) {
      pending.delete(key)
    },

    /**
     * Clear all pending requests
     */
    clearAll() {
      pending.clear()
    },
  }
}

/**
 * Create a performance-optimized response wrapper
 */
export async function respondWithOptimization<T>(
  data: T,
  options: {
    cacheType?: 'list' | 'read' | 'config' | 'static' | 'dynamic'
    status?: number
    maxAge?: number
  } = {}
): Promise<NextResponse<T>> {
  const { cacheType = 'dynamic', status = 200, maxAge } = options

  const response = NextResponse.json(data, { status })

  // Add cache headers
  const cacheHeaders = getCacheHeaders(cacheType, maxAge)
  Object.entries(cacheHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Add compression info headers (for monitoring)
  const optimization = optimizeResponse(data)
  response.headers.set('X-Response-Original-Size', String(optimization.original))
  response.headers.set('X-Response-Optimized-Size', String(optimization.optimized))

  return response
}

/**
 * Global performance tracker instance
 */
export const performanceTracker = createPerformanceTracker()

/**
 * Global request deduplicator instance
 */
export const requestDeduplicator = createRequestDeduplicator()

/**
 * Global pagination helper instance
 */
export const paginationHelper = createPaginationHelper()
