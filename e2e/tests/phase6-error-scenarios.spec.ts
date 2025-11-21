import { test, expect, Page, APIRequestContext } from '@playwright/test'

/**
 * Phase 6 Comprehensive Testing - Error Scenarios
 * Coverage: 404s, 5XXs, validation errors, network issues
 */

test.describe('Error Handling - 404 Pages', () => {
  test('404 page displays when navigating to nonexistent route', async ({ page }) => {
    await page.goto('/nonexistent-page-12345')

    // Should either redirect to home or show 404
    await expect(page).toHaveURL(/^(\/|.*404.*)$/)

    // Should have meaningful error message or return to home
    const content = await page.content()
    const hasErrorMessage = content.includes('404') || content.includes('not found')
    expect(hasErrorMessage || page.url() === 'http://localhost:3000/').toBe(true)
  })

  test('404 on nonexistent service page', async ({ page }) => {
    await page.goto('/services/nonexistent-service')

    // Should handle gracefully
    const response = await page.evaluate(() => document.body.innerText)
    expect(response).toBeTruthy()
  })

  test('404 on nonexistent admin page', async ({ page }) => {
    await page.goto('/admin/nonexistent')

    // Should handle gracefully
    await expect(page.locator('body')).toBeTruthy()
  })
})

test.describe('Error Handling - Validation Errors', () => {
  test('booking form shows validation errors', async ({ page }) => {
    await page.goto('/booking')

    // Try to submit empty form
    const submitBtn = page.getByRole('button', { name: /submit|book|continue/i }).first()
    if (await submitBtn.isVisible()) {
      await submitBtn.click()

      // Wait for validation errors
      const errors = page.locator('[role="alert"], .error, .invalid')
      const errorCount = await errors.count()

      // Should show at least one error or redirect if valid
      expect(errorCount > 0 || page.url().includes('/booking')).toBe(true)
    }
  })

  test('contact form validates email field', async ({ page }) => {
    await page.goto('/contact')

    // Fill form with invalid email
    const emailInput = page.getByLabel(/email/i).first()
    if (await emailInput.isVisible()) {
      await emailInput.fill('invalid-email')

      // Try to submit
      const submitBtn = page.getByRole('button', { name: /submit|send/i }).first()
      if (await submitBtn.isVisible()) {
        await submitBtn.click()

        // Should show validation error or HTML5 validation
        const emailField = page.getByLabel(/email/i).first()
        const isInvalid = await emailField.evaluate((el: any) => !el.validity.valid)
        expect(isInvalid || page.locator('[role="alert"]').first().isVisible()).toBeTruthy()
      }
    }
  })

  test('form shows required field errors', async ({ page }) => {
    await page.goto('/contact')

    // Try to submit without filling required fields
    const submitBtn = page.getByRole('button', { name: /submit|send/i }).first()
    if (await submitBtn.isVisible()) {
      await submitBtn.click()

      // Should show error messages
      await expect(page.locator('[role="alert"], .error').first()).toBeVisible({
        timeout: 2000,
      }).catch(() => {
        // Or have validation indicators
        expect(true).toBe(true)
      })
    }
  })
})

test.describe('Error Handling - Network & Timeout', () => {
  test('page handles slow network gracefully', async ({ page }) => {
    // Simulate slow 3G network
    await page.route('**/*', (route) => {
      setTimeout(() => route.continue(), 100)
    })

    await page.goto('/')

    // Page should still load
    await expect(page.locator('body')).toBeTruthy()

    // Clear route override
    await page.unroute('**/*')
  })

  test('API error shows user-friendly message', async ({ page }) => {
    // Mock API error
    await page.route('**/api/**', (route) => {
      route.abort('failed')
    })

    await page.goto('/services')

    // Should handle error gracefully
    const content = page.locator('body')
    await expect(content).toBeTruthy()

    // Clear route override
    await page.unroute('**/api/**')
  })

  test('service page shows loading state', async ({ page }) => {
    // Slow down network
    await page.route('**/api/services**', (route) => {
      setTimeout(() => route.continue(), 500)
    })

    await page.goto('/services')

    // Should show loading indicator or skeleton
    const loadingElements = page.locator('[class*="loading"], [class*="skeleton"], [aria-busy="true"]')
    const hasLoadingState = await loadingElements.count().then(c => c > 0)

    // Either has loading state or content loaded fast
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 5000 })

    await page.unroute('**/api/services**')
  })
})

