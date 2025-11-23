'use client'

/**
 * Simple performance logger for development
 */
class PerformanceLogger {
  private marks: Map<string, number> = new Map()
  private isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development'

  /**
   * Mark a point in time
   */
  mark(label: string) {
    const now = performance.now()
    this.marks.set(label, now)

    if (this.isDev) {
      console.log(`✓ Mark: ${label} @ ${now.toFixed(2)}ms`)
    }
  }

  /**
   * Measure time between two marks
   */
  measure(label: string, startMark: string, endMark?: string) {
    const endTime = endMark ? this.marks.get(endMark) : performance.now()
    const startTime = this.marks.get(startMark)

    if (!startTime || !endTime) {
      console.warn(`Marks not found: ${startMark} or ${endMark}`)
      return 0
    }

    const duration = endTime - startTime

    if (this.isDev) {
      const color = duration < 100 ? '🟢' : duration < 500 ? '🟡' : '🔴'
      console.log(`${color} Measure: ${label} = ${duration.toFixed(2)}ms`)
    }

    return duration
  }

  /**
   * Measure function execution time
   */
  async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    try {
      return await fn()
    } finally {
      const duration = performance.now() - start
      if (this.isDev) {
        const color = duration < 100 ? '🟢' : duration < 500 ? '🟡' : '🔴'
        console.log(`${color} Async: ${label} = ${duration.toFixed(2)}ms`)
      }
    }
  }

  /**
   * Measure sync function execution time
   */
  measureSync<T>(label: string, fn: () => T): T {
    const start = performance.now()
    try {
      return fn()
    } finally {
      const duration = performance.now() - start
      if (this.isDev) {
        const color = duration < 100 ? '🟢' : duration < 500 ? '🟡' : '🔴'
        console.log(`${color} Sync: ${label} = ${duration.toFixed(2)}ms`)
      }
    }
  }

  /**
   * Clear all marks
   */
  clear() {
    this.marks.clear()
  }

  /**
   * Get all marks
   */
  getMarks() {
    return Object.fromEntries(this.marks)
  }
}

export const performanceLogger = new PerformanceLogger()
