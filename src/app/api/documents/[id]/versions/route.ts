'use server'

import { NextRequest } from 'next/server'
import { withTenantContext } from '@/lib/api-wrapper'
import { requireTenantContext } from '@/lib/tenant-utils'
import { respond } from '@/lib/api-response'
import prisma from '@/lib/prisma'
import { z } from 'zod'

/**
 * GET /api/documents/[id]/versions
 * Get document version history
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
    })

    if (!document) {
      return respond.notFound('Document not found')
    }

    // Authorization check
    if (userRole !== 'ADMIN' && document.uploaderId !== userId) {
      return respond.forbidden('You do not have access to this document')
    }

    // Get all versions
    const versions = await prisma.documentVersion.findMany({
      where: {
        attachmentId: params.id,
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
      },
      orderBy: {
        versionNumber: 'desc',
      },
    })

    // Get total count
    const total = versions.length

    // Format response
    const formattedVersions = versions.map((version) => ({
      id: version.id,
      versionNumber: version.versionNumber,
      name: version.name,
      size: version.size,
      contentType: version.contentType,
      url: version.url,
      uploadedAt: version.uploadedAt,
      uploadedBy: version.uploader,
      changeDescription: version.changeDescription,
    }))

    // Log access
    await prisma.auditLog.create({
      data: {
        tenantId: tenantId as string,
        action: 'documents:view_versions',
        userId,
        resource: 'Document',
      },
    }).catch(() => { })

    return respond.ok({
      data: formattedVersions,
      meta: {
        total,
        documentId: params.id,
      },
    })
  } catch (error) {
    console.error('Get versions error:', error)
    return respond.serverError()
  }
})

/**
 * POST /api/documents/[id]/versions
 * Create new version of document
 */
export const POST = withTenantContext(async (request: NextRequest, { params }: any) => {
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
      return respond.forbidden('You do not have permission to update this document')
    }

    const formData = await request.formData()
    const newFile = formData.get('file') as File | null
    const changeDescription = formData.get('changeDescription') as string | undefined

    if (!newFile) {
      return respond.badRequest('File is required')
    }

    // Validation
    const MAX_FILE_SIZE = 100 * 1024 * 1024
    if (newFile.size > MAX_FILE_SIZE) {
      return respond.badRequest('File size exceeds 100MB limit')
    }

    // Upload new version
    const { uploadFile } = await import('@/lib/upload-provider')
    const fileBuffer = Buffer.from(await newFile.arrayBuffer())
    const versionKey = `${tenantId}/${params.id}/v${Date.now()}/${newFile.name}`

    let versionUrl: string
    try {
      const uploadResult = await uploadFile(fileBuffer, versionKey, newFile.type)
      versionUrl = uploadResult.url
    } catch (uploadError) {
      console.error('Version upload error:', uploadError)
      return respond.serverError('Failed to upload version')
    }

    // Get latest version number
    const latestVersion = await prisma.documentVersion.findFirst({
      where: { attachmentId: params.id },
      orderBy: { versionNumber: 'desc' },
      select: { versionNumber: true },
    })

    const newVersionNumber = (latestVersion?.versionNumber || 0) + 1

    // Create version record
    const version = await prisma.documentVersion.create({
      data: {
        attachmentId: params.id,
        versionNumber: newVersionNumber,
        name: newFile.name,
        size: newFile.size,
        contentType: newFile.type,
        key: versionKey,
        url: versionUrl,
        uploaderId: userId,
        changeDescription: changeDescription || null,
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
      },
    })

    // Update main document metadata
    await prisma.attachment.update({
      where: { id: params.id },
      data: {
        name: newFile.name,
        size: newFile.size,
        contentType: newFile.type,
        url: versionUrl,
      },
    }).catch(() => { })

    // Log audit
    await prisma.auditLog.create({
      data: {
        tenantId: tenantId as string,
        action: 'documents:create_version',
        userId,
        resource: 'DocumentVersion',
        metadata: {
          documentId: params.id,
          versionNumber: newVersionNumber,
          changeDescription,
        },
      },
    }).catch(() => { })

    return respond.created({
      data: {
        id: version.id,
        versionNumber: version.versionNumber,
        name: version.name,
        size: version.size,
        contentType: version.contentType,
        url: version.url,
        uploadedAt: version.uploadedAt,
        uploadedBy: version.uploader,
        changeDescription: version.changeDescription,
      },
    })
  } catch (error) {
    console.error('Create version error:', error)
    return respond.serverError()
  }
})
