import { NextResponse } from 'next/server'

/**
 * Compression configuration
 */
export const COMPRESSION_CONFIG = {
  minSize: 1024, // Only compress if response > 1KB
  level: 6, // Compression level 1-9 (6 is good balance)
  threshold: 100, // Compress if % savings > 100
  types: [
    'application/json',
    'application/javascript',
    'text/javascript',
    'text/css',
    'text/html',
    'text/plain',
    'text/xml',
    'application/xml',
  ],
}

/**
 * Check if response should be compressed
 */
export function shouldCompress(
  contentType?: string,
  contentLength?: number
): boolean {
  if (!contentType || !contentLength) return false

  // Check if content type is compressible
  const isCompressible = COMPRESSION_CONFIG.types.some((type) =>
    contentType.includes(type)
  )

  // Only compress if larger than minimum size
  const isLargeEnough = contentLength >= COMPRESSION_CONFIG.minSize

  return isCompressible && isLargeEnough
}

/**
 * Gzip compression headers for Next.js response
 */
export function getCompressionHeaders() {
  return {
    'Content-Encoding': 'gzip',
    'Vary': 'Accept-Encoding',
  }
}

/**
 * Add compression headers to response
 */
export function addCompressionHeaders(response: NextResponse, compressed: boolean) {
  if (compressed) {
    response.headers.set('Content-Encoding', 'gzip')
    response.headers.set('Vary', 'Accept-Encoding')
  }

  return response
}

/**
 * Serializable response wrapper with compression metadata
 */
export interface CompressedResponse<T> {
  data: T
  compressed: boolean
  originalSize?: number
  compressedSize?: number
  compressionRatio?: number
}

/**
 * Calculate compression ratio
 */
export function calculateCompressionRatio(
  original: number,
  compressed: number
): number {
  if (original === 0) return 0
  return ((original - compressed) / original) * 100
}

/**
 * Response optimization with compression metadata
 */
export function createOptimizedResponse<T>(
  data: T,
  options?: {
    compressed?: boolean
    originalSize?: number
    compressedSize?: number
    cacheControl?: string
  }
): CompressedResponse<T> {
  const compressionRatio =
    options?.originalSize && options?.compressedSize
      ? calculateCompressionRatio(options.originalSize, options.compressedSize)
      : undefined

  return {
    data,
    compressed: options?.compressed ?? false,
    originalSize: options?.originalSize,
    compressedSize: options?.compressedSize,
    compressionRatio,
  }
}

/**
 * Best practices for response optimization
 */
export const optimizationTips = {
  /**
   * Remove null values to reduce payload
   */
  removeNullValues<T extends Record<string, any>>(obj: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(obj).filter(([, value]) => value !== null && value !== undefined)
    ) as Partial<T>
  },

  /**
   * Remove empty arrays to reduce payload
   */
  removeEmptyArrays<T extends Record<string, any>>(obj: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(obj).filter(
        ([, value]) =>
          !(Array.isArray(value) && value.length === 0)
      )
    ) as Partial<T>
  },

  /**
   * Remove specified fields
   */
  removeFields<T extends Record<string, any>>(
    obj: T,
    fieldsToRemove: string[]
  ): Partial<T> {
    return Object.fromEntries(
      Object.entries(obj).filter(([key]) => !fieldsToRemove.includes(key))
    ) as Partial<T>
  },

  /**
   * Trim string values to max length
   */
  trimStrings<T extends Record<string, any>>(
    obj: T,
    maxLength: number
  ): Partial<T> {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key,
        typeof value === 'string' ? value.substring(0, maxLength) : value,
      ])
    ) as Partial<T>
  },
}

/**
 * Next.js automatically compresses responses when:
 * 1. Content-Type is in the compressible list
 * 2. Response size is >= 1KB (default)
 * 3. Accept-Encoding header includes 'gzip'
 *
 * This is handled by Next.js middleware, but we provide
 * utilities to monitor and optimize compression.
 */

export const compressionInfo = {
  /**
   * Next.js configures gzip compression automatically through:
   * - next.config.js compress option (default: true)
   * - Vercel/Netlify/other platforms handle it at edge
   *
   * To verify compression is working:
   * 1. Check 'Content-Encoding: gzip' header in response
   * 2. Compare Content-Length with uncompressed size
   * 3. Use DevTools Network tab to see sizes
   */

  howToCheckCompression: `
    1. Open DevTools Network tab
    2. Find your API response
    3. Check Response Headers for 'Content-Encoding: gzip'
    4. Size column shows compressed size
    5. Hover for original size
  `,

  recommendedNextConfig: `
    // next.config.mjs
    const nextConfig = {
      compress: true, // Enable gzip compression (default)
      headers: async () => [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Vary',
              value: 'Accept-Encoding',
            },
          ],
        },
      ],
    }
  `,
}
