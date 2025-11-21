# TypeScript Build Errors - Comprehensive Fix Guide

**Generated**: Current Build Session  
**Total Errors**: 150+  
**Build Status**: Failed  
**Next.js Version**: 15.5.4

---

## Error Summary by Category

| Category | Count | Priority | Status |
|----------|-------|----------|--------|
| API Handler Signatures | 25+ | HIGH | ❌ Pending |
| Database Schema Mismatches | 20+ | HIGH | ❌ Pending |
| Response Type Mismatches | 15+ | HIGH | ❌ Pending |
| Missing Properties/Fields | 20+ | MEDIUM | ❌ Pending |
| Missing Modules | 5 | MEDIUM | ❌ Pending |
| Type Casting Issues | 10+ | MEDIUM | ❌ Pending |
| Admin Page Component Errors | 20+ | MEDIUM | ❌ Pending |

---

## Category 1: API Handler Signature Errors (TS2345)

### Issue
Multiple API routes have incorrect handler signatures. The middleware/api wrapper expects handlers to accept 3+ arguments, but handlers are receiving only 2.

**Affected Files**:
- `src/app/api/admin/documents/[id]/approve/route.ts` (lines 18, 138)
- `src/app/api/admin/documents/[id]/route.ts` (lines 12, 95, 220)
- `src/app/api/admin/documents/[id]/scan/route.ts` (lines 12, 97)
- `src/app/api/admin/documents/[id]/sign/route.ts` (lines 26, 150, 258)
- `src/app/api/admin/documents/[id]/versions/route.ts` (lines 12, 94)
- `src/app/api/admin/tasks/[id]/assign/route.ts` (line 12)
- `src/app/api/admin/tasks/[id]/route.ts` (lines 14, 87, 184)
- `src/app/api/admin/users/[id]/activity/route.ts` (line 17)
- `src/app/api/admin/users/[id]/route.ts` (lines 21, 66, 125)
- `src/app/api/documents/[id]/analyze/route.ts` (lines 17, 156)
- `src/app/api/documents/[id]/download/route.ts` (line 12)
- `src/app/api/documents/[id]/route.ts` (lines 13, 132, 220)
- `src/app/api/documents/[id]/sign/route.ts` (lines 26, 150, 258)
- `src/app/api/documents/[id]/versions/route.ts` (lines 12, 94)
- `src/app/api/tasks/[id]/comments/[commentId]/route.ts` (lines 14, 99)
- `src/app/api/tasks/[id]/comments/route.ts` (lines 14, 106)
- `src/app/api/tasks/[id]/route.ts` (lines 14, 87, 184)
- `src/app/api/users/[id]/route.ts` (line 15)

### Error Example
```typescript
// WRONG - expects 3+ arguments
export const withMiddleware = (handler: (request: any, { tenantId, user }, { params }) => Promise<NextResponse<any>>) => {
  // ...
}

// Should be:
export const withMiddleware = (handler: (request: any, { tenantId, user, someOtherArg }, { params }) => Promise<NextResponse<any>>) => {
  // ...
}
```

### Root Cause
The middleware wrapper signature has been updated to expect more context arguments, but handlers weren't updated to match.

### Fix Strategy

**Step 1**: Check the middleware definition
```bash
grep -r "export.*withMiddleware\|export.*MiddlewareHandler\|export.*ApiHandler" src/lib/performance/ src/lib/ --include="*.ts"
```

**Step 2**: Update each affected handler to accept the correct number of parameters

**Example Fix Pattern**:
```typescript
// Before:
const GET = (request: any, { tenantId, user }, { params }) => { ... }

// After (add any missing context parameter):
const GET = (request: any, { tenantId, user }, { params }, options?: any) => { ... }
// OR check what the 4th parameter should be
```

**Step 3**: For each file in the affected list, update the handler signatures to match the middleware expectations.

---

## Category 2: Missing/Wrong Prisma Schema Fields (TS2339, TS2353)

### Issue
Code is referencing Prisma model fields that don't exist or have wrong types.

