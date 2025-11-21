/**
 * Task Events Publisher
 *
 * Publishes real-time events about task changes to connected clients
 * via WebSocket or Server-Sent Events (SSE).
 *
 * Events:
 * - TASK_CREATED: New task created
 * - TASK_UPDATED: Task details updated
 * - TASK_ASSIGNED: Task assigned to user
 * - TASK_STATUS_CHANGED: Task status changed
 * - COMMENT_ADDED: Comment added to task
 */

import { Task } from '@/types/shared/entities/task'

export interface TaskEventPayload {
  type: 'TASK_CREATED' | 'TASK_UPDATED' | 'TASK_ASSIGNED' | 'TASK_STATUS_CHANGED' | 'COMMENT_ADDED'
  taskId: string
  task?: Task
  data?: Record<string, any>
  timestamp: Date
  userId?: string
  tenantId: string
}

/**
 * In-memory event subscribers (for single-instance deployments)
 * For production with multiple instances, use Redis/PubSub
 */
const eventSubscribers = new Map<
  string,
  Set<(event: TaskEventPayload) => void>
>()

/**
 * Subscribe to task events for a specific task or all tasks
 */
export function subscribeToTaskEvents(
  taskId: string | 'all',
  callback: (event: TaskEventPayload) => void
): () => void {
  if (!eventSubscribers.has(taskId)) {
    eventSubscribers.set(taskId, new Set())
  }

  eventSubscribers.get(taskId)!.add(callback)

  // Return unsubscribe function
  return () => {
    eventSubscribers.get(taskId)?.delete(callback)
  }
}

/**
 * Publish task created event
 */
export async function publishTaskCreated(
  task: Task,
  tenantId: string,
  userId: string
): Promise<void> {
  const event: TaskEventPayload = {
    type: 'TASK_CREATED',
    taskId: task.id,
    task,
    timestamp: new Date(),
    userId,
    tenantId,
  }

  // Publish to subscribers
  publishEvent(event)
}

/**
 * Publish task updated event
 */
export async function publishTaskUpdated(
  taskId: string,
  task: Task,
  changes: Record<string, any>,
  tenantId: string,
  userId: string
): Promise<void> {
  const event: TaskEventPayload = {
    type: 'TASK_UPDATED',
    taskId,
    task,
    data: changes,
    timestamp: new Date(),
    userId,
    tenantId,
  }

  publishEvent(event)
}

/**
 * Publish task assigned event
 */
export async function publishTaskAssigned(
  taskId: string,
  task: Task,
  assigneeId: string,
  tenantId: string,
  userId: string
): Promise<void> {
  const event: TaskEventPayload = {
    type: 'TASK_ASSIGNED',
    taskId,
    task,
    data: { assigneeId, previousAssigneeId: task.assigneeId },
    timestamp: new Date(),
    userId,
    tenantId,
  }

  publishEvent(event)
}

/**
 * Publish task status changed event
 */
export async function publishTaskStatusChanged(
  taskId: string,
  task: Task,
  oldStatus: string,
  newStatus: string,
  tenantId: string,
  userId: string
): Promise<void> {
  const event: TaskEventPayload = {
    type: 'TASK_STATUS_CHANGED',
    taskId,
    task,
    data: { oldStatus, newStatus },
    timestamp: new Date(),
    userId,
    tenantId,
  }

  publishEvent(event)
}

/**
 * Publish comment added event
 */
export async function publishCommentAdded(
  taskId: string,
  task: Task,
  commentId: string,
  content: string,
  authorId: string,
  tenantId: string
): Promise<void> {
  const event: TaskEventPayload = {
    type: 'COMMENT_ADDED',
    taskId,
    task,
    data: { commentId, content, authorId },
    timestamp: new Date(),
    userId: authorId,
    tenantId,
  }

  publishEvent(event)
}

/**
 * Internal function to publish events to subscribers
 */
function publishEvent(event: TaskEventPayload): void {
  // Publish to task-specific subscribers
  const taskSubscribers = eventSubscribers.get(event.taskId)
  if (taskSubscribers) {
    taskSubscribers.forEach((callback) => {
      try {
        callback(event)
      } catch (err) {
        console.error('Error calling task event subscriber:', err)
      }
    })
  }

  // Publish to all tasks subscribers
  const allSubscribers = eventSubscribers.get('all')
  if (allSubscribers) {
    allSubscribers.forEach((callback) => {
      try {
        callback(event)
      } catch (err) {
        console.error('Error calling global task event subscriber:', err)
      }
    })
  }
}

/**
 * Clear all subscribers (useful for cleanup in tests)
 */
export function clearTaskEventSubscribers(): void {
  eventSubscribers.clear()
}

const TaskEvents = {
  subscribeToTaskEvents,
  publishTaskCreated,
  publishTaskUpdated,
  publishTaskAssigned,
  publishTaskStatusChanged,
  publishCommentAdded,
  clearTaskEventSubscribers,
}

export default TaskEvents
