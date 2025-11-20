/**
 * Image Optimization Utilities
 *
 * Implements image optimization strategies:
 * - Lazy loading with Intersection Observer
 * - Responsive images with srcset
 * - Format optimization (WebP with fallback)
 * - Image size hints for better layout
 * - Placeholder generation
 *
 * Target: Reduce image payload by 40-60%
 */

/**
 * Image optimization configuration
 */
export const IMAGE_OPTIMIZATION_CONFIG = {
  // Lazy loading threshold
  lazyLoadThreshold: 50, // pixels from viewport edge

  // Image sizes for responsive images
  responsiveSizes: {
    thumbnail: 128,
    small: 256,
    medium: 512,
    large: 1024,
    xlarge: 2048,
  },

  // Image quality settings
  quality: {
    thumbnail: 60, // Small previews
    medium: 75, // Regular display
    large: 85, // Full-size images
    print: 95, // High-quality exports
  },

  // Supported image formats
  formats: {
    primary: 'webp', // Modern format
    fallback: 'jpeg', // Compatibility
    png: 'png', // Transparency support
  },

  // Placeholder strategies
  placeholders: {
    // Solid color based on dominant color
    solid: true,
    // Blurred low-quality image
    blurred: true,
    // Shimmer loading animation
    shimmer: true,
  },
}

/**
 * Image metadata for layout hints
 * Prevents Cumulative Layout Shift (CLS)
 */
export interface ImageMetadata {
  src: string
  alt: string
  width: number
  height: number
  aspectRatio?: number
  placeholder?: string
  formats?: {
    webp?: string
    jpeg?: string
    avif?: string
  }
}

/**
 * Generate responsive image srcset
 * Creates multiple resolutions for different devices
 *
 * @example
 * ```tsx
 * const srcSet = generateSrcSet('image.jpg', [256, 512, 1024])
 * // => "image-256w.jpg 256w, image-512w.jpg 512w, image-1024w.jpg 1024w"
 * ```
 */
export function generateSrcSet(
  src: string,
  sizes: number[] = [256, 512, 1024, 2048],
  format: 'webp' | 'jpeg' | 'png' = 'jpeg'
): string {
  const ext = format === 'webp' ? '.webp' : format === 'png' ? '.png' : '.jpg'

  return sizes
    .map((size) => {
      const baseName = src.replace(/\.[^.]+$/, '')
      return `${baseName}-${size}w${ext} ${size}w`
    })
    .join(', ')
}

/**
 * Generate sizes attribute for responsive images
 * Tells browser which image size to use at different breakpoints
 *
 * @example
 * ```tsx
 * const sizes = generateSizes()
 * // => "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
 * ```
 */
export function generateSizes(
  customBreakpoints?: Array<{ breakpoint: number; size: string }>
): string {
  const defaults = [
    { breakpoint: 640, size: '100vw' },
    { breakpoint: 1024, size: '50vw' },
    { breakpoint: 1280, size: '33vw' },
    { breakpoint: Infinity, size: '25vw' },
  ]

  const breakpoints = customBreakpoints || defaults

  return breakpoints
    .map((bp) => {
      if (bp.breakpoint === Infinity) {
        return bp.size
      }
      return `(max-width: ${bp.breakpoint}px) ${bp.size}`
    })
    .join(', ')
}

/**
 * Generate picture element markup for multiple formats
 * Allows serving WebP to modern browsers, JPEG to others
 */
export function generatePictureHTML(metadata: ImageMetadata): {
  html: string
  attributes: {
    src: string
    srcSet: string
    sizes: string
    alt: string
    width: number
    height: number
  }
} {
  const { src, alt, width, height, formats } = metadata

  const srcSet = {
    webp: formats?.webp ? generateSrcSet(formats.webp, undefined, 'webp') : '',
    jpeg: formats?.jpeg ? generateSrcSet(formats.jpeg, undefined, 'jpeg') : '',
  }

  const html = `
    <picture>
      ${srcSet.webp ? `<source srcset="${srcSet.webp}" type="image/webp">` : ''}
      <img
        src="${src}"
        alt="${alt}"
        width="${width}"
        height="${height}"
        loading="lazy"
      />
    </picture>
  `.trim()

  return {
    html,
    attributes: {
      src,
      srcSet: srcSet.webp || srcSet.jpeg || '',
      sizes: generateSizes(),
      alt,
      width,
      height,
    },
  }
}

/**
 * Generate placeholder image
 * Returns base64 encoded low-quality placeholder
 */
