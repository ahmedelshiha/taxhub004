"use client"

import { useCallback } from 'react'
import { useLocalizationContext } from '../LocalizationProvider'

export function useLanguageAnalytics() {
  const { setAnalyticsData, setError } = useLocalizationContext()

  const loadAnalytics = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/user-language-analytics')
      const d = await r.json()
      if (!r.ok) throw new Error(d?.error || 'Failed to load analytics')
      setAnalyticsData(d.data)
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to load analytics'
      setError(errorMessage)
      throw e
    }
  }, [setAnalyticsData, setError])

  return { loadAnalytics }
}
