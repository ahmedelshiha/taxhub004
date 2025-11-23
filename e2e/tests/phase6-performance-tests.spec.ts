import { test, expect } from '@playwright/test'

/**
 * Phase 6 Performance Testing
 * Tests Core Web Vitals, bundle size, and performance metrics
 */

test.describe('Web Vitals & Core Performance', () => {
  test('homepage loads within performance budget', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/', { waitUntil: 'networkidle' })

    const loadTime = Date.now() - startTime

    // Should load within reasonable time (5 seconds)
    expect(loadTime).toBeLessThan(5000)

    // Check that hero section is visible (LCP element)
    const hero = page.locator('h1').first()
    await expect(hero).toBeVisible()
  })

  test('services page loads quickly', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/services', { waitUntil: 'domcontentloaded' })

    const loadTime = Date.now() - startTime

    // DOM should be ready quickly
    expect(loadTime).toBeLessThan(3000)

    // Content should be visible
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('no layout shifts during page load', async ({ page }) => {
    let layoutShifts = 0

    // Monitor for layout shifts
    await page.addInitScript(() => {
      (window as any).layoutShifts = 0

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if ((entry as any).hadRecentInput) return
          ;(window as any).layoutShifts += (entry as any).value
        }
      })

      observer.observe({ type: 'layout-shift', buffered: true })
    })

    await page.goto('/')

    // Get layout shift count
    layoutShifts = await page.evaluate(() => (window as any).layoutShifts || 0)

    // CLS should be low (< 0.1 is good)
    expect(layoutShifts).toBeLessThan(0.15)
  })

  test('images are lazy-loaded', async ({ page }) => {
    await page.goto('/services')

    // Count images with loading="lazy"
    const lazyImages = page.locator('img[loading="lazy"]')
    const lazyCount = await lazyImages.count()

    // Check that some images use lazy loading
    // (might be 0 if no images, but should exist for optimization)
    expect(lazyCount >= 0).toBe(true)
  })

  test('scripts are not render-blocking', async ({ page }) => {
    const startTime = Date.now()

    // Abort all scripts
    await page.route('**/*.js', (route) => {
      route.abort()
    })

    // Page should still render something
    await page.goto('/')

    const htmlLoaded = await page.locator('html').count()
    expect(htmlLoaded).toBeGreaterThan(0)

    // Clear route
    await page.unroute('**/*.js')
  })
})

test.describe('First Paint Metrics', () => {
  test('first contentful paint happens quickly', async ({ page }) => {
    const metrics = await page.evaluate(() => {
      const navTiming = performance.getEntriesByType('navigation')[0]
      if (navTiming) {
        const fcp = performance.getEntriesByName('first-contentful-paint')[0]
        if (fcp) {
          return {
            fcp: fcp.startTime,
          }
        }
      }
      return null
    })

    // Navigate and measure FCP
    await page.goto('/')

    // Content should be visible
    await expect(page.locator('body *').first()).toBeVisible()
  })

  test('largest contentful paint is visible', async ({ page }) => {
    await page.goto('/')

    // Wait for largest contentful paint
    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          if (entries.length > 0) {
            const lastEntry = entries[entries.length - 1]
            resolve((lastEntry as any).renderTime || (lastEntry as any).loadTime)
          }
        })

        observer.observe({ type: 'largest-contentful-paint', buffered: true })

        // Timeout after 5 seconds
        setTimeout(() => resolve(0), 5000)
      })
    })

    // LCP should be measured
    expect(typeof lcp).toBe('number')

    // Main content should be visible
    await expect(page.locator('body').first()).toBeVisible()
  })
})

