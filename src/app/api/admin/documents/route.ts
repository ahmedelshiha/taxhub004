'use server'

import { withAdminAuth } from '@/lib/auth-middleware'
import { respond } from '@/lib/api-response'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const AdminDocumentFilterSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  search: z.string().optional(),
  uploadedBy: z.string().optional(),
  status: z.enum(['pending', 'clean', 'infected', 'approved']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.enum(['uploadedAt', 'name', 'size', 'avStatus']).default('uploadedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

type AdminDocumentFilter = z.infer<typeof AdminDocumentFilterSchema>

/**
 * GET /api/admin/documents
 * List all documents in tenant (admin only)
 */
export const GET = withAdminAuth(async (request, context) => {
  const tenantId = (request as any).tenantId
  const userId = (request as any).userId
  try {
    const queryParams = Object.fromEntries(request.nextUrl.searchParams)
    const filters = AdminDocumentFilterSchema.parse(queryParams)

    // Build where clause
    const where: any = { tenantId }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { key: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    if (filters.uploadedBy) {
      where.uploaderId = filters.uploadedBy
    }

    if (filters.status) {
      const statusMap: Record<string, string | null> = {
        pending: 'pending',
        clean: 'clean',
        infected: 'infected',
        approved: 'approved',
      }
      where.avStatus = statusMap[filters.status]
    }

    if (filters.startDate || filters.endDate) {
      where.uploadedAt = {}
      if (filters.startDate) {
        where.uploadedAt.gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        where.uploadedAt.lte = new Date(filters.endDate)
      }
    }

    // Count total
    const total = await prisma.attachment.count({ where })

    // Fetch documents
    const documents = await prisma.attachment.findMany({
      where,
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        versions: {
          select: {
            id: true,
            versionNumber: true,
          },
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
        auditLogs: {
          select: {
            action: true,
            performedAt: true,
          },
          orderBy: { performedAt: 'desc' },
          take: 3,
        },
      },
      orderBy: {
        [filters.sortBy]: filters.sortOrder,
      },
      skip: filters.offset,
      take: filters.limit,
    })

    // Format response with all admin fields
    const formattedDocuments = documents.map((doc) => ({
      id: doc.id,
      name: doc.name,
      size: doc.size,
      contentType: doc.contentType,
      url: doc.url,
      uploadedAt: doc.uploadedAt,
      uploadedBy: doc.uploader,
      status: doc.avStatus,
      key: doc.key,
      provider: doc.provider,
      avDetails: doc.avDetails,
      avThreatName: doc.avThreatName,
      avScanTime: doc.avScanTime,
      avScanAt: doc.avScanAt,
      isStarred: doc.isStarred,
      isQuarantined: doc.avStatus === 'infected',
      metadata: doc.metadata,
      versionCount: doc.versions.length,
      latestVersion: doc.versions[0] || null,
      recentActivity: doc.auditLogs.map((log) => ({
        action: log.action,
        timestamp: log.performedAt,
      })),
    }))

    // Log access
    await prisma.auditLog.create({
      data: {
        tenantId,
        action: 'admin:documents_list',
        userId,
        resource: 'Document',
        metadata: {
          count: documents.length,
          total,
          filters: {
            search: !!filters.search,
            status: filters.status,
          },
        },
      },
    }).catch(() => { })

    return respond.ok({
      data: formattedDocuments,
      meta: {
        total,
        limit: filters.limit,
        offset: filters.offset,
        hasMore: filters.offset + filters.limit < total,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return respond.badRequest('Invalid query parameters', error.errors)
    }
    console.error('Admin documents list error:', error)
    return respond.serverError()
  }
})
