# TypeScript Build Errors - Complete Checklist

**Last Updated**: Current Session  
**Total Errors**: 150+ documented  
**Estimated Time**: 6-8 hours  
**Status**: Ready for systematic fixing

**Issue**: Handlers declared with 2 args but middleware expects 3+  
**Fix Pattern**: Update handler signature to match middleware

### Document APIs

- [ ] `src/app/api/documents/[id]/analyze/route.ts:17` - GET handler signature
- [ ] `src/app/api/documents/[id]/analyze/route.ts:156` - POST handler signature
- [ ] `src/app/api/documents/[id]/download/route.ts:12` - GET handler signature
- [ ] `src/app/api/documents/[id]/sign/route.ts:26` - POST handler signature
- [ ] `src/app/api/documents/[id]/sign/route.ts:150` - GET handler signature
- [ ] `src/app/api/documents/[id]/sign/route.ts:258` - DELETE handler signature

### Task Comment APIs

- [ ] `src/app/api/tasks/[id]/comments/[commentId]/route.ts:14` - GET handler
- [ ] `src/app/api/tasks/[id]/comments/[commentId]/route.ts:99` - PUT handler

### User APIs

- [ ] `src/app/api/users/[id]/route.ts:15` - GET handler
- [ ] `src/app/api/users/team/route.ts:22` - context destructuring + handler

**Quick Command**:
```bash
# Check handler signature definition:
grep -n "export.*GET\|export.*POST\|export.*PUT\|export.*DELETE" src/app/api/documents/[id]/analyze/route.ts | head -5
```

---

## Phase 2: Field Name Corrections (30+ fixes)

**Issue**: Code references fields with wrong names  
**Fix Pattern**: Replace incorrect field names with correct ones

### AuditLog Field Fixes (resource)

**Problem**: Code uses `resourceId`, `resourceType`, `details`, `userId`, `tenantId`, or `entity` but AuditLog model has:
- ✅ `resource` (String, line 426)
- ✅ `metadata` (Json, line 427) - use for storing extra data
- ✅ `userId` (String, line 424) - EXISTS in schema! Check code
- ✅ `tenantId` (String, line 423) - EXISTS in schema! Check code
- ❌ `resourceId` - WRONG
- ❌ `resourceType` - WRONG
- ❌ `details` - WRONG
- ❌ `entity` - WRONG

#### Wrong field: resourceId (should be resource)

- [ ] `src/app/api/admin/documents/[id]/approve/route.ts:103` - AuditLog.resourceId
- [ ] `src/app/api/admin/documents/[id]/route.ts:120` - AuditLog.resourceId
- [ ] `src/app/api/admin/documents/[id]/scan/route.ts:66` - AuditLog.resourceId
- [ ] `src/app/api/documents/[id]/route.ts:123` - AuditLog.resourceId
- [ ] `src/app/api/documents/[id]/route.ts:201` - AuditLog.resourceId
- [ ] `src/app/api/documents/[id]/route.ts:263` - AuditLog.resourceId
- [ ] `src/app/api/documents/[id]/versions/route.ts:79` - AuditLog.resourceId
- [ ] `src/app/api/documents/[id]/versions/route.ts:205` - AuditLog.resourceId
- [ ] `src/app/api/documents/route.ts:324` - AuditLog.resourceId

#### Wrong field: resourceType (should be resource)

- [ ] `src/app/api/documents/[id]/analyze/route.ts:81` - AuditLog.resourceType
- [ ] `src/app/api/documents/[id]/download/route.ts:62` - AuditLog.resourceType
- [ ] `src/app/api/documents/[id]/sign/route.ts:109` - AuditLog.resourceType
- [ ] `src/app/api/documents/[id]/sign/route.ts:227` - AuditLog.resourceType

#### Wrong field: details (not valid)

- [ ] `src/app/api/admin/documents/route.ts:139` - AuditLog.details → use metadata

#### Wrong field: userId (already exists! Check AuditLog schema)

