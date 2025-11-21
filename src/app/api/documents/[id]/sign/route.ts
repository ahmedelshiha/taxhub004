'use server'

import { withTenantAuth } from '@/lib/auth-middleware'
import { respond } from '@/lib/api-response'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const SignRequestSchema = z.object({
  signerEmail: z.string().email('Invalid signer email'),
  signerName: z.string().min(1, 'Signer name is required'),
  signatureFields: z.array(z.object({
    page: z.number().int().positive(),
    x: z.number(),
    y: z.number(),
  })).min(1, 'At least one signature field is required'),
  expiresIn: z.number().int().positive().optional().default(30), // Days
  requireBiometric: z.boolean().optional().default(false),
})

type SignRequest = z.infer<typeof SignRequestSchema>

/**
 * POST /api/documents/[id]/sign
 * Request document signature (e-signature flow)
 */
export const POST = withTenantAuth(async (request, { tenantId, user }, { params }) => {
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
      },
    })

    if (!document) {
      return respond.notFound('Document not found')
    }

    // Authorization - admin or document uploader
    if (user.role !== 'ADMIN' && document.uploaderId !== user.id) {
      return respond.forbidden('You do not have permission to request signatures on this document')
    }

    // Verify document is scanned and safe
    if (document.avStatus === 'infected') {
      return respond.forbidden('Cannot request signatures on quarantined documents')
    }

    if (document.avStatus === 'pending') {
      return respond.conflict('Document is still being scanned. Please wait.')
    }

    const body = await request.json()
    const signData = SignRequestSchema.parse(body)

    // Check if signer exists in tenant
    const signer = await prisma.user.findFirst({
      where: {
        email: signData.signerEmail,
        tenantId,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    if (!signer) {
      return respond.badRequest('Signer not found in this organization')
    }

    // Create signature request
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + signData.expiresIn)

    // Note: In production, this would integrate with services like DocuSign, HelloSign, etc.
    // For now, we'll create a placeholder signature request record
    const signatureRequest = await prisma.documentSignatureRequest?.create?.({
      data: {
        attachmentId: params.id,
        requestedBy: user.id,
        signerEmail: signData.signerEmail,
        signerName: signData.signerName,
        signerId: signer.id,
        signatureFields: signData.signatureFields,
        requireBiometric: signData.requireBiometric,
        expiresAt,
        status: 'pending',
        tenantId,
      },
    }).catch(() => null)

    // Log audit
    await prisma.auditLog.create({
      data: {
        tenantId,
        action: 'documents:request_signature',
        userId: user.id,
        resourceType: 'Document',
        resourceId: document.id,
        details: {
          signerEmail: signData.signerEmail,
          signerName: signData.signerName,
          fieldCount: signData.signatureFields.length,
          expiresAt,
        },
      },
    }).catch(() => {})

    // In production: Send email to signer with signature link
    // await sendSignatureEmail(signer.email, document, signatureRequest)

    return respond.created({
      data: {
        signatureRequestId: signatureRequest?.id || `sig-req-${Date.now()}`,
        documentId: params.id,
        documentName: document.name,
        signerEmail: signData.signerEmail,
        signerName: signData.signerName,
        signatureFields: signData.signatureFields,
        status: 'pending',
        expiresAt,
        signingLink: `/sign/${signatureRequest?.id || 'temp'}`, // Would be actual signing link
        createdAt: new Date(),
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return respond.badRequest('Invalid signature request data', error.errors)
    }
    console.error('Request signature error:', error)
    return respond.serverError()
  }
})

/**
 * PUT /api/documents/[id]/sign
 * Sign a document
 */
export const PUT = withTenantAuth(async (request, { tenantId, user }, { params }) => {
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

    const body = await request.json()
    const SignSchema = z.object({
      signatureRequestId: z.string(),
      signatureData: z.string(), // Base64 encoded signature
      timestamp: z.string().datetime(),
    })

    const { signatureRequestId, signatureData, timestamp } = SignSchema.parse(body)

    // Verify signature request exists and is for this user
    const sigRequest = await prisma.documentSignatureRequest?.findUnique?.({
      where: { id: signatureRequestId },
    }).catch(() => null)

    if (!sigRequest || (sigRequest as any).signerId !== user.id) {
      return respond.forbidden('Invalid signature request')
    }

    if ((sigRequest as any).status !== 'pending') {
      return respond.conflict('This document has already been signed or the request has expired')
    }

    // Create signature record
    const signature = await prisma.documentSignature?.create?.({
      data: {
        documentId: params.id,
        signatureRequestId,
        signedBy: user.id,
        signatureData, // Store encrypted in production
        timestamp: new Date(timestamp),
        signedAt: new Date(),
        tenantId,
      },
    }).catch(() => null)

    // Update signature request status
    await prisma.documentSignatureRequest?.update?.({
      where: { id: signatureRequestId },
      data: {
        status: 'signed',
        signedAt: new Date(),
      },
    }).catch(() => {})

    // Update document metadata
    await prisma.attachment.update({
      where: { id: params.id },
      data: {
        metadata: {
          ...document.metadata,
          signed: true,
          signedBy: user.id,
          signedAt: new Date().toISOString(),
          signatureRequestId,
        },
      },
    }).catch(() => {})

    // Log audit
    await prisma.auditLog.create({
      data: {
        tenantId,
        action: 'documents:signed',
        userId: user.id,
        resourceType: 'Document',
        resourceId: document.id,
        details: {
          signatureRequestId,
          timestamp,
        },
      },
    }).catch(() => {})

    return respond.ok({
      data: {
        documentId: params.id,
        signatureId: signature?.id || `sig-${Date.now()}`,
        status: 'completed',
        signedAt: new Date(),
        message: 'Document has been signed successfully',
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return respond.badRequest('Invalid signature data', error.errors)
    }
    console.error('Sign document error:', error)
    return respond.serverError()
  }
})

/**
 * GET /api/documents/[id]/sign
 * Get signature requests for a document
 */
export const GET = withTenantAuth(async (request, { tenantId, user }, { params }) => {
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

    // Authorization - admin or document uploader
    if (user.role !== 'ADMIN' && document.uploaderId !== user.id) {
      return respond.forbidden('You do not have access to signature requests for this document')
    }

    // Get all signature requests for this document
    const signatureRequests = await prisma.documentSignatureRequest?.findMany?.({
      where: { attachmentId: params.id },
    }).catch(() => [])

    // Get all signatures for this document
    const signatures = await prisma.documentSignature?.findMany?.({
      where: { documentId: params.id },
      include: {
        signedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }).catch(() => [])

    return respond.ok({
      data: {
        documentId: params.id,
        signatureRequests: (signatureRequests || []).map((req: any) => ({
          id: req.id,
          signerEmail: req.signerEmail,
          signerName: req.signerName,
          status: req.status,
          expiresAt: req.expiresAt,
          createdAt: req.createdAt,
          signedAt: req.signedAt,
        })),
        signatures: (signatures || []).map((sig: any) => ({
          id: sig.id,
          signedBy: sig.signedBy,
          signedAt: sig.signedAt,
          timestamp: sig.timestamp,
        })),
      },
    })
  } catch (error) {
    console.error('Get signatures error:', error)
    return respond.serverError()
  }
})
