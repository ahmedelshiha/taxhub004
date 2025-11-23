'use client'

import React from 'react'
import Link from 'next/link'
import { User } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TeamMember {
  id: string
  name?: string | null
  email: string
  image?: string | null
  department?: string | null
  position?: string | null
  status?: 'online' | 'offline' | 'away'
}

interface TeamMemberCardProps {
  member: TeamMember
  variant?: 'full' | 'avatar-only' | 'compact'
  onSelect?: (id: string) => void
  isSelected?: boolean
  className?: string
  href?: string
  showStatus?: boolean
  showDepartment?: boolean
}

/**
 * TeamMemberCard Component
 *
 * Displays a team member's information with multiple view variants.
 * Used in team directory, task assignment, and collaboration features.
 *
 * @example
 * ```tsx
 * <TeamMemberCard
 *   member={{ id: '1', name: 'John Doe', email: 'john@example.com' }}
 *   variant="full"
 *   showStatus
 * />
 * ```
 */
export function TeamMemberCard({
  member,
  variant = 'full',
  onSelect,
  isSelected = false,
  className,
  href,
  showStatus = false,
  showDepartment = true,
}: TeamMemberCardProps) {
  const getInitials = () => {
    if (!member.name) return member.email.charAt(0).toUpperCase()
    return member.name
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase()
  }

  const getStatusColor = () => {
    switch (member.status) {
      case 'online':
        return 'bg-green-500'
      case 'away':
        return 'bg-yellow-500'
      case 'offline':
        return 'bg-gray-400'
      default:
        return 'bg-gray-300'
    }
  }

  const cardContent = (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700',
        'hover:shadow-md transition-shadow cursor-pointer',
        isSelected && 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20',
        'dark:hover:border-gray-600',
        className
      )}
      onClick={() => onSelect?.(member.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect?.(member.id)
        }
      }}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {member.image ? (
          <img
            src={member.image}
            alt={member.name || 'Team member'}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
            {getInitials()}
          </div>
        )}

        {/* Status indicator */}
        {showStatus && member.status && (
          <div
            className={cn(
              'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800',
              getStatusColor()
            )}
            aria-label={`Status: ${member.status}`}
          />
        )}
      </div>

      {/* Content based on variant */}
      {variant !== 'avatar-only' && (
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {member.name || 'Unknown'}
            </h3>
            {showStatus && member.status && (
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {member.status}
              </span>
            )}
          </div>

          {variant === 'full' && (
            <>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{member.email}</p>
              {showDepartment && member.department && (
                <p className="text-xs text-gray-500 dark:text-gray-500">{member.department}</p>
              )}
              {member.position && (
                <p className="text-xs text-gray-500 dark:text-gray-500">{member.position}</p>
              )}
            </>
          )}

          {variant === 'compact' && member.position && (
            <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{member.position}</p>
          )}
        </div>
      )}

      {/* Select indicator */}
      {isSelected && variant !== 'avatar-only' && (
        <div className="flex-shrink-0">
          <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
            <svg
              className="h-3 w-3 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  )

  // If href provided, wrap in Link
  if (href) {
    return <Link href={href}>{cardContent}</Link>
  }

  return cardContent
}

export default TeamMemberCard