**Common Missing Fields**:
1. `Document.url` - Referenced in `src/app/portal/documents/page.tsx:342`
2. `AuditEntry.userId` - Referenced in multiple task/user routes
3. `AuditEntry.tenantId` - Referenced in multiple routes
4. `AuditEntry.entity` - Referenced in activity routes
5. `Task.tags`, `Task.assignee`, `Task.estimatedHours`, `Task.clientId`, `Task.bookingId`, `Task.client`, `Task.booking` - Multiple task modal references
6. `Booking.assignedToId`, `Booking.completedAt`, `Booking.amount`, `Booking.rating` - Performance optimization references
7. `User.isAdmin`, `User.bio`, `User.lastLogin` - User profile references
8. `TeamMember.image` - Booking API references
9. `Service.reviews`, `Service.status` ("ARCHIVED" vs correct enum) - Service API references
10. `AuditLog.resourceType` - Should be `resource` instead
11. `Attachment.uploadedBy` - Should be `uploaderId` instead

### Fix Strategy

**Step 1**: Review and update Prisma schema for missing fields
```bash
# Check current schema:
grep -n "model Document\|model AuditEntry\|model Task\|model Booking\|model User\|model TeamMember\|model Service\|model AuditLog\|model Attachment" prisma/schema.prisma
```

**Step 2**: Add missing fields to schema or remove references

**Common Schema Updates Needed**:

For `Document` model:
```prisma
model Document {
  id        String   @id
  url       String?  // Add this field
  // ... other fields
}
```

For `Booking` model:
```prisma
model Booking {
  // ... existing fields
  assignedToId   String?  // If needed for team assignment
  completedAt    DateTime? // If tracking completion
  amount         Decimal? // If tracking revenue
  rating         Int?     // If tracking satisfaction
}
```

For `Task` model:
```prisma
model Task {
  // ... existing fields
  tags                String[]    // If using tags
  estimatedHours      Int?        // If tracking estimates
  clientId            String?     // If tasks are client-specific
  bookingId           String?     // If linked to bookings
  client              Client?     @relation(fields: [clientId], references: [id])
  booking             Booking?    @relation(fields: [bookingId], references: [id])
  // ... other relations
}
```

For `AuditLog` model (fix field name):
```prisma
// Change:
resourceType    String  // WRONG
// To:
resource        String  // CORRECT
```

**Step 3**: After schema updates, create a migration:
```bash
pnpm exec prisma migrate dev --name "fix_missing_fields"
```

**Step 4**: Update code references to match actual schema fields:
- Replace `resourceType` → `resource` in audit log creation
- Replace `uploadedBy` → `uploaderId` in attachment references
- Remove undefined property access or add optional chaining

---

## Category 3: API Context/Params Type Errors (TS2339)

### Issue
Routes are trying to access `user`, `tenantId` from `{ params }` object instead of from the correct context object.

**Affected Files**:
- `src/app/api/admin/tasks/bulk-update/route.ts:13`
- `src/app/api/admin/tasks/route.ts:16`
- `src/app/api/admin/tasks/stats/route.ts:12`
- `src/app/api/admin/users/route.ts:30, 109`
- `src/app/api/tasks/route.ts:16, 140`
- `src/app/api/users/me/activity/route.ts:29`
- `src/app/api/users/me/route.ts:23, 63`
- `src/app/api/users/me/settings/route.ts:25, 67`
- `src/app/api/users/team/route.ts:22`

### Error Example
```typescript
// WRONG - user/tenantId on params object
const GET = async (request, { params }) => {
  const { user, tenantId } = { params } // ❌ Wrong structure
}

// CORRECT - they come from second parameter
const GET = async (request, { user, tenantId }) => {
  // user and tenantId are directly available
}
```

### Fix Strategy

**Step 1**: For each affected file, update context destructuring:

```typescript
// Before:
const GET = async (request, context) => {
  const { user, tenantId } = context.params  // ❌ WRONG

// After:
const GET = async (request, { user, tenantId, params }) => {
  // user and tenantId are now available directly
```

**Step 2**: Update handler wrapper call if using ApiWrapper:
```typescript
// Ensure the wrapper is called with correct options:
export const GET = withApiWrapper(
  async (request, { user, tenantId, params }) => {
    // implementation
  },
  { requireAdmin: true } // Correct option format
)
```

