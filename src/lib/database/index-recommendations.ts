/**
 * Database Index Recommendations
 *
 * Recommended database indexes to optimize query performance
 * These indexes improve performance on frequently filtered and sorted columns
 *
 * Implementation:
 * 1. Review the SQL statements below
 * 2. Run on production database after backup
 * 3. Monitor index usage with monitoring dashboard
 * 4. Remove unused indexes after 30 days
 */

export interface IndexRecommendation {
  table: string
  columns: string[]
  type: 'simple' | 'composite' | 'fulltext'
  priority: 'critical' | 'high' | 'medium' | 'low'
  estimatedImpact: string
  estimatedSize: string
  rationale: string
}

/**
 * CRITICAL Priority Indexes
 * Implement these first - highest performance impact
 */
export const CRITICAL_INDEXES: IndexRecommendation[] = [
  {
    table: 'users',
    columns: ['tenantId', 'role'],
    type: 'composite',
    priority: 'critical',
    estimatedImpact: '85% improvement',
    estimatedSize: '2-5 MB',
    rationale: 'Most common admin query: list users by tenant and role',
  },
  {
    table: 'bookings',
    columns: ['tenantId', 'status'],
    type: 'composite',
    priority: 'critical',
    estimatedImpact: '80% improvement',
    estimatedSize: '3-7 MB',
    rationale: 'Frequent filtering: bookings by status per tenant',
  },
  {
    table: 'tasks',
    columns: ['tenantId', 'status'],
    type: 'composite',
    priority: 'critical',
    estimatedImpact: '75% improvement',
    estimatedSize: '2-5 MB',
    rationale: 'Common task filtering by status and tenant',
  },
  {
    table: 'documents',
    columns: ['tenantId', 'status'],
    type: 'composite',
    priority: 'critical',
    estimatedImpact: '70% improvement',
    estimatedSize: '2-5 MB',
    rationale: 'Document listing and filtering by status',
  },
  {
    table: 'services',
    columns: ['tenantId', 'active'],
    type: 'composite',
    priority: 'critical',
    estimatedImpact: '75% improvement',
    estimatedSize: '1-3 MB',
    rationale: 'Service listing with active status filtering',
  },
]

/**
 * HIGH Priority Indexes
 * Implement after critical - good performance gains
 */
export const HIGH_PRIORITY_INDEXES: IndexRecommendation[] = [
  {
    table: 'users',
    columns: ['tenantId', 'createdAt'],
    type: 'composite',
    priority: 'high',
    estimatedImpact: '90% improvement',
    estimatedSize: '3-7 MB',
    rationale: 'Date range queries and sorting by creation date',
  },
  {
    table: 'users',
    columns: ['tenantId', 'email'],
    type: 'composite',
    priority: 'high',
    estimatedImpact: '95% improvement',
    estimatedSize: '2-5 MB',
    rationale: 'Email lookups and email-based search',
  },
  {
    table: 'bookings',
    columns: ['tenantId', 'createdAt'],
    type: 'composite',
    priority: 'high',
    estimatedImpact: '85% improvement',
    estimatedSize: '3-7 MB',
    rationale: 'Booking date range queries and analytics',
  },
  {
    table: 'bookings',
    columns: ['clientId', 'createdAt'],
    type: 'composite',
    priority: 'high',
    estimatedImpact: '80% improvement',
    estimatedSize: '2-5 MB',
    rationale: 'Portal user viewing own bookings with date sorting',
  },
  {
    table: 'tasks',
    columns: ['tenantId', 'assigneeId'],
    type: 'composite',
    priority: 'high',
    estimatedImpact: '70% improvement',
    estimatedSize: '2-5 MB',
    rationale: 'Task assignment and filtering by assignee',
  },
  {
    table: 'tasks',
    columns: ['tenantId', 'createdAt'],
    type: 'composite',
    priority: 'high',
    estimatedImpact: '75% improvement',
    estimatedSize: '2-5 MB',
    rationale: 'Task timeline and date-based filtering',
  },
  {
    table: 'documents',
    columns: ['tenantId', 'uploadedAt'],
    type: 'composite',
    priority: 'high',
    estimatedImpact: '80% improvement',
    estimatedSize: '2-5 MB',
    rationale: 'Document timeline and upload date filtering',
  },
  {
    table: 'services',
    columns: ['tenantId', 'createdAt'],
    type: 'composite',
    priority: 'high',
    estimatedImpact: '70% improvement',
    estimatedSize: '2-5 MB',
    rationale: 'Service listing with date sorting',
  },
]

/**
 * MEDIUM Priority Indexes
 * Implement for additional optimization
 */
export const MEDIUM_PRIORITY_INDEXES: IndexRecommendation[] = [
  {
    table: 'users',
    columns: ['tenantId', 'status'],
    type: 'composite',
    priority: 'medium',
    estimatedImpact: '75% improvement',
    estimatedSize: '2-5 MB',
    rationale: 'Active/inactive user filtering',
  },
  {
    table: 'invoices',
    columns: ['tenantId', 'status'],
    type: 'composite',
    priority: 'medium',
    estimatedImpact: '70% improvement',
    estimatedSize: '2-5 MB',
    rationale: 'Invoice payment status filtering',
  },
  {
    table: 'approvals',
    columns: ['tenantId', 'status'],
    type: 'composite',
    priority: 'medium',
    estimatedImpact: '65% improvement',
    estimatedSize: '1-3 MB',
    rationale: 'Approval workflow status filtering',
  },
  {
    table: 'messages',
    columns: ['tenantId', 'threadId'],
    type: 'composite',
    priority: 'medium',
    estimatedImpact: '75% improvement',
    estimatedSize: '2-5 MB',
    rationale: 'Message thread loading and sorting',
  },
]

/**
 * FULLTEXT Search Indexes
 * For enhanced search capabilities
 */
export const FULLTEXT_INDEXES: IndexRecommendation[] = [
  {
    table: 'users',
    columns: ['name', 'email', 'company'],
    type: 'fulltext',
    priority: 'high',
    estimatedImpact: '80% improvement',
    estimatedSize: '10-20 MB',
    rationale: 'Full-text search across user fields',
  },
  {
    table: 'services',
    columns: ['name', 'description'],
    type: 'fulltext',
    priority: 'medium',
    estimatedImpact: '70% improvement',
    estimatedSize: '5-10 MB',
    rationale: 'Full-text search for service discovery',
  },
  {
    table: 'documents',
    columns: ['name', 'description'],
    type: 'fulltext',
    priority: 'medium',
    estimatedImpact: '65% improvement',
    estimatedSize: '5-10 MB',
    rationale: 'Full-text search for document discovery',
  },
]

/**
 * SQL to create CRITICAL priority indexes
 * Run these first on production
 */
export const CREATE_CRITICAL_INDEXES = `
-- CRITICAL: User management indexes
CREATE INDEX IF NOT EXISTS "idx_users_tenantId_role" ON "users" ("tenantId", "role");
CREATE INDEX IF NOT EXISTS "idx_users_tenantId_status" ON "users" ("tenantId", "status");

-- CRITICAL: Booking management indexes
CREATE INDEX IF NOT EXISTS "idx_bookings_tenantId_status" ON "bookings" ("tenantId", "status");
CREATE INDEX IF NOT EXISTS "idx_bookings_clientId" ON "bookings" ("clientId");

-- CRITICAL: Task management indexes
CREATE INDEX IF NOT EXISTS "idx_tasks_tenantId_status" ON "tasks" ("tenantId", "status");

-- CRITICAL: Document management indexes
CREATE INDEX IF NOT EXISTS "idx_documents_tenantId_status" ON "documents" ("tenantId", "status");

-- CRITICAL: Service management indexes
CREATE INDEX IF NOT EXISTS "idx_services_tenantId_active" ON "services" ("tenantId", "active");
`

