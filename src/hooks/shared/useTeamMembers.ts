import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'
import { TeamMember } from '@/components/shared/widgets/TeamMemberCard'
import { apiFetch } from '@/lib/api'

export interface TeamMembersFilters {
  department?: string
  search?: string
  status?: 'online' | 'offline' | 'away'
  limit?: number
  offset?: number
}

interface TeamMembersResponse {
  data: TeamMember[]
  meta: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

/**
 * Hook to fetch team members
 *
 * For portal users: Returns team members assigned to their bookings/tasks
 * For admin users: Returns all users in the organization
 *
 * @example
 * ```tsx
 * const { members, isLoading, error, mutate } = useTeamMembers({
 *   department: 'Engineering',
 *   limit: 50
 * })
 * ```
 */
export function useTeamMembers(filters: TeamMembersFilters = {}) {
  const params = new URLSearchParams()

  if (filters.department) params.append('department', filters.department)
  if (filters.search) params.append('search', filters.search)
  if (filters.status) params.append('status', filters.status)
  if (filters.limit) params.append('limit', String(filters.limit))
  if (filters.offset) params.append('offset', String(filters.offset || 0))

  const key = `/api/users/team?${params.toString()}`

  const { data, error, mutate, isLoading } = useSWR<TeamMembersResponse>(
    key,
    async (url) => {
      const response = await apiFetch(url)
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`)
      return response.json()
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 seconds
      focusThrottleInterval: 60000, // 1 minute
    }
  )

  return {
    members: data?.data || [],
    total: data?.meta?.total || 0,
    hasMore: data?.meta?.hasMore || false,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook to fetch a single team member's profile
 */
export function useTeamMember(memberId: string | null | undefined) {
  const { data, error, mutate, isLoading } = useSWR<{ data: TeamMember }>(
    memberId ? `/api/users/${memberId}` : null,
    async (url) => {
      const response = await apiFetch(url)
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`)
      return response.json()
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )

  return {
    member: data?.data || null,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook to search team members
 */
export function useTeamMemberSearch(query: string) {
  const { members, isLoading, error, mutate } = useTeamMembers({
    search: query,
    limit: 20,
  })

  return {
    results: members,
    isLoading,
    error,
    mutate,
  }
}

export default useTeamMembers
