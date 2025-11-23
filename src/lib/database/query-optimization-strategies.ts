/**
 * Database Query Optimization Strategies
 *
 * Provides patterns and best practices for optimizing Prisma queries
 * Prevents N+1 problems, excessive data loading, and slow queries
 */

import prisma from '../prisma'

/**
 * STRATEGY 1: Select Optimization
 * Only fetch fields you need, not entire records
 */
export const selectOptimization = {
  /**
   * Common user fields (minimal)
   * Use for list endpoints
   */
  userMinimal: {
    id: true,
    name: true,
    email: true,
    image: true,
  },

  /**
   * User fields with details
   * Use for detail/profile pages
   */
  userDetail: {
    id: true,
    name: true,
    email: true,
    image: true,
    role: true,
    status: true,
    createdAt: true,
    updatedAt: true,
  },

  /**
   * Admin user with extended fields
   * Use for admin user management
   */
  userAdmin: {
    id: true,
    name: true,
    email: true,
    image: true,
    role: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    tenantId: true,
    lastLogin: true,
  },

  /**
   * Service fields (minimal)
   */
  serviceMinimal: {
    id: true,
    name: true,
    slug: true,
    price: true,
    image: true,
    active: true,
  },

  /**
   * Booking fields (list view)
   */
  bookingList: {
    id: true,
    serviceId: true,
    clientId: true,
    status: true,
    scheduledAt: true,
    duration: true,
    amount: true,
    createdAt: true,
  },

  /**
   * Booking fields (detail view)
   */
  bookingDetail: {
    id: true,
    serviceId: true,
    clientId: true,
    status: true,
    scheduledAt: true,
    duration: true,
    amount: true,
    notes: true,
    createdAt: true,
    updatedAt: true,
    completedAt: true,
  },

  /**
   * Document fields (list)
   */
  documentList: {
    id: true,
    name: true,
    contentType: true,
    size: true,
    uploadedAt: true,
    uploaderId: true,
  },

  /**
   * Task fields (list)
   */
  taskList: {
    id: true,
    title: true,
    status: true,
    priority: true,
    assigneeId: true,
    dueAt: true,
    createdAt: true,
  },
}

/**
 * STRATEGY 2: Pagination Best Practices
 * Always paginate large result sets
 */
export const paginationStrategies = {
  /**
   * Standard pagination (offset/limit)
   * Good for admin dashboards
   */
  offsetLimit: (limit: number = 20, offset: number = 0) => ({
    take: limit,
    skip: offset,
  }),

  /**
   * Cursor-based pagination
   * Better for API clients (more stable)
   */
  cursorBased: (limit: number = 20, cursor?: string) => ({
    take: limit,
    ...(cursor && { skip: 1, cursor: { id: cursor } }),
  }),

  /**
   * Default limits to prevent runaway queries
   */
  DEFAULTS: {
    MIN_LIMIT: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },

  /**
   * Validate pagination params
   */
  validate: (limit?: number, offset?: number) => {
    const { MIN_LIMIT, DEFAULT_LIMIT, MAX_LIMIT } = paginationStrategies.DEFAULTS

    const validLimit = limit
      ? Math.max(MIN_LIMIT, Math.min(limit, MAX_LIMIT))
      : DEFAULT_LIMIT

    const validOffset = offset && offset >= 0 ? offset : 0

    return { limit: validLimit, offset: validOffset }
  },
}

/**
 * STRATEGY 3: Relationship Loading
 * Load related data efficiently
 */
export const relationshipStrategies = {
  /**
   * Include single related record
   * Use sparingly - only when needed
   */
  withOneRelation: (relationName: string) => ({
    include: {
      [relationName]: {
        select: selectOptimization.userMinimal,
      },
    },
  }),

  /**
   * Include multiple related records (with pagination)
   * Load related data in separate query
   */
  withManyRelations: (relationName: string, limit: number = 10) => ({
    include: {
      [relationName]: {
        select: selectOptimization.userMinimal,
        take: limit,
        orderBy: { createdAt: 'desc' },
      },
    },
  }),

  /**
   * Count related records
   * Use for summary/stat display
   */
  withCount: (relationNames: string[]) => ({
    include: {
      _count: {
        select: relationNames.reduce(
          (acc, name) => {
            acc[name] = true
            return acc
          },
          {} as Record<string, boolean>
        ),
      },
    },
  }),

  /**
   * Avoid eager loading - fetch separately
   * More efficient for large related sets
   */
  separateQueries: true,
}

/**
 * STRATEGY 4: Filtering & Where Clauses
 * Efficient filtering patterns
 */