---

## Category 4: Handler Option Type Errors (TS2353)

### Issue
API wrapper options have incorrect property names or unknown options.

**Problems**:
- `requireAdmin` doesn't exist on `ApiWrapperOptions`
- Using spread operator on wrong types

**Affected Files**:
- `src/app/api/admin/tasks/bulk-update/route.ts:85`
- `src/app/api/admin/tasks/route.ts:144, 205`
- `src/app/api/admin/tasks/stats/route.ts:122`

### Fix Strategy

**Step 1**: Find the ApiWrapperOptions type definition:
```bash
grep -r "type ApiWrapperOptions\|interface ApiWrapperOptions" src/lib --include="*.ts"
```

**Step 2**: Update handler wrappers to use correct options:
```typescript
// Before:
export const POST = withApiWrapper(handler, { requireAdmin: true })

// After (depends on actual ApiWrapperOptions):
export const POST = withApiWrapper(handler, { 
  requireAuth: true,
  // or other valid options
})
```

---

## Category 5: Prisma Model Type Mismatches (TS2322)

### Issue
Attempting to assign values to Prisma model fields with incompatible types.

**Affected Areas**:

### 5.1: Service Status Enum (TS2322)
**File**: `src/app/api/services/[slug]/route.ts:203`
```typescript
// WRONG - "ARCHIVED" might not be valid ServiceStatus
status: "ARCHIVED"

// CORRECT - use valid enum value
status: ServiceStatus.ARCHIVED  // or "ACTIVE", "INACTIVE"
```

### 5.2: Service Query Status (TS2820)
**File**: `src/app/api/services/route.ts:71`
```typescript
// WRONG - "ACTIVE" (uppercase) not in enum
status: "ACTIVE"

// CORRECT - use lowercase
status: "active"
```

### 5.3: Approval Priority (TS2322)
**File**: `src/lib/workflows/approval-engine.ts:58`
```typescript
// WRONG - lowercase not allowed
priority: "low"

// CORRECT - use uppercase
priority: ApprovalPriority.LOW  // "LOW", "NORMAL", "HIGH", "URGENT"
```

### 5.4: Form Input Type (TS2322)
**File**: `src/app/admin/settings/financial/page.tsx:180`
```typescript
// WRONG - unknown type passed to input value
<input value={unknownValue} />

// CORRECT - ensure value is string | number | readonly string[]
<input value={String(unknownValue)} />
```

### Fix Strategy

**Step 1**: Check Prisma generated types for enum values:
```bash
grep -A 10 "export enum.*Status\|export enum.*Priority" node_modules/@prisma/client/index.d.ts | head -50
```

**Step 2**: Replace all enum value assignments with correct casing and enum type

---

## Category 6: Response Type Mismatches (TS2345, TS2352)

### Issue
Fetch responses are being cast to specific types without proper type narrowing.

**Affected Files**:
- `src/hooks/shared/useApprovals.ts:67`
- `src/hooks/shared/useNotifications.ts:38, 151`
- `src/hooks/shared/useTeamMembers.ts:51, 76`

### Error Example
```typescript
// WRONG - Response doesn't have .data property
const data = (response as NotificationListResponse).data  // ❌

// CORRECT - Parse response properly
const data = await response.json() as NotificationListResponse
```

### Fix Strategy

**Step 1**: For each hook, ensure proper response parsing:

```typescript
// Before:
const response = await fetch(url)
const data = (response as NotificationListResponse).data

// After:
const response = await fetch(url)
if (!response.ok) throw new Error('Failed to fetch')
const data = await response.json() as NotificationListResponse
```

**Step 2**: Update response interfaces if needed:
```typescript
interface NotificationListResponse {
  notifications: Notification[]
  total: number
  unreadCount: number
  hasMore: boolean
}
```

---

## Category 7: Zod Validation Error Handling (TS2345)

### Issue
ZodIssue arrays being passed where string error messages expected.

**Affected Files**:
- `src/app/api/admin/notifications/route.ts:146`
- `src/app/api/approvals/[id]/route.ts:130`
- `src/app/api/approvals/route.ts:130`
- `src/app/api/notifications/preferences/route.ts:97`
- `src/app/api/notifications/route.ts:108`

