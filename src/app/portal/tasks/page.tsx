'use client'

import React, { useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useTasksData } from '@/hooks/shared/useTasks'
import { Task, TaskStatus, TaskPriority } from '@/types/shared/entities/task'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TaskCard } from '@/components/shared/cards'
import { TaskStatusSelect, TaskProgressBar } from '@/components/shared/widgets'
import { Filter, Plus, Search, Calendar, AlertCircle } from 'lucide-react'
import { formatDate } from '@/lib/shared/formatters'

/**
 * Portal Tasks Page
 *
 * Displays list of tasks assigned to the current user with:
 * - Filtering by status and priority
 * - Search functionality
 * - Quick status updates
 * - Due date indicators
 * - Bulk actions
 */
export default function PortalTasksPage() {
  const { data: session } = useSession()
  const { data: tasks = [], isLoading, error } = useTasksData({
    limit: 50,
    offset: 0,
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | null>(null)
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | null>(null)
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())

  // Filter tasks based on search and filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        !searchQuery ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = !statusFilter || task.status === statusFilter
      const matchesPriority = !priorityFilter || task.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [tasks, searchQuery, statusFilter, priorityFilter])

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    return {
      OPEN: filteredTasks.filter((t) => t.status === TaskStatus.OPEN),
      IN_PROGRESS: filteredTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS),
      REVIEW: filteredTasks.filter((t) => t.status === TaskStatus.REVIEW),
      COMPLETED: filteredTasks.filter((t) => t.status === TaskStatus.COMPLETED),
      BLOCKED: filteredTasks.filter((t) => t.status === TaskStatus.BLOCKED),
    }
  }, [filteredTasks])

  // Overdue tasks
  const overdueTasks = useMemo(() => {
    const now = new Date()
    return filteredTasks.filter(
      (t) => t.dueAt && new Date(t.dueAt) < now && t.status !== TaskStatus.COMPLETED
    )
  }, [filteredTasks])

  // Due soon (within 3 days)
  const dueSoonTasks = useMemo(() => {
    const now = new Date()
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    return filteredTasks.filter(
      (t) =>
        t.dueAt &&
        new Date(t.dueAt) >= now &&
        new Date(t.dueAt) <= threeDaysFromNow &&
        t.status !== TaskStatus.COMPLETED
    )
  }, [filteredTasks])

  const handleToggleTask = (taskId: string) => {
    setSelectedTasks((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

  const handleToggleAll = () => {
    if (selectedTasks.size === filteredTasks.length) {
      setSelectedTasks(new Set())
    } else {
      setSelectedTasks(new Set(filteredTasks.map((t) => t.id)))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Loading tasks...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md inline-block">
          {error instanceof Error ? error.message : String(error)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Tasks</h1>
          <p className="text-gray-600 mt-1">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} to manage
          </p>
        </div>
        <Link href="/portal/tasks/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </Link>
      </div>

      {/* Alert Section */}
      {(overdueTasks.length > 0 || dueSoonTasks.length > 0) && (
        <div className="space-y-2">
          {overdueTasks.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6 flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">
                  {overdueTasks.length} overdue task{overdueTasks.length !== 1 ? 's' : ''}
                </span>
              </CardContent>
            </Card>
          )}
          {dueSoonTasks.length > 0 && !overdueTasks.length && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6 flex items-center gap-2 text-yellow-700">
                <Calendar className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">
                  {dueSoonTasks.length} task{dueSoonTasks.length !== 1 ? 's' : ''} due soon
                </span>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search tasks by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <div>
              <label className="text-xs font-medium text-gray-600">Status:</label>
              <div className="flex gap-1 mt-1">
                <Badge
                  variant={statusFilter === null ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setStatusFilter(null)}
                >
                  All
                </Badge>
                {(Object.values(TaskStatus) as TaskStatus[]).map((status) => (
                  <Badge
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Priority:</label>
              <div className="flex gap-1 mt-1">
                <Badge
                  variant={priorityFilter === null ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setPriorityFilter(null)}
                >
                  All
                </Badge>
                {(Object.values(TaskPriority) as TaskPriority[]).map((priority) => (
                  <Badge
                    key={priority}
                    variant={priorityFilter === priority ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setPriorityFilter(priority)}
                  >
                    {priority}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks by Status Tabs */}
      {filteredTasks.length > 0 ? (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">
              All
              <Badge variant="secondary" className="ml-2">
                {filteredTasks.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="open">
              Open
              <Badge variant="secondary" className="ml-2">
                {tasksByStatus.OPEN.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              In Progress
              <Badge variant="secondary" className="ml-2">
                {tasksByStatus.IN_PROGRESS.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="review">
              Review
              <Badge variant="secondary" className="ml-2">
                {tasksByStatus.REVIEW.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed">
              Done
              <Badge variant="secondary" className="ml-2">
                {tasksByStatus.COMPLETED.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="blocked">
              Blocked
              <Badge variant="secondary" className="ml-2">
                {tasksByStatus.BLOCKED.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* All Tasks Tab */}
          <TabsContent value="all" className="space-y-3 mt-4">
            {filteredTasks.length > 0 ? (
              <div className="grid gap-3">
                {filteredTasks.map((task) => (
                  <Link key={task.id} href={`/portal/tasks/${task.id}`}>
                    <TaskCard
                      data={task}
                      variant="portal"
                      onClick={() => {}}
                      showActions={false}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <p>No tasks match your filters</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Status-based Tabs */}
          {(
            [
              { status: 'open', label: 'Open', tasks: tasksByStatus.OPEN },
              {
                status: 'in-progress',
                label: 'In Progress',
                tasks: tasksByStatus.IN_PROGRESS,
              },
              { status: 'review', label: 'Review', tasks: tasksByStatus.REVIEW },
              {
                status: 'completed',
                label: 'Completed',
                tasks: tasksByStatus.COMPLETED,
              },
              { status: 'blocked', label: 'Blocked', tasks: tasksByStatus.BLOCKED },
            ] as const
          ).map(({ status, tasks: statusTasks }) => (
            <TabsContent key={status} value={status} className="space-y-3 mt-4">
              {statusTasks.length > 0 ? (
                <div className="grid gap-3">
                  {statusTasks.map((task) => (
                    <Link key={task.id} href={`/portal/tasks/${task.id}`}>
                      <TaskCard
                        data={task}
                        variant="portal"
                        onClick={() => {}}
                        showActions={false}
                      />
                    </Link>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    <p>No {status} tasks</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-4">No tasks yet</p>
            <Link href="/portal/tasks/new">
              <Button>Create First Task</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
