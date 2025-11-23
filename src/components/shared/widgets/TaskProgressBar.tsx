'use client'

import React from 'react'
import { TaskPriority, TaskStatus } from '@/types/shared/entities/task'

interface TaskProgressBarProps {
  /** Current task status */
  status: TaskStatus
  /** Task priority level */
  priority: TaskPriority
  /** Show percentage */
  showPercentage?: boolean
  /** Custom height */
  height?: 'sm' | 'md' | 'lg'
  /** Show status labels */
  showLabels?: boolean
}

/**
 * TaskProgressBar Component
 *
 * Visual progress indicator showing task workflow progression.
 * Maps task status to percentage complete and applies priority-based styling.
 *
 * @example
 * ```tsx
 * <TaskProgressBar
 *   status={TaskStatus.IN_PROGRESS}
 *   priority={TaskPriority.HIGH}
 *   showPercentage
 * />
 * ```
 */
export default function TaskProgressBar({
  status,
  priority,
  showPercentage = true,
  height = 'md',
  showLabels = true,
}: TaskProgressBarProps) {
  // Map status to progress percentage
  const statusProgress: Record<TaskStatus, number> = {
    OPEN: 10,
    IN_PROGRESS: 50,
    REVIEW: 75,
    COMPLETED: 100,
    BLOCKED: 25,
  }

  // Map priority to color
  const priorityColors: Record<TaskPriority, string> = {
    LOW: 'bg-blue-500',
    MEDIUM: 'bg-yellow-500',
    HIGH: 'bg-red-500',
  }

  // Map height
  const heightClasses: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }

  // Status labels
  const statusLabels: Record<TaskStatus, string> = {
    OPEN: 'Not Started',
    IN_PROGRESS: 'In Progress',
    REVIEW: 'In Review',
    COMPLETED: 'Complete',
    BLOCKED: 'Blocked',
  }

  const progress = statusProgress[status]
  const color = priorityColors[priority]

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {showLabels && (
          <span className="text-xs font-medium text-gray-700">
            {statusLabels[status]}
          </span>
        )}
        {showPercentage && (
          <span className="text-xs font-semibold text-gray-900">
            {progress}%
          </span>
        )}
      </div>

      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heightClasses[height]}`}>
        <div
          className={`${color} transition-all duration-500 ease-out ${heightClasses[height]}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Status Indicators */}
      <div className="flex items-center justify-between text-xs text-gray-600 pt-1">
        <div className="text-center flex-1">
          <div className={`inline-block w-2 h-2 rounded-full ${progress >= 10 ? 'bg-blue-500' : 'bg-gray-300'}`} />
          <p className="text-xs mt-1">Started</p>
        </div>
        <div className="text-center flex-1">
          <div className={`inline-block w-2 h-2 rounded-full ${progress >= 50 ? 'bg-blue-500' : 'bg-gray-300'}`} />
          <p className="text-xs mt-1">Progress</p>
        </div>
        <div className="text-center flex-1">
          <div className={`inline-block w-2 h-2 rounded-full ${progress >= 75 ? 'bg-blue-500' : 'bg-gray-300'}`} />
          <p className="text-xs mt-1">Review</p>
        </div>
        <div className="text-center flex-1">
          <div className={`inline-block w-2 h-2 rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-gray-300'}`} />
          <p className="text-xs mt-1">Done</p>
        </div>
      </div>
    </div>
  )
}