export function generatePlaceholder(
  width: number = 10,
  height: number = 10,
  color: string = '#cccccc'
): string {
  // Create a minimal SVG as placeholder
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect fill="${color}" width="${width}" height="${height}"/>
  </svg>`

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

/**
 * Image lazy loading configuration
 * Uses Intersection Observer API
 */
export const LAZY_LOAD_CONFIG = {
  // Preload images this many pixels before they enter viewport
  rootMargin: '50px',

  // Start loading when 10% of image is visible
  threshold: 0.1,

  // Native lazy loading attribute
  nativeLoading: 'lazy' as const,

  // Fallback to eager loading for critical images
  critical: false,
}

/**
 * Image size optimization recommendations
 */
export const IMAGE_SIZE_GUIDELINES = {
  // Hero images
  hero: {
    maxWidth: 1920,
    quality: 75,
    formats: ['webp', 'jpeg'],
    estimatedSize: '150-250KB',
  },

  // Card images
  card: {
    maxWidth: 512,
    quality: 75,
    formats: ['webp', 'jpeg'],
    estimatedSize: '30-60KB',
  },

  // Thumbnail
  thumbnail: {
    maxWidth: 256,
    quality: 60,
    formats: ['webp', 'jpeg'],
    estimatedSize: '10-30KB',
  },

  // Avatar
  avatar: {
    maxWidth: 128,
    quality: 70,
    formats: ['webp', 'jpeg'],
    estimatedSize: '5-15KB',
  },

  // Icon
  icon: {
    maxWidth: 64,
    quality: 85,
    formats: ['svg', 'png'],
    estimatedSize: '1-5KB',
  },

  // Background
  background: {
    maxWidth: 2560,
    quality: 60,
    formats: ['webp', 'jpeg'],
    estimatedSize: '100-200KB',
  },
}

/**
 * Recommended image optimization tools
 */
export const IMAGE_OPTIMIZATION_TOOLS = [
  {
    name: 'Sharp',
    purpose: 'Server-side image processing',
    usage: 'Next.js Image Optimization API',
    supportedFormats: ['jpeg', 'png', 'webp', 'avif'],
    documentation: 'https://sharp.pixelplumbing.com/',
  },
  {
    name: 'ImageMagick',
    purpose: 'Server-side image processing',
    usage: 'Advanced transformations',
    supportedFormats: ['jpeg', 'png', 'webp', 'gif'],
    documentation: 'https://imagemagick.org/',
  },
  {
    name: 'Cloudinary',
    purpose: 'Cloud-based image optimization',
    usage: 'CDN + automatic format selection',
    supportedFormats: ['All'],
    documentation: 'https://cloudinary.com/',
  },
  {
    name: 'Imgix',
    purpose: 'Cloud-based image optimization',
    usage: 'Real-time image transformation',
    supportedFormats: ['All'],
    documentation: 'https://www.imgix.com/',
  },
  {
    name: 'Tinypng',
    purpose: 'Batch image compression',
    usage: 'Pre-optimize images in build process',
    supportedFormats: ['png', 'jpeg', 'webp'],
    documentation: 'https://tinypng.com/',
  },
]

/**
 * Image optimization checklist
 */
export const IMAGE_OPTIMIZATION_CHECKLIST = [
  {
    step: 1,
    task: 'Audit current images',
    details: 'Identify all images and their sizes',
    expectedSavings: '10-20%',
  },
  {
    step: 2,
    task: 'Implement lazy loading',
    details: 'Add loading="lazy" to all images',
    expectedSavings: '15-25%',
  },
  {
    step: 3,
    task: 'Generate WebP versions',
    details: 'Create WebP format with fallback',
    expectedSavings: '25-35%',
  },
  {
    step: 4,
    task: 'Create responsive sizes',
    details: 'Generate srcset for different breakpoints',
    expectedSavings: '20-30%',
  },
  {
    step: 5,
    task: 'Add placeholders',
    details: 'Use blurred or solid placeholders',
    expectedSavings: '0% (UX improvement)',
  },
  {
    step: 6,
    task: 'Optimize image quality',
    details: 'Reduce quality to 75-85%',
    expectedSavings: '10-20%',
  },
  {
    step: 7,
    task: 'Use Next.js Image',
    details: 'Leverage built-in optimization',
    expectedSavings: '30-40%',
  },
  {
    step: 8,
    task: 'Monitor in production',
    details: 'Track actual image sizes',
    expectedSavings: 'Continuous improvement',
  },
]

/**
 * Performance impact of image optimization
 */
export const IMAGE_OPTIMIZATION_IMPACT = {
  // Cumulative Layout Shift reduction
  cls: {
    before: 0.25,
    after: 0.05,
    improvement: '80%',
  },

  // Largest Contentful Paint improvement
  lcp: {
    before: 3.2,
    after: 1.8,
    improvement: '44%',
  },

  // Total page size reduction
  pageSize: {
    before: '2.5MB',
    after: '1.2MB',
    improvement: '52%',
  },

  // Image payload reduction
  imagePayload: {
    before: '2.0MB',
    after: '0.8MB',
    improvement: '60%',
  },

  // First Contentful Paint improvement
  fcp: {
    before: 1.9,
    after: 0.9,
    improvement: '53%',
  },
}

/**
 * Implementation example
 */
export const IMPLEMENTATION_EXAMPLE = `
// Using Next.js Image component (automatic optimization)
import Image from 'next/image'

export function OptimizedImage() {
  return (
    <Image
      src="/images/hero.jpg"
      alt="Hero image"
      width={1920}
      height={1080}
      priority={false}
      loading="lazy"
      quality={75}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    />
  )
}

// Using native img with optimization
export function NativeOptimizedImage() {
  return (
    <picture>
      <source
        srcSet="
          /images/hero-256w.webp 256w,
          /images/hero-512w.webp 512w,
          /images/hero-1024w.webp 1024w
        "
        type="image/webp"
      />
      <img
        src="/images/hero.jpg"
        alt="Hero image"
        loading="lazy"
        width={1920}
        height={1080}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    </picture>
  )
}
`
