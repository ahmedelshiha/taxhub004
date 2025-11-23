'use client'

import React from 'react'
import { TaskStatus } from '@/types/shared/entities/task'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { formatDate, formatRelativeTime } from '@/lib/shared/formatters'

interface TaskDueDateBadgeProps {
  /** Due date */
  dueAt: Date
  /** Current task status */
  status: TaskStatus
  /** Show icon */
  showIcon?: boolean
  /** Show relative time */
  showRelative?: boolean
  /** Custom class */
  className?: string
}

/**
 * TaskDueDateBadge Component
 *
 * Displays due date with visual indicators for overdue, due soon, and completed tasks.
 * Automatically applies appropriate styling based on date proximity and status.
 *
 * @example
 * ```tsx
 * <TaskDueDateBadge
 *   dueAt={new Date('2024-12-25')}
 *   status={TaskStatus.IN_PROGRESS}
 *   showRelative
 * />
 * ```
 */
export default function TaskDueDateBadge({
  dueAt,
  status,
  showIcon = true,
  showRelative = true,
  className = '',
}: TaskDueDateBadgeProps) {
  const now = new Date()
  const isOverdue = dueAt < now && status !== TaskStatus.COMPLETED
  const isDueSoon = !isOverdue && (dueAt.getTime() - now.getTime()) < 86400000 * 3 // 3 days
  const isCompleted = status === TaskStatus.COMPLETED
  const isFutureDate = dueAt > now && !isDueSoon

  // Determine badge styling
  let variant: 'default' | 'secondary' | 'destructive' = 'default'
  let bgColor = ''
  let icon: React.ReactNode = null

  if (isCompleted) {
    variant = 'secondary'
    bgColor = 'bg-green-50 text-green-700 border-green-200'
    icon = <CheckCircle2 className="w-4 h-4" />
  } else if (isOverdue) {
    variant = 'destructive'
    bgColor = 'bg-red-50 text-red-700 border-red-200 animate-pulse'
    icon = <AlertCircle className="w-4 h-4" />
  } else if (isDueSoon) {
    variant = 'secondary'
    bgColor = 'bg-yellow-50 text-yellow-700 border-yellow-200'
    icon = <AlertCircle className="w-4 h-4" />
  } else {
    variant = 'secondary'
    bgColor = 'bg-blue-50 text-blue-700 border-blue-200'
    icon = <Clock className="w-4 h-4" />
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <Badge variant={variant} className={`w-fit flex items-center gap-2 ${bgColor}`}>
        {showIcon && icon}
        <span className="font-medium">{formatDate(dueAt)}</span>
      </Badge>

      {showRelative && (
        <div className="text-xs text-gray-600">
          {isCompleted && <span className="text-green-600">✓ Completed</span>}
          {isOverdue && (
            <span className="text-red-600 font-semibold">
              ⚠ Overdue by {formatRelativeTime(dueAt).split(' ').slice(0, 2).join(' ')}
            </span>
          )}
          {isDueSoon && !isOverdue && (
            <span className="text-yellow-600">
              📌 Due {formatRelativeTime(dueAt)}
            </span>
          )}
          {isFutureDate && (
            <span className="text-gray-600">
              📅 Due {formatRelativeTime(dueAt)}
            </span>
          )}
        </div>
      )}

      {/* Status-based Helper Text */}
      {isOverdue && (
        <p className="text-xs text-red-600 font-semibold animate-pulse">
          This task is overdue. Please complete or reassign.
        </p>
      )}
      {isDueSoon && !isOverdue && (
        <p className="text-xs text-yellow-600">
          This task is due soon. Plan to complete it soon.
        </p>
      )}
    </div>
  )
}