**ACTION**: Check if AuditLog.userId exists in schema. If yes, code might be trying to set wrong type.

- [ ] `src/app/api/admin/tasks/[id]/route.ts:166` - AuditLog.userId
- [ ] `src/app/api/admin/tasks/[id]/route.ts:217` - AuditLog.userId
- [ ] `src/app/api/admin/tasks/route.ts:191` - AuditLog.userId
- [ ] `src/app/api/admin/users/[id]/route.ts:106` - AuditLog.userId
- [ ] `src/app/api/admin/users/[id]/route.ts:167` - AuditLog.userId (also missing `user` variable)

#### Wrong field: tenantId (already exists! Check if type issue)

- [ ] `src/app/api/admin/users/route.ts:161` - AuditLog.tenantId (also missing `tenantId` in scope)
- [ ] `src/app/api/tasks/[id]/comments/[commentId]/route.ts:70` - AuditLog.tenantId
- [ ] `src/app/api/tasks/[id]/comments/[commentId]/route.ts:139` - AuditLog.tenantId
- [ ] `src/app/api/tasks/[id]/comments/route.ts:171` - AuditLog.tenantId
- [ ] `src/app/api/tasks/[id]/route.ts:163` - AuditLog.tenantId
- [ ] `src/app/api/tasks/[id]/route.ts:214` - AuditLog.tenantId
- [ ] `src/app/api/tasks/route.ts:177` - AuditLog.tenantId
- [ ] `src/app/api/users/me/route.ts:104` - AuditLog.tenantId
- [ ] `src/app/api/users/me/settings/route.ts:112` - AuditLog.tenantId

#### Wrong field: entity (not valid - use resource)

- [ ] `src/app/api/admin/users/[id]/activity/route.ts:51` - AuditLog.entity → use resource
- [ ] `src/app/api/users/me/activity/route.ts:70` - AuditLog.entity → use resource

### Service Model Field Issues