/**
 * SQL to create HIGH priority indexes
 * Run after critical indexes are in place
 */
export const CREATE_HIGH_PRIORITY_INDEXES = `
-- HIGH: User date and email indexes
CREATE INDEX IF NOT EXISTS "idx_users_tenantId_createdAt" ON "users" ("tenantId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_users_tenantId_email" ON "users" ("tenantId", "email");

-- HIGH: Booking date and client indexes
CREATE INDEX IF NOT EXISTS "idx_bookings_tenantId_createdAt" ON "bookings" ("tenantId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_bookings_clientId_createdAt" ON "bookings" ("clientId", "createdAt" DESC);

-- HIGH: Task assignment indexes
CREATE INDEX IF NOT EXISTS "idx_tasks_tenantId_assigneeId" ON "tasks" ("tenantId", "assigneeId");
CREATE INDEX IF NOT EXISTS "idx_tasks_tenantId_createdAt" ON "tasks" ("tenantId", "createdAt" DESC);

-- HIGH: Document date indexes
CREATE INDEX IF NOT EXISTS "idx_documents_tenantId_uploadedAt" ON "documents" ("tenantId", "uploadedAt" DESC);

-- HIGH: Service date indexes
CREATE INDEX IF NOT EXISTS "idx_services_tenantId_createdAt" ON "services" ("tenantId", "createdAt" DESC);
`

/**
 * SQL to create MEDIUM priority indexes
 * Run for additional optimization
 */
export const CREATE_MEDIUM_PRIORITY_INDEXES = `
-- MEDIUM: User status index
CREATE INDEX IF NOT EXISTS "idx_users_tenantId_status" ON "users" ("tenantId", "status");

-- MEDIUM: Invoice status index
CREATE INDEX IF NOT EXISTS "idx_invoices_tenantId_status" ON "invoices" ("tenantId", "status");

-- MEDIUM: Approval status index
CREATE INDEX IF NOT EXISTS "idx_approvals_tenantId_status" ON "approvals" ("tenantId", "status");

-- MEDIUM: Message thread index
CREATE INDEX IF NOT EXISTS "idx_messages_tenantId_threadId" ON "messages" ("tenantId", "threadId");
`

/**
 * SQL to create FULLTEXT search indexes
 * PostgreSQL specific - uses GIN indexes
 */
export const CREATE_FULLTEXT_INDEXES = `
-- FULLTEXT: User search index
CREATE INDEX IF NOT EXISTS "idx_users_search" ON "users" USING GIN (
  to_tsvector('english', COALESCE("name", '') || ' ' || COALESCE("email", '') || ' ' || COALESCE("company", ''))
);

-- FULLTEXT: Service search index
CREATE INDEX IF NOT EXISTS "idx_services_search" ON "services" USING GIN (
  to_tsvector('english', COALESCE("name", '') || ' ' || COALESCE("description", ''))
);

-- FULLTEXT: Document search index
CREATE INDEX IF NOT EXISTS "idx_documents_search" ON "documents" USING GIN (
  to_tsvector('english', COALESCE("name", '') || ' ' || COALESCE("description", ''))
);
`

/**
 * SQL to monitor index usage
 * Run periodically to identify unused indexes
 */
export const MONITOR_INDEX_USAGE = `
-- Check index usage statistics
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as "Scan Count",
  idx_tup_read as "Tuples Read",
  idx_tup_fetch as "Tuples Fetched",
  CASE 
    WHEN idx_scan = 0 THEN 'UNUSED'
    WHEN idx_scan < 100 THEN 'RARELY USED'
    ELSE 'ACTIVE'
  END as "Status"
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

-- Check for missing indexes on frequently queried columns
SELECT
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND correlation < -0.1  -- columns with good selectivity
ORDER BY n_distinct DESC;

-- Identify slow queries (requires pg_stat_statements extension)
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE mean_time > 100  -- queries taking >100ms
ORDER BY mean_time DESC
LIMIT 20;
`

