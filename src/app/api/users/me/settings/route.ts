import { NextRequest, NextResponse } from 'next/server'
import { withTenantContext } from '@/lib/api-wrapper'
import { requireTenantContext } from '@/lib/tenant-utils'
import { respond } from '@/lib/api-response'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'

const SettingsUpdateSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  twoFactorEnabled: z.boolean().optional(),
  language: z.string().max(10).optional(),
  timezone: z.string().max(50).optional(),
  notificationFrequency: z.enum(['instant', 'daily', 'weekly', 'never']).optional(),
})

type SettingsInput = z.infer<typeof SettingsUpdateSchema>

/**
 * GET /api/users/me/settings
 * Get user preferences and settings
 */
export const GET = withTenantContext(
  async (request, { params }) => {
    try {
      const ctx = requireTenantContext()
      // Fetch user settings from database
      const userSettings = await prisma.user.findUnique({
        where: { id: ctx.userId },
        select: {
          id: true,
          preferences: true, // Assuming a JSON field in the schema
        },
      })

      if (!userSettings) {
        return respond.notFound('User not found')
      }

      // Return default settings if none exist
      const settings = userSettings.preferences || {
        theme: 'system',
        emailNotifications: true,
        pushNotifications: true,
        twoFactorEnabled: false,
        language: 'en',
        timezone: 'UTC',
        notificationFrequency: 'instant',
      }

      return respond.ok({
        data: settings,
      })
    } catch (error) {
      console.error('Get settings error:', error)
      return respond.serverError()
    }
  },
  { requireAuth: true }
)

/**
 * PUT /api/users/me/settings
 * Update user preferences and settings
 */
export const PUT = withTenantContext(
  async (request, { params }) => {
    try {
      const ctx = requireTenantContext()
      const { tenantId } = ctx
      const body = await request.json()
      const input = SettingsUpdateSchema.parse(body)

      // Get current settings
      const currentUser = await prisma.user.findUnique({
        where: { id: ctx.userId },
        select: { preferences: true },
      })

      const currentSettings = currentUser?.preferences || {
        theme: 'system',
        emailNotifications: true,
        pushNotifications: true,
        twoFactorEnabled: false,
        language: 'en',
        timezone: 'UTC',
        notificationFrequency: 'instant',
      }

      // Merge new settings with existing
      const settingsObj = typeof currentSettings === 'object' && currentSettings !== null
        ? currentSettings as Record<string, any>
        : {}
      const updatedSettings = {
        ...settingsObj,
        ...input,
      }

      // Update settings
      const updated = await prisma.user.update({
        where: { id: ctx.userId },
        data: {
          preferences: updatedSettings,
        },
        select: {
          id: true,
          preferences: true,
        },
      })

      // Log audit event
      await logAudit({
        tenantId,
        userId: ctx.userId,
        action: 'SETTINGS_UPDATED',
        entity: 'UserSettings',
        entityId: ctx.userId,
        changes: input,
      })

      return respond.ok({
        data: updated.preferences,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return respond.badRequest('Invalid settings', error.errors)
      }
      console.error('Update settings error:', error)
      return respond.serverError()
    }
  },
  { requireAuth: true }
)
