# TypeScript Build Errors - Fix Checklist

**Last Updated**: Current Session  
**Total Errors to Fix**: 150+  
**Estimated Time**: 4-6 hours (depending on schema changes)

---

## ✅ Quick Progress Tracker

| Phase | Component | Status | Notes |
|-------|-----------|--------|-------|
| Fixed | Calendar drag payload | ✅ DONE | Changed `evt._raw.id` → `evt.id` |
| Phase 1 | Prisma schema updates | ⏳ PENDING | Need to add missing fields |
| Phase 2 | API handler signatures | ⏳ PENDING | ~25 files need updating |
| Phase 3 | Type fixes (enums, etc) | ⏳ PENDING | Multiple enum casing issues |
| Phase 4 | Components & hooks | ⏳ PENDING | Response type handling |
| Phase 5 | Missing modules | ⏳ PENDING | web-vitals, performance-analytics |

---

## Phase 1: Prisma Schema & Database (HIGH PRIORITY)

### Add Missing Fields to Models

#### Document Model
- [ ] Add `url?: String` field
- [ ] Create migration
- [ ] Update Prisma client

#### Task Model
- [ ] Add `tags?: String[]` field
- [ ] Add `estimatedHours?: Int` field  
- [ ] Add `clientId?: String` field
- [ ] Add `bookingId?: String` field
- [ ] Add relations: `client`, `booking`
- [ ] Create migration

#### Booking Model
- [ ] Add `assignedToId?: String` field (if needed for assignments)
- [ ] Add `completedAt?: DateTime` field (if tracking completion)
- [ ] Add `amount?: Decimal` field (if tracking revenue)
- [ ] Add `rating?: Int` field (if tracking satisfaction)
- [ ] Create migration

#### User Model
- [ ] Verify `isAdmin` field exists (check existing schema)
- [ ] Verify `bio` field exists or add it
- [ ] Verify `lastLogin` field exists or add it

#### TeamMember Model
- [ ] Verify `image` field exists or add it

#### AuditLog Model
- [ ] **RENAME**: `resourceType` → `resource`
- [ ] Create migration for field rename

#### Attachment Model
- [ ] Verify `uploadedBy` is actually `uploaderId` in schema
- [ ] Update all code references if needed

#### Service Model
- [ ] Verify valid `ServiceStatus` enum values
- [ ] Check if "ARCHIVED" is valid enum value
- [ ] Update status mappings if needed

#### Reminder Model
- [ ] Verify `channel` field exists on Reminder model
- [ ] Check relationship with ServiceRequest

### Execute Schema Updates

```bash
# Step 1: Update schema.prisma with all changes above
# File: prisma/schema.prisma

# Step 2: Create migration
pnpm exec prisma migrate dev --name "fix_missing_schema_fields"

# Step 3: Generate Prisma client
pnpm exec prisma generate

# Step 4: Verify build
pnpm build
```

---

## Phase 2: API Handler Signatures (HIGH PRIORITY)

### Check Middleware Definition
```bash
grep -r "export.*withMiddleware\|MiddlewareHandler\|ApiHandler" src/lib/performance src/middleware --include="*.ts"
```

**Files to Update** (25+ handlers):

#### Admin Documents Routes
- [ ] `src/app/api/admin/documents/[id]/approve/route.ts:18` (GET handler)
- [ ] `src/app/api/admin/documents/[id]/approve/route.ts:138` (POST handler)
- [ ] `src/app/api/admin/documents/[id]/route.ts:12` (GET handler)
- [ ] `src/app/api/admin/documents/[id]/route.ts:95` (PUT handler)
- [ ] `src/app/api/admin/documents/[id]/route.ts:220` (DELETE handler)
- [ ] `src/app/api/admin/documents/[id]/scan/route.ts:12` (POST handler)
- [ ] `src/app/api/admin/documents/[id]/scan/route.ts:97` (GET status handler)
- [ ] `src/app/api/admin/documents/[id]/sign/route.ts:26` (POST handler)
- [ ] `src/app/api/admin/documents/[id]/sign/route.ts:150` (GET handler)
- [ ] `src/app/api/admin/documents/[id]/sign/route.ts:258` (DELETE handler)
- [ ] `src/app/api/admin/documents/[id]/versions/route.ts:12` (GET handler)
- [ ] `src/app/api/admin/documents/[id]/versions/route.ts:94` (POST handler)

