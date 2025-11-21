'use server'

import { withTenantAuth } from '@/lib/auth-middleware'
import { respond } from '@/lib/api-response'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'

/**
 * GET /api/documents/[id]/download
 * Download document with permission check and audit logging
 */
export const GET = withTenantAuth(async (request, { tenantId, user }, { params }) => {
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
          },
        },
      },
    })

    if (!document) {
      return respond.notFound('Document not found')
    }

    // Authorization check
    if (user.role !== 'ADMIN' && document.uploaderId !== user.id) {
      return respond.forbidden('You do not have access to this document')
    }

    // Check if document is quarantined
    if (document.avStatus === 'infected') {
      return respond.forbidden('This document is quarantined due to security concerns and cannot be downloaded')
    }

    // Check if document is still pending scan
    if (document.avStatus === 'pending') {
      return respond.conflict(
        'Document is still being scanned. Please wait before downloading.'
      )
    }

    // Verify URL exists
    if (!document.url) {
      console.error('Document has no URL:', document.id)
      return respond.serverError('Document URL not found')
    }

    // Log download
    await prisma.auditLog.create({
      data: {
        tenantId,
        action: 'documents:download',
        userId: user.id,
        resourceType: 'Document',
        resourceId: document.id,
        details: {
          documentName: document.name,
          documentSize: document.size,
          downloadedBy: user.id,
        },
      },
    }).catch(() => {})

    // Create download record for analytics
    await prisma.documentAuditLog.create({
      data: {
        attachmentId: document.id,
        action: 'download',
        performedBy: user.id,
        performedAt: new Date(),
        tenantId,
        details: {
          userAgent: request.headers.get('user-agent'),
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      },
    }).catch(() => {})

    // Return download response with redirect to signed URL
    return Response.redirect(document.url, 302)
  } catch (error) {
    console.error('Download document error:', error)
    return respond.serverError()
  }
})
