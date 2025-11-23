'use client'

import { onCLS, onINP, onFCP, onLCP, onTTFB, Metric } from 'web-vitals'

/**
 * Core Web Vitals targets (Google's recommendations)
 */
export const WEB_VITALS_TARGETS = {
  LCP: 2500, // Largest Contentful Paint - Good: < 2.5s
  FID: 100, // First Input Delay - Good: < 100ms
  CLS: 0.1, // Cumulative Layout Shift - Good: < 0.1
  FCP: 1800, // First Contentful Paint - Good: < 1.8s
  TTFB: 600, // Time to First Byte - Good: < 600ms
}

/**
 * Performance metric tracking
 */
interface PerformanceMetric extends Metric {
  isGood: boolean
  isFair: boolean
  isPoor: boolean
  target: number
}

/**
 * Send metric to analytics
 */
export function sendMetricToAnalytics(metric: Metric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`${metric.name}: ${metric.value}ms`)
  }

  // Send to your analytics service (Sentry, DataDog, etc.)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ; (window as any).gtag('event', metric.name, {
      event_category: 'web_vitals',
      value: Math.round(metric.value),
      event_label: metric.id,
      non_interaction: true,
    })
  }

  // Send to Sentry if available
  if (typeof window !== 'undefined' && (window as any).__SENTRY__) {
    ; (window as any).__SENTRY__.captureException(
      new Error(`Web Vital: ${metric.name} = ${metric.value}`),
      {
        level: 'info',
        tags: {
          metric: metric.name,
        },
        contexts: {
          metric: {
            value: metric.value,
            rating: metric.rating,
          },
        },
      }
    )
  }
}

/**
 * Track all web vitals (web-vitals v3 API)
 */
export function monitorWebVitals() {
  if (typeof window === 'undefined') return

  onCLS(sendMetricToAnalytics)
  onINP(sendMetricToAnalytics)
  onFCP(sendMetricToAnalytics)
  onLCP(sendMetricToAnalytics)
  onTTFB(sendMetricToAnalytics)
}

/**
 * Track specific performance metric
 */
export function trackPerformanceMetric(
  name: 'CLS' | 'FCP' | 'LCP' | 'INP' | 'TTFB',
  startTime: number = performance.now()
): () => void {
  return () => {
    const duration = performance.now() - startTime
    sendMetricToAnalytics({
      name,
      value: duration,
      rating: duration < 1000 ? 'good' : duration < 2000 ? 'needs-improvement' : 'poor',
      delta: 0,
      id: `${name}-${Date.now()}`,
    } as Metric)
  }
}

/**
 * Report all web vitals on page load (web-vitals v3 API)
 */
export async function reportWebVitals() {
  const metrics: PerformanceMetric[] = []

  // Wait for metrics to be available
  await new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(null)
      return
    }

    onCLS((metric) => {
      metrics.push({
        ...metric,
        isGood: metric.value <= WEB_VITALS_TARGETS.CLS,
        isFair: metric.value > WEB_VITALS_TARGETS.CLS && metric.value < 0.25,
        isPoor: metric.value >= 0.25,
        target: WEB_VITALS_TARGETS.CLS,
      })
    })

    onFCP((metric) => {
      metrics.push({
        ...metric,
        isGood: metric.value <= WEB_VITALS_TARGETS.FCP,
        isFair: metric.value > WEB_VITALS_TARGETS.FCP && metric.value < 3000,
        isPoor: metric.value >= 3000,
        target: WEB_VITALS_TARGETS.FCP,
      })
    })

    onLCP((metric) => {
      metrics.push({
        ...metric,
        isGood: metric.value <= WEB_VITALS_TARGETS.LCP,
        isFair: metric.value > WEB_VITALS_TARGETS.LCP && metric.value < 4000,
        isPoor: metric.value >= 4000,
        target: WEB_VITALS_TARGETS.LCP,
      })
    })

    // Resolve after metrics collected (1 second timeout)
    setTimeout(() => resolve(metrics), 1000)
  })

  return metrics
}
