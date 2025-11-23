import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-wrapper'
import { requireTenantContext } from '@/lib/tenant-utils'
import { respond } from '@/lib/api-response'
import prisma from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'

const UserUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  role: z.enum(['ADMIN', 'TEAM_MEMBER', 'CLIENT']).optional(),
  department: z.string().max(100).optional(),
  position: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
})

/**
 * GET /api/admin/users/[id]
 * Get user details
 */
export const GET = withAdminAuth(
  async (request, { params }) => {
    try {
      const ctx = requireTenantContext()
      const { tenantId } = ctx
      const actualParams = await params
      const { id } = actualParams

      const userDetail = await prisma.user.findFirst({
        where: {
          id,
          tenantId: tenantId as string,
        },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
          department: true,
          position: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          emailVerified: true,
          lastLogin: true,
        },
      })

      if (!userDetail) {
        return respond.notFound('User not found')
      }

      return respond.ok({
        data: userDetail,
      })
    } catch (error) {
      console.error('Get user detail error:', error)
      return respond.serverError()
    }
  },
  { requireAuth: true }
)

/**
 * PUT /api/admin/users/[id]
 * Update user details
 */
export const PUT = withAdminAuth(
  async (request, { params }) => {
    try {
      const ctx = requireTenantContext()
      const { tenantId } = ctx
      const actualParams = await params
      const { id } = actualParams
      const body = await request.json()
      const input = UserUpdateSchema.parse(body)

      // Verify user exists and belongs to tenant
      const existing = await prisma.user.findFirst({
        where: { id, tenantId: tenantId as string },
      })

      if (!existing) {
        return respond.notFound('User not found')
      }

      // Update user
      const updated = await prisma.user.update({
        where: { id },
        data: input,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          department: true,
          position: true,
          isActive: true,
          updatedAt: true,
        },
      })

      // Log audit event
      await logAudit({
        userId: ctx.userId,
        action: 'USER_UPDATED',
        entity: 'User',
        entityId: id,
        changes: input,
      })

      return respond.ok({
        data: updated,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return respond.badRequest('Invalid user data', error.errors)
      }
      console.error('Update user error:', error)
      return respond.serverError()
    }
  },
  { requireAuth: true }
)

/**
 * DELETE /api/admin/users/[id]
 * Deactivate/delete user
 */
export const DELETE = withAdminAuth(
  async (request, { params }) => {
    try {
      const ctx = requireTenantContext()
      const { tenantId } = ctx
      const actualParams = await params
      const { id } = actualParams

      // Prevent self-deletion
      if (id === ctx.userId) {
        return respond.badRequest('Cannot deactivate your own user account')
      }

      // Verify user exists and belongs to tenant
      const existing = await prisma.user.findFirst({
        where: { id, tenantId: tenantId as string },
      })

      if (!existing) {
        return respond.notFound('User not found')
      }

      // Soft delete by deactivating
      const deleted = await prisma.user.update({
        where: { id },
        data: { isActive: false },
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true,
        },
      })

      // Log audit event
      await logAudit({
        userId: ctx.userId,
        action: 'USER_DEACTIVATED',
        entity: 'User',
        entityId: id,
        changes: { isActive: false },
      })

      return respond.ok({
        data: deleted,
      })
    } catch (error) {
      console.error('Delete user error:', error)
      return respond.serverError()
    }
  },
  { requireAuth: true }
)
