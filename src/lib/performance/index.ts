/**
 * Performance Optimization Library
 *
 * Comprehensive performance monitoring and optimization utilities for the Portal-Admin system
 * Ensures all API endpoints meet strict SLA targets (<200ms p95)
 *
 * Modules:
 * - api-optimization: Core optimization utilities and strategies
 * - api-middleware: Performance middleware for API routes
 * - endpoint-optimizations: Endpoint-specific optimization implementations
 * - metrics: Performance metrics collection
 */

// Core API Optimization
export {
  PERFORMANCE_TARGETS,
  CACHE_STRATEGIES,
  COMPRESSION_SETTINGS,
  getCacheHeaders,
  optimizeResponse,
  createPaginationHelper,
  createRequestDeduplicator,
  respondWithOptimization,
  performanceTracker,
  requestDeduplicator,
  paginationHelper,
  getPerformanceTarget,
} from './api-optimization'

// Performance Middleware
export {
  withPerformanceOptimization,
  withCache,
  checkPerformanceSLA,
  getPerformanceInsights,
  createPerformanceMonitoringData,
  createRateLimiter,
} from './api-middleware'

// Endpoint-Specific Optimizations
export {
  analyticsOptimizations,
  listingOptimizations,
  searchOptimizations,
  exportOptimizations,
  realtimeOptimizations,
  optimizationHelpers,
} from './endpoint-optimizations'

// Analytics and Metrics
export {
  PerformanceAnalyticsCollector,
  analyticsCollector,
  usePerformanceMetrics,
} from './performance-analytics'

export {
  performanceMetrics,
  getPerformanceReport,
  exportMetricsAsJSON,
} from './metrics'

// Guidelines and configuration
export { optimizationChecklist, performanceBenchmarks } from './optimizations'

/**
 * Quick start example:
 *
 * ```typescript
 * import {
 *   withPerformanceOptimization,
 *   respondWithOptimization,
 *   paginationHelper,
 * } from '@/lib/performance'
 *
 * export const GET = withPerformanceOptimization(
 *   async (request) => {
 *     const { limit, offset } = paginationHelper.validate(
 *       parseInt(request.nextUrl.searchParams.get('limit') || '20'),
 *       parseInt(request.nextUrl.searchParams.get('offset') || '0')
 *     )
 *
 *     const items = await prisma.item.findMany({ take: limit, skip: offset })
 *     const total = await prisma.item.count()
 *
 *     return respondWithOptimization(
 *       { data: items, meta: paginationHelper.createMeta(total, limit, offset) },
 *       { cacheType: 'list', maxAge: 300 }
 *     )
 *   },
 *   { cacheType: 'list', maxAge: 300, deduplicateKey: 'items-list' }
 * )
 * ```
 */