export const filteringStrategies = {
  /**
   * Build where clause dynamically
   */
  buildWhere: (filters: Record<string, any>) => {
    const where: any = {}

    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === null) continue

      // Handle different value types
      if (Array.isArray(value)) {
        // Array = IN clause
        where[key] = { in: value }
      } else if (typeof value === 'string' && value.includes('%')) {
        // String with % = LIKE query
        where[key] = { contains: value.replace(/%/g, ''), mode: 'insensitive' }
      } else if (typeof value === 'object' && value.gte) {
        // Object with gte = range query
        where[key] = value
      } else {
        // Simple equality
        where[key] = value
      }
    }

    return where
  },

  /**
   * Date range queries
   */
  dateRange: (field: string, startDate?: Date, endDate?: Date) => {
    const where: any = {}

    if (startDate || endDate) {
      where[field] = {}
      if (startDate) where[field].gte = startDate
      if (endDate) where[field].lte = endDate
    }

    return where
  },

  /**
   * Text search (use full-text index)
   */
  textSearch: (fields: string[], query: string) => ({
    OR: fields.map((field) => ({
      [field]: { contains: query, mode: 'insensitive' },
    })),
  }),

  /**
   * Combine multiple filter conditions
   */
  combineFilters: (conditions: any[]) => ({
    AND: conditions.filter((c) => c),
  }),
}

/**
 * STRATEGY 5: Sorting Best Practices
 * Efficient sorting patterns
 */
export const sortingStrategies = {
  /**
   * Always sort by indexed columns
   */
  byCreatedAt: { createdAt: 'desc' },
  byUpdatedAt: { updatedAt: 'desc' },
  byName: { name: 'asc' },
  byEmail: { email: 'asc' },
  byStatus: { status: 'asc' },
  byPriority: { priority: 'desc' },

  /**
   * Multi-column sorting
   */
  multiColumn: (sorts: Record<string, 'asc' | 'desc'>) => sorts,

  /**
   * Parse sort from query string
   */
  parseFromQuery: (sortQuery?: string) => {
    if (!sortQuery) return { createdAt: 'desc' }

    const [field, direction] = sortQuery.split(':')
    return {
      [field]: (direction as 'asc' | 'desc') || 'asc',
    }
  },
}

/**
 * STRATEGY 6: Aggregation
 * Use database aggregation instead of loading all records
 */
export const aggregationStrategies = {
  /**
   * Count records (more efficient than findMany.length)
   */
  count: async (model: any, where: any) => {
    return model.count({ where })
  },

  /**
   * Get min/max/sum/avg
   */
  aggregate: async (
    model: any,
    where: any,
    aggregations: Record<string, boolean>
  ) => {
    return model.aggregate({
      where,
      _sum: aggregations._sum ? {} : undefined,
      _avg: aggregations._avg ? {} : undefined,
      _min: aggregations._min ? {} : undefined,
      _max: aggregations._max ? {} : undefined,
      _count: aggregations._count ? true : undefined,
    })
  },

  /**
   * Group by with aggregation
   */
  groupBy: async (model: any, groupBy: string[], select: any) => {
    return model.groupBy({
      by: groupBy,
      _count: { _all: true },
      _sum: select._sum || undefined,
      _avg: select._avg || undefined,
    })
  },

  /**
   * Statistics calculation (all-in-one query)
   */
  getStats: async (model: any, where: any) => {
    const result = await model.aggregate({
      where,
      _count: true,
      _sum: { amount: true },
      _avg: { rating: true },
      _min: { createdAt: true },
      _max: { createdAt: true },
    })

    return {
      total: result._count,
      sumAmount: result._sum.amount || 0,
      avgRating: result._avg.rating || 0,
      oldestDate: result._min.createdAt,
      newestDate: result._max.createdAt,
    }
  },
}

/**
 * STRATEGY 7: Parallel Queries
 * Execute multiple queries in parallel
 */
