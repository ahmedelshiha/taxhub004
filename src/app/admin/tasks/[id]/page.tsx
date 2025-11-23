'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTaskDetail } from '@/hooks/shared/useTasks'
import { useUsersData } from '@/hooks/shared/useUsers'
import { TaskStatus } from '@/types/shared/entities/task'
import { TaskDetailCard } from '@/components/shared/cards'
import { TaskAssignmentForm } from '@/components/shared/forms'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react'

/**
 * Admin Task Detail Page
 *
 * Full task management interface with:
 * - Task details and timeline
 * - Comment management
 * - Task assignment to team members
 * - Status updates and changes
 * - Edit and delete capabilities
 */
export default function AdminTaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const taskId = params.id as string
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | undefined>(undefined)

  const { task, comments, isLoading, error, mutate } = useTaskDetail(taskId)
  const { data: users = [] } = useUsersData({})

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    setIsUpdating(true)
    setUpdateError(undefined)

    try {
      const response = await fetch(`/api/admin/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Failed to update task status')
      }

      await mutate()
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Failed to update task')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAddComment = async (taskId: string, content: string) => {
    setIsUpdating(true)
    setUpdateError(undefined)

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

      await mutate()
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Failed to add comment')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAssign = async (taskId: string, assigneeId: string) => {
    setIsUpdating(true)
    setUpdateError(undefined)

    try {
      const response = await fetch(`/api/admin/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assigneeId }),
      })

      if (!response.ok) {
        throw new Error('Failed to assign task')
      }

      await mutate()
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Failed to assign task')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task? This cannot be undone.')) {
      return
    }

    setIsUpdating(true)
    setUpdateError(undefined)

    try {
      const response = await fetch(`/api/admin/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete task')
      }

      router.push('/admin/tasks')
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Failed to delete task')
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
        <Link href="/admin/tasks">
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
        <Link href="/admin/tasks">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tasks
          </Button>
        </Link>

        <div className="flex gap-2">
          <Link href={`/admin/tasks/${task.id}/edit`}>
            <Button variant="outline">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isUpdating}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Task Details</TabsTrigger>
          <TabsTrigger value="assignment">Assign Task</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Task Details Tab */}
        <TabsContent value="details" className="space-y-4 mt-4">
          <TaskDetailCard
            task={task}
            comments={comments}
            onStatusChange={handleStatusChange}
            onAddComment={handleAddComment}
            loading={isUpdating}
            showActions={true}
          />
        </TabsContent>

        {/* Assignment Tab */}
        <TabsContent value="assignment" className="space-y-4 mt-4">
          <TaskAssignmentForm
            task={task}
            users={users}
            onSubmit={handleAssign}
            isLoading={isUpdating}
            error={updateError}
          />
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">Activity log will show all changes to this task.</p>
              <p className="text-gray-500 text-xs mt-2">Feature coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
