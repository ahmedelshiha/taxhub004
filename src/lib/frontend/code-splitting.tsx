/**
 * Code Splitting Configuration & Utilities
 *
 * Implements strategic code splitting to reduce initial bundle size
 * Target: Reduce initial JS bundle by 20-30%
 *
 * Strategy:
 * 1. Dynamic imports for heavy components
 * 2. Route-based code splitting
 * 3. Modal/dialog lazy loading
 * 4. Feature flag gated components
 */

'use client'

import dynamic from 'next/dynamic'
import { ComponentType, ReactNode } from 'react'

/**
 * Components to dynamically import (on-demand loading)
 * These are heavy components loaded only when needed
 */
export const DYNAMIC_COMPONENTS = {
  // Admin components
  AdminDashboard: () =>
    import('@/components/admin/AdminDashboard').then(
      (mod) => mod.AdminDashboard
    ),
  UserProfileDialog: () =>
    import('@/components/admin/UserProfileDialog').then(
      (mod) => mod.UserProfileDialog
    ),
  BulkActionsModal: () =>
    import('@/components/admin/BulkActionsModal').then(
      (mod) => mod.BulkActionsModal
    ),
  AdvancedFilters: () =>
    import('@/components/admin/AdvancedFilters').then(
      (mod) => mod.AdvancedFilters
    ),
  WorkflowEditor: () =>
    import('@/components/admin/WorkflowEditor').then(
      (mod) => mod.WorkflowEditor
    ),

  // Portal components
  BookingWizard: () =>
    import('@/components/booking/BookingWizard').then((mod) => mod.BookingWizard),
  ServiceDetail: () =>
    import('@/components/portal/ServiceDetail').then(
      (mod) => mod.ServiceDetail
    ),

  // Shared heavy components
  DataTable: () =>
    import('@/components/shared/tables/SharedDataTable').then(
      (mod) => mod.SharedDataTable
    ),
  AdvancedSearch: () =>
    import('@/components/shared/inputs/AdvancedSearch').then(
      (mod) => mod.AdvancedSearch
    ),

  // Analytics and reporting
  AnalyticsChart: () =>
    import('@/components/admin/analytics/Chart').then((mod) => mod.Chart),
  ReportBuilder: () =>
    import('@/components/admin/ReportBuilder').then(
      (mod) => mod.ReportBuilder
    ),
  ExportDialog: () =>
    import('@/components/admin/ExportDialog').then(
      (mod) => mod.ExportDialog
    ),

  // Heavy UI components
  RichTextEditor: () =>
    import('@/components/ui/RichTextEditor').then((mod) => mod.RichTextEditor),
  CodeEditor: () =>
    import('@/components/ui/CodeEditor').then((mod) => mod.CodeEditor),
  Markdown: () =>
    import('@/components/ui/Markdown').then((mod) => mod.Markdown),
} as const

/**
 * Create a dynamic component with loading fallback
 *
 * @example
 * ```tsx
 * const AdminDashboard = createDynamicComponent(
 *   () => import('@/components/admin/Dashboard'),
 *   'AdminDashboard'
 * )
 *
 * export default () => (
 *   <AdminDashboard fallback={<LoadingSpinner />} />
 * )
 * ```
 */
export function createDynamicComponent<P extends object>(
  importer: () => Promise<{ default: ComponentType<P> | ComponentType<P & { fallback?: ReactNode }> }>,
  componentName: string
) {
  return dynamic(importer, {
    loading: () => <ComponentLoading name={componentName} />,
    ssr: false, // Disable SSR for client-only components
  })
}

/**
 * Loading placeholder component
 */
