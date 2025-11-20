import { ComponentType, ReactNode } from 'react'
import dynamic from 'next/dynamic'

/**
 * Configuration for dynamic component loading
 */
export interface DynamicComponentConfig {
  loading?: () => ReactNode
  ssr?: boolean
}

/**
 * Default loading fallback
 */
function DefaultLoadingFallback() {
  return <div className="animate-pulse bg-gray-200 rounded h-12 w-12" />
}

/**
 * Get configuration for dynamic component loading
 */
export function getDynamicComponentConfig(
  type: 'admin' | 'modal' | 'modal-heavy' | 'page' | 'feature'
): DynamicComponentConfig {
  const configs: Record<string, DynamicComponentConfig> = {
    admin: {
      loading: DefaultLoadingFallback,
      ssr: false, // Admin pages usually don't need SSR
    },
    modal: {
      loading: DefaultLoadingFallback,
      ssr: false, // Modals load on demand
    },
    modal_heavy: {
      loading: DefaultLoadingFallback,
      ssr: false, // Heavy modals load on demand
    },
    page: {
      loading: DefaultLoadingFallback,
      ssr: true, // Pages need SSR for SEO
    },
    feature: {
      loading: DefaultLoadingFallback,
      ssr: false, // Feature components load on demand
    },
  }

  return configs[type] || configs.feature
}

/**
 * Create a dynamically imported component
 */
export function createDynamicComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  type: 'admin' | 'modal' | 'modal-heavy' | 'page' | 'feature' = 'feature'
): T {
  const config = getDynamicComponentConfig(type)

  return dynamic(importFunc, {
    loading: config.loading,
    ssr: config.ssr,
  }) as T
}

/**
 * Heavy components that should be code-split
 * List of components to wrap with dynamic imports
 */
export const HEAVY_COMPONENTS_TO_SPLIT = {
  // Admin dashboards
  AdminDashboard: () => import('@/components/admin/AdminDashboard').then((m) => m.default),
  AdminUsers: () => import('@/app/admin/users/page').then((m) => m.default),
  AdminServices: () => import('@/app/admin/services/page').then((m) => m.default),
  AdminBookings: () => import('@/app/admin/bookings/page').then((m) => m.default),
  AdminTasks: () => import('@/app/admin/tasks/page').then((m) => m.default),
  AdminDocuments: () => import('@/app/admin/documents/page').then((m) => m.default),
  AdminAnalytics: () => import('@/app/admin/analytics/page').then((m) => m.default),

  // Portal pages
  PortalServices: () => import('@/components/portal/ServicesDirectory').then((m) => m.default),
  PortalBookings: () => import('@/app/portal/bookings/page').then((m) => m.default),
  PortalTasks: () => import('@/app/portal/tasks/page').then((m) => m.default),
  PortalDocuments: () => import('@/app/portal/documents/page').then((m) => m.default),

  // Forms and modals (heavy)
  ServiceForm: () => import('@/components/shared/forms/ServiceForm').then((m) => m.default),
  BookingForm: () => import('@/components/shared/forms/BookingForm').then((m) => m.default),
  TaskForm: () => import('@/components/shared/forms/TaskForm').then((m) => m.default),
  UserForm: () => import('@/components/admin/shared/UserForm').then((m) => m.default),

  // Data tables
  DataTable: () => import('@/components/dashboard/DataTable').then((m) => m.default),
  VirtualizedList: () => import('@/components/dashboard/lists/VirtualizedList').then((m) => m.default),
}

/**
 * Type for accessing heavy components dynamically
 */
export type HeavyComponentKey = keyof typeof HEAVY_COMPONENTS_TO_SPLIT

/**
 * Get dynamically imported component
 */
export function getDynamicComponent(key: HeavyComponentKey) {
  const componentImport = HEAVY_COMPONENTS_TO_SPLIT[key]
  if (!componentImport) {
    throw new Error(`Unknown component: ${key}`)
  }

  return createDynamicComponent(componentImport, 'admin')
}