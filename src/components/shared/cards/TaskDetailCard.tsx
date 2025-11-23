'use client'

import React, { useState } from 'react'
import { Task, TaskPriority, TaskStatus } from '@/types/shared/entities/task'
import { usePermissions } from '@/lib/use-permissions'
import { PERMISSIONS } from '@/lib/permissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Edit2, Trash2, MessageCircle, User, Calendar, AlertCircle, CheckCircle2, Clock, Flag } from 'lucide-react'
import { formatDate, formatRelativeTime } from '@/lib/shared/formatters'
import TaskCommentCard from './TaskCommentCard'
import TaskDueDateBadge from '../widgets/TaskDueDateBadge'
import TaskProgressBar from '../widgets/TaskProgressBar'
import { TaskComment } from '@/types/shared/entities/task'

interface TaskDetailCardProps {
  /** The task to display */
  task: Task
  /** Comments on the task */
  comments?: TaskComment[]
  /** Called to edit task */
  onEdit?: (id: string) => void
  /** Called to delete task */
  onDelete?: (id: string) => void
  /** Called to change status */
  onStatusChange?: (id: string, status: TaskStatus) => void
  /** Called to add comment */
  onAddComment?: (taskId: string, content: string) => void
  /** Is loading */
  loading?: boolean
  /** Show edit/delete actions */
  showActions?: boolean
}

/**
 * TaskDetailCard Component
 *
 * Displays detailed task information including all comments and metadata.
 * Used on task detail pages to show full task context.
 *
 * @example
 * ```tsx
 * <TaskDetailCard
 *   task={task}
 *   comments={comments}
 *   onStatusChange={handleStatusChange}
 *   onAddComment={handleAddComment}
 * />
 * ```
 */
export default function TaskDetailCard({
  task,
  comments = [],
  onEdit,
  onDelete,
  onStatusChange,
  onAddComment,
  loading = false,
  showActions = true,
}: TaskDetailCardProps) {
  const { has } = usePermissions()
  const canEditTask = has(PERMISSIONS.TASKS_EDIT)
  const canDeleteTask = has(PERMISSIONS.TASKS_DELETE)
  const [newComment, setNewComment] = useState('')

  if (!task) return null

  const priorityIcons: Record<TaskPriority, React.ReactNode> = {
    LOW: <Flag className="w-4 h-4 text-blue-600" />,
    MEDIUM: <Flag className="w-4 h-4 text-yellow-600" />,
    HIGH: <Flag className="w-4 h-4 text-red-600" />,
  }

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment?.(task.id, newComment)
      setNewComment('')
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-2xl">{task.title}</CardTitle>
            {task.description && (
              <CardDescription className="mt-2 whitespace-pre-wrap">{task.description}</CardDescription>
            )}
          </div>
          {showActions && canDeleteTask && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete?.(task.id)}
              disabled={loading}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Task Status Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Status & Priority</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-2">Current Status</p>
              <Badge className="bg-blue-100 text-blue-800">
                {task.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">Priority Level</p>
              <Badge className="flex items-center gap-2 w-fit">
                {priorityIcons[task.priority]}
                {task.priority}
              </Badge>
            </div>
          </div>
          <TaskProgressBar
            status={task.status}
            priority={task.priority}
          />
        </div>

        <Separator />

        {/* Task Dates */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Dates</h3>
          <div className="grid grid-cols-2 gap-4">
            {task.createdAt && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Created</p>
                <p className="text-sm">{formatDate(new Date(task.createdAt))}</p>
                <p className="text-xs text-gray-500">{formatRelativeTime(new Date(task.createdAt))}</p>
              </div>
            )}
            {task.dueAt && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Due Date</p>
                <TaskDueDateBadge dueAt={new Date(task.dueAt)} status={task.status} />
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Assignee Information */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Assignment</h3>
          {task.assignee ? (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {task.assignee.image ? (
                <img
                  src={task.assignee.image}
                  alt={task.assignee.name || 'User'}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium">{task.assignee.name || task.assignee.email}</p>
                {task.assignee.department && (
                  <p className="text-xs text-gray-500">{task.assignee.department}</p>
                )}
                {task.assignee.position && (
                  <p className="text-xs text-gray-500">{task.assignee.position}</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Not assigned</p>
          )}
        </div>

        {/* Compliance Information */}
        {task.complianceRequired && (
          <>
            <Separator />
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <p className="font-semibold text-yellow-900">Compliance Required</p>
              </div>
              {task.complianceDeadline && (
                <p className="text-sm text-yellow-800">
                  Must be completed by {formatDate(new Date(task.complianceDeadline))}
                </p>
              )}
            </div>
          </>
        )}

        <Separator />

        {/* Task Actions */}
        {showActions && canEditTask && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onEdit?.(task.id)}
              disabled={loading}
              className="flex-1"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Task
            </Button>
            {task.status !== TaskStatus.COMPLETED && (
              <Button
                variant="default"
                onClick={() => onStatusChange?.(task.id, TaskStatus.COMPLETED)}
                disabled={loading}
                className="flex-1"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark Complete
              </Button>
            )}
          </div>
        )}

        {/* Comments Section */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Comments ({comments.length})
          </h3>

          {/* Comments List */}
          {comments.length > 0 ? (
            <div className="space-y-3">
              {comments.map((comment) => (
                <TaskCommentCard
                  key={comment.id}
                  comment={comment}
                  taskId={task.id}
                  onDelete={() => {}}
                  onEdit={() => {}}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No comments yet</p>
          )}

          {/* Add Comment */}
          <div className="mt-4 pt-4 border-t">
            <div className="space-y-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                disabled={loading}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || loading}
                  className="flex-1"
                >
                  Add Comment
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
