'use server'

import { NextRequest } from 'next/server'
import { withTenantContext } from '@/lib/api-wrapper'
import { requireTenantContext } from '@/lib/tenant-utils'
import { respond } from '@/lib/api-response'
import prisma from '@/lib/prisma'
import { z } from 'zod'

/**
 * GET /api/documents/[id]
 * Get document details
 */
export const GET = withTenantContext(async (request: NextRequest, { params }: any) => {
  try {
    const ctx = requireTenantContext()
    const { tenantId, userId, role } = ctx
    const userRole = role

    const document = await prisma.attachment.findFirst({
      where: {
        id: params.id,
        tenantId: tenantId as string,
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        versions: {
          orderBy: { versionNumber: 'desc' },
          include: {
            uploader: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        links: {
          select: {
            id: true,
            linkedToType: true,
            linkedToId: true,
            linkedAt: true,
            linkedBy: true,
          },
        },
        auditLogs: {
          select: {
            id: true,
            action: true,
            details: true,
            performedBy: true,
            performedAt: true,
          },
          orderBy: { performedAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!document) {
      return respond.notFound('Document not found')
    }

    // Authorization check - portal users can only see their own documents
    if (userRole !== 'ADMIN' && document.uploaderId !== userId) {
      return respond.forbidden('You do not have access to this document')
    }

    // Format response based on role
    const baseData = {
      id: document.id,
      name: document.name,
      size: document.size,
      contentType: document.contentType,
      url: document.url,
      uploadedAt: document.uploadedAt,
      uploadedBy: document.uploader,
      status: document.avStatus,
      isStarred: document.isStarred,
      isQuarantined: document.avStatus === 'infected',
      versions: document.versions.map((v) => ({
        id: v.id,
        number: v.versionNumber,
        uploadedAt: v.uploadedAt,
        uploadedBy: v.uploader,
        changeDescription: v.changeDescription,
      })),
      links: document.links,
      recentAuditLogs: document.auditLogs,
    }

    // Admin gets additional details
    if (userRole === 'ADMIN') {
      return respond.ok({
        data: {
          ...baseData,
          key: document.key,
          provider: document.provider,
          metadata: document.metadata,
          avDetails: document.avDetails,
          avThreatName: document.avThreatName,
          avScanTime: document.avScanTime,
          avScanAt: document.avScanAt,
        },
      })
    }

    // Log access
    await prisma.auditLog.create({
      data: {
        tenantId,
        action: 'documents:view',
        userId,
        resource: 'Document',
      },
    }).catch(() => { })

    return respond.ok({ data: baseData })
  } catch (error) {
    console.error('Get document error:', error)
    return respond.serverError()
  }
})

/**
 * PUT /api/documents/[id]
 * Update document metadata
 */
export const PUT = withTenantContext(async (request: NextRequest, { params }: any) => {
  try {
    const ctx = requireTenantContext()
    const { tenantId, userId, role } = ctx
    const userRole = role

    const document = await prisma.attachment.findFirst({
      where: {
        id: params.id,
        tenantId: tenantId as string,
      },
    })

    if (!document) {
      return respond.notFound('Document not found')
    }

    // Authorization - only uploader or admin can update
    if (userRole !== 'ADMIN' && document.uploaderId !== userId) {
      return respond.forbidden('You do not have permission to update this document')
    }

    const body = await request.json()
    const UpdateSchema = z.object({
      name: z.string().optional(),
      isStarred: z.boolean().optional(),
      metadata: z.record(z.any()).optional(),
    })

    const updateData = UpdateSchema.parse(body)

    // Merge metadata
    const currentMetadata = typeof document.metadata === 'object' && document.metadata !== null
      ? document.metadata as Record<string, any>
      : {}
    const newMetadata = updateData.metadata
      ? { ...currentMetadata, ...updateData.metadata }
      : document.metadata

    const updated = await prisma.attachment.update({
      where: { id: params.id },
      data: {
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.isStarred !== undefined && { isStarred: updateData.isStarred }),
        ...(newMetadata && { metadata: newMetadata }),
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Log audit
    await prisma.auditLog.create({
      data: {
        tenantId,
        action: 'documents:update',
        userId,
        resource: 'Document',
        metadata: updateData,
      },
    }).catch(() => { })

    return respond.ok({
      data: {
        id: updated.id,
        name: updated.name,
        size: updated.size,
        contentType: updated.contentType,
        url: updated.url,
        uploadedAt: updated.uploadedAt,
        uploadedBy: updated.uploader,
        status: updated.avStatus,
        isStarred: updated.isStarred,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return respond.badRequest('Invalid update data', error.errors)
    }
    console.error('Update document error:', error)
    return respond.serverError()
  }
})

/**
 * DELETE /api/documents/[id]
 * Delete document (soft delete for portal, hard delete for admin)
 */
export const DELETE = withTenantContext(async (request: NextRequest, { params }: any) => {
  try {
    const ctx = requireTenantContext()
    const { tenantId, userId, role } = ctx
    const userRole = role

    const document = await prisma.attachment.findFirst({
      where: {
        id: params.id,
        tenantId: tenantId as string,
      },
    })

    if (!document) {
      return respond.notFound('Document not found')
    }

    // Authorization
    if (userRole !== 'ADMIN' && document.uploaderId !== userId) {
      return respond.forbidden('You do not have permission to delete this document')
    }

    // Log deletion
    await prisma.auditLog.create({
      data: {
        tenantId,
        action: 'documents:delete',
        userId,
        resource: 'Document',
        metadata: {
          documentName: document.name,
          documentSize: document.size,
        },
      },
    }).catch(() => { })

    // Admin: hard delete, Portal user: soft delete (archive)
    if (userRole === 'ADMIN') {
      // Hard delete - cascade handles versions, links, audit logs
      await prisma.attachment.delete({
        where: { id: params.id },
      })

      return respond.ok({
        data: {
          id: params.id,
          deleted: true,
          message: 'Document permanently deleted',
        },
      })
    } else {
      // Soft delete - mark as deleted in metadata
      const currentMetadata = typeof document.metadata === 'object' && document.metadata !== null
        ? document.metadata as Record<string, any>
        : {}
      await prisma.attachment.update({
        where: { id: params.id },
        data: {
          metadata: {
            ...currentMetadata,
            deletedAt: new Date().toISOString(),
            deletedBy: userId,
          },
        },
      })

      return respond.ok({
        data: {
          id: params.id,
          archived: true,
          message: 'Document archived (can be restored)',
        },
      })
    }
  } catch (error) {
    console.error('Delete document error:', error)
    return respond.serverError()
  }
})
