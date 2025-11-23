import { describe, it, expect } from 'vitest'
import { CACHE_TTL, cacheKey } from '../strategy'

describe('Cache Strategy', () => {
  describe('CACHE_TTL', () => {
    it('should define TTL for services', () => {
      expect(CACHE_TTL.SERVICES_LIST).toBe(5 * 60) // 5 minutes
    })

    it('should define TTL for availability', () => {
      expect(CACHE_TTL.AVAILABILITY_SLOTS).toBe(1 * 60) // 1 minute
    })

    it('should have shorter TTL for volatile data', () => {
      expect(CACHE_TTL.AVAILABILITY_SLOTS).toBeLessThan(
        CACHE_TTL.SERVICES_LIST
      )
    })

    it('should have longer TTL for stable data', () => {
      expect(CACHE_TTL.PERMISSIONS).toBeGreaterThan(CACHE_TTL.SERVICES_LIST)
    })

    it('should all be positive numbers', () => {
      Object.values(CACHE_TTL).forEach((ttl) => {
        expect(ttl).toBeGreaterThan(0)
      })
    })
  })

  describe('cacheKey builders', () => {
    describe('services', () => {
      it('should build correct key', () => {
        const key = cacheKey.services('tenant123')

        expect(key).toBe('cache:services:tenant123')
      })
    })

    describe('service', () => {
      it('should build correct key with tenant and service id', () => {
        const key = cacheKey.service('tenant123', 'service456')

        expect(key).toBe('cache:service:tenant123:service456')
      })
    })

    describe('availability', () => {
      it('should build correct key with service and date', () => {
        const key = cacheKey.availability('service123', '2024-01-15')

        expect(key).toBe('cache:availability:service123:2024-01-15')
      })
    })

    describe('userProfile', () => {
      it('should build correct key', () => {
        const key = cacheKey.userProfile('user123')

        expect(key).toBe('cache:user:user123')
      })
    })

    describe('userPermissions', () => {
      it('should build correct key', () => {
        const key = cacheKey.userPermissions('user123')

        expect(key).toBe('cache:permissions:user123')
      })
    })

    describe('bookings', () => {
      it('should build key for all tenant bookings', () => {
        const key = cacheKey.bookings('tenant123')

        expect(key).toBe('cache:bookings:tenant123')
      })

      it('should build key for client bookings', () => {
        const key = cacheKey.bookings('tenant123', 'client456')

        expect(key).toBe('cache:bookings:tenant123:client456')
      })
    })

    describe('search', () => {
      it('should build correct search cache key', () => {
        const key = cacheKey.search('tenant123', 'user', 'search')

        expect(key).toBe('cache:search:tenant123:search:user')
      })
    })

    it('should all have cache: prefix', () => {
      const keys = [
        cacheKey.services('t1'),
        cacheKey.userProfile('u1'),
        cacheKey.bookings('t1'),
        cacheKey.tasks('t1'),
        cacheKey.documents('t1'),
      ]

      keys.forEach((key) => {
        expect(key).toMatch(/^cache:/)
      })
    })

    it('should create unique keys for different entities', () => {
      const keys = new Set([
        cacheKey.services('tenant1'),
        cacheKey.userProfile('user1'),
        cacheKey.bookings('tenant1'),
      ])

      expect(keys.size).toBe(3) // All unique
    })

    it('should create different keys for different tenants', () => {
      const key1 = cacheKey.services('tenant1')
      const key2 = cacheKey.services('tenant2')

      expect(key1).not.toBe(key2)
    })

    it('should handle special characters', () => {
      const key = cacheKey.userProfile('user-123_456')

      expect(key).toContain('user-123_456')
    })
  })

  describe('Cache TTL consistency', () => {
    it('should have reasonable TTL values', () => {
      const oneMinute = 60
      const oneHour = 60 * 60

      Object.entries(CACHE_TTL).forEach(([key, ttl]) => {
        expect(ttl).toBeGreaterThanOrEqual(oneMinute)
        expect(ttl).toBeLessThanOrEqual(oneHour * 24) // Max 24 hours
      })
    })

    it('should have consistent naming', () => {
      Object.keys(CACHE_TTL).forEach((key) => {
        expect(key).toMatch(/^[A-Z_]+$/)
      })
    })
  })
})
