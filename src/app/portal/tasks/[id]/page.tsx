'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTaskDetail } from '@/hooks/shared/useTasks'
import { TaskStatus } from '@/types/shared/entities/task'
import { TaskDetailCard } from '@/components/shared/cards'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Edit2 } from 'lucide-react'

/**
 * Portal Task Detail Page
 *
 * Displays detailed task information with:
 * - Full task description and metadata
 * - All comments and replies
 * - Ability to add comments
 * - Status update capability
 * - Edit task button (for own tasks)
 */
export default function PortalTaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const taskId = params.id as string
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  const { task, comments, isLoading, error, mutate } = useTaskDetail(taskId)

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    setIsUpdating(true)
    setUpdateError(null)

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Failed to update task status')
      }

      // Revalidate task data
      await mutate()
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Failed to update task')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAddComment = async (taskId: string, content: string) => {
    setIsUpdating(true)
    setUpdateError(null)

    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error('Failed to add comment')
      }

      // Revalidate task data with comments
      await mutate()
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Failed to add comment')
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Loading task...</p>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="space-y-4 p-6">
        <Link href="/portal/tasks">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tasks
          </Button>
        </Link>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">{error || 'Task not found'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/portal/tasks">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tasks
          </Button>
        </Link>

        <Link href={`/portal/tasks/${task.id}/edit`}>
          <Button variant="outline">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Task
          </Button>
        </Link>
      </div>

      {/* Task Detail */}
      <TaskDetailCard
        task={task}
        comments={comments}
        onStatusChange={handleStatusChange}
        onAddComment={handleAddComment}
        loading={isUpdating}
        showActions={true}
      />

      {/* Error Display */}
      {updateError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">{updateError}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
