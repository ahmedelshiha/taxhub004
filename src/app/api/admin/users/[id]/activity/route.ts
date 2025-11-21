import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-wrapper'
import { requireTenantContext } from '@/lib/tenant-utils'
import { respond } from '@/lib/api-response'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const FilterSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

/**
 * GET /api/admin/users/[id]/activity
 * Get user's activity log (admin view)
 */
export const GET = withAdminAuth(
  async (request, { params }) => {
    try {
      const ctx = requireTenantContext()
      const { tenantId } = ctx
      const actualParams = await params
      const { id } = actualParams
      const { searchParams } = new URL(request.url)
      const filters = FilterSchema.parse(Object.fromEntries(searchParams))

      // Verify user exists and belongs to tenant
      const userExists = await prisma.user.findFirst({
        where: { id, tenantId },
      })

      if (!userExists) {
        return respond.notFound('User not found')
      }

      // Build query
      const where: any = {
        userId: id,
        tenantId,
      }

      // Get total count
      const total = await prisma.auditLog.count({ where })

      // Get paginated results
      const data = await prisma.auditLog.findMany({
        where,
        select: {
          id: true,
          action: true,
          entity: true,
          entityId: true,
          changes: true,
          details: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: filters.offset,
        take: filters.limit,
      })

      return respond.ok({
        data,
        meta: {
          total,
          limit: filters.limit,
          offset: filters.offset,
          hasMore: filters.offset + filters.limit < total,
        },
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return respond.badRequest('Invalid filters', error.errors)
      }
      console.error('Get user activity error:', error)
      return respond.serverError()
    }
  },
  { requireAuth: true }
)
