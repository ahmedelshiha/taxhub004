'use client'

import React, { useEffect, useState } from 'react'
import { TaskEvent } from '@/hooks/shared/useTasksSocket'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCircle2, AlertCircle, Users, MessageCircle, Zap, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TaskNotificationProps {
  /** Event to display */
  event: TaskEvent
  /** Called when notification is dismissed */
  onDismiss?: () => void
  /** Auto-dismiss after ms (0 = don't auto-dismiss) */
  autoDismissMs?: number
}

/**
 * TaskNotification Component
 *
 * Displays real-time task event notifications with:
 * - Event-specific icons and colors
 * - Auto-dismiss capability
 * - Smooth animations
 * - Dismiss button
 *
 * @example
 * ```tsx
 * <TaskNotification
 *   event={taskEvent}
 *   autoDismissMs={5000}
 *   onDismiss={handleDismiss}
 * />
 * ```
 */
export default function TaskNotification({
  event,
  onDismiss,
  autoDismissMs = 5000,
}: TaskNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (autoDismissMs > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onDismiss?.(), 300) // Wait for animation
      }, autoDismissMs)

      return () => clearTimeout(timer)
    }
  }, [autoDismissMs, onDismiss])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onDismiss?.(), 300)
  }

  // Get notification details based on event type
  const getNotificationDetails = () => {
    switch (event.type) {
      case 'TASK_CREATED':
        return {
          icon: <CheckCircle2 className="w-5 h-5" />,
          title: 'New Task Created',
          description: event.task?.title || 'A new task has been created',
          bgColor: 'bg-green-50 border-green-200',
          iconColor: 'text-green-600',
        }
      case 'TASK_ASSIGNED':
        return {
          icon: <Users className="w-5 h-5" />,
          title: 'Task Assigned',
          description: `"${event.task?.title}" has been assigned to you`,
          bgColor: 'bg-blue-50 border-blue-200',
          iconColor: 'text-blue-600',
        }
      case 'TASK_STATUS_CHANGED':
        return {
          icon: <Zap className="w-5 h-5" />,
          title: 'Status Updated',
          description: `"${event.task?.title}" status changed to ${event.data?.newStatus}`,
          bgColor: 'bg-purple-50 border-purple-200',
          iconColor: 'text-purple-600',
        }
      case 'COMMENT_ADDED':
        return {
          icon: <MessageCircle className="w-5 h-5" />,
          title: 'New Comment',
          description: `Comment added to "${event.task?.title}"`,
          bgColor: 'bg-amber-50 border-amber-200',
          iconColor: 'text-amber-600',
        }
      case 'TASK_UPDATED':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          title: 'Task Updated',
          description: `"${event.task?.title}" has been updated`,
          bgColor: 'bg-gray-50 border-gray-200',
          iconColor: 'text-gray-600',
        }
      default:
        return {
          icon: <Bell className="w-5 h-5" />,
          title: 'Notification',
          description: 'A task event occurred',
          bgColor: 'bg-gray-50 border-gray-200',
          iconColor: 'text-gray-600',
        }
    }
  }

  const details = getNotificationDetails()

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 400, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 400, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`fixed bottom-6 right-6 max-w-sm border rounded-lg shadow-lg p-4 ${details.bgColor}`}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`flex-shrink-0 ${details.iconColor}`}>
              {details.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-gray-900">{details.title}</h4>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{details.description}</p>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
