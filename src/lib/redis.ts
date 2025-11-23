import { Redis } from '@upstash/redis'

// Stub for Redis client
// In a real app, this would connect to Redis
// For build passing, we provide a mock interface compatible with @upstash/redis or similar

class MockRedis {
  private store = new Map<string, any>()

  async get(key: string) {
    return this.store.get(key)
  }

  async set(key: string, value: any, opts?: any) {
    this.store.set(key, value)
    return 'OK'
  }

  async del(key: string) {
    return this.store.delete(key)
  }

  async incr(key: string) {
    const val = (this.store.get(key) || 0) + 1
    this.store.set(key, val)
    return val
  }

  async expire(key: string, seconds: number) {
    return 1
  }
}

export const redis = new MockRedis() as unknown as Redis
