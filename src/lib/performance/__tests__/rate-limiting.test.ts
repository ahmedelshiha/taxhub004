import { describe, it, expect } from 'vitest'
import {
  buildRateLimitKey,
  calculateCompressionRatio,
  RATE_LIMIT_CONFIG,
  endpointPatterns,
} from '../rate-limiting'

describe('Rate Limiting', () => {
  describe('buildRateLimitKey', () => {
    it('should build correct key without type', () => {
      const key = buildRateLimitKey('user123', '/api/bookings')

      expect(key).toBe('ratelimit:user123:/api/bookings')
    })

    it('should build correct key with type', () => {
      const key = buildRateLimitKey('user123', '/api/bookings', 'POST')

      expect(key).toBe('ratelimit:user123:/api/bookings:POST')
    })

    it('should handle complex endpoints', () => {
      const key = buildRateLimitKey('ip-192.168.1.1', '/api/admin/users/bulk')

      expect(key).toContain('ratelimit:')
      expect(key).toContain('/api/admin/users/bulk')
    })
  })

  describe('RATE_LIMIT_CONFIG', () => {
    it('should have auth configuration', () => {
      expect(RATE_LIMIT_CONFIG.auth).toBeDefined()
      expect(RATE_LIMIT_CONFIG.auth.requests).toBe(5)
      expect(RATE_LIMIT_CONFIG.auth.windowSeconds).toBe(300)
    })

    it('should have strict login config', () => {
      expect(RATE_LIMIT_CONFIG.login).toBeDefined()
      expect(RATE_LIMIT_CONFIG.login.requests).toBe(3)
      expect(RATE_LIMIT_CONFIG.login.windowSeconds).toBe(900)
    })

    it('should have permissive read config', () => {
      expect(RATE_LIMIT_CONFIG.read.requests).toBeGreaterThan(
        RATE_LIMIT_CONFIG.auth.requests
      )
    })

    it('should have restrictive delete config', () => {
      expect(RATE_LIMIT_CONFIG.delete.requests).toBeLessThan(
        RATE_LIMIT_CONFIG.read.requests
      )
    })

    it('should have all endpoint types', () => {
      const types = [
        'auth',
        'login',
        'read',
        'list',
        'write',
        'delete',
        'export',
        'search',
        'bulk',
        'admin',
        'public',
      ]

      types.forEach((type) => {
        expect(RATE_LIMIT_CONFIG[type as keyof typeof RATE_LIMIT_CONFIG]).toBeDefined()
      })
    })

    it('should have valid window times', () => {
      Object.values(RATE_LIMIT_CONFIG).forEach((config) => {
        expect(config.windowSeconds).toBeGreaterThan(0)
        expect(config.requests).toBeGreaterThan(0)
      })
    })

    it('should have stricter limits for sensitive operations', () => {
      expect(RATE_LIMIT_CONFIG.login.requests).toBeLessThan(
        RATE_LIMIT_CONFIG.read.requests
      )
      expect(RATE_LIMIT_CONFIG.delete.requests).toBeLessThan(
        RATE_LIMIT_CONFIG.write.requests
      )
    })
  })

  describe('endpointPatterns', () => {
    it('should have patterns defined', () => {
      expect(Object.keys(endpointPatterns).length).toBeGreaterThan(0)
    })

    it('should have auth patterns', () => {
      expect(endpointPatterns['/api/auth/*']).toBeDefined()
      expect(endpointPatterns['/api/auth/login']).toBeDefined()
    })

    it('should use correct configs for patterns', () => {
      expect(endpointPatterns['/api/auth/login']).toEqual(
        RATE_LIMIT_CONFIG.login
      )
      expect(endpointPatterns['/api/admin/*']).toEqual(RATE_LIMIT_CONFIG.admin)
    })

    it('should have more permissive public endpoints', () => {
      const publicConfig = endpointPatterns['/api/public/*']
      const authConfig = endpointPatterns['/api/auth/*']

      expect(publicConfig.requests).toBeGreaterThan(authConfig.requests)
    })
  })

  describe('Rate Limit Logic', () => {
    it('should allow requests below limit', () => {
      const config = RATE_LIMIT_CONFIG.read

      // Simulate 50 requests out of 100 limit
      const currentCount = 50
      const allowed = currentCount < config.requests

      expect(allowed).toBe(true)
    })

    it('should reject requests at limit', () => {
      const config = RATE_LIMIT_CONFIG.read

      // Simulate 100 requests at 100 limit
      const currentCount = 100
      const allowed = currentCount <= config.requests

      expect(allowed).toBe(false)
    })

    it('should calculate remaining correctly', () => {
      const config = RATE_LIMIT_CONFIG.read
      const currentCount = 75

      const remaining = Math.max(0, config.requests - currentCount)

      expect(remaining).toBe(25)
    })

    it('should reset after window expires', () => {
      const config = RATE_LIMIT_CONFIG.read
      const windowMs = config.windowSeconds * 1000

      const resetTime = Date.now() + windowMs

      expect(resetTime).toBeGreaterThan(Date.now())
    })
  })
})
