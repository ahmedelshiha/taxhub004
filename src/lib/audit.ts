import prisma from '@/lib/prisma'
import { resolveTenantId } from '@/lib/default-tenant'

export interface AuditEntry {
  tenantId?: string | null
  userId?: string | null
  action: string
  resource?: string | null
  entity?: string
  entityId?: string
  changes?: Record<string, unknown>
  metadata?: Record<string, unknown>
  ipAddress?: string | null
  userAgent?: string | null
  actorId?: string | null
  targetId?: string | null
  details?: Record<string, unknown> | null
}

/**
 * Log an audit entry to the AuditLog table
 * Supports both new format (tenantId, userId, resource, metadata)
 * and legacy format (entity, entityId, changes)
 */
export async function logAudit(entry: AuditEntry) {
  const hasDb = Boolean(process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL)
  
  // Build the audit log message for console logging
  const message = JSON.stringify({
    action: entry.action,
    resource: entry.resource || entry.entity,
    entityId: entry.entityId,
    userId: entry.userId || entry.actorId,
    tenantId: entry.tenantId,
    changes: entry.changes,
    metadata: entry.metadata || entry.details,
    at: new Date().toISOString(),
  })

  if (!hasDb) {
    console.info('[AUDIT]', message)
    return { ok: true, stored: false }
  }

  try {
    const tenantId = entry.tenantId || (await resolveTenantId(null))
    
    // Build metadata by merging legacy fields with new format
    const metadata = {
      ...entry.metadata,
      ...entry.details,
      ...(entry.entity && { entity: entry.entity }),
      ...(entry.entityId && { entityId: entry.entityId }),
      ...(entry.changes && { changes: entry.changes }),
    }

    // Create AuditLog entry
    await (prisma as any).auditLog.create({
      data: {
        tenantId,
        userId: entry.userId || entry.actorId,
        action: entry.action,
        resource: entry.resource || entry.entity || null,
        metadata: Object.keys(metadata).length > 0 ? metadata : null,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
      },
    }).catch(() => {
      // If AuditLog.create fails, try healthLog as fallback
      return (prisma as any).healthLog?.create?.({
        data: {
          tenantId: tenantId || 'unknown',
          service: 'AUDIT',
          status: 'INFO',
          message,
        },
      })
    })

    return { ok: true, stored: true }
  } catch (e) {
    console.error('Failed to persist audit log', e)
    return { ok: false, stored: false }
  }
}
