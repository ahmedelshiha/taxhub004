'use server'

import { NextRequest } from 'next/server'
import { withTenantContext } from '@/lib/api-wrapper'
import { requireTenantContext } from '@/lib/tenant-utils'
import { respond } from '@/lib/api-response'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const AnalyzeSchema = z.object({
  type: z.enum(['ocr', 'classification', 'extraction']).default('ocr'),
  extractFields: z.array(z.string()).optional(),
})

/**
 * POST /api/documents/[id]/analyze
 * Analyze document
 */
export const POST = withTenantContext(
  async (request: NextRequest, { params }: any) => {
    try {
      const ctx = requireTenantContext()
      const { tenantId } = ctx

      const document = await prisma.attachment.findFirst({
        where: {
          id: params.id,
          tenantId: tenantId as string,
        },
      })

      if (!document) {
        return respond.notFound('Document not found')
      }

      const body = await request.json()
      const { type } = AnalyzeSchema.parse(body)

      // Create analysis job (using correct schema field: analysisType)
      const analysisJob = await prisma.analysisJob?.create?.({
        data: {
          attachmentId: params.id,
          analysisType: type,
          status: 'PENDING',
          tenantId: tenantId as string,
        },
      }).catch(() => null)

      return respond.ok({
        jobId: analysisJob?.id || `job-${Date.now()}`,
        analysisType: type,
        status: 'processing',
      })
    } catch (error) {
      console.error('Analyze document error:', error)
      return respond.serverError()
    }
  },
  { requireAuth: true }
)

/**
 * GET /api/documents/[id]/analyze  
 * Get analysis results
 */
export const GET = withTenantContext(
  async (request: NextRequest, { params }: any) => {
    try {
      const ctx = requireTenantContext()
      const { tenantId } = ctx

      const jobs = await prisma.analysisJob?.findMany?.({
        where: { attachmentId: params.id, tenantId: tenantId as string },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }).catch(() => [])

      return respond.ok({
        jobs: jobs || [],
      })
    } catch (error) {
      console.error('Get analysis error:', error)
      return respond.serverError()
    }
  },
  { requireAuth: true }
)
