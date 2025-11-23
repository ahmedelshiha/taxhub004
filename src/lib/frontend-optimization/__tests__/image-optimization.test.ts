import { describe, it, expect } from 'vitest'
import {
  optimizeImage,
  IMAGE_OPTIMIZATION_CONFIG,
} from '../image-optimization'

describe('Image Optimization', () => {
  describe('optimizeImage', () => {
    it('should return config for hero type', () => {
      const config = optimizeImage('hero')

      expect(config).toEqual(IMAGE_OPTIMIZATION_CONFIG.hero)
      expect(config.quality).toBe(75)
      expect(config.priority).toBe(true)
      expect(config.maxWidth).toBe(1920)
    })

    it('should return config for card type', () => {
      const config = optimizeImage('card')

      expect(config).toEqual(IMAGE_OPTIMIZATION_CONFIG.card)
      expect(config.quality).toBe(75)
      expect(config.priority).toBe(false)
      expect(config.maxWidth).toBe(512)
    })

    it('should return config for thumbnail type', () => {
      const config = optimizeImage('thumbnail')

      expect(config.quality).toBe(70)
      expect(config.maxWidth).toBe(256)
    })

    it('should return config for avatar type', () => {
      const config = optimizeImage('avatar')

      expect(config.quality).toBe(80)
      expect(config.maxWidth).toBe(128)
    })

    it('should return config for icon type', () => {
      const config = optimizeImage('icon')

      expect(config.quality).toBe(85)
      expect(config.maxWidth).toBe(64)
    })

    it('should default to card type', () => {
      const config = optimizeImage()

      expect(config).toEqual(IMAGE_OPTIMIZATION_CONFIG.card)
    })

    it('should have all required properties', () => {
      const config = optimizeImage('hero')

      expect(config).toHaveProperty('quality')
      expect(config).toHaveProperty('priority')
      expect(config).toHaveProperty('maxWidth')
      expect(config).toHaveProperty('maxHeight')
      expect(config).toHaveProperty('sizes')
    })
  })

  describe('IMAGE_OPTIMIZATION_CONFIG', () => {
    it('should have all image types defined', () => {
      const types = ['hero', 'card', 'thumbnail', 'avatar', 'icon'] as const

      types.forEach((type) => {
        expect(IMAGE_OPTIMIZATION_CONFIG[type]).toBeDefined()
      })
    })

    it('should have valid quality values', () => {
      Object.values(IMAGE_OPTIMIZATION_CONFIG).forEach((config) => {
        expect(config.quality).toBeGreaterThanOrEqual(60)
        expect(config.quality).toBeLessThanOrEqual(100)
      })
    })

    it('should have valid sizes property', () => {
      Object.values(IMAGE_OPTIMIZATION_CONFIG).forEach((config) => {
        expect(typeof config.sizes).toBe('string')
        expect(config.sizes.length).toBeGreaterThan(0)
      })
    })

    it('should have valid dimensions', () => {
      Object.values(IMAGE_OPTIMIZATION_CONFIG).forEach((config) => {
        expect(config.maxWidth).toBeGreaterThan(0)
        expect(config.maxHeight).toBeGreaterThan(0)
        expect(config.maxWidth).toBeGreaterThanOrEqual(config.maxHeight / 3)
      })
    })
  })
})
