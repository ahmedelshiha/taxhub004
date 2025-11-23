'use client'

import React, { useState, useMemo } from 'react'
import { Search, Users, MapPin, Building2, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { TeamMemberCard, TeamMember } from './TeamMemberCard'
import { cn } from '@/lib/utils'

interface TeamDirectoryProps {
  members: TeamMember[]
  isLoading?: boolean
  error?: Error | null
  onSelectMember?: (memberId: string) => void
  selectedMembers?: string[]
  variant?: 'list' | 'grid'
  showDepartmentFilter?: boolean
  showStatusFilter?: boolean
  showSearch?: boolean
  title?: string
  description?: string
  emptyState?: React.ReactNode
  className?: string
}

/**
 * TeamDirectory Component
 *
 * Displays a searchable, filterable directory of team members.
 * Supports both list and grid layouts with optional status and department filtering.
 *
 * @example
 * ```tsx
 * <TeamDirectory
 *   members={teamMembers}
 *   variant="grid"
 *   showDepartmentFilter
 *   showStatusFilter
 * />
 * ```
 */
export function TeamDirectory({
  members,
  isLoading = false,
  error,
  onSelectMember,
  selectedMembers = [],
  variant = 'list',
  showDepartmentFilter = true,
  showStatusFilter = true,
  showSearch = true,
  title = 'Team Directory',
  description,
  emptyState,
  className,
}: TeamDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  // Get unique departments
  const departments = useMemo(() => {
    return Array.from(
      new Set(
        members
          .filter((m) => m.department)
          .map((m) => m.department)
      )
    ).filter((d): d is string => d !== null)
  }, [members])

  // Get unique statuses
  const statuses = useMemo(() => {
    return Array.from(
      new Set(members.filter((m) => m.status).map((m) => m.status))
    ).filter((s): s is 'offline' | 'online' | 'away' => typeof s === 'string' && ['offline', 'online', 'away'].includes(s as string))
  }, [members])

  // Filter members
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        !searchQuery ||
        (member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.position?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

      const matchesDepartment = !selectedDepartment || member.department === selectedDepartment
      const matchesStatus = !selectedStatus || member.status === selectedStatus

      return matchesSearch && matchesDepartment && matchesStatus
    })
  }, [members, searchQuery, selectedDepartment, selectedStatus])

  // Group by department if variant is list
  const groupedByDepartment = useMemo(() => {
    if (variant !== 'list') return {}

    return filteredMembers.reduce(
      (acc, member) => {
        const dept = member.department || 'Other'
        if (!acc[dept]) acc[dept] = []
        acc[dept].push(member)
        return acc
      },
      {} as Record<string, TeamMember[]>
    )
  }, [filteredMembers, variant])

  if (error) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="text-red-600 dark:text-red-400">
          <p className="font-semibold">Error loading team directory</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{error.message}</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (filteredMembers.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        {emptyState ? (
          emptyState
        ) : (
          <div>
            <Users className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No team members found
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {searchQuery || selectedDepartment || selectedStatus
                ? 'Try adjusting your filters'
                : 'No team members to display'}
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      {(title || description) && (
        <div className="mb-6">
          {title && <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>}
          {description && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing <span className="font-semibold">{filteredMembers.length}</span> of{' '}
          <span className="font-semibold">{members.length}</span> team members
        </div>
      </div>

      {/* Search and Filters */}
      {(showSearch || showDepartmentFilter || showStatusFilter) && (
        <div className="space-y-4">
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by name, email, or position..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Filter Pills */}
          {(showDepartmentFilter || showStatusFilter) && (
            <div className="flex flex-wrap gap-2">
              {showDepartmentFilter && departments.length > 0 && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  {departments.map((dept) => (
                    <Button
                      key={dept}
                      variant={selectedDepartment === dept ? 'default' : 'outline'}
                      size="sm"
                      onClick={() =>
                        setSelectedDepartment(selectedDepartment === dept ? null : dept)
                      }
                    >
                      {dept}
                    </Button>
                  ))}
                </div>
              )}

              {showStatusFilter && statuses.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="ml-2">
                    Status
                  </Badge>
                  {statuses.map((status) => (
                    <Button
                      key={status}
                      variant={selectedStatus === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedStatus(selectedStatus === status ? null : status)}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ))}
                </div>
              )}

              {/* Clear filters button */}
              {(selectedDepartment || selectedStatus || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedDepartment(null)
                    setSelectedStatus(null)
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {variant === 'grid' ? (
        // Grid layout
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              variant="full"
              onSelect={onSelectMember}
              isSelected={selectedMembers.includes(member.id)}
              showStatus
              showDepartment
            />
          ))}
        </div>
      ) : (
        // List layout - grouped by department
        <div className="space-y-8">
          {Object.entries(groupedByDepartment).map(([dept, deptMembers]) => (
            <div key={dept}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-gray-400" />
                {dept}
                <Badge variant="secondary">{deptMembers.length}</Badge>
              </h3>
              <div className="space-y-3">
                {deptMembers.map((member) => (
                  <TeamMemberCard
                    key={member.id}
                    member={member}
                    variant="compact"
                    onSelect={onSelectMember}
                    isSelected={selectedMembers.includes(member.id)}
                    showStatus
                    showDepartment={false}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TeamDirectory
