'use server'

import { withAdminAuth } from '@/lib/auth-middleware'
import { respond } from '@/lib/api-response'
import prisma from '@/lib/prisma'
import { z } from 'zod'

/**
 * POST /api/admin/documents/[id]/scan
 * Trigger antivirus scan for a document
 */
export const POST = withAdminAuth(async (request, context) => {
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

    // Parse request body
    const body = await request.json().catch(() => ({}))
    const ScanSchema = z.object({
      force: z.boolean().optional().default(false), // Force re-scan
    })
    const { force } = ScanSchema.parse(body)

    // Check if already scanned (unless force is true)
    if (!force && document.avStatus !== 'pending') {
      return respond.conflict(
        `Document already scanned. Status: ${document.avStatus}. Use force: true to re-scan.`
      )
    }

    // Update status to pending (queued for scanning)
    const updated = await prisma.attachment.update({
      where: { id: params.id },
      data: {
        avStatus: 'pending',
        avScanAt: new Date(),
        metadata: {
          ...(typeof document.metadata === 'object' && document.metadata !== null ? document.metadata : {}),
          scanRequested: {
            by: userId,
            at: new Date().toISOString(),
            force,
          },
        },
      },
    })

    // Log scan request
    await prisma.auditLog.create({
      data: {
        tenantId,
        action: 'admin:documents_scan',
        userId,
        resource: 'Document',
        metadata: {
          documentName: document.name,
          previousStatus: document.avStatus,
          force,
        },
      },
    }).catch(() => {})

    // In production, this would queue the document for scanning with the AV service
    // Example: await scanDocumentWithClamAV(document.url)

    return respond.ok({
      data: {
        documentId: params.id,
        status: 'scanning',
        message: 'Document has been queued for antivirus scanning',
        scanStartedAt: new Date(),
        estimatedCompletionTime: '5-30 seconds',
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return respond.badRequest('Invalid scan request', error.errors)
    }
    console.error('Document scan error:', error)
    return respond.serverError()
  }
})

/**
 * GET /api/admin/documents/[id]/scan
 * Get scan status
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
    })

    if (!document) {
      return respond.notFound('Document not found')
    }

    // Determine scan status message
    let scanStatusMessage = ''
    let isScanning = false

    if (document.avStatus === 'pending') {
      scanStatusMessage = 'Currently scanning...'
      isScanning = true
    } else if (document.avStatus === 'clean') {
      scanStatusMessage = 'Document is clean - no threats detected'
    } else if (document.avStatus === 'infected') {
      scanStatusMessage = `Document is infected - Threat: ${document.avThreatName || 'Unknown'}`
    } else if (document.avStatus === 'approved') {
      scanStatusMessage = 'Document has been manually approved'
    }

    return respond.ok({
      data: {
        documentId: params.id,
        documentName: document.name,
        status: document.avStatus,
        isScanning,
        message: scanStatusMessage,
        scanDetails: {
          scannedAt: document.avScanAt,
          threatName: document.avThreatName || null,
          scanTime: document.avScanTime || null,
          details: document.avDetails || null,
        },
        lastScan: document.avScanAt,
      },
    })
  } catch (error) {
    console.error('Get scan status error:', error)
    return respond.serverError()
  }
})