- [ ] `src/app/api/services/[slug]/route.ts:71` - Service.reviews (doesn't exist in model)
- [ ] `src/app/api/services/[slug]/route.ts:204` - Service.deletedAt (doesn't exist)

### User Model Field Issues

- [ ] `src/app/api/users/me/route.ts:37` - User.phoneNumber → verify if exists
- [ ] `src/app/api/users/me/route.ts:85` - User.phoneNumber → verify if exists
- [ ] `src/app/api/users/me/route.ts:95` - User.phoneNumber → verify if exists

### Booking Model Field Issues

- [ ] `src/app/api/users/[id]/route.ts:212` - Booking.assignedToId (verify if should exist)
- [ ] `src/app/api/users/[id]/route.ts:213` - Booking.assignedToId
- [ ] `src/app/api/users/team/route.ts:64` - Booking.assignedToId
- [ ] `src/app/api/users/team/route.ts:65` - Booking.assignedToId
- [ ] `src/app/api/users/team/route.ts:78` - Booking.assignedToId

---

## Phase 3: Context Destructuring (15+ fixes)

**Issue**: Routes not properly accessing context parameters  
**Fix Pattern**: Ensure `user`, `tenantId` are destructured from correct location

### Context from TenantContext

- [ ] `src/app/api/admin/tasks/route.ts:20` - accessing `user` from context
- [ ] `src/app/api/admin/tasks/route.ts:159` - accessing `user` from context

### requireTenantContext() Not Callable

- [ ] `src/app/api/admin/users/route.ts:33` - `requireTenantContext()` error
- [ ] `src/app/api/admin/users/route.ts:116` - `requireTenantContext()` error

### Missing tenantId in Scope

- [ ] `src/app/api/admin/users/route.ts:144` - shorthand property `tenantId` missing

### Missing user Variable in Scope

- [ ] `src/app/api/admin/users/[id]/route.ts:167` - `user` not found
- [ ] `src/app/api/documents/[id]/route.ts:293` - `user` not found
- [ ] `src/app/api/documents/[id]/versions/route.ts:207` - `user` not found

### Context Object Property Access

- [ ] `src/app/api/tasks/route.ts:144` - `user` from `{ params }`
- [ ] `src/app/api/tasks/route.ts:144` - `tenantId` from `{ params }`
- [ ] `src/app/api/users/team/route.ts:22` - `user` from context
- [ ] `src/app/api/users/team/route.ts:22` - `tenantId` from context

---

## Phase 4: Type Safety Fixes (20+ fixes)

### 4.1: Zod Validation Error Handling (5 fixes)

**Issue**: Throwing ZodIssue[] instead of string  
**Fix Pattern**:
```typescript
// BEFORE:
throw new ApiError(validationResult.error.issues)

// AFTER:
throw new ApiError(
  validationResult.error.issues.map(i => i.message).join(', ')
)
```

- [ ] `src/app/api/admin/notifications/route.ts:146` - ZodIssue[]
- [ ] `src/app/api/approvals/[id]/route.ts:130` - ZodIssue[]
- [ ] `src/app/api/approvals/route.ts:130` - ZodIssue[]
- [ ] `src/app/api/notifications/preferences/route.ts:97` - ZodIssue[]
- [ ] `src/app/api/notifications/route.ts:108` - ZodIssue[]

### 4.2: Spread Operator on Non-Object (8+ fixes)

**Issue**: Spreading unknown or non-object types  
**Fix Pattern**:
```typescript
// BEFORE:
const spread = { ...unknownValue }

// AFTER:
const spread = typeof unknownValue === 'object' && unknownValue !== null 
  ? unknownValue 
  : {}
```

- [ ] `src/app/admin/settings/analytics/page.tsx:33` - spreading unknown
- [ ] `src/app/admin/settings/communication/page.tsx:38` - spreading unknown
- [ ] `src/app/api/admin/documents/[id]/scan/route.ts:49` - spreading unknown
- [ ] `src/app/api/documents/[id]/analyze/route.ts:123` - spreading unknown
- [ ] `src/app/api/documents/[id]/route.ts:173` - spreading unknown
- [ ] `src/app/api/documents/[id]/route.ts:291` - spreading unknown
- [ ] `src/app/api/documents/[id]/sign/route.ts:212` - spreading unknown
- [ ] `src/app/api/users/me/settings/route.ts:94` - spreading unknown

### 4.3: Type Predicate Fix (1 fix)

- [ ] `src/components/shared/widgets/TeamDirectory.tsx:79` - type predicate returns wrong type
  ```typescript
  // BEFORE:
  (s: unknown): s is string
  
  // AFTER:
  (s: unknown): s is 'offline' | 'online' | 'away'
  ```

### 4.4: Enum Value Casing

- [ ] `src/app/api/services/route.ts:71` - "ACTIVE" should be "active"

### 4.5: Service API Response Structure

**Issue**: Code assumes `.data` property on response that doesn't exist

- [ ] `src/app/api/services/route.ts:77` - `.data` on response
- [ ] `src/app/api/services/route.ts:78` - `.data` on response (2 instances)
- [ ] `src/app/api/services/route.ts:124` - `.data` on NextResponse
- [ ] `src/app/api/services/route.ts:131` - `.data` and `.pagination`

### 4.6: Function Argument Count

- [ ] `src/app/api/services/route.ts:122` - Expected 1 argument, got 2
- [ ] `src/app/api/services/route.ts:169` - Expected 3 arguments, got 2

### 4.7: Error Type to ReactNode

**Issue**: Error object not assignable to ReactNode  
**Fix Pattern**:
```typescript
{error instanceof Error ? error.message : String(error)}
```

- [ ] `src/app/admin/tasks/page.tsx:343` - Error to ReactNode
- [ ] `src/app/portal/tasks/page.tsx:359` - Error to ReactNode

### 4.8: Object Literal Type Issues

- [ ] `src/app/api/admin/bpm/processes/route.ts:72` - `id` property required
- [ ] `src/app/api/admin/tasks/route.ts:171` - tenantId type incompatibility
- [ ] `src/app/api/tasks/[id]/route.ts:145` - `status` property missing
- [ ] `src/app/api/tasks/route.ts:156` - tenantId type incompatibility

### 4.9: Document Versions Duplicate Properties

**Issue**: Object literal with duplicate property names

- [ ] `src/app/api/documents/[id]/versions/route.ts:206` - duplicate property
- [ ] `src/app/api/documents/[id]/versions/route.ts:207` - duplicate property (2 instances)
- [ ] `src/app/api/documents/[id]/versions/route.ts:209` - duplicate property

### 4.10: Fetch Body Type Issue

- [ ] `src/app/admin/settings/localization/hooks/useFormMutation.ts:26` - unknown not assignable to BodyInit

### 4.11: Error Message on Unknown Type

- [ ] `src/app/admin/settings/localization/hooks/useFetchWithTimeout.ts:46` - `error.message` on unknown

### 4.12: Generic Type Handling

- [ ] `src/app/admin/settings/localization/utils/performance.ts:59` - unknown not assignable to T

---

## Phase 5: Missing Prisma Models (10+ fixes)

**Issue**: Code references Prisma models that don't exist in schema

### Document Signing (Need to create or fix references)

- [ ] `src/app/api/documents/[id]/sign/route.ts:88` - `prisma.documentSignatureRequest` - does model exist?
- [ ] `src/app/api/documents/[id]/sign/route.ts:173` - `prisma.documentSignatureRequest`
- [ ] `src/app/api/documents/[id]/sign/route.ts:186` - `prisma.documentSignature` - does model exist?
- [ ] `src/app/api/documents/[id]/sign/route.ts:199` - `prisma.documentSignatureRequest`
- [ ] `src/app/api/documents/[id]/sign/route.ts:277` - `prisma.documentSignatureRequest`
- [ ] `src/app/api/documents/[id]/sign/route.ts:282` - `prisma.documentSignature`

### Document Analysis (Need to create or fix references)

- [ ] `src/app/api/documents/[id]/analyze/route.ts:64` - `prisma.analysisJob` - does model exist?

**Decision**: 
- [ ] Check if these models exist in schema
- [ ] If yes: Verify import paths
- [ ] If no: Create the models or refactor to use existing models

---

## Phase 6: Component Props Issues (10+ fixes)

### TaskDetailsModal Component Issues

**Problem**: TaskDetailsModal trying to use Task relations/properties that may not be passed correctly

- [ ] `src/app/admin/tasks/components/modals/TaskDetailsModal.tsx:108` - `Task.tags` array (3 instances)
  - Verify task object includes tags array
  
- [ ] `src/app/admin/tasks/components/modals/TaskDetailsModal.tsx:124` - `Task.assignee` relation
  - Should use assigneeId and fetch user separately, or ensure relation included
  
- [ ] `src/app/admin/tasks/components/modals/TaskDetailsModal.tsx:126` - `Task.estimatedHours`
  - Verify task object includes this field
  
- [ ] `src/app/admin/tasks/components/modals/TaskDetailsModal.tsx:130` - `Task.clientId`
  - Verify task object includes this field
  
- [ ] `src/app/admin/tasks/components/modals/TaskDetailsModal.tsx:130` - `Task.bookingId`
  - Verify task object includes this field
  
- [ ] `src/app/admin/tasks/components/modals/TaskDetailsModal.tsx:132` - `Task.client` relation
  - Ensure relation is included in query
  
- [ ] `src/app/admin/tasks/components/modals/TaskDetailsModal.tsx:133` - `Task.booking` relation
  - Ensure relation is included in query

- [ ] `src/app/admin/tasks/components/modals/TaskDetailsModal.tsx:141` - array type to string[] mapping
  - Fix: Map array items correctly to strings

### Other Component Issues

- [ ] `src/app/portal/documents/page.tsx:342` - `Document.url` (check if field exists)

- [ ] `src/components/shared/cards/TaskDetailCard.tsx:247` - `taskId` prop missing from TaskCommentCardProps
  - Either add prop to component or remove from usage

---

## Phase 7: Missing Modules (8+ fixes)

### Missing Module: web-vitals

**Action**: 
```bash
pnpm add web-vitals
```

- [ ] `src/lib/frontend-optimization/web-vitals-monitor.ts:3` - imports: getCLS, getFID, getFCP, getLCP, getTTFB
- [ ] `src/lib/frontend-optimization/web-vitals-monitor.ts:88` - string not assignable to metric enum
- [ ] `src/lib/frontend-optimization/web-vitals-monitor.ts:90` - "fair" not valid enum value

### Missing Module: ./prisma

- [ ] `src/lib/database/query-optimization-strategies.ts:8` - cannot find module `./prisma`
  - **Action**: Create `src/lib/database/prisma.ts` with proper exports

### Missing Module: ./performance-analytics

- [ ] `src/lib/performance/index.ts:55` - cannot find module `./performance-analytics`
  - **Action**: Create `src/lib/performance/performance-analytics.ts` with proper exports

### Missing Component Exports

- [ ] `src/lib/frontend/code-splitting.tsx:48` - `BookingWizard` not exported
  - **Action**: Check `src/components/booking/BookingWizard.tsx` exports
  
- [ ] `src/lib/frontend/code-splitting.tsx:57` - `SharedDataTable` not exported
  - **Action**: Check `src/components/shared/tables/SharedDataTable.tsx` exports

### Dynamic Import Signature

- [ ] `src/lib/frontend-optimization/dynamic-imports.tsx:100` - wrong return type signature
  - **Fix**: Ensure loader returns `() => Promise<{ default: () => Element }>`

---

## Phase 8: Validation & Testing

### 8.1: Type Check Commands

```bash
# Full type check
pnpm exec tsc --noEmit

# Check specific file
pnpm exec tsc --noEmit src/app/api/documents/[id]/analyze/route.ts

# Count remaining errors
pnpm build 2>&1 | grep -c "error TS"
```

### 8.2: Build Validation

```bash
# Full build
pnpm build

# Check for specific error patterns
pnpm build 2>&1 | grep "resourceId\|resourceType\|details"
pnpm build 2>&1 | grep "TS2345"  # Handler signature errors
pnpm build 2>&1 | grep "TS2339"  # Missing property errors
```

### 8.3: Success Criteria

- [ ] `pnpm build` exits with code 0
- [ ] 0 TypeScript errors reported
- [ ] `pnpm test` passes (if applicable)
- [ ] `pnpm test:e2e` passes (if applicable)

---

## Quick Fix Commands

### Replace all resourceId with resource
```bash
find src/app/api -name "*.ts" -type f | xargs sed -i 's/resourceId/resource/g'
```

### Replace all resourceType with resource
```bash
find src/app/api -name "*.ts" -type f | xargs sed -i 's/resourceType/resource/g'
```

### Check for phoneNumber vs phone
```bash
grep -r "phoneNumber" src/app/api --include="*.ts"
```

---

## Documentation References

- See `BUILD_ERROR_SUMMARY_UPDATED.md` for detailed error breakdown
- See `AI_AGENT_RULESET.md` for execution guidelines
- See `TYPESCRIPT_ERRORS_FIX_GUIDE.md` for detailed fix patterns

---

## Session Notes

**Key Finding**: Schema is correct! All 150+ errors are code issues, not schema issues.

**Biggest Fix Areas**:
1. API handler signatures (40+ instances)
2. Field name corrections (30+ instances)
3. Context destructuring (15+ instances)

**Estimated Time**: 6-8 hours systematic fixing

**Next Action**: Start Phase 1 - API Handler Signatures