#### Admin Tasks Routes
- [ ] `src/app/api/admin/tasks/[id]/assign/route.ts:12` (POST handler)
- [ ] `src/app/api/admin/tasks/[id]/route.ts:14` (GET handler)
- [ ] `src/app/api/admin/tasks/[id]/route.ts:87` (PUT handler)
- [ ] `src/app/api/admin/tasks/[id]/route.ts:184` (DELETE handler)

#### Admin Users Routes
- [ ] `src/app/api/admin/users/[id]/activity/route.ts:17` (GET handler)
- [ ] `src/app/api/admin/users/[id]/route.ts:21` (GET handler)
- [ ] `src/app/api/admin/users/[id]/route.ts:66` (PUT handler)
- [ ] `src/app/api/admin/users/[id]/route.ts:125` (DELETE handler)

#### Documents Routes (Portal)
- [ ] `src/app/api/documents/[id]/analyze/route.ts:17` (POST handler)
- [ ] `src/app/api/documents/[id]/analyze/route.ts:156` (GET handler)
- [ ] `src/app/api/documents/[id]/download/route.ts:12` (GET handler)
- [ ] `src/app/api/documents/[id]/route.ts:13` (GET handler)
- [ ] `src/app/api/documents/[id]/route.ts:132` (PUT handler)
- [ ] `src/app/api/documents/[id]/route.ts:220` (DELETE handler)
- [ ] `src/app/api/documents/[id]/sign/route.ts:26` (POST handler)
- [ ] `src/app/api/documents/[id]/sign/route.ts:150` (GET handler)
- [ ] `src/app/api/documents/[id]/sign/route.ts:258` (DELETE handler)
- [ ] `src/app/api/documents/[id]/versions/route.ts:12` (GET handler)
- [ ] `src/app/api/documents/[id]/versions/route.ts:94` (POST handler)

#### Tasks Routes (Portal)
- [ ] `src/app/api/tasks/[id]/comments/[commentId]/route.ts:14` (GET handler)
- [ ] `src/app/api/tasks/[id]/comments/[commentId]/route.ts:99` (PUT handler)
- [ ] `src/app/api/tasks/[id]/comments/route.ts:14` (POST handler)
- [ ] `src/app/api/tasks/[id]/comments/route.ts:106` (GET handler)
- [ ] `src/app/api/tasks/[id]/route.ts:14` (GET handler)
- [ ] `src/app/api/tasks/[id]/route.ts:87` (PUT handler)
- [ ] `src/app/api/tasks/[id]/route.ts:184` (DELETE handler)

#### Users Routes
- [ ] `src/app/api/users/[id]/route.ts:15` (GET handler)

### Update Pattern

For each file, apply this pattern:

```typescript
// Before:
export const GET = withMiddleware(
  async (request: any, { tenantId, user }, { params }) => {
    // handler code
  }
)

// After:
export const GET = withMiddleware(
  async (request: any, { tenantId, user, params }) => {
    // handler code  
  }
)
```

---

## Phase 3: Type Fixes & Enums (MEDIUM PRIORITY)

### 3.1: Enum Value Casing

#### Service Status
- [ ] File: `src/app/api/services/[slug]/route.ts:203`
  - Fix: `"ARCHIVED"` → Check valid enum value
  - Verify: `ServiceStatus` enum definition

- [ ] File: `src/app/api/services/route.ts:71`
  - Fix: `"ACTIVE"` → `"active"` (lowercase)
  - Verify: Valid enum values are lowercase

#### Approval Priority
- [ ] File: `src/lib/workflows/approval-engine.ts:58`
  - Fix: `"low"` → `ApprovalPriority.LOW` (uppercase)
  - Verify: `ApprovalPriority` enum definition

### 3.2: Context Parameter Issues

#### Fix user/tenantId access
- [ ] `src/app/api/admin/tasks/bulk-update/route.ts:13`
  - Change: `context.params.user` → `{ user } from context`
  
- [ ] `src/app/api/admin/tasks/route.ts:16`
  - Change: Context destructuring

- [ ] `src/app/api/admin/tasks/stats/route.ts:12`
  - Change: Context destructuring

