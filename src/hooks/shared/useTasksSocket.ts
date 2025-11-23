'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Task, TaskStatus } from '@/types/shared/entities/task'

export interface TaskEvent {
  type: 'TASK_CREATED' | 'TASK_UPDATED' | 'TASK_ASSIGNED' | 'TASK_STATUS_CHANGED' | 'COMMENT_ADDED'
  taskId: string
  task?: Task
  data?: Record<string, any>
  timestamp: Date
  userId?: string
}

interface UseTasksSocketOptions {
  taskId?: string
  onTaskCreated?: (event: TaskEvent) => void
  onTaskUpdated?: (event: TaskEvent) => void
  onTaskAssigned?: (event: TaskEvent) => void
  onTaskStatusChanged?: (event: TaskEvent) => void
  onCommentAdded?: (event: TaskEvent) => void
  onError?: (error: Error) => void
}

/**
 * Real-time task updates via WebSocket with SSE fallback
 *
 * Connects to server and receives live updates about:
 * - Task creation
 * - Task updates
 * - Task assignments
 * - Status changes
 * - Comments added
 *
 * @example
 * ```tsx
 * const { isConnected } = useTasksSocket({
 *   taskId: '123',
 *   onTaskStatusChanged: (event) => console.log('Status:', event.data),
 *   onCommentAdded: (event) => console.log('Comment:', event.data),
 * })
 * ```
 */
export function useTasksSocket(options: UseTasksSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<TaskEvent | null>(null)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const websocketRef = useRef<WebSocket | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleEvent = useCallback(
    (event: TaskEvent) => {
      setLastEvent(event)

      // Call appropriate handler based on event type
      switch (event.type) {
        case 'TASK_CREATED':
          options.onTaskCreated?.(event)
          break
        case 'TASK_UPDATED':
          options.onTaskUpdated?.(event)
          break
        case 'TASK_ASSIGNED':
          options.onTaskAssigned?.(event)
          break
        case 'TASK_STATUS_CHANGED':
          options.onTaskStatusChanged?.(event)
          break
        case 'COMMENT_ADDED':
          options.onCommentAdded?.(event)
          break
      }
    },
    [
      options.onTaskCreated,
      options.onTaskUpdated,
      options.onTaskAssigned,
      options.onTaskStatusChanged,
      options.onCommentAdded,
    ]
  )

  const connect = useCallback(() => {
    // Prefer WebSocket, fall back to SSE
    const useWebSocket = typeof WebSocket !== 'undefined'

    if (useWebSocket) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const url = `${protocol}//${window.location.host}/api/realtime/tasks${
        options.taskId ? `?taskId=${options.taskId}` : ''
      }`

      try {
        const ws = new WebSocket(url)

        ws.onopen = () => {
          setIsConnected(true)
          setReconnectAttempts(0)
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as TaskEvent
            data.timestamp = new Date(data.timestamp)
            handleEvent(data)
          } catch (err) {
            console.error('Failed to parse WebSocket message:', err)
          }
        }

        ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          options.onError?.(new Error('WebSocket connection error'))
          ws.close()
        }

        ws.onclose = () => {
          setIsConnected(false)
          // Attempt to reconnect with exponential backoff
          reconnectWithBackoff()
        }

        websocketRef.current = ws
      } catch (err) {
        console.error('Failed to create WebSocket:', err)
        // Fall back to SSE
        connectSSE()
      }
    } else {
      // Fall back to SSE if WebSocket not available
      connectSSE()
    }
  }, [options.taskId, handleEvent, options.onError])

  const connectSSE = useCallback(() => {
    const url = `/api/realtime/tasks${options.taskId ? `?taskId=${options.taskId}` : ''}`

    try {
      const eventSource = new EventSource(url)

      eventSource.onopen = () => {
        setIsConnected(true)
        setReconnectAttempts(0)
      }

      eventSource.addEventListener('task-update', (event) => {
        try {
          const data = JSON.parse(event.data) as TaskEvent
          data.timestamp = new Date(data.timestamp)
          handleEvent(data)
        } catch (err) {
          console.error('Failed to parse SSE message:', err)
        }
      })

      eventSource.onerror = (error) => {
        console.error('SSE error:', error)
        options.onError?.(new Error('SSE connection error'))
        eventSource.close()
        setIsConnected(false)
        reconnectWithBackoff()
      }

      eventSourceRef.current = eventSource
    } catch (err) {
      console.error('Failed to create SSE:', err)
      options.onError?.(err as Error)
      reconnectWithBackoff()
    }
  }, [options.taskId, handleEvent, options.onError])

  const reconnectWithBackoff = useCallback(() => {
    const maxAttempts = 5
    const baseDelay = 1000 // 1 second

    if (reconnectAttempts >= maxAttempts) {
      console.error('Max reconnect attempts reached')
      return
    }

    const delay = baseDelay * Math.pow(2, reconnectAttempts)
    setReconnectAttempts((prev) => prev + 1)

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log(`Attempting to reconnect (attempt ${reconnectAttempts + 1})...`)
      connect()
    }, delay)
  }, [reconnectAttempts, connect])

  const disconnect = useCallback(() => {
    if (websocketRef.current) {
      websocketRef.current.close()
      websocketRef.current = null
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    setIsConnected(false)
  }, [])

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    isConnected,
    lastEvent,
    reconnectAttempts,
    disconnect,
  }
}

export default useTasksSocket
