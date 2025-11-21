/**
 * Frontend performance optimization utilities
 * Code splitting, image optimization, CSS optimization
 */

export {
  OptimizedImage,
  ResponsiveImage,
  optimizeImage,
  IMAGE_OPTIMIZATION_CONFIG,
} from './image-optimization'
export {
  monitorWebVitals,
  trackPerformanceMetric,
  reportWebVitals,
  WEB_VITALS_TARGETS,
} from './web-vitals-monitor'
export { performanceLogger } from './performance-logger'
export {
  getDynamicComponentConfig,
  createDynamicComponent,
  getDynamicComponent,
  HEAVY_COMPONENTS_TO_SPLIT,
  type HeavyComponentKey,
  type DynamicComponentConfig,
} from './dynamic-imports'