### Error Example
```typescript
// WRONG - ZodIssue[] instead of string
throw new ApiError(validationResult.error.issues)

// CORRECT - convert issues to string
throw new ApiError(
  validationResult.error.issues.map(i => i.message).join(', ')
)
```

### Fix Strategy

**Step 1**: Create a validation error helper:
```typescript
// lib/api/validation-helpers.ts
export function getValidationErrorMessage(issues: ZodIssue[]): string {
  return issues
    .map(issue => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ')
}
```

**Step 2**: Update all error throws to use the helper:
```typescript
// Before:
throw new ApiError(validationResult.error.issues)

// After:
throw new ApiError(getValidationErrorMessage(validationResult.error.issues))
```

---

## Category 8: Missing Exports (TS2459, TS2305)

### Issue
Type/interface not exported from module.

**File**: `src/hooks/shared/index.ts:9`

```typescript
// Before:
export { useApprovals } from './useApprovals'
// Missing ApprovalFilters and UseApprovalsResponse

// After:
export { 
  useApprovals,
  type ApprovalFilters,
  type UseApprovalsResponse
} from './useApprovals'
```

### Fix Strategy

**Step 1**: Check useApprovals.ts exports:
```bash
grep "export\|interface\|type" src/hooks/shared/useApprovals.ts | head -20
```

**Step 2**: Add missing exports

---

## Category 9: Missing Module Imports (TS2307)

### Issue
Cannot find module or missing type declarations.

**Affected**:
1. `src/lib/database/query-optimization-strategies.ts:8` - Missing `./prisma` module
2. `src/lib/frontend-optimization/web-vitals-monitor.ts:3` - Missing `web-vitals` package
3. `src/lib/performance/index.ts:55` - Missing `./performance-analytics` module

### Fix Strategy

**Step 1**: Install missing package:
```bash
pnpm add web-vitals
```

**Step 2**: Create missing modules:
```bash
# Create missing file
touch src/lib/database/prisma.ts
# Add proper exports
```

**Step 3**: Check performance-analytics exists:
```bash
ls -la src/lib/performance-analytics.ts
```

If not, create it with proper exports.

---

## Category 10: Admin Page Component Type Errors

### 10.1: Calendar Page - Availability Slot Type (TS2345, TS2345)
**File**: `src/app/admin/calendar/page.tsx:410, 420, 428`

**Error**: Argument type mismatch for availability slot operations

**Root Cause**: The slot data type doesn't match expected function parameter type

**Fix**:
```typescript
// Ensure correct type casting before function call
const processSlot = (slot: AvailabilitySlot) => {
  // Verify all required fields exist before using
}

// Or cast appropriately:
const typedSlot = {
  id: slot.id || crypto.randomUUID(),
  date: typeof slot.date === 'string' ? slot.date : slot.date.toISOString().split('T')[0],
  startTime: slot.startTime || '09:00',
  endTime: slot.endTime || '17:00',
  teamMember: slot.teamMember || { name: 'Unassigned' },
  available: slot.available ?? true,
  serviceId: slot.serviceId,
  teamMemberId: slot.teamMemberId
}
```

### 10.2: Integrations Page - Health Status (TS2322)
**File**: `src/app/admin/integrations/page.tsx:85`

**Error**: Type 'string' not assignable to `"healthy" | "degraded" | "unavailable" | "operational"`

**Fix**:
```typescript
// Ensure status is mapped to valid enum
const mapHealthStatus = (status: string): 'healthy' | 'degraded' | 'unavailable' | 'operational' => {
  const statusMap: Record<string, any> = {
    'ok': 'healthy',
    'UP': 'operational',
    'DEGRADED': 'degraded',
    'DOWN': 'unavailable'
  }
  return statusMap[status] || 'unavailable'
}
```

### 10.3: Performance Metrics - Missing Web Vitals (TS2339)
**File**: `src/app/admin/perf-metrics/page.tsx:72-75`

**Error**: Properties `ttfb`, `fcp`, `domInteractive`, `load` don't exist