/**
 * SQL to drop unused indexes (after 30-day monitoring period)
 * Only drop if idx_scan = 0 and not a unique constraint
 */
export const DROP_UNUSED_INDEXES = `
-- Review before dropping - only drop explicitly verified unused indexes
-- Example: DROP INDEX IF EXISTS "idx_example_unused";
`

/**
 * Implementation checklist
 */
export const IMPLEMENTATION_CHECKLIST = [
  {
    step: 1,
    task: 'Backup database',
    details: 'Create full backup before running DDL',
    critical: true,
  },
  {
    step: 2,
    task: 'Create critical indexes',
    details: 'Run CREATE_CRITICAL_INDEXES SQL',
    critical: true,
  },
  {
    step: 3,
    task: 'Verify index creation',
    details: 'Check pg_indexes catalog table',
    critical: true,
  },
  {
    step: 4,
    task: 'Create high-priority indexes',
    details: 'Run CREATE_HIGH_PRIORITY_INDEXES SQL',
    critical: false,
  },
  {
    step: 5,
    task: 'Monitor index performance',
    details: 'Run MONITOR_INDEX_USAGE query',
    critical: false,
  },
  {
    step: 6,
    task: 'Create medium-priority indexes',
    details: 'Run CREATE_MEDIUM_PRIORITY_INDEXES SQL',
    critical: false,
  },
  {
    step: 7,
    task: 'Create fulltext indexes',
    details: 'Run CREATE_FULLTEXT_INDEXES SQL',
    critical: false,
  },
  {
    step: 8,
    task: 'Update query planner',
    details: 'Run ANALYZE; to update table statistics',
    critical: true,
  },
  {
    step: 9,
    task: 'Monitor for 30 days',
    details: 'Identify and drop unused indexes',
    critical: false,
  },
  {
    step: 10,
    task: 'Document final index set',
    details: 'Update database documentation',
    critical: false,
  },
]

/**
 * Get all recommendations
 */
export function getAllRecommendations(): IndexRecommendation[] {
  return [
    ...CRITICAL_INDEXES,
    ...HIGH_PRIORITY_INDEXES,
    ...MEDIUM_PRIORITY_INDEXES,
    ...FULLTEXT_INDEXES,
  ]
}

/**
 * Get recommendations by priority
 */
export function getRecommendationsByPriority(
  priority: 'critical' | 'high' | 'medium' | 'low'
): IndexRecommendation[] {
  return getAllRecommendations().filter((rec) => rec.priority === priority)
}

/**
 * Get recommendations for a specific table
 */
export function getRecommendationsForTable(
  table: string
): IndexRecommendation[] {
  return getAllRecommendations().filter((rec) => rec.table === table)
}

/**
 * Generate SQL for all indexes
 */
export function generateAllIndexSQL(): string {
  return [
    '-- Database Index Creation Script',
    '-- Generated: ' + new Date().toISOString(),
    '-- Total indexes: ' + getAllRecommendations().length,
    '',
    '-- Step 1: CRITICAL Priority Indexes (highest impact)',
    CREATE_CRITICAL_INDEXES,
    '',
    '-- Step 2: HIGH Priority Indexes (strong impact)',
    CREATE_HIGH_PRIORITY_INDEXES,
    '',
    '-- Step 3: MEDIUM Priority Indexes (moderate impact)',
    CREATE_MEDIUM_PRIORITY_INDEXES,
    '',
    '-- Step 4: FULLTEXT Search Indexes',
    CREATE_FULLTEXT_INDEXES,
    '',
    '-- Step 5: Update statistics',
    'ANALYZE;',
    '',
    '-- Step 6: Verify indexes created',
    "SELECT schemaname, tablename, indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname;",
  ].join('\n')
}
