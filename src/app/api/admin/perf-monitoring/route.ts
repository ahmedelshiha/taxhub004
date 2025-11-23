/**
 * Performance Monitoring Dashboard Endpoint
 *
 * Provides real-time performance metrics and SLA status for the admin dashboard
 * Tracks all API endpoints and identifies performance issues
 *
 * Endpoint: GET /api/admin/perf-monitoring
 * Auth: Admin only
 * Cache: 1 minute
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/auth-middleware'
import { respondWithOptimization } from '@/lib/performance/api-optimization'
import {
  performanceTracker,
  checkPerformanceSLA,
  getPerformanceInsights,
  createPerformanceMonitoringData,
} from '@/lib/performance/api-middleware'

interface PerformanceMonitoringResponse {
  success: boolean
  data: {
    timestamp: string
    sla: {
      passed: boolean
      totalEndpoints: number
      passingRate: number
      failingEndpoints: Array<{
        endpoint: string
        p95: number
        target: number
        excess: number
      }>
    }
    insights: {
      slowest: Array<{
        endpoint: string
        p95: number
        recommendation: string
      }>
      fastest: Array<{
        endpoint: string
        p95: number
      }>
      summary: {
        avgP95: number
        avgP99: number
        slowestEndpoint: string | undefined
        fastestEndpoint: string | undefined
      }
    }
    metrics: Array<{
      endpoint: string
      method: string
      count: number
      avg: number
      min: number
      max: number
      p50: number
      p95: number
      p99: number
    }>
    summary: {
      totalRequests: number
      uniqueEndpoints: number
      uptime: string
    }
  }
}

export const GET = withAdminAuth(
  async (request: NextRequest): Promise<NextResponse<PerformanceMonitoringResponse>> => {
    const startTime = performance.now()

    // Gather performance data
    const monitoringData = createPerformanceMonitoringData()

    const responseData: PerformanceMonitoringResponse = {
      success: true,
      data: monitoringData,
    }

    // Add response time header
    const duration = performance.now() - startTime
    const response = await respondWithOptimization(responseData, {
      cacheType: 'list',
      maxAge: 60, // Cache for 1 minute
    })

    response.headers.set('X-Response-Time', `${duration.toFixed(2)}ms`)
    response.headers.set('X-Cache-Key', 'perf-monitoring')

    return response
  }
)

/**
 * POST: Reset performance metrics (admin only)
 * Useful for clearing baseline and starting fresh measurements
 */
export const POST = withAdminAuth(
  async (request: NextRequest): Promise<NextResponse> => {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'reset':
        performanceTracker.clear()
        return NextResponse.json(
          {
            success: true,
            message: 'Performance metrics reset',
          },
          { status: 200 }
        )

      case 'export':
        const metrics = performanceTracker.getAllStats()
        return NextResponse.json(
          {
            success: true,
            data: metrics,
            timestamp: new Date().toISOString(),
          },
          {
            headers: {
              'Content-Disposition': 'attachment; filename=performance-metrics.json',
            },
          }
        )

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Unknown action',
          },
          { status: 400 }
        )
    }
  }
)
