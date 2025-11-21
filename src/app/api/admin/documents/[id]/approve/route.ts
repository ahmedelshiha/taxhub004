'use server'

import { withAdminAuth } from '@/lib/auth-middleware'
import { respond } from '@/lib/api-response'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const ApprovalSchema = z.object({
  approved: z.boolean(),
  notes: z.string().optional(),
  expiresIn: z.number().int().positive().optional(), // Days until approval expires
})

/**
 * POST /api/admin/documents/[id]/approve
 * Approve or reject a document
 */
export const POST = withAdminAuth(async (request, context) => {
  try {
    const tenantId = (request as any).tenantId
    const userId = (request as any).userId
    const params = context?.params || {}

    // Fetch user details for response
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    })

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
      },
    })

    if (!document) {
      return respond.notFound('Document not found')
    }

    const body = await request.json()
    const { approved, notes, expiresIn } = ApprovalSchema.parse(body)

    // Verify document is scanned
    if (document.avStatus === 'pending') {
      return respond.conflict('Document is still being scanned. Please wait before approving.')
    }

    if (document.avStatus === 'infected') {
      return respond.conflict('Cannot approve quarantined documents. Document contains malware.')
    }

    // Calculate expiration date if provided
    let expiresAt = null
    if (expiresIn) {
      expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + expiresIn)
    }

    // Update document with approval status
    const updated = await prisma.attachment.update({
      where: { id: params.id },
      data: {
        avStatus: approved ? 'approved' : 'rejected',
        metadata: {
          ...(typeof document.metadata === 'object' && document.metadata !== null ? document.metadata : {}),
          approval: {
            approved,
            approvedBy: userId,
            approvedAt: new Date().toISOString(),
            approvalNotes: notes || null,
            expiresAt: expiresAt?.toISOString() || null,
          },
        },
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

    // Log approval
    await prisma.auditLog.create({
      data: {
        tenantId,
        action: approved ? 'admin:documents_approve' : 'admin:documents_reject',
        userId,
        resource: 'Document',
        resourceId: document.id,
        details: {
          documentName: document.name,
          approvedBy: userId,
          approved,
          notes,
          expiresAt,
        },
      },
    }).catch(() => {})

    // Send notification to uploader
    // In production: Send email to uploader with approval status
    // await sendApprovalEmail(document.uploader.email, document, approved, notes)

    return respond.ok({
      data: {
        id: updated.id,
        name: updated.name,
        status: updated.avStatus,
        approved,
        approvedAt: new Date(),
        approvedBy: {
          id: user?.id || userId,
          name: user?.name || 'System',
          email: user?.email || '',
        },
        approvalNotes: notes,
        expiresAt: expiresAt || undefined,
        message: approved ? 'Document approved successfully' : 'Document rejected',
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return respond.badRequest('Invalid approval data', error.errors)
    }
    console.error('Document approval error:', error)
    return respond.serverError()
  }
})

/**
 * GET /api/admin/documents/[id]/approve
 * Get approval status
 */
export const GET = withAdminAuth(async (request, context) => {
  try {
    const tenantId = (request as any).tenantId
    const params = context?.params || {}

    const document = await prisma.attachment.findFirst({
      where: {
        id: params.id,
        tenantId,
      },
    })

    if (!document) {
      return respond.notFound('Document not found')
    }

    const metadata = document.metadata as any
    const approvalInfo = metadata?.approval

    if (!approvalInfo) {
      return respond.ok({
        data: {
          documentId: params.id,
          status: 'pending',
          approved: false,
          message: 'Document has not been approved yet',
        },
      })
    }

    return respond.ok({
      data: {
        documentId: params.id,
        status: approvalInfo.approved ? 'approved' : 'rejected',
        approved: approvalInfo.approved,
        approvedBy: approvalInfo.approvedBy,
        approvedAt: approvalInfo.approvedAt,
        approvalNotes: approvalInfo.approvalNotes,
        expiresAt: approvalInfo.expiresAt,
        isExpired: approvalInfo.expiresAt
          ? new Date(approvalInfo.expiresAt) < new Date()
          : false,
      },
    })
  } catch (error) {
    console.error('Get approval status error:', error)
    return respond.serverError()
  }
})
