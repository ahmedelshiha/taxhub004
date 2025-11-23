import { NextRequest, NextResponse } from 'next/server'
import { withTenantContext } from '@/lib/api-wrapper'
import { respond } from '@/lib/api-response'
import { TaskUpdateSchema } from '@/schemas/shared/entities/task'
import prisma from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { requireTenantContext } from '@/lib/tenant-utils'
import { z } from 'zod'

/**
 * GET /api/admin/tasks/[id]
 * Get task details with comments (admin only)
 */
export const GET = withTenantContext(
  async (request, { params }) => {
    try {
      const ctx = requireTenantContext()
      const { tenantId, userId, role, tenantRole } = ctx

      // Verify admin access
      if (role !== 'SUPER_ADMIN' && !tenantRole?.includes('ADMIN')) {
        return respond.forbidden('Only administrators can access this endpoint')
      }

      const taskId = (await params).id

      const task = await prisma.task.findFirst({
        where: {
          id: taskId,
          tenantId: tenantId as string,
        },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              department: true,
              position: true,
            },
          },
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
              replies: {
                include: {
                  author: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      image: true,
                    },
                  },
                },
              },
            },
            where: {
              parentId: null, // Only fetch top-level comments
            },
          },
        },
      })

      if (!task) {
        return respond.notFound('Task not found')
      }

      return respond.ok({ data: task })
    } catch (error) {
      console.error('Admin task detail error:', error)
      return respond.serverError()
    }
  },
  { requireAuth: true }
)

/**
 * PUT /api/admin/tasks/[id]
 * Update a task (admin only)
 */
export const PUT = withTenantContext(
  async (request, { params }) => {
    try {
      const ctx = requireTenantContext()
      const { tenantId, userId, role, tenantRole } = ctx

      // Verify admin access
      if (role !== 'SUPER_ADMIN' && !tenantRole?.includes('ADMIN')) {
        return respond.forbidden('Only administrators can update tasks')
      }

      const taskId = (await params).id

      // Verify task exists and get current state
      const existingTask = await prisma.task.findFirst({
        where: {
          id: taskId,
          tenantId: tenantId as string,
        },
      })

      if (!existingTask) {
        return respond.notFound('Task not found')
      }

      const body = await request.json()
      const updates = TaskUpdateSchema.parse(body)

      // Store old values for audit log
      const oldValues = {
        status: existingTask.status,
        priority: existingTask.priority,
        assigneeId: existingTask.assigneeId,
        title: existingTask.title,
        dueAt: existingTask.dueAt,
      }

      // Update the task
      const updated = await prisma.task.update({
        where: { id: taskId },
        data: updates,
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              department: true,
              position: true,
            },
          },
        },
      })

      // Log audit event with changes
      const changes: Record<string, any> = {}
      const anyUpdates = updates as any
      if (anyUpdates.status && anyUpdates.status !== oldValues.status) {
        changes.status = { from: oldValues.status, to: anyUpdates.status }
      }
      if (anyUpdates.priority && anyUpdates.priority !== oldValues.priority) {
        changes.priority = { from: oldValues.priority, to: anyUpdates.priority }
      }
      if (anyUpdates.assigneeId !== undefined && anyUpdates.assigneeId !== oldValues.assigneeId) {
        changes.assigneeId = { from: oldValues.assigneeId, to: anyUpdates.assigneeId }
      }
      if (anyUpdates.title && anyUpdates.title !== oldValues.title) {
        changes.title = { from: oldValues.title, to: anyUpdates.title }
      }
      if (anyUpdates.dueAt && anyUpdates.dueAt !== oldValues.dueAt) {
        changes.dueAt = { from: oldValues.dueAt, to: anyUpdates.dueAt }
      }

      if (Object.keys(changes).length > 0) {
        await logAudit({
          userId,
          action: 'TASK_UPDATED',
          entity: 'Task',
          entityId: taskId,
          changes,
        })
      }

      return respond.ok({ data: updated })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return respond.badRequest('Invalid task data', error.errors)
      }
      console.error('Admin task update error:', error)
      return respond.serverError()
    }
  },
  { requireAuth: true }
)

/**
 * DELETE /api/admin/tasks/[id]
 * Delete a task (admin only)
 */
export const DELETE = withTenantContext(
  async (request, { params }) => {
    try {
      const ctx = requireTenantContext()
      const { tenantId, userId, role, tenantRole } = ctx

      // Verify admin access
      if (role !== 'SUPER_ADMIN' && !tenantRole?.includes('ADMIN')) {
        return respond.forbidden('Only administrators can delete tasks')
      }

      const taskId = (await params).id

      // Verify task exists
      const task = await prisma.task.findFirst({
        where: {
          id: taskId,
          tenantId: tenantId as string,
        },
      })

      if (!task) {
        return respond.notFound('Task not found')
      }

      // Log audit event before deletion
      await logAudit({
        userId,
        action: 'TASK_DELETED',
        entity: 'Task',
        entityId: taskId,
        changes: {
          title: task.title,
          status: task.status,
        },
      })

      // Delete the task (cascade will handle comments)
      await prisma.task.delete({
        where: { id: taskId },
      })

      return respond.ok({ success: true, message: 'Task deleted successfully' })
    } catch (error) {
      console.error('Admin task deletion error:', error)
      return respond.serverError()
    }
  },
  { requireAuth: true }
)