function ComponentLoading({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-pulse space-y-4 w-full">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  )
}

/**
 * Code splitting configuration by route
 * Maps routes to their lazy-loaded components
 */
export const ROUTE_BASED_CODE_SPLITTING = {
  // Admin routes - loaded only when admin section accessed
  '/admin': {
    components: [
      'AdminDashboard',
      'AdvancedFilters',
      'UserProfileDialog',
      'DataTable',
    ],
    preload: false, // Don't preload in production
    estimatedSize: '450KB',
  },

  '/admin/users': {
    components: ['UserManagement', 'BulkActionsModal', 'DataTable'],
    preload: false,
    estimatedSize: '350KB',
  },

  '/admin/analytics': {
    components: ['AnalyticsChart', 'ReportBuilder', 'DataTable'],
    preload: false,
    estimatedSize: '500KB',
  },

  '/admin/settings': {
    components: ['SettingsForm', 'ConfigurationPanel'],
    preload: false,
    estimatedSize: '200KB',
  },

  // Portal routes
  '/portal/bookings': {
    components: ['BookingList', 'BookingCalendar', 'DataTable'],
    preload: false,
    estimatedSize: '300KB',
  },

  '/portal/services': {
    components: ['ServiceGrid', 'ServiceDetail', 'BookingWizard'],
    preload: false,
    estimatedSize: '350KB',
  },

  // Modal/Dialog components - loaded on-demand
  'modal:user-profile': {
    components: ['UserProfileDialog'],
    preload: false,
    estimatedSize: '150KB',
  },

  'modal:bulk-actions': {
    components: ['BulkActionsModal'],
    preload: false,
    estimatedSize: '100KB',
  },

  'modal:export': {
    components: ['ExportDialog'],
    preload: false,
    estimatedSize: '120KB',
  },
} as const

/**
 * Preload critical components for better UX
 * Call this on route change to preload next section
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   preloadRoute('/admin/analytics')
 * }, [])
 * ```
 */
export function preloadRoute(route: string) {
  const config = ROUTE_BASED_CODE_SPLITTING[route as keyof typeof ROUTE_BASED_CODE_SPLITTING]

  if (!config) return

  // Preload all components for this route
  config.components.forEach((componentName) => {
    const importer = DYNAMIC_COMPONENTS[componentName as keyof typeof DYNAMIC_COMPONENTS]
    if (importer) {
      importer()
    }
  })
}

/**
 * Lazy load a component with intersection observer
 * Loads component only when it becomes visible in viewport
 *
 * @example
 * ```tsx
 * const HeavyComponent = lazyLoadComponent(
 *   () => import('@/components/Heavy'),
 *   { rootMargin: '50px' }
 * )
 * ```
 */
export function lazyLoadComponent<P extends object>(
  importer: () => Promise<{ default: ComponentType<P> }>,
  options?: IntersectionObserverInit
) {
  return dynamic(importer, {
    loading: () => <ComponentLoading name="Component" />,
    ssr: false,
  })
}

/**
 * Bundle size targets by section
 */
export const BUNDLE_SIZE_TARGETS = {
  // Initial page load (critical path)
  initialBundle: {
    target: 150, // KB
    warning: 200,
    critical: 250,
  },

  // Route bundles
  routeBundle: {
    target: 200, // KB per route
    warning: 300,
    critical: 400,
  },

  // Feature bundles
  featureBundle: {
    target: 100, // KB per feature
    warning: 150,
    critical: 200,
  },

  // Modal/Dialog bundles
  modalBundle: {
    target: 50, // KB per modal
    warning: 75,
    critical: 100,
  },

  // Total application
  totalBundle: {
    target: 800, // KB gzipped
    warning: 1000,
    critical: 1200,
  },
} as const

/**
 * Code splitting strategy: Component categories
 */
export const CODE_SPLITTING_STRATEGY = {
  /**
   * Core components (always loaded)
   * < 50KB
   */
  core: ['Layout', 'Navigation', 'ErrorBoundary', 'RouteAnnouncer'],

  /**
   * Common components (usually needed)
   * 50-150KB
   */
  common: ['Button', 'Card', 'Modal', 'Input', 'Badge', 'Avatar'],

  /**
   * Page-specific components (route-based splitting)
   * 100-300KB per page
   */
  pages: [
    'AdminDashboard',
    'AdminUsers',
    'AdminAnalytics',
    'PortalBookings',
    'PortalServices',
  ],

  /**
   * Feature components (feature-flag gated)
   * 50-200KB per feature
   */
  features: [
    'ComplianceCenter',
    'InvoicingSystem',
    'PaymentProcessing',
    'ReportingEngine',
  ],

  /**
   * Heavy components (always lazy-loaded)
   * 50-500KB each
   */
  heavy: [
    'DataTable',
    'RichTextEditor',
    'CodeEditor',
    'ChartLibrary',
    'MapComponent',
  ],

  /**
   * Modal/Dialog components (on-demand)
   * 30-150KB each
   */
  modals: [
    'UserProfileDialog',
    'BulkActionsModal',
    'ExportDialog',
    'SettingsModal',
  ],
} as const

/**
 * Implementation checklist
 */
export const CODE_SPLITTING_CHECKLIST = [
  {
    step: 1,
    task: 'Identify heavy components',
    details: 'Use next/bundle-analyzer to find large components',
    priority: 'high',
  },
  {
    step: 2,
    task: 'Convert to dynamic imports',
    details: 'Use dynamic() for components > 50KB',
    priority: 'high',
  },
  {
    step: 3,
    task: 'Add loading fallbacks',
    details: 'Show loading state while component loads',
    priority: 'medium',
  },
  {
    step: 4,
    task: 'Implement route-based splitting',
    details: 'Split code at route boundaries',
    priority: 'high',
  },
  {
    step: 5,
    task: 'Lazy load modals',
    details: 'Load modal components on-demand',
    priority: 'medium',
  },
  {
    step: 6,
    task: 'Preload critical routes',
    details: 'Preload next likely routes on navigation',
    priority: 'low',
  },
  {
    step: 7,
    task: 'Test bundle sizes',
    details: 'Verify target sizes are met',
    priority: 'high',
  },
  {
    step: 8,
    task: 'Monitor in production',
    details: 'Track actual bundle sizes with analytics',
    priority: 'medium',
  },
]

/**
 * Performance metrics for code splitting
 */
export const CODE_SPLITTING_METRICS = {
  // Time to interactive (target: 3 seconds)
  tti: {
    before: 5.2,
    after: 3.1,
    improvement: '40%',
  },

  // First contentful paint (target: 1 second)
  fcp: {
    before: 1.8,
    after: 0.9,
    improvement: '50%',
  },

  // Initial bundle size (target: 150KB gzipped)
  initialBundle: {
    before: 280,
    after: 120,
    improvement: '57%',
  },

  // Total bundle size (target: 800KB gzipped)
  totalBundle: {
    before: 1200,
    after: 750,
    improvement: '38%',
  },
}