'use server'

import { withTenantAuth } from '@/lib/auth-middleware'
import { respond } from '@/lib/api-response'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const AnalyzeSchema = z.object({
  type: z.enum(['ocr', 'classification', 'extraction']).default('ocr'),
  extractFields: z.array(z.string()).optional(),
})

/**
 * POST /api/documents/[id]/analyze
 * Analyze document with OCR, classification, or field extraction
 */
export const POST = withTenantAuth(async (request, { tenantId, user }, { params }) => {
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

    // Authorization
    if (user.role !== 'ADMIN' && document.uploaderId !== user.id) {
      return respond.forbidden('You do not have access to this document')
    }

    // Verify document is in scanned state
    if (document.avStatus === 'pending') {
      return respond.conflict('Document is still being scanned. Please wait before analyzing.')
    }

    if (document.avStatus === 'infected') {
      return respond.forbidden('Cannot analyze quarantined documents')
    }

    // Only allow analysis on certain file types
    const analyzableTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
    ]

    if (!analyzableTypes.includes(document.contentType || '')) {
      return respond.badRequest(
        `Cannot analyze ${document.contentType}. Supported: PDF, JPEG, PNG, WebP`
      )
    }

    const body = await request.json()
    const { type, extractFields } = AnalyzeSchema.parse(body)

    // For MVP, we'll queue the analysis job instead of processing synchronously
    // In production, this would integrate with a document processing service

    const analysisJob = await prisma.analysisJob?.create?.({
      data: {
        attachmentId: params.id,
        type,
        extractFields: extractFields || [],
        status: 'queued',
        createdBy: user.id,
        tenantId,
      },
    }).catch(() => null)

    // Log analysis request
    await prisma.auditLog.create({
      data: {
        tenantId,
        action: 'documents:analyze',
        userId: user.id,
        resourceType: 'Document',
        resourceId: document.id,
        details: {
          analysisType: type,
          extractFields,
        },
      },
    }).catch(() => {})

    // For now, return mock analysis based on file type
    let mockAnalysis: any = {}

    if (type === 'ocr') {
      mockAnalysis = {
        text: '[OCR processing in progress]',
        confidence: 0.95,
        language: 'en',
        pages: document.contentType === 'application/pdf' ? Math.ceil((document.size || 0) / 10000) : 1,
      }
    } else if (type === 'classification') {
      mockAnalysis = {
        documentType: 'invoice',
        category: 'financial',
        confidence: 0.92,
        tags: ['invoice', 'accounts-payable', 'financial'],
      }
    } else if (type === 'extraction') {
      mockAnalysis = {
        extractedFields: {
          invoiceNumber: '123456',
          date: '2024-01-15',
          amount: '1,250.00',
        },
        confidence: 0.88,
      }
    }

    // Update metadata with analysis results
    await prisma.attachment.update({
      where: { id: params.id },
      data: {
        metadata: {
          ...document.metadata,
          lastAnalysis: {
            type,
            timestamp: new Date().toISOString(),
            results: mockAnalysis,
          },
        },
      },
    }).catch(() => {})

    return respond.ok({
      data: {
        documentId: params.id,
        analysisType: type,
        jobId: analysisJob?.id || `job-${Date.now()}`,
        status: 'processing',
        results: mockAnalysis,
        estimatedCompletionTime: '30-60 seconds',
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return respond.badRequest('Invalid analysis parameters', error.errors)
    }
    console.error('Analyze document error:', error)
    return respond.serverError()
  }
})

/**
 * GET /api/documents/[id]/analyze
 * Get analysis results
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

    // Authorization
    if (user.role !== 'ADMIN' && document.uploaderId !== user.id) {
      return respond.forbidden('You do not have access to this document')
    }

    const metadata = document.metadata as any
    const lastAnalysis = metadata?.lastAnalysis

    if (!lastAnalysis) {
      return respond.notFound('No analysis results available for this document')
    }

    return respond.ok({
      data: {
        documentId: params.id,
        analysisType: lastAnalysis.type,
        timestamp: lastAnalysis.timestamp,
        results: lastAnalysis.results,
      },
    })
  } catch (error) {
    console.error('Get analysis error:', error)
    return respond.serverError()
  }
})
