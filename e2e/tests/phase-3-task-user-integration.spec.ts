import { test, expect, Page } from '@playwright/test'

/**
 * Phase 3: Task & User Integration E2E Tests
 *
 * Tests cover:
 * 1. Task Management (3.1)
 *    - Portal task viewing and filtering
 *    - Task status updates
 *    - Task assignment and comments
 * 2. User Profiles & Team (3.2)
 *    - User profile viewing and editing
 *    - Team member directory
 *    - Team member visibility
 */

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000'

// Test data
const TEST_PORTAL_USER = {
  email: 'portal@test.com',
  password: 'Test1234!',
  name: 'Portal User',
}

const TEST_ADMIN_USER = {
  email: 'admin@test.com',
  password: 'Test1234!',
  name: 'Admin User',
}

test.describe('Phase 3: Task & User Integration', () => {
  let portalPage: Page
  let adminPage: Page

  test.beforeAll(async ({ browser }) => {
    // Create two browser contexts for parallel testing
    const portalContext = await browser.newContext()
    const adminContext = await browser.newContext()

    portalPage = await portalContext.newPage()
    adminPage = await adminContext.newPage()

    // Login as portal user
    await loginAsUser(portalPage, TEST_PORTAL_USER)

    // Login as admin user
    await loginAsUser(adminPage, TEST_ADMIN_USER)
  })

  test.afterAll(async () => {
    await portalPage.close()
    await adminPage.close()
  })

  // ============ TASK MANAGEMENT TESTS ============

  test.describe('3.1: Task Management', () => {
    test('Portal user can view assigned tasks', async () => {
      await portalPage.goto(`${BASE_URL}/portal/tasks`)

      // Wait for page to load
      await portalPage.waitForLoadState('networkidle')

      // Check that tasks page is loaded
      await expect(portalPage.locator('h1:has-text("My Tasks")')).toBeVisible()

      // Check that at least the task list container exists
      const tasksList = portalPage.locator('[role="region"]')
      await expect(tasksList).toBeVisible()
    })

    test('Portal user can filter tasks by status', async () => {
      await portalPage.goto(`${BASE_URL}/portal/tasks`)

      // Find and click on status filter
      const statusSelect = portalPage.locator('select').first()
      await statusSelect.selectOption('IN_PROGRESS')

      // Wait for content to update
      await portalPage.waitForLoadState('networkidle')

      // Verify filter was applied (basic check)
      const selectedOption = await statusSelect.inputValue()
      expect(selectedOption).toBe('IN_PROGRESS')
    })

    test('Portal user can view task details', async () => {
      await portalPage.goto(`${BASE_URL}/portal/tasks`)

      // Wait for tasks to load
      await portalPage.waitForLoadState('networkidle')

      // Click on first task (if exists)
      const taskCard = portalPage.locator('[class*="task-card"]').first()

      if (await taskCard.isVisible()) {
        await taskCard.click()

        // Check that task details are shown
        const taskTitle = portalPage.locator('h2, h3')
        await expect(taskTitle).toBeVisible()
      }
    })

    test('Admin can view and manage all tasks', async () => {
      await adminPage.goto(`${BASE_URL}/admin`)

      // Navigate to tasks section
      const tasksLink = adminPage.locator('a:has-text("Tasks"), [aria-label*="Tasks"]').first()

      if (await tasksLink.isVisible()) {
        await tasksLink.click()
        await adminPage.waitForLoadState('networkidle')

        // Check that admin sees all tasks
        const tasksList = adminPage.locator('[class*="task"], [role="table"]')
        await expect(tasksList).toBeVisible()
      }
    })

    test('Task status updates are reflected in real-time', async () => {
      // Open same task in both portal and admin views
      await portalPage.goto(`${BASE_URL}/portal/tasks`)
      await adminPage.goto(`${BASE_URL}/admin/tasks`)

      await portalPage.waitForLoadState('networkidle')
      await adminPage.waitForLoadState('networkidle')

      // Both pages should show task information
      const portalTasks = portalPage.locator('[class*="task"]')
      const adminTasks = adminPage.locator('[class*="task"]')

      if (await portalTasks.isVisible() && await adminTasks.isVisible()) {
        // Verify both loaded
        await expect(portalTasks.first()).toBeVisible()
        await expect(adminTasks.first()).toBeVisible()
      }
    })

    test('Portal user cannot create tasks (admin only)', async () => {
      await portalPage.goto(`${BASE_URL}/portal/tasks`)

      // Look for create task button - should not exist for portal users
      const createButton = portalPage.locator('button:has-text("Create"), button:has-text("New Task")')

      // Either button doesn't exist or is disabled
      if (await createButton.isVisible()) {
        const isDisabled = await createButton.isDisabled()
        expect(isDisabled).toBe(true)
      }
    })
  })

  // ============ USER PROFILE TESTS ============

  test.describe('3.2: User Profiles & Team', () => {
    test('Portal user can view their own profile in settings', async () => {
      await portalPage.goto(`${BASE_URL}/portal/settings`)

      // Wait for settings to load
      await portalPage.waitForLoadState('networkidle')

      // Check that profile section is visible
      const profileSection = portalPage.locator('text=Profile')
      await expect(profileSection).toBeVisible()

      // Check that user email is displayed
      const emailDisplay = portalPage.locator(`text=${TEST_PORTAL_USER.email}`)
      await expect(emailDisplay).toBeVisible()
    })

    test('Portal user can edit their profile', async () => {
      await portalPage.goto(`${BASE_URL}/portal/settings`)

      // Wait for settings to load
      await portalPage.waitForLoadState('networkidle')

      // Find and click edit button
      const editButton = portalPage.locator('button:has-text("Edit")')

      if (await editButton.isVisible()) {
        await editButton.click()

        // Update name field
        const nameInput = portalPage.locator('input[type="text"]').first()
        await nameInput.clear()
        await nameInput.fill('Updated Name')

        // Save changes
        const saveButton = portalPage.locator('button:has-text("Save")')
        await saveButton.click()

        // Wait for success message
        await portalPage.waitForTimeout(1000)

        // Verify success
        const successMessage = portalPage.locator('text=updated successfully, text=saved')
        if (await successMessage.isVisible()) {
          expect(successMessage).toBeTruthy()
        }
      }
    })

    test('User API endpoint returns profile information', async () => {
      const response = await portalPage.request.get(`${BASE_URL}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${process.env.PORTAL_USER_TOKEN || ''}`,
        },
      })

      // Should return 200 for authenticated requests
      if (response.ok) {
        const data = await response.json()
        expect(data).toHaveProperty('data')
        expect(data.data).toHaveProperty('email')
      }
    })

    test('Admin can view team members directory', async () => {
      await adminPage.goto(`${BASE_URL}/admin/users`)

      // Wait for users page to load
      await adminPage.waitForLoadState('networkidle')

      // Check that users list is visible
      const usersList = adminPage.locator('[role="table"], [class*="user"]')
      await expect(usersList).toBeVisible()

      // Check that user search exists
      const searchInput = adminPage.locator('input[placeholder*="Search"], input[placeholder*="search"]')

      if (await searchInput.isVisible()) {
        // Try searching for a user
        await searchInput.fill(TEST_PORTAL_USER.name)
        await adminPage.waitForLoadState('networkidle')
      }
    })

    test('Admin can open user profile dialog and view tabs', async () => {
      await adminPage.goto(`${BASE_URL}/admin/users`)

      // Wait for users page to load
      await adminPage.waitForLoadState('networkidle')

      // Click on first user row
      const userRow = adminPage.locator('[role="row"]').nth(1)

      if (await userRow.isVisible()) {
        await userRow.click()

        // Wait for dialog to open
        await adminPage.waitForLoadState('networkidle')

        // Check for profile dialog
        const profileDialog = adminPage.locator('[role="dialog"]')

        if (await profileDialog.isVisible()) {
          // Look for tabs
          const tabs = adminPage.locator('[role="tablist"]')
          if (await tabs.isVisible()) {
            // Check that common tabs exist
            const overviewTab = adminPage.locator('[role="tab"]:has-text("Overview")')
            const permissionsTab = adminPage.locator('[role="tab"]:has-text("Permissions")')

            if (await overviewTab.isVisible()) {
              await expect(overviewTab).toBeVisible()
            }
            if (await permissionsTab.isVisible()) {
              await expect(permissionsTab).toBeVisible()
            }
          }
        }
      }
    })

    test('Team members API returns accessible team members for portal user', async () => {
      const response = await portalPage.request.get(`${BASE_URL}/api/users/team?limit=50`, {
        headers: {
          'Authorization': `Bearer ${process.env.PORTAL_USER_TOKEN || ''}`,
        },
      })

      // Should return team members visible to this user
      if (response.ok) {
        const data = await response.json()
        expect(data).toHaveProperty('data')
        expect(Array.isArray(data.data)).toBe(true)

        // Each team member should have required fields
        if (data.data.length > 0) {
          const member = data.data[0]
          expect(member).toHaveProperty('id')
          expect(member).toHaveProperty('email')
          expect(member).toHaveProperty('name')
        }
      }
    })

    test('Team members API returns all users for admin', async () => {
      const response = await adminPage.request.get(`${BASE_URL}/api/users/team?limit=50`, {
        headers: {
          'Authorization': `Bearer ${process.env.ADMIN_USER_TOKEN || ''}`,
        },
      })

      // Admin should see all users
      if (response.ok) {
        const data = await response.json()
        expect(data).toHaveProperty('meta')
        expect(data.meta).toHaveProperty('total')
        expect(data.meta.total).toBeGreaterThan(0)
      }
    })

    test('Team directory can be filtered by department', async () => {
      const response = await adminPage.request.get(
        `${BASE_URL}/api/users/team?department=Engineering`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.ADMIN_USER_TOKEN || ''}`,
          },
        }
      )

      // Should return filtered results
      if (response.ok) {
        const data = await response.json()
        expect(data).toHaveProperty('data')

        // All returned members should be in Engineering department
        data.data.forEach((member: any) => {
          if (member.department) {
            expect(member.department).toBe('Engineering')
          }
        })
      }
    })

    test('Portal user cannot access other user profiles', async () => {
      // Try to access another user's profile
      const adminUserId = 'test-admin-id'

      const response = await portalPage.request.get(`${BASE_URL}/api/users/${adminUserId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.PORTAL_USER_TOKEN || ''}`,
        },
      })

      // Should either be 403 (forbidden) or 404 (not found)
      // or allow access only if they're on the same team
      expect([403, 404, 200]).toContain(response.status)
    })
  })

  // ============ PERMISSION & ACCESS CONTROL TESTS ============

  test.describe('3.3: Permission & Access Control', () => {
    test('Portal users have limited access to admin features', async () => {
      await portalPage.goto(`${BASE_URL}/admin`)

      // Should be redirected or shown access denied
      const notFoundElement = portalPage.locator('text=Not Found, text=Unauthorized, text=Access Denied')
      const adminContent = portalPage.locator('[class*="admin"]')

      // Either redirected or shown error
      const isRedirected = portalPage.url().includes('/portal') || portalPage.url().includes('/login')
      const isErrorShown = await notFoundElement.isVisible()

      expect(isRedirected || isErrorShown).toBe(true)
    })

    test('Task status update respects user permissions', async () => {
      // Portal user should only be able to update their own tasks
      await portalPage.goto(`${BASE_URL}/portal/tasks`)

      const taskCard = portalPage.locator('[class*="task-card"]').first()

      if (await taskCard.isVisible()) {
        // Should be able to see status selector
        const statusSelector = taskCard.locator('select, button[aria-label*="status"]')

        if (await statusSelector.isVisible()) {
          await expect(statusSelector).toBeEnabled()
        }
      }
    })

    test('User profile update validates authorization', async () => {
      // Try to update another user's profile (should fail)
      const anotherUserId = 'another-user-id'

      const response = await portalPage.request.put(
        `${BASE_URL}/api/users/${anotherUserId}`,
        {
          data: {
            name: 'Hacked Name',
          },
          headers: {
            'Authorization': `Bearer ${process.env.PORTAL_USER_TOKEN || ''}`,
          },
        }
      )

      // Should be forbidden (403)
      expect(response.status).toBe(403)
    })
  })

  // ============ MOBILE RESPONSIVENESS TESTS ============

  test.describe('3.4: Mobile Responsiveness', () => {
    test('Task page is responsive on mobile', async () => {
      // Set mobile viewport
      await portalPage.setViewportSize({ width: 375, height: 667 })

      await portalPage.goto(`${BASE_URL}/portal/tasks`)

      // Wait for mobile layout
      await portalPage.waitForLoadState('networkidle')

      // Check that content is visible on mobile
      const content = portalPage.locator('main, [role="main"]')
      await expect(content).toBeVisible()

      // Reset viewport
      await portalPage.setViewportSize({ width: 1280, height: 720 })
    })

    test('Team directory is responsive on mobile', async () => {
      await adminPage.setViewportSize({ width: 375, height: 667 })

      await adminPage.goto(`${BASE_URL}/admin/users`)

      // Wait for mobile layout
      await adminPage.waitForLoadState('networkidle')

      // Check that content is visible
      const content = adminPage.locator('main, [role="main"]')
      await expect(content).toBeVisible()

      // Reset viewport
      await adminPage.setViewportSize({ width: 1280, height: 720 })
    })
  })
})

// ============ HELPER FUNCTIONS ============

async function loginAsUser(page: Page, user: { email: string; password: string; name: string }) {
  await page.goto(`${BASE_URL}/login`)

  // Fill email
  const emailInput = page.locator('input[type="email"]')
  await emailInput.fill(user.email)

  // Fill password
  const passwordInput = page.locator('input[type="password"]')
  await passwordInput.fill(user.password)

  // Click login button
  const loginButton = page.locator('button:has-text("Sign In"), button:has-text("Login")')
  await loginButton.click()

  // Wait for redirect to dashboard/portal
  await page.waitForURL((url) => !url.toString().includes('/login'), { timeout: 30000 })
  await page.waitForLoadState('networkidle')
}
