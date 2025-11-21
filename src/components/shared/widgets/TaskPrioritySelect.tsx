'use client'

import React from 'react'
import { TaskPriority } from '@/types/shared/entities/task'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import { Flag, ChevronDown } from 'lucide-react'

interface TaskPrioritySelectProps {
  /** Current priority level */
  value: TaskPriority
  /** Called when priority changes */
  onChange: (priority: TaskPriority) => void
  /** Is disabled */
  disabled?: boolean
  /** Show label */
  showLabel?: boolean
  /** Display size */
  size?: 'sm' | 'md' | 'lg'
}

/**
 * TaskPrioritySelect Component
 *
 * Dropdown selector for task priority levels with visual priority indicators.
 *
 * @example
 * ```tsx
 * <TaskPrioritySelect
 *   value={TaskPriority.HIGH}
 *   onChange={handlePriorityChange}
 * />
 * ```
 */
export default function TaskPrioritySelect({
  value,
  onChange,
  disabled = false,
  showLabel = true,
  size = 'md',
}: TaskPrioritySelectProps) {
  const priorities = [
    { value: TaskPriority.LOW, label: 'Low', color: 'text-blue-600', bgColor: 'bg-blue-50', description: 'Can wait' },
    {
      value: TaskPriority.MEDIUM,
      label: 'Medium',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      description: 'Normal timeline',
    },
    {
      value: TaskPriority.HIGH,
      label: 'High',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Urgent',
    },
  ]

  const currentPriority = priorities.find((p) => p.value === value)

  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-base',
    lg: 'h-12 text-lg',
  }

  return (
    <div className="flex flex-col gap-2">
      {showLabel && (
        <label className="text-sm font-medium text-gray-700">Priority</label>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={`w-full justify-between ${sizeClasses[size]} ${currentPriority ? currentPriority.bgColor : ''}`}
          >
            <div className="flex items-center gap-2">
              <Flag className={`w-4 h-4 ${currentPriority?.color}`} />
              <span className="font-medium">{currentPriority?.label || 'Select priority'}</span>
            </div>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuRadioGroup value={value} onValueChange={(val) => onChange(val as TaskPriority)}>
            {priorities.map((priority) => (
              <DropdownMenuRadioItem
                key={priority.value}
                value={priority.value}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-3 w-full">
                  <Flag className={`w-4 h-4 ${priority.color}`} />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{priority.label}</span>
                    <span className="text-xs text-gray-500">{priority.description}</span>
                  </div>
                </div>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Priority Guide */}
      <div className="text-xs text-gray-600 space-y-1">
        <p className="font-semibold">Priority Guide:</p>
        <ul className="space-y-0.5 ml-2">
          <li>🟦 <span className="text-blue-600 font-medium">Low</span> - Can wait, routine work</li>
          <li>🟨 <span className="text-yellow-600 font-medium">Medium</span> - Standard timeline</li>
          <li>🟥 <span className="text-red-600 font-medium">High</span> - Urgent, high impact</li>
        </ul>
      </div>
    </div>
  )
}
