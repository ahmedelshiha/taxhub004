import { NextRequest, NextResponse } from 'next/server'
import { withTenantContext } from '@/lib/api-wrapper'
import { requireTenantContext } from '@/lib/tenant-utils'
import { respond } from '@/lib/api-response'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'

const ProfileUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  image: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  department: z.string().max(100).optional(),
  position: z.string().max(100).optional(),
  phoneNumber: z.string().max(20).optional(),
})

/**
 * GET /api/users/me
 * Get current user profile
 */
export const GET = withTenantContext(
  async (request, { params }) => {
    try {
      const ctx = requireTenantContext()
      const profile = await prisma.user.findUnique({
        where: { id: ctx.userId },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          bio: true,
          department: true,
          position: true,
          createdAt: true,
          updatedAt: true,
          role: true,
          emailVerified: true,
        },
      })

      if (!profile) {
        return respond.notFound('User not found')
      }

      return respond.ok({
        data: profile,
      })
    } catch (error) {
      console.error('Get profile error:', error)
      return respond.serverError()
    }
  },
  { requireAuth: true }
)

/**
 * PUT /api/users/me
 * Update current user profile
 */
export const PUT = withTenantContext(
  async (request, { params }) => {
    try {
      const ctx = requireTenantContext()
      const body = await request.json()
      const input = ProfileUpdateSchema.parse(body)

      // Prevent email changes (security - require email verification)
      if (input.email && input.email !== ctx.userEmail) {
        return respond.forbidden('Email changes require verification. Contact support.')
      }

      // Update profile
      const updated = await prisma.user.update({
        where: { id: ctx.userId },
        data: {
          name: input.name,
          image: input.image,
          bio: input.bio,
          department: input.department,
          position: input.position,
        },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          bio: true,
          department: true,
          position: true,
          createdAt: true,
          updatedAt: true,
          role: true,
        },
      })

      // Log audit event
      await logAudit({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        action: 'PROFILE_UPDATED',
        entity: 'User',
        entityId: ctx.userId,
        changes: input,
      })

      return respond.ok({
        data: updated,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return respond.badRequest('Invalid input', error.errors)
      }
      console.error('Update profile error:', error)
      return respond.serverError()
    }
  },
  { requireAuth: true }
)
