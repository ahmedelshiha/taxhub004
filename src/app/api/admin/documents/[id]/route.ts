'use server'

import { withAdminAuth } from '@/lib/auth-middleware'
import { respond } from '@/lib/api-response'
import prisma from '@/lib/prisma'
import { z } from 'zod'

/**
 * GET /api/admin/documents/[id]
 * Get document details (admin view with all fields)
 */
export const GET = withAdminAuth(async (request, context) => {
  const tenantId = (request as any).tenantId
  const params = context?.params || {}
  try {
    const document = await prisma.attachment.findFirst({
      where: {
        id: params.id,
        tenantId,
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
        links: true,
        auditLogs: {
          orderBy: { performedAt: 'desc' },
        },
      },
    })

    if (!document) {
      return respond.notFound('Document not found')
    }

    return respond.ok({
      data: {
        id: document.id,
        name: document.name,
        size: document.size,
        contentType: document.contentType,
        url: document.url,
        key: document.key,
        provider: document.provider,
        uploadedAt: document.uploadedAt,
        uploadedBy: document.uploader,
        status: document.avStatus,
        avDetails: document.avDetails,
        avThreatName: document.avThreatName,
        avScanTime: document.avScanTime,
        avScanAt: document.avScanAt,
        isStarred: document.isStarred,
        isQuarantined: document.avStatus === 'infected',
        metadata: document.metadata,
        versions: document.versions.map((v) => ({
          id: v.id,
          number: v.versionNumber,
          uploadedAt: v.uploadedAt,
          uploadedBy: v.uploader,
          changeDescription: v.changeDescription,
        })),
        links: document.links,
        auditLogs: document.auditLogs.map((log) => ({
          id: log.id,
          action: log.action,
          details: log.details,
          performedBy: log.performedBy,
          performedAt: log.performedAt,
        })),
      },
    })
  } catch (error) {
    console.error('Get admin document error:', error)
    return respond.serverError()
  }
})

/**
 * DELETE /api/admin/documents/[id]
 * Force delete document (admin only, hard delete)
 */
export const DELETE = withAdminAuth(async (request, context) => {
  const tenantId = (request as any).tenantId
  const userId = (request as any).userId
  const params = context?.params || {}
  try {
    const document = await prisma.attachment.findFirst({
      where: {
        id: params.id,
        tenantId,
      },
    })

    if (!document) {
      return respond.notFound('Document not found')
    }

    // Log deletion
    await prisma.auditLog.create({
      data: {
        tenantId,
        action: 'admin:documents_delete',
        userId,
        resource: 'Document',
        metadata: {
          documentName: document.name,
          documentSize: document.size,
          deletedBy: userId,
        },
      },
    }).catch(() => {})

    // Hard delete with cascading
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
  } catch (error) {
    console.error('Delete document error:', error)
    return respond.serverError()
  }
})
