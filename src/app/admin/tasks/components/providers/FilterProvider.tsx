'use client'

import React, { createContext, useContext, useState, useMemo } from 'react'
import type { TaskFilters } from '@/lib/tasks/types'
import { applyFilters } from '@/lib/tasks/utils'

const defaultFilters: TaskFilters = { search: '', status: [], priority: [], category: [], assignee: [], client: [], dateRange: {}, overdue: false, compliance: false, tags: [] }
interface FilterContextType {
  filters: TaskFilters
  setFilters: (filters: TaskFilters) => void
  resetFilters: () => void
  filteredTasks: any[]
}

const FilterContext = createContext<FilterContextType | null>(null)

export const FilterProvider = ({ children, tasks }: { children: React.ReactNode; tasks: any[] }) => {
  const [filters, setFilters] = useState<TaskFilters>(defaultFilters)
  const resetFilters = () => setFilters(defaultFilters)

  const filteredTasks = useMemo(() => applyFilters(tasks || [], filters), [tasks, filters])

  return (
    <FilterContext.Provider value={{ filters, setFilters, resetFilters, filteredTasks }}>{children}</FilterContext.Provider>
  )
}

export const useFilterContext = (): FilterContextType => {
  const context = useContext(FilterContext)
  if (!context) {
    throw new Error('useFilterContext must be used within FilterProvider')
  }
  return context
}