**Fix**: Add missing metric types to schema:
```typescript
interface PerformanceMetrics {
  lcp?: string
  cls?: string
  inp?: string
  ttfb?: string    // Add
  fcp?: string     // Add
  domInteractive?: string  // Add
  load?: string    // Add
}
```

### 10.4: Reminders Page - Type Mismatch (TS2345)
**File**: `src/app/admin/reminders/page.tsx:63`

**Error**: Map callback parameter type incompatibility

**Fix**:
```typescript
// The array contains full reminder objects, not simplified ones
reminders.map((r: ReminderWithRelations) => (
  <ReminderCard 
    key={r.id}
    id={r.id}
    channel={r.channel}
    serviceRequest={r.serviceRequest}
    scheduledAt={r.scheduledAt}
  />
))
```

### 10.5: Services Page - Analytics Type (TS2739)
**File**: `src/app/admin/services/page.tsx:161`

**Error**: Type missing properties for ServiceAnalytics

**Fix**: Ensure analytics data has all required fields:
```typescript
interface ServiceAnalytics {
  monthlyBookings: number[]
  revenueByService: Record<string, number>
  popularServices: Service[]
  conversionRates: number
}

// When creating analytics:
const analytics: ServiceAnalytics = {
  monthlyBookings: [],
  revenueByService: {},
  popularServices: [],
  conversionRates: 0
}
```

### 10.6: Tasks Page - Component Props (TS2322)
**File**: `src/app/admin/tasks/page.tsx:343`

**Error**: Error type not assignable to ReactNode

**Fix**:
```typescript
// Before:
return <div>{error}</div>

// After:
return <div>{error instanceof Error ? error.message : String(error)}</div>
```

### 10.7: Task Details Modal - Missing Task Properties (TS2339)
**File**: `src/components/shared/cards/TaskDetailCard.tsx:108, 124, 126, 130-133`

**Error**: Task model missing properties: `tags`, `assignee`, `estimatedHours`, `clientId`, `bookingId`, `client`, `booking`

**Fix**: Either add these to the Task schema or update the component to handle optional properties:
```typescript
interface TaskExtended extends Task {
  tags?: string[]
  assignee?: User
  estimatedHours?: number
  client?: Client
  booking?: Booking
}

// Update component to use optional chaining:
{task.tags?.map(tag => <span key={tag}>{tag}</span>)}
{task.assignee?.name}
```

### 10.8: Settings Pages - Type Spreading Errors (TS2698)
**Files**:
- `src/app/admin/settings/analytics/page.tsx:33`
- `src/app/admin/settings/communication/page.tsx:38`
- `src/app/api/admin/documents/[id]/approve/route.ts:65`

**Error**: Spread types may only be created from object types

**Fix**: Ensure spreading valid objects:
```typescript
// Before:
const spread = { ...unknownValue }

// After:
const spread = { 
  ...((unknownValue && typeof unknownValue === 'object') ? unknownValue : {})
}
```

---

## Category 11: Team Directory Component (TS2677)

### Issue: Type Predicate Error
**File**: `src/components/shared/widgets/TeamDirectory.tsx:79`

**Error**: Type predicate's type not assignable to parameter type

```typescript
// WRONG - predicate returns wrong type
const isStatus = (s: unknown): s is string => 
  ['offline', 'online', 'away'].includes(s)

// CORRECT - be explicit about the union type
const isStatus = (s: unknown): s is 'offline' | 'online' | 'away' =>
  typeof s === 'string' && ['offline', 'online', 'away'].includes(s)
```

---

## Category 12: Dynamic Imports (TS2345)

### Issue
**File**: `src/lib/frontend-optimization/dynamic-imports.tsx:100`

**Error**: Dynamic import function signature mismatch

```typescript
// WRONG - importing default function instead of module with default export
const loader = () => import('./Component').then(m => m.default)

// CORRECT - match next/dynamic expectations
const loader = () => import('./Component').then(m => ({ default: m.default }))
```

---

## Category 13: API Middleware Response Types (TS2322)

### Issue
**File**: `src/lib/performance/api-middleware.ts:168, 179`

**Error**: NextResponse<unknown> not assignable to NextResponse<T>

