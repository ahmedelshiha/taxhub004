import { NextRequest, NextResponse } from 'next/server'
import { withTenantContext } from '@/lib/api-wrapper'
import { requireTenantContext } from '@/lib/tenant-utils'
import { respond } from '@/lib/api-response'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const FilterSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  action: z.string().optional(),
  entity: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
})

/**
 * GET /api/users/me/activity
 * Get current user's activity log
 *
 * Query Parameters:
 * - limit: Number of records (default 20, max 100)
 * - offset: Pagination offset (default 0)
 * - action: Filter by action type (e.g., TASK_CREATED, PROFILE_UPDATED)
 * - entity: Filter by entity type (e.g., Task, User, Service)
 * - dateFrom: Start date for activity
 * - dateTo: End date for activity
 */
export const GET = withTenantContext(
  async (request, { params }) => {
    try {
      const ctx = requireTenantContext()
      const { tenantId, userId } = ctx
      const { searchParams } = new URL(request.url)
      const filters = FilterSchema.parse(Object.fromEntries(searchParams))

      // Build query
      const where: any = {
        userId,
        tenantId,
      }

      if (filters.action) {
        where.action = filters.action
      }

      if (filters.entity) {
        where.entity = filters.entity
      }

      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {}
        if (filters.dateFrom) {
          where.createdAt.gte = new Date(filters.dateFrom)
        }
        if (filters.dateTo) {
          where.createdAt.lte = new Date(filters.dateTo)
        }
      }

      // Get total count
      const total = await prisma.auditLog.count({ where })

      // Get paginated results
      const data = await prisma.auditLog.findMany({
        where,
        select: {
          id: true,
          action: true,
          resource: true,
          metadata: true,
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
      console.error('Get activity error:', error)
      return respond.serverError()
    }
  },
  { requireAuth: true }
)