- [ ] `src/app/api/admin/users/route.ts:30, 109`
  - Change: Context destructuring

- [ ] `src/app/api/tasks/route.ts:16, 140`
  - Change: Context destructuring

- [ ] `src/app/api/users/me/activity/route.ts:29`
  - Change: Context destructuring

- [ ] `src/app/api/users/me/route.ts:23, 63`
  - Change: Context destructuring

- [ ] `src/app/api/users/me/settings/route.ts:25, 67`
  - Change: Context destructuring

- [ ] `src/app/api/users/team/route.ts:22`
  - Change: Context destructuring

### 3.3: Handler Options (ApiWrapperOptions)

- [ ] `src/app/api/admin/tasks/bulk-update/route.ts:85`
  - Verify: `requireAdmin` is valid option or replace with correct option

- [ ] `src/app/api/admin/tasks/route.ts:144, 205`
  - Verify: `requireAdmin` is valid option

- [ ] `src/app/api/admin/tasks/stats/route.ts:122`
  - Verify: `requireAdmin` is valid option

### 3.4: Form Input Types

- [ ] `src/app/admin/settings/financial/page.tsx:180`
  - Fix: Cast unknown value to string/number
  - Apply: `String(unknownValue)` or type guard

### 3.5: Spread Type Issues

- [ ] `src/app/admin/settings/analytics/page.tsx:33`
  - Fix: Ensure spreading valid object type

- [ ] `src/app/admin/settings/communication/page.tsx:38`
  - Fix: Ensure spreading valid object type

- [ ] `src/app/api/admin/documents/[id]/approve/route.ts:65`
  - Fix: Ensure spreading valid object type

- [ ] `src/app/api/users/me/settings/route.ts:90`
  - Fix: Ensure spreading valid object type

---

## Phase 4: Response & Hook Type Fixes (MEDIUM PRIORITY)

### 4.1: Hook Response Handling

#### useApprovals
- [ ] File: `src/hooks/shared/useApprovals.ts:67, 68`
  - Issue: `response.data` doesn't exist on Response type
  - Fix: Parse response with `await response.json()` first
  - Update: Export missing types from module

#### useNotifications  
- [ ] File: `src/hooks/shared/useNotifications.ts:38, 151`
  - Issue: Response type mismatch
  - Fix: Properly type response parsing
  - Ensure: `NotificationListResponse` interface has all required fields

#### useTeamMembers
- [ ] File: `src/hooks/shared/useTeamMembers.ts:51, 76`
  - Issue: Response type mismatch
  - Fix: Properly type response parsing
  - Ensure: `TeamMembersResponse` interface correct

### 4.2: Missing Exports

- [ ] File: `src/hooks/shared/index.ts:9`
  - Add export: `ApprovalFilters`
  - Add export: `UseApprovalsResponse`
  - Source: `src/hooks/shared/useApprovals.ts`

---

## Phase 5: Admin Pages & Components (MEDIUM PRIORITY)

### 5.1: Calendar Page

- [ ] `src/app/admin/calendar/page.tsx:410`
  - Issue: Availability slot type mismatch
  - Fix: Ensure all required fields present before function call

- [ ] `src/app/admin/calendar/page.tsx:420`
  - Same as above

- [ ] `src/app/admin/calendar/page.tsx:428`
  - Same as above

### 5.2: Integrations Page

- [ ] `src/app/admin/integrations/page.tsx:85`
  - Issue: String not assignable to health status enum
  - Fix: Map status values to valid enum
  - Create: Status mapping utility function

### 5.3: Performance Metrics

- [ ] `src/app/admin/perf-metrics/page.tsx:72`
  - Add field: `ttfb` to PerformanceMetrics interface

- [ ] `src/app/admin/perf-metrics/page.tsx:73`
  - Add field: `fcp` to PerformanceMetrics interface

- [ ] `src/app/admin/perf-metrics/page.tsx:74`
  - Add field: `domInteractive` to PerformanceMetrics interface

- [ ] `src/app/admin/perf-metrics/page.tsx:75`
  - Add field: `load` to PerformanceMetrics interface

### 5.4: Reminders Page

- [ ] `src/app/admin/reminders/page.tsx:63`
  - Issue: Map callback type incompatibility
  - Fix: Ensure reminder objects match expected type

