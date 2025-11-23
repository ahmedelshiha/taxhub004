import { describe, it, expect } from 'vitest'
import {
  shouldCompress,
  calculateCompressionRatio,
  COMPRESSION_CONFIG,
} from '../compression'

describe('Compression Utilities', () => {
  describe('shouldCompress', () => {
    it('should compress JSON content type', () => {
      const result = shouldCompress('application/json', 2048)

      expect(result).toBe(true)
    })

    it('should compress HTML content type', () => {
      const result = shouldCompress('text/html', 2048)

      expect(result).toBe(true)
    })

    it('should compress CSS content type', () => {
      const result = shouldCompress('text/css', 2048)

      expect(result).toBe(true)
    })

    it('should compress JavaScript content type', () => {
      const result = shouldCompress('application/javascript', 2048)

      expect(result).toBe(true)
    })

    it('should not compress image types', () => {
      const result = shouldCompress('image/png', 2048)

      expect(result).toBe(false)
    })

    it('should not compress video types', () => {
      const result = shouldCompress('video/mp4', 2048)

      expect(result).toBe(false)
    })

    it('should not compress below minimum size', () => {
      const result = shouldCompress('application/json', 512)

      expect(result).toBe(false)
    })

    it('should not compress without content type', () => {
      const result = shouldCompress(undefined, 2048)

      expect(result).toBe(false)
    })

    it('should not compress without content length', () => {
      const result = shouldCompress('application/json', undefined)

      expect(result).toBe(false)
    })
  })

  describe('calculateCompressionRatio', () => {
    it('should calculate correct ratio for typical JSON', () => {
      const original = 10000
      const compressed = 3000

      const ratio = calculateCompressionRatio(original, compressed)

      expect(ratio).toBe(70) // 70% reduction
    })

    it('should calculate correct ratio for CSS', () => {
      const original = 50000
      const compressed = 10000

      const ratio = calculateCompressionRatio(original, compressed)

      expect(ratio).toBe(80) // 80% reduction
    })

    it('should handle zero original size', () => {
      const ratio = calculateCompressionRatio(0, 0)

      expect(ratio).toBe(0)
    })

    it('should handle no compression', () => {
      const original = 10000
      const compressed = 10000

      const ratio = calculateCompressionRatio(original, compressed)

      expect(ratio).toBe(0)
    })

    it('should handle typical gzip compression', () => {
      // Average gzip reduces to 30-40% of original
      const original = 100000
      const compressed = 35000

      const ratio = calculateCompressionRatio(original, compressed)

      expect(ratio).toBeGreaterThan(60)
      expect(ratio).toBeLessThan(70)
    })
  })

  describe('COMPRESSION_CONFIG', () => {
    it('should have minSize set', () => {
      expect(COMPRESSION_CONFIG.minSize).toBeGreaterThan(0)
    })

    it('should have valid compression level', () => {
      expect(COMPRESSION_CONFIG.level).toBeGreaterThanOrEqual(1)
      expect(COMPRESSION_CONFIG.level).toBeLessThanOrEqual(9)
    })

    it('should have threshold value', () => {
      expect(COMPRESSION_CONFIG.threshold).toBeGreaterThan(0)
    })

    it('should have compressible types array', () => {
      expect(Array.isArray(COMPRESSION_CONFIG.types)).toBe(true)
      expect(COMPRESSION_CONFIG.types.length).toBeGreaterThan(0)
    })

    it('should include JSON in compressible types', () => {
      expect(
        COMPRESSION_CONFIG.types.some((type) => type.includes('json'))
      ).toBe(true)
    })
  })
})
