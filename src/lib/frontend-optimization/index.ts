/**
 * Frontend performance optimization utilities
 * Code splitting, image optimization, CSS optimization
 */

export { optimizeImage, Image } from './image-optimization'
export {
  monitorWebVitals,
  trackPerformanceMetric,
  reportWebVitals,
} from './web-vitals-monitor'
export { performanceLogger } from './performance-logger'
export { getDynamicComponentConfig, createDynamicComponent } from './dynamic-imports'
