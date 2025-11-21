'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { useTasksData } from '@/hooks/shared/useTasks'
import { Task, TaskStatus, TaskPriority } from '@/types/shared/entities/task'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TaskCard } from '@/components/shared/cards'
import { Plus, Search, Filter, MoreVertical, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { formatDate } from '@/lib/shared/formatters'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/**
 * Admin Tasks Management Page
 *
 * Comprehensive task management dashboard with:
 * - Task analytics and statistics
 * - Advanced filtering by status, priority, assignee, due date
 * - Bulk operations (reassign, status change, delete)
 * - Search functionality
 * - Task creation
 * - Performance metrics
 */
export default function AdminTasksPage() {
  const { data: tasks = [], isLoading, error } = useTasksData({
    limit: 100,
    offset: 0,
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | null>(null)
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | null>(null)
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<'dueAt' | 'priority' | 'status' | 'created'>('created')

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let result = tasks.filter((task) => {
      const matchesSearch =
        !searchQuery ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = !statusFilter || task.status === statusFilter
      const matchesPriority = !priorityFilter || task.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'dueAt') {
        if (!a.dueAt) return 1
        if (!b.dueAt) return -1
        return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
      }
      if (sortBy === 'priority') {
        const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }
      if (sortBy === 'status') {
        const statusOrder = { OPEN: 0, IN_PROGRESS: 1, REVIEW: 2, BLOCKED: 3, COMPLETED: 4 }
        return statusOrder[a.status] - statusOrder[b.status]
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return result
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortBy])

  // Analytics
  const analytics = useMemo(() => {
    return {
      total: tasks.length,
      open: tasks.filter((t) => t.status === TaskStatus.OPEN).length,
      inProgress: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
      review: tasks.filter((t) => t.status === TaskStatus.REVIEW).length,
      completed: tasks.filter((t) => t.status === TaskStatus.COMPLETED).length,
      blocked: tasks.filter((t) => t.status === TaskStatus.BLOCKED).length,
      highPriority: tasks.filter((t) => t.priority === TaskPriority.HIGH).length,
      overdue: tasks.filter(
        (t) => t.dueAt && new Date(t.dueAt) < new Date() && t.status !== TaskStatus.COMPLETED
      ).length,
      completionRate:
        tasks.length > 0
          ? Math.round(
              (tasks.filter((t) => t.status === TaskStatus.COMPLETED).length / tasks.length) * 100
            )
          : 0,
    }
  }, [tasks])

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
          <h1 className="text-3xl font-bold">Task Management</h1>
          <p className="text-gray-600 mt-1">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <Link href="/admin/tasks/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </Button>
        </Link>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{analytics.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{analytics.completionRate}%</p>
            <p className="text-xs text-gray-500 mt-1">{analytics.completed} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{analytics.inProgress}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{analytics.highPriority}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{analytics.overdue}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Blocked</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{analytics.blocked}</p>
          </CardContent>
        </Card>
      </div>

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

          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-2">Status</label>
              <div className="flex gap-1 flex-wrap">
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
              <label className="text-xs font-medium text-gray-600 block mb-2">Priority</label>
              <div className="flex gap-1 flex-wrap">
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

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-2">Sort By</label>
              <div className="flex gap-1">
                {(
                  [
                    { value: 'created', label: 'Created' },
                    { value: 'dueAt', label: 'Due Date' },
                    { value: 'priority', label: 'Priority' },
                    { value: 'status', label: 'Status' },
                  ] as const
                ).map(({ value, label }) => (
                  <Badge
                    key={value}
                    variant={sortBy === value ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSortBy(value)}
                  >
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tasks ({filteredTasks.length})</CardTitle>
            {selectedTasks.size > 0 && (
              <div className="text-sm text-gray-600">
                {selectedTasks.size} selected
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredTasks.length > 0 ? (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <Link key={task.id} href={`/admin/tasks/${task.id}`}>
                  <TaskCard
                    data={task}
                    variant="admin"
                    showActions={false}
                  />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No tasks match your filters</p>
            </div>
          )}
        </CardContent>
      </Card>

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