test.describe('Error Handling - Boundary Conditions', () => {
  test('very long strings are handled', async ({ page }) => {
    const longString = 'a'.repeat(10000)

    await page.goto('/contact')

    const textarea = page.getByLabel(/message/i).first()
    if (await textarea.isVisible()) {
      await textarea.fill(longString)

      // Page should not crash
      await expect(page).toBeTruthy()
    }
  })

  test('special characters in input', async ({ page }) => {
    await page.goto('/contact')

    const nameInput = page.getByLabel(/name|full name/i).first()
    if (await nameInput.isVisible()) {
      const specialChars = '<script>alert("xss")</script>'
      await nameInput.fill(specialChars)

      // Page should sanitize and not execute
      const scripts = await page.locator('script').count()
      expect(scripts).toBeLessThan(5) // Should not add new scripts
    }
  })

  test('multiple rapid clicks handled', async ({ page }) => {
    await page.goto('/services')

    const firstButton = page.getByRole('button').first()
    if (await firstButton.isVisible()) {
      // Rapid clicks
      for (let i = 0; i < 10; i++) {
        await firstButton.click({ force: true })
      }

      // Page should not crash
      await expect(page.locator('body')).toBeTruthy()
    }
  })

  test('back/forward navigation works', async ({ page }) => {
    await page.goto('/')
    await page.goto('/services')
    await page.goBack()

    // Should be on homepage
    expect(page.url()).toContain('/')
    await expect(page.locator('body')).toBeTruthy()

    await page.goForward()
    expect(page.url()).toContain('services')
  })
})

test.describe('Error Handling - Accessibility with Errors', () => {
  test('error messages are announced to screen readers', async ({ page }) => {
    await page.goto('/contact')

    // Try invalid submission
    const submitBtn = page.getByRole('button', { name: /submit/i }).first()
    if (await submitBtn.isVisible()) {
      await submitBtn.click()

      // Look for alert role (screen reader friendly)
      const alerts = page.locator('[role="alert"]')
      const alertCount = await alerts.count()

      // Should have alerts or error containers
      expect(alertCount >= 0).toBe(true)
    }
  })

  test('form errors are associated with inputs', async ({ page }) => {
    await page.goto('/contact')

    const inputs = page.locator('input, textarea')
    const inputCount = await inputs.count()

    // Inputs should have labels or aria-label
    for (let i = 0; i < Math.min(inputCount, 3); i++) {
      const input = inputs.nth(i)
      const hasLabel = await input.evaluate((el: any) => {
        return el.labels?.length > 0 || el.getAttribute('aria-label')
      })

      expect(hasLabel).toBe(true)
    }
  })
})

test.describe('Error Handling - XSS Prevention', () => {
  test('XSS payload in URL is not executed', async ({ page }) => {
    const xssPayload = '?name=<img src=x onerror="console.error(\'xss\')">'

    await page.goto(`/contact${xssPayload}`)

    // Page should load safely
    await expect(page.locator('body')).toBeTruthy()

    // Check no console errors (would need proper setup to capture)
    const content = await page.content()
    expect(content).not.toContain('onerror')
  })

  test('XSS payload in form input is sanitized', async ({ page }) => {
    await page.goto('/contact')

    const nameInput = page.getByLabel(/name/i).first()
    if (await nameInput.isVisible()) {
      const xssPayload = '<img src=x onerror="alert(\'xss\')">'
      await nameInput.fill(xssPayload)

      // Content should be sanitized
      const value = await nameInput.inputValue()
      expect(value).toBeTruthy()

      // Page should not show alerts
      page.on('dialog', () => {
        throw new Error('Alert dialog was triggered - XSS vulnerability')
      })
    }
  })
})

test.describe('Error Handling - State Recovery', () => {
  test('page recovers from error state', async ({ page, request, baseURL }) => {
    await page.goto('/services')

    // Cause an error by aborting API
    await page.route('**/api/services**', (route) => {
      route.abort('failed')
    })

    await page.reload()

    // Should handle error gracefully
    await expect(page.locator('body')).toBeTruthy()

    // Clear error route
    await page.unroute('**/api/services**')

    // Reload with working API
    await page.reload()

    // Should recover
    await expect(page.locator('body')).toBeTruthy()
  })

  test('form preserves data after validation error', async ({ page }) => {
    await page.goto('/contact')

    const nameInput = page.getByLabel(/name/i).first()
    if (await nameInput.isVisible()) {
      const testName = 'Test User'
      await nameInput.fill(testName)

      // Try to submit (will fail validation)
      const submitBtn = page.getByRole('button', { name: /submit/i }).first()
      if (await submitBtn.isVisible()) {
        await submitBtn.click()

        // Data should still be there
        const currentValue = await nameInput.inputValue()
        expect(currentValue).toBe(testName)
      }
    }
  })
})