- [ ] `src/app/admin/reminders/page.tsx:70`
  - Fix: Add `channel` property access

### 5.5: Services Page

- [ ] `src/app/admin/services/page.tsx:161`
  - Issue: Missing ServiceAnalytics properties
  - Fix: Add all required fields: `monthlyBookings`, `revenueByService`, `popularServices`, `conversionRates`

### 5.6: Tasks Page

- [ ] `src/app/admin/tasks/page.tsx:343`
  - Issue: Error type not assignable to ReactNode
  - Fix: `{error instanceof Error ? error.message : String(error)}`

- [ ] `src/app/admin/tasks/components/modals/TaskDetailsModal.tsx:108`
  - Issue: `Task.tags` doesn't exist
  - Fix: Check if field needs to be added to schema or optional chaining

- [ ] `src/app/admin/tasks/components/modals/TaskDetailsModal.tsx:108` (52, 76)
  - Issue: Multiple tag references
  - Fix: Same as above

- [ ] `src/app/admin/tasks/components/modals/TaskDetailsModal.tsx:124`
  - Issue: `Task.assignee` doesn't exist (should be `assigneeId`)
  - Fix: Update field name or add full relation

- [ ] `src/app/admin/tasks/components/modals/TaskDetailsModal.tsx:126`
  - Issue: `Task.estimatedHours` missing
  - Fix: Add to schema or update component

- [ ] `src/app/admin/tasks/components/modals/TaskDetailsModal.tsx:130`
  - Issue: `Task.clientId` missing
  - Fix: Add to schema

- [ ] `src/app/admin/tasks/components/modals/TaskDetailsModal.tsx:130` (141)
  - Issue: `Task.bookingId` missing  
  - Fix: Add to schema

- [ ] `src/app/admin/tasks/components/modals/TaskDetailsModal.tsx:132`
  - Issue: `Task.client` relation missing
  - Fix: Add to schema

- [ ] `src/app/admin/tasks/components/modals/TaskDetailsModal.tsx:132` (133)
  - Issue: `Task.booking` relation missing
  - Fix: Add to schema

- [ ] `src/app/admin/tasks/components/modals/TaskDetailsModal.tsx:141`
  - Issue: Array type incompatibility
  - Fix: Map array correctly to `string[]`

### 5.7: Localization Settings

- [ ] `src/app/admin/settings/localization/LocalizationContent.tsx:450, 451`
  - Issue: `message` doesn't exist on unknown
  - Fix: Proper type guard or cast

- [ ] `src/app/admin/settings/localization/LocalizationContent.tsx:469, 470`
  - Same as above

- [ ] `src/app/admin/settings/localization/LocalizationContent.tsx:491, 492`
  - Same as above

- [ ] `src/app/admin/settings/localization/LocalizationContent.tsx:1334`
  - Issue: `percentage` missing from object
  - Fix: Add field to object or interface

- [ ] `src/app/admin/settings/localization/hooks/useFetchWithTimeout.ts:46`
  - Issue: `error.message` on unknown
  - Fix: Type guard for error

- [ ] `src/app/admin/settings/localization/hooks/useFormMutation.ts:26`
  - Issue: unknown not assignable to BodyInit
  - Fix: Proper type casting for fetch body

- [ ] `src/app/admin/settings/localization/utils/performance.ts:59`
  - Issue: unknown not assignable to T
  - Fix: Proper generic type handling

### 5.8: Portal Documents

- [ ] `src/app/portal/documents/page.tsx:342`
  - Issue: `Document.url` doesn't exist
  - Fix: Add to schema or update code

### 5.9: Portal Tasks

- [ ] `src/app/portal/tasks/page.tsx:359`
  - Issue: Error type not assignable to ReactNode
  - Fix: Error message handling

### 5.10: Task Comment Card

- [ ] `src/components/shared/cards/TaskDetailCard.tsx:247`
  - Issue: `taskId` prop doesn't exist on TaskCommentCardProps
  - Fix: Add prop or update component signature

### 5.11: Team Directory

- [ ] `src/components/shared/widgets/TeamDirectory.tsx:79`
  - Issue: Type predicate returns wrong type
  - Fix: `s is 'offline' | 'online' | 'away'` instead of `s is string`

---

## Phase 6: Missing Modules (MEDIUM PRIORITY)

### 6.1: Web Vitals Package

- [ ] Install: `pnpm add web-vitals`
- [ ] File: `src/lib/frontend-optimization/web-vitals-monitor.ts:3`
  - Verify: Import works after installation

### 6.2: Database Prisma Module

- [ ] Check: Does `src/lib/database/prisma.ts` exist?
  - If NO: Create file with proper exports
  - If YES: Verify exports match what's imported

- [ ] File: `src/lib/database/query-optimization-strategies.ts:8`
  - Verify: Import path correct

### 6.3: Performance Analytics Module

- [ ] Check: Does `src/lib/performance/performance-analytics.ts` exist?
  - If NO: Create file with proper exports
  - If YES: Verify exports match what's imported

- [ ] File: `src/lib/performance/index.ts:55`
  - Verify: Import path correct

### 6.4: API Exports

- [ ] File: `src/lib/frontend/code-splitting.tsx:48`
  - Issue: `BookingWizard` not exported
  - Fix: Check `src/components/booking/BookingWizard` exports default or named export

- [ ] File: `src/lib/frontend/code-splitting.tsx:57`
  - Issue: `SharedDataTable` not exported
  - Fix: Check `src/components/shared/tables/SharedDataTable` exports

---

## Phase 7: API Response & Data Types (MEDIUM PRIORITY)

### 7.1: API Service Responses

- [ ] `src/app/api/services/route.ts:77, 78, 124, 131`
  - Issue: `.data` property doesn't exist on response
  - Fix: Update response interface to have `data` property

- [ ] `src/app/api/services/route.ts:122, 169`
  - Issue: Function called with wrong number of arguments
  - Fix: Check function signature

### 7.2: API User Responses

- [ ] `src/app/api/users/[id]/route.ts:36`
  - Issue: `isAdmin` field doesn't exist on User
  - Fix: Check schema or add field

- [ ] `src/app/api/users/[id]/route.ts:193-195`
  - Issue: String not assignable to filter type
  - Fix: Proper filter object construction

- [ ] `src/app/api/users/[id]/route.ts:208-209`
  - Issue: `assignedToId` doesn't exist on Booking model
  - Fix: Use correct field name for assignment queries

- [ ] `src/app/api/users/team/route.ts:62-63, 76`
  - Issue: `assignedToId` field doesn't exist
  - Fix: Update field name or add to schema

### 7.3: Event Emitter

- [ ] `src/lib/events/event-emitter.ts:219`
  - Issue: `uploadedBy` doesn't exist (should be `uploaderId`)
  - Fix: Update field reference

### 7.4: Performance Optimization

- [ ] `src/lib/performance/endpoint-optimizations.ts:64, 92, 106`
  - Issue: `completedAt` doesn't exist on Booking
  - Fix: Use correct field or add to schema

- [ ] `src/lib/performance/endpoint-optimizations.ts:98, 109`
  - Issue: `amount`, `rating` don't exist on Booking
  - Fix: Use correct fields or add to schema

- [ ] `src/lib/performance/endpoint-optimizations.ts:122-123`
  - Issue: Properties don't exist
  - Fix: Update aggregation fields

### 7.5: Cache Strategy

- [ ] `src/lib/cache/strategy.ts:60`
  - Issue: unknown not assignable to string
  - Fix: Type guard and casting

### 7.6: Rate Limiting

- [ ] `src/lib/performance/rate-limiting.ts:105`
  - Issue: unknown not assignable to string
  - Fix: Type guard and casting

---

## Phase 8: Permission & Workflow Types (LOW PRIORITY)

### 8.1: Permissions

- [ ] `src/lib/permissions.ts:200`
  - Issue: Missing permission types
  - Fix: Add: `"tasks.edit"`, `"services.update"`, `"bookings.view"`
  - Verify: All required permissions are defined

### 8.2: Workflow Engine

- [ ] `src/lib/workflows/approval-engine.ts:113`
  - Issue: `approvedAt` doesn't exist (should be `approver`)
  - Fix: Use correct field name

- [ ] `src/lib/workflows/approval-engine.ts:189`
  - Issue: `rejectedAt` doesn't exist
  - Fix: Check correct field name for rejection tracking

- [ ] `src/lib/workflows/approval-engine.ts:265`
  - Issue: Spread types on invalid type
  - Fix: Ensure spreading valid object

### 8.3: API Wrapper

- [ ] `src/lib/performance/api-middleware.ts:168, 179`
  - Issue: NextResponse<unknown> not assignable to NextResponse<T>
  - Fix: Proper response type casting

- [ ] `src/app/api/documents/stats/route.ts:155`
  - Issue: `totalDocuments` variable not in scope
  - Fix: Initialize or declare variable

### 8.4: Booking Field Issues

- [ ] `src/app/api/bookings/[id]/route.ts:60`
  - Issue: `image` doesn't exist on TeamMember
  - Fix: Check correct field name or add to schema

---

## Phase 9: Miscellaneous Fixes (LOW PRIORITY)

### 9.1: Dynamic Imports

- [ ] `src/lib/frontend-optimization/dynamic-imports.tsx:100`
  - Issue: Dynamic import function signature mismatch
  - Fix: Wrap in proper module format

### 9.2: BPM Process Definition

- [ ] `src/app/api/admin/bpm/processes/route.ts:72`
  - Issue: Missing `id` property on ProcessDefinition
  - Fix: Make `id` required or provide value

### 9.3: Task Create Validation

- [ ] `src/app/api/admin/tasks/route.ts:164`
  - Issue: `tenantId: any` not assignable
  - Fix: Proper type for tenantId

- [ ] `src/app/api/tasks/route.ts:152`
  - Same as above

### 9.4: Audit Entry Types

- [ ] `src/app/api/admin/tasks/[id]/route.ts:159, 207`
  - Issue: `userId` doesn't exist on AuditEntry
  - Fix: Use correct field name

- [ ] `src/app/api/admin/users/route.ts:151`
  - Issue: `tenantId` doesn't exist on AuditEntry
  - Fix: Use correct field or structure

- [ ] `src/app/api/tasks/[id]/comments/[commentId]/route.ts:70, 139`
  - Same as above

- [ ] `src/app/api/tasks/route.ts:173`
  - Same as above

- [ ] `src/app/api/users/me/route.ts:101`
  - Same as above

### 9.5: Document Fields

- [ ] `src/app/api/admin/documents/[id]/approve/route.ts:92`
  - Issue: `resourceType` field doesn't exist (should be `resource`)
  - Fix: Rename field everywhere in codebase

- [ ] `src/app/api/admin/documents/[id]/route.ts:114`
  - Same as above

- [ ] `src/app/api/admin/documents/[id]/scan/route.ts:62`
  - Same as above

- [ ] `src/app/api/admin/documents/route.ts:136`
  - Same as above

- [ ] `src/app/api/admin/documents/stats/route.ts:133`
  - Same as above

- [ ] Multiple other document routes
  - Same pattern: `resourceType` → `resource`

### 9.6: Template Exports

- [ ] `templates/component.template.tsx:111`
  - Issue: `can` doesn't exist on permissions object
  - Fix: Update template or permissions type

---

## Execution Summary

### Quick Start Command
```bash
# After fixing schema and creating migration:
pnpm exec prisma generate
pnpm build 2>&1 | tee build-output.log

# Check remaining errors:
pnpm build | grep "error TS" | wc -l
```

### Validation Steps
```bash
# Type check only (fast):
pnpm exec tsc --noEmit

# Full build:
pnpm build

# Run tests:
pnpm test
pnpm test:e2e
```

### Final Verification
- [ ] Build succeeds with 0 TypeScript errors
- [ ] All tests pass
- [ ] E2E tests pass
- [ ] No runtime errors on core flows
- [ ] Ready to deploy

---

## Troubleshooting

### If migration fails:
```bash
# Reset and recreate:
pnpm exec prisma migrate reset
pnpm exec prisma generate
```

### If type errors remain after fixes:
```bash
# Clear TypeScript cache:
rm -rf .next
pnpm build
```

### If specific file still fails:
```bash
# Type check just that file:
pnpm exec tsc --noEmit src/path/to/file.ts
```

---

**Total Estimated Work**: ~150+ error fixes across 40+ files  
**Recommended Order**: Schema → Handlers → Types → Components → Modules  
**Checkpoint**: After each phase, run `pnpm build` to verify progress
