'use client'

import Image from 'next/image'

/**
 * Image optimization guidelines for different use cases
 */
export const IMAGE_OPTIMIZATION_CONFIG = {
  hero: {
    quality: 75,
    priority: true,
    maxWidth: 1920,
    maxHeight: 1080,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1920px',
  },
  card: {
    quality: 75,
    priority: false,
    maxWidth: 512,
    maxHeight: 512,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  },
  thumbnail: {
    quality: 70,
    priority: false,
    maxWidth: 256,
    maxHeight: 256,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 25vw, 256px',
  },
  avatar: {
    quality: 80,
    priority: false,
    maxWidth: 128,
    maxHeight: 128,
    sizes: '128px',
  },
  icon: {
    quality: 85,
    priority: false,
    maxWidth: 64,
    maxHeight: 64,
    sizes: '64px',
  },
}

/**
 * Optimized Image component wrapper with sensible defaults
 */
interface OptimizedImageProps {
  src: string
  alt: string
  type?: keyof typeof IMAGE_OPTIMIZATION_CONFIG
  width?: number
  height?: number
  priority?: boolean
  className?: string
  loading?: 'lazy' | 'eager'
}

export function optimizeImage(type: keyof typeof IMAGE_OPTIMIZATION_CONFIG = 'card') {
  return IMAGE_OPTIMIZATION_CONFIG[type]
}

export function OptimizedImage({
  src,
  alt,
  type = 'card',
  width,
  height,
  priority,
  className,
  loading,
}: OptimizedImageProps) {
  const config = IMAGE_OPTIMIZATION_CONFIG[type]

  return (
    <Image
      src={src}
      alt={alt}
      width={width || config.maxWidth}
      height={height || config.maxHeight}
      quality={config.quality}
      priority={priority !== undefined ? priority : config.priority}
      loading={loading || 'lazy'}
      sizes={config.sizes}
      className={className}
    />
  )
}

/**
 * Responsive image with srcset for different screen sizes
 */
export function ResponsiveImage({
  src,
  alt,
  type = 'card',
  className,
}: {
  src: string
  alt: string
  type?: keyof typeof IMAGE_OPTIMIZATION_CONFIG
  className?: string
}) {
  const config = IMAGE_OPTIMIZATION_CONFIG[type]

  return (
    <div className={`relative w-full h-auto ${className || ''}`}>
      <Image
        src={src}
        alt={alt}
        width={config.maxWidth}
        height={config.maxHeight}
        quality={config.quality}
        sizes={config.sizes}
        style={{ width: '100%', height: 'auto' }}
      />
    </div>
  )
}