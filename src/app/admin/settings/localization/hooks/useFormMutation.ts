import { useState } from 'react'
import { useFetchWithTimeout } from './useFetchWithTimeout'
import { apiCache } from '../utils/cache'

export type MutateOptions = {
  headers?: Record<string, string>
  invalidate?: (string | RegExp)[]
  json?: boolean
}

export function useFormMutation() {
  const [saving, setSaving] = useState(false)
  const { fetchWithTimeout } = useFetchWithTimeout()

  async function mutate<T = unknown>(
    url: string,
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    body?: unknown,
    options: MutateOptions = {}
  ): Promise<{ ok: boolean; data?: T; error?: string }> {
    setSaving(true)
    try {
      const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
      const result = await fetchWithTimeout<T>(url, {
        method,
        body: body && options.json !== false ? JSON.stringify(body) : (body as any),
        headers,
      })

      if (!result.ok) {
        return { ok: false, error: result.error }
      }

      if (options.invalidate && options.invalidate.length) {
        for (const pattern of options.invalidate) {
          try {
            apiCache.deletePattern(pattern)
          } catch (e) {
            // ignore invalidation errors
          }
        }
      }

      return { ok: true, data: result.data }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      return { ok: false, error: message }
    } finally {
      setSaving(false)
    }
  }

  return { saving, mutate }
}
