/**
 * Performance Analytics Collector
 *
 * Collects, aggregates, and reports performance metrics across the application.
 * Integrates with Sentry and internal monitoring systems.
 */

import { logger } from '@/lib/logger'

export interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: Date
  tags?: Record<string, string>
  endpoint?: string
}

export interface PerformanceAlert {
  metric: string
  threshold: number
  actual: number
  severity: 'warning' | 'critical'
  timestamp: Date
}

/**
 * PerformanceAnalyticsCollector
 * Singleton instance for collecting and managing performance metrics
 */
export class PerformanceAnalyticsCollector {
  private metrics: PerformanceMetric[] = []
  private alerts: PerformanceAlert[] = []
  private readonly maxMetrics = 10000
  private readonly alertThresholds: Record<string, number> = {
    'api.response-time': 200, // 200ms
    'api.db-query-time': 100, // 100ms
    'memory.heap-used': 500 * 1024 * 1024, // 500MB
    'memory.external': 100 * 1024 * 1024, // 100MB
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push({
      ...metric,
      timestamp: metric.timestamp || new Date(),
    })

    // Keep metrics in bounds
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }

    // Check against thresholds
    this.checkThresholds(metric)
  }

  /**
   * Check if metric exceeds configured threshold
   */
  private checkThresholds(metric: PerformanceMetric): void {
    const threshold = this.alertThresholds[metric.name]
    if (threshold && metric.value > threshold) {
      const alert: PerformanceAlert = {
        metric: metric.name,
        threshold,
        actual: metric.value,
        severity: metric.value > threshold * 1.5 ? 'critical' : 'warning',
        timestamp: new Date(),
      }

      this.alerts.push(alert)
      logger.warn('Performance threshold exceeded', {
        metric: metric.name,
        threshold,
        actual: metric.value,
        endpoint: metric.endpoint,
        tags: metric.tags,
      })
    }
  }

  /**
   * Get metrics for a specific time range
   */
  getMetrics(
    startTime?: Date,
    endTime?: Date,
    filterByName?: string
  ): PerformanceMetric[] {
    return this.metrics.filter((m) => {
      if (filterByName && m.name !== filterByName) return false
      if (startTime && m.timestamp < startTime) return false
      if (endTime && m.timestamp > endTime) return false
      return true
    })
  }

  /**
   * Get performance summary statistics
   */
  getSummary(metricName?: string): Record<string, any> {
    const metrics = metricName
      ? this.metrics.filter((m) => m.name === metricName)
      : this.metrics

    if (metrics.length === 0) {
      return {
        count: 0,
        average: 0,
        min: 0,
        max: 0,
        p95: 0,
        p99: 0,
      }
    }

    const values = metrics.map((m) => m.value).sort((a, b) => a - b)
    const count = values.length
    const sum = values.reduce((a, b) => a + b, 0)
    const average = sum / count

    return {
      count,
      average,
      min: values[0],
      max: values[count - 1],
      p95: values[Math.floor(count * 0.95)],
      p99: values[Math.floor(count * 0.99)],
      sum,
    }
  }

  /**
   * Get recent alerts
   */
  getAlerts(limit: number = 100): PerformanceAlert[] {
    return this.alerts.slice(-limit)
  }

  /**
   * Clear metrics and alerts
   */
  clear(): void {
    this.metrics = []
    this.alerts = []
  }

  /**
   * Export metrics as JSON for external monitoring
   */
  exportMetrics(): string {
    return JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        metrics: this.metrics,
        alerts: this.alerts,
        summary: {
          totalMetrics: this.metrics.length,
          totalAlerts: this.alerts.length,
        },
      },
      null,
      2
    )
  }
}

/**
 * Global analytics collector instance
 */
export const analyticsCollector = new PerformanceAnalyticsCollector()

/**
 * React hook for accessing performance metrics
 */
export function usePerformanceMetrics(metricName?: string) {
  return {
    recordMetric: (metric: Omit<PerformanceMetric, 'timestamp'>) => {
      analyticsCollector.recordMetric({
        ...metric,
        timestamp: new Date(),
      })
    },
    getMetrics: (startTime?: Date, endTime?: Date) => {
      return analyticsCollector.getMetrics(startTime, endTime, metricName)
    },
    getSummary: () => {
      return analyticsCollector.getSummary(metricName)
    },
    getAlerts: (limit?: number) => {
      return analyticsCollector.getAlerts(limit)
    },
  }
}
