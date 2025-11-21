'use server'

import { withTenantAuth } from '@/lib/auth-middleware'
import { respond } from '@/lib/api-response'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'

/**
 * GET /api/documents/[id]/download
 * Download document with permission check and audit logging
 */
export const GET = withTenantAuth(async (request: any, { params }: any) => {
  try {
    const { userId, tenantId, userRole } = request as any
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
    if (userRole !== 'ADMIN' && document.uploaderId !== userId) {
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
        userId,
        resource: 'Document',
        metadata: {
          documentId: document.id,
          documentName: document.name,
          documentSize: document.size,
          downloadedBy: userId,
        },
      },
    }).catch(() => {})

    return Response.redirect(document.url, 302)
  } catch (error) {
    console.error('Download document error:', error)
    return respond.serverError()
  }
})
