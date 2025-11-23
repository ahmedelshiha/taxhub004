'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Task } from '@/types/shared/entities/task'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User, Mail, AlertCircle } from 'lucide-react'

interface User {
  id: string
  name: string | null
  email: string
  image?: string
  department?: string
  position?: string
}

interface TaskAssignmentFormProps {
  /** Task to assign */
  task: Task
  /** Available users to assign to */
  users: User[]
  /** Called when assignment is submitted */
  onSubmit: (taskId: string, assigneeId: string) => Promise<void>
  /** Is loading */
  isLoading?: boolean
  /** Error message */
  error?: string
}

const AssignmentSchema = z.object({
  assigneeId: z.string().min(1, 'Please select a user to assign to'),
})

type AssignmentFormData = z.infer<typeof AssignmentSchema>

/**
 * TaskAssignmentForm Component
 *
 * Form to assign or reassign a task to a team member.
 *
 * @example
 * ```tsx
 * <TaskAssignmentForm
 *   task={task}
 *   users={teamMembers}
 *   onSubmit={handleAssign}
 * />
 * ```
 */
export default function TaskAssignmentForm({
  task,
  users,
  onSubmit,
  isLoading = false,
  error,
}: TaskAssignmentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(AssignmentSchema),
    defaultValues: {
      assigneeId: task.assigneeId || '',
    },
  })

  const selectedAssigneeId = watch('assigneeId')
  const selectedUser = users.find((u) => u.id === selectedAssigneeId)

  const onSubmitHandler = async (data: AssignmentFormData) => {
    try {
      await onSubmit(task.id, data.assigneeId)
      // Form will be reset by parent component
    } catch (err) {
      // Error is handled by parent
      console.error('Assignment error:', err)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Assign Task</CardTitle>
        <CardDescription>
          Assign &quot;{task.title}&quot; to a team member
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Current Assignment */}
          {task.assignee && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-600 mb-2 font-semibold">Currently Assigned</p>
              <div className="flex items-center gap-3">
                {task.assignee.image ? (
                  <img
                    src={task.assignee.image}
                    alt={task.assignee.name || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-300 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">{task.assignee.name || task.assignee.email}</p>
                  {task.assignee.department && (
                    <p className="text-xs text-gray-600">{task.assignee.department}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* User Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Assign To</label>
            <Select
              value={selectedAssigneeId}
              onValueChange={(value) => setValue('assigneeId', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    users.length > 0 ? 'Select a team member...' : 'No users available'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      {user.image && (
                        <img
                          src={user.image}
                          alt={user.name || 'User'}
                          className="w-4 h-4 rounded-full"
                        />
                      )}
                      <span>{user.name || user.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.assigneeId && (
              <p className="text-sm text-red-600">{errors.assigneeId.message}</p>
            )}
          </div>

          {/* Selected User Preview */}
          {selectedUser && selectedUser.id !== (task.assigneeId || '') && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs text-green-600 mb-2 font-semibold">New Assignment</p>
              <div className="flex items-center gap-3">
                {selectedUser.image ? (
                  <img
                    src={selectedUser.image}
                    alt={selectedUser.name || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-green-300 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">{selectedUser.name || selectedUser.email}</p>
                  {selectedUser.department && (
                    <p className="text-xs text-gray-600">{selectedUser.department}</p>
                  )}
                  {selectedUser.position && (
                    <p className="text-xs text-gray-600">{selectedUser.position}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading || !selectedAssigneeId}
              className="flex-1"
            >
              {isLoading ? 'Assigning...' : 'Assign Task'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