**Fix**:
```typescript
// Ensure response is properly typed before return
const response: NextResponse<T> = NextResponse.json(data, status)
return response
```

---

## Execution Plan: Fix Order (by priority)

### Phase 1: Critical Schema/Database Issues (HIGH)
1. **Fix Prisma Schema** (`prisma/schema.prisma`)
   - Add missing fields: `url` to Document, `tags`/`estimatedHours`/`clientId`/`bookingId` to Task
   - Fix field names: `resourceType` → `resource` in AuditLog
   - Add `completedAt`, `amount`, `rating` to Booking if needed
   - Add missing User fields: `isAdmin`, `bio`
   - Add Attachment.uploadedBy or verify it's uploaderId
   - Add TeamMember.image if needed

2. **Run Migration**
   ```bash
   pnpm exec prisma migrate dev --name "fix_missing_fields_and_types"
   pnpm exec prisma generate
   ```

### Phase 2: API Handler Signatures (HIGH)
1. Check middleware handler definitions
2. Update all affected route handlers to match expected signature
3. Files: All `src/app/api/**/**/route.ts` files

### Phase 3: Type Fixes (MEDIUM)
1. Fix enum values (uppercase/lowercase)
2. Fix response type handling in hooks
3. Fix validation error handling
4. Add missing exports

### Phase 4: Component Updates (MEDIUM)
1. Update admin page components
2. Fix task details modal
3. Fix settings pages
4. Update team directory

### Phase 5: Missing Modules (MEDIUM)
1. Install `web-vitals` package
2. Create/verify missing module files
3. Update imports

---

## Verification Steps

After each phase, run:

```bash
# Check for TypeScript errors
pnpm run build

# Or quick type check:
pnpm exec tsc --noEmit

# Check specific file:
pnpm exec tsc --noEmit src/app/admin/calendar/page.tsx
```

---

## Summary of All Affected Files

**Total Files to Fix**: 40+

### Admin Pages (5 files)
- `src/app/admin/calendar/page.tsx` - ✅ FIXED (calendar event drag)
- `src/app/admin/integrations/page.tsx`
- `src/app/admin/perf-metrics/page.tsx`
- `src/app/admin/reminders/page.tsx`
- `src/app/admin/services/page.tsx`
- `src/app/admin/tasks/page.tsx`
- `src/app/admin/settings/analytics/page.tsx`
- `src/app/admin/settings/communication/page.tsx`
- `src/app/admin/settings/financial/page.tsx`
- `src/app/admin/settings/localization/LocalizationContent.tsx` (11+ errors)

### API Routes (15+ files)
- `src/app/api/admin/documents/**`
- `src/app/api/admin/tasks/**`
- `src/app/api/admin/users/**`
- `src/app/api/documents/**`
- `src/app/api/tasks/**`
- `src/app/api/users/**`
- `src/app/api/services/**`
- `src/app/api/approvals/**`
- `src/app/api/notifications/**`

### Hooks (3 files)
- `src/hooks/shared/useApprovals.ts`
- `src/hooks/shared/useNotifications.ts`
- `src/hooks/shared/useTeamMembers.ts`
- `src/hooks/shared/index.ts`

### Libraries (5+ files)
- `src/lib/cache/strategy.ts`
- `src/lib/database/query-optimization-strategies.ts`
- `src/lib/events/event-emitter.ts`
- `src/lib/frontend-optimization/**`
- `src/lib/performance/**`
- `src/lib/workflows/approval-engine.ts`
- `src/lib/permissions.ts`

### Components (3 files)
- `src/components/shared/cards/TaskDetailCard.tsx`
- `src/components/shared/widgets/TeamDirectory.tsx`
- `templates/component.template.tsx`

### Other Pages
- `src/app/portal/documents/page.tsx`
- `src/app/portal/tasks/page.tsx`

---

## Notes

- **Database Changes Required**: Several schema updates needed before code changes will work
- **Migration Strategy**: Plan for zero-downtime migration if in production
- **Testing**: After fixes, run full test suite: `pnpm test`
- **E2E Tests**: Run `pnpm test:e2e` to verify integrations still work
- **Deployment**: Don't deploy until all 150+ errors are resolved and tests pass