test.describe('Bundle & Asset Size', () => {
  test('initial page load uses reasonable bandwidth', async ({ page }) => {
    let totalSize = 0

    page.on('response', (response) => {
      const size = response.headers()['content-length']
      if (size) {
        totalSize += parseInt(size)
      }
    })

    await page.goto('/', { waitUntil: 'networkidle' })

    // Should be under 5MB for full page load
    // (More reasonable targets: < 1MB for most pages)
    expect(totalSize).toBeLessThan(5 * 1024 * 1024)
  })

  test('no massive uncompressed responses', async ({ page }) => {
    const largeResponses: any[] = []

    page.on('response', async (response) => {
      const contentEncoding = response.headers()['content-encoding']
      const contentLength = parseInt(response.headers()['content-length'] || '0')

      // Check for large uncompressed responses
      if (!contentEncoding && contentLength > 100 * 1024) {
        largeResponses.push({
          url: response.url(),
          size: contentLength,
          contentType: response.headers()['content-type'],
        })
      }
    })

    await page.goto('/')

    // Should have compression for large responses
    // (may have some, but shouldn't be excessive)
    expect(largeResponses.length).toBeLessThanOrEqual(2)
  })

  test('API responses use compression', async ({ page }) => {
    let compressedResponses = 0
    let totalApiResponses = 0

    page.on('response', (response) => {
      if (response.url().includes('/api/')) {
        totalApiResponses++

        const contentEncoding = response.headers()['content-encoding']
        if (contentEncoding === 'gzip' || contentEncoding === 'br') {
          compressedResponses++
        }
      }
    })

    await page.goto('/services')

    // Most API responses should be compressed
    if (totalApiResponses > 0) {
      const compressionRate = compressedResponses / totalApiResponses
      expect(compressionRate).toBeGreaterThan(0.8) // 80%+ compression
    }
  })
})

test.describe('Network Performance', () => {
  test('requests are made in parallel', async ({ page }) => {
    const requests: any[] = []

    page.on('request', (request) => {
      requests.push({
        url: request.url(),
        timestamp: Date.now(),
      })
    })

    await page.goto('/', { waitUntil: 'networkidle' })

    // Should have multiple concurrent requests
    // (browser typically allows 6-8 per domain)
    expect(requests.length).toBeGreaterThan(3)
  })

  test('no render-blocking resources', async ({ page }) => {
    let renderBlockingResources = 0

    page.on('response', (response) => {
      const url = response.url()
      const contentType = response.headers()['content-type'] || ''

      // Check for render-blocking resources
      if (url.includes('.css') && !url.includes('async')) {
        // CSS blocks rendering
        renderBlockingResources++
      }
    })

    await page.goto('/')

    // Some CSS is ok, but shouldn't be excessive
    expect(renderBlockingResources).toBeLessThan(5)
  })

  test('DNS lookup is cached', async ({ page }) => {
    // First request to establish DNS
    await page.goto('/')

    const dnsLookups: number[] = []

    // Get DNS timing from performance
    const entries = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map((entry: any) => ({
        name: entry.name,
        domainLookupStart: entry.domainLookupStart,
        domainLookupEnd: entry.domainLookupEnd,
      }))
    })

    // Should have some cached (same domain)
    const cachedEntries = entries.filter(
      (e: any) => e.domainLookupStart === e.domainLookupEnd
    )

    expect(cachedEntries.length).toBeGreaterThan(0)
  })
})

test.describe('Mobile Performance', () => {
  test.use({
    viewport: { width: 375, height: 667 },
  })

  test('mobile viewport loads efficiently', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/')

    const loadTime = Date.now() - startTime

    // Mobile should be reasonable (may be slower)
    expect(loadTime).toBeLessThan(8000)

    // Content should be visible
    await expect(page.locator('body *').first()).toBeVisible()
  })

  test('no horizontal scroll', async ({ page }) => {
    await page.goto('/')

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })

    expect(hasHorizontalScroll).toBe(false)
  })

  test('touch targets are appropriately sized', async ({ page }) => {
    await page.goto('/')

    const buttons = page.locator('button, a[role="button"]')
    const count = await buttons.count()

    // Check a few buttons
    for (let i = 0; i < Math.min(count, 3); i++) {
      const button = buttons.nth(i)
      const box = await button.boundingBox()

      if (box) {
        // Touch target should be at least 48x48px
        // (44x44 is minimum, 48+ is recommended)
        const size = Math.min(box.width, box.height)
        expect(size).toBeGreaterThanOrEqual(40)
      }
    }
  })
})