export const parallelQueryStrategies = {
  /**
   * Fetch related data in parallel
   */
  fetchParallel: async (queries: Array<() => Promise<any>>) => {
    return Promise.all(queries.map((q) => q()))
  },

  /**
   * Common parallel pattern: list + count
   */
  listWithCount: async (
    model: any,
    where: any,
    pagination: { limit: number; offset: number }
  ) => {
    const [items, total] = await Promise.all([
      model.findMany({
        where,
        take: pagination.limit,
        skip: pagination.offset,
        orderBy: { createdAt: 'desc' },
      }),
      model.count({ where }),
    ])

    return { items, total }
  },

  /**
   * Dashboard pattern: stats + recent items
   */
  dashboardData: async (
    model: any,
    where: any
  ) => {
    const [stats, recentItems] = await Promise.all([
      aggregationStrategies.getStats(model, where),
      model.findMany({
        where,
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
    ])

    return { stats, recentItems }
  },
}

/**
 * STRATEGY 8: Caching Patterns
 * Cache frequently accessed data
 */
export const cachingStrategies = {
  /**
   * In-memory cache
   */
  memoryCache: (() => {
    const cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

    return {
      get: (key: string) => {
        const entry = cache.get(key)
        if (!entry) return null

        const isExpired = Date.now() - entry.timestamp > entry.ttl * 1000
        if (isExpired) {
          cache.delete(key)
          return null
        }

        return entry.data
      },

      set: (key: string, data: any, ttlSeconds: number = 300) => {
        cache.set(key, {
          data,
          timestamp: Date.now(),
          ttl: ttlSeconds,
        })
      },

      has: (key: string) => cache.has(key),
      delete: (key: string) => cache.delete(key),
      clear: () => cache.clear(),
    }
  })(),

  /**
   * Cache key builder
   */
  cacheKey: {
    user: (id: string) => `user:${id}`,
    users: (tenantId: string, filters: any) =>
      `users:${tenantId}:${JSON.stringify(filters)}`,
    service: (id: string) => `service:${id}`,
    booking: (id: string) => `booking:${id}`,
  },

  /**
   * TTL recommendations
   */
  TTL: {
    SHORT: 60, // 1 minute
    MEDIUM: 300, // 5 minutes
    LONG: 900, // 15 minutes
    DAY: 86400, // 1 day
  },
}

/**
 * STRATEGY 9: Query Patterns by Use Case
 * Common query patterns
 */
export const queryPatternsByUseCase = {
  /**
   * Dashboard: Get summary stats and recent items
   */
  dashboard: async (model: any, tenantId: string) => {
    return Promise.all([
      model.count({ where: { tenantId } }),
      model.aggregate({
        where: { tenantId },
        _sum: { amount: true },
        _avg: { rating: true },
      }),
      model.findMany({
        where: { tenantId },
        select: selectOptimization.userMinimal,
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ])
  },

  /**
   * List: Get paginated, filtered, sorted list
   */
  list: async (
    model: any,
    tenantId: string,
    options: {
      filters?: any
      limit?: number
      offset?: number
      sortBy?: string
    }
  ) => {
    const { filters = {}, limit = 20, offset = 0, sortBy = 'createdAt' } = options

    const where = { tenantId, ...filters }
    const orderBy = { [sortBy]: 'desc' }

    return parallelQueryStrategies.listWithCount(model, where, {
      limit,
      offset,
    })
  },

  /**
   * Detail: Get complete item with relations
   */
  detail: async (model: any, id: string) => {
    return model.findUnique({
      where: { id },
      include: {
        _count: true,
      },
    })
  },

  /**
   * Search: Full-text search across fields
   */
  search: async (
    model: any,
    tenantId: string,
    query: string,
    fields: string[]
  ) => {
    const where = {
      tenantId,
      OR: fields.map((field) => ({
        [field]: { contains: query, mode: 'insensitive' },
      })),
    }

    return model.findMany({
      where,
      take: 20,
    })
  },

  /**
   * Create: Insert new record
   */
  create: async (model: any, data: any) => {
    return model.create({ data })
  },

  /**
   * Update: Update record
   */
  update: async (model: any, id: string, data: any) => {
    return model.update({
      where: { id },
      data,
    })
  },

  /**
   * Delete: Delete record (soft delete recommended)
   */
  delete: async (model: any, id: string, softDelete: boolean = true) => {
    if (softDelete) {
      return model.update({
        where: { id },
        data: { deletedAt: new Date() },
      })
    }
    return model.delete({ where: { id } })
  },
}

/**
 * STRATEGY 10: Performance Anti-Patterns to Avoid
 */
export const antiPatterns = [
  {
    name: 'N+1 Query Problem',
    bad: `
      const users = await prisma.user.findMany()
      for (const user of users) {
        user.bookings = await prisma.booking.findMany({ where: { clientId: user.id } })
      }
    `,
    good: `
      const users = await prisma.user.findMany({
        include: { bookings: true }  // OR fetch separately in parallel
      })
    `,
  },
  {
    name: 'Fetching All Fields',
    bad: 'await prisma.user.findMany() // All fields!',
    good: 'await prisma.user.findMany({ select: { id, name, email } })',
  },
  {
    name: 'Calculating in Application',
    bad: `
      const users = await prisma.user.findMany()
      const count = users.length
      const total = users.reduce((sum, u) => sum + u.amount, 0)
    `,
    good: `
      const stats = await prisma.user.aggregate({
        _count: true,
        _sum: { amount: true }
      })
    `,
  },
  {
    name: 'Missing Pagination',
    bad: 'await prisma.user.findMany() // Could return millions!',
    good: 'await prisma.user.findMany({ take: 20, skip: 0 })',
  },
  {
    name: 'Sorting on Unindexed Columns',
    bad: 'orderBy: { customField: "asc" } // No index = slow',
    good: 'orderBy: { createdAt: "desc" } // Indexed column',
  },
]
