import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-wrapper'
import { requireTenantContext } from '@/lib/tenant-utils'
import { respond } from '@/lib/api-response'
import prisma from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'

const UserListFilterSchema = z.object({
  role: z.string().optional(),
  department: z.string().optional(),
  search: z.string().optional(),
  active: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  offset: z.coerce.number().int().min(0).default(0),
})

const UserCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  role: z.enum(['ADMIN', 'TEAM_MEMBER', 'CLIENT']).default('TEAM_MEMBER'),
  department: z.string().max(100).optional(),
  position: z.string().max(100).optional(),
})

/**
 * GET /api/admin/users
 * List all users with filtering and pagination
 */
export const GET = withAdminAuth(
  async (request) => {
    try {
      const ctx = requireTenantContext()
      const { tenantId } = ctx

      const { searchParams } = new URL(request.url)
      const filters = UserListFilterSchema.parse(Object.fromEntries(searchParams))

      // Build query
      const where: any = { tenantId: tenantId as string }

      if (filters.role) {
        where.role = filters.role
      }

      if (filters.department) {
        where.department = filters.department
      }

      if (filters.active !== undefined) {
        where.isActive = filters.active
      }

      if (filters.search) {
        where.OR = [
          { email: { contains: filters.search, mode: 'insensitive' } },
          { name: { contains: filters.search, mode: 'insensitive' } },
          { department: { contains: filters.search, mode: 'insensitive' } },
        ]
      }

      // Get total count
      const total = await prisma.user.count({ where })

      // Get paginated results
      const data = await prisma.user.findMany({
        where,
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
      console.error('User list error:', error)
      return respond.serverError()
    }
  }
)

/**
 * POST /api/admin/users
 * Create a new user
 */
export const POST = withAdminAuth(
  async (request) => {
    try {
      const ctx = requireTenantContext()
      const { tenantId, userId } = ctx

      const body = await request.json()
      const input = UserCreateSchema.parse(body)

      // Check if user with email already exists in tenant
      const existingUser = await prisma.user.findFirst({
        where: {
          email: input.email,
          tenantId: tenantId as string,
        },
      })

      if (existingUser) {
        return respond.badRequest('User with this email already exists in this organization')
      }

      // Create new user
      const newUser = await prisma.user.create({
        data: {
          email: input.email,
          name: input.name,
          role: input.role,
          department: input.department,
          position: input.position,
          tenantId: tenantId as string,
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          department: true,
          position: true,
          isActive: true,
          createdAt: true,
        },
      })

      // Log audit event
      await logAudit({
        tenantId,
        userId,
        action: 'USER_CREATED',
        entity: 'User',
        entityId: newUser.id,
        changes: input,
      })

      return respond.created({
        data: newUser,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return respond.badRequest('Invalid user data', error.errors)
      }
      console.error('User creation error:', error)
      return respond.serverError()
    }
  },
  { requireAuth: true }
)
