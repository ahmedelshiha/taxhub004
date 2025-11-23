# Phase 1: API Handler Signature Fixes - Complete Analysis

**Status**: IN PROGRESS  
**Files Fixed**: 4 (8+ handlers)  
**Files Remaining**: 20+  
**Total Handlers to Fix**: 40+  
**Session Date**: Current TypeScript Error Fix Session  

---

## Executive Summary

### Root Cause
40+ API route handlers are declared with **3 parameters** when their middleware wrappers only provide **2 parameters**, causing "Target signature provides too few arguments" errors.

### The Mismatch
```typescript
// MIDDLEWARE PROVIDES:
handler(request, { params })  // 2 arguments

// HANDLERS EXPECT:
async (request, { tenantId, user }, { params }) => { }  // 3 arguments ❌
```

### Solution
**Two different fixes depending on middleware type**:

1. **withTenantAuth**: Get user data from request object
2. **withTenantContext**: Call `requireTenantContext()` inside handler

---

## Fixed Files (Phase 1 Session Work)

### File 1: src/app/api/documents/[id]/analyze/route.ts
**Middleware**: `withTenantAuth`  
**Handlers**: POST, GET  
**Status**: ✅ FIXED

**Changes Made**:
- Changed signature from 3 params to 2
- Extract userId/userRole from request object
- Fixed AuditLog fields: resourceType → resource

**Before**:
```typescript
export const POST = withTenantAuth(async (request, { tenantId, user }, { params }) => {
  if (user.role !== 'ADMIN') { ... }
  resourceType: 'Document',
```

**After**:
```typescript
export const POST = withTenantAuth(async (request: any, { params }: any) => {
  const { userId, tenantId, userRole } = request as any
  if (userRole !== 'ADMIN') { ... }
  resource: 'Document',
```

---

### File 2: src/app/api/documents/[id]/download/route.ts
**Middleware**: `withTenantAuth`  
**Handlers**: GET  
**Status**: ✅ FIXED

**Changes Made**:
- Changed signature from 3 params to 2
- Extract userId/userRole from request
- Fixed AuditLog fields

---

### File 3: src/app/api/documents/[id]/sign/route.ts
**Middleware**: `withTenantAuth`  
**Handlers**: POST, PUT, GET  
**Status**: ✅ FIXED

**Key Changes**:
- All 3 handlers updated to 2-parameter signature
- All references to `user.id` → `userId`
- All references to `user.role` → `userRole`
- Fixed AuditLog metadata structure

---

### File 4: src/app/api/tasks/[id]/comments/[commentId]/route.ts
**Middleware**: `withTenantContext`  
**Handlers**: PUT, DELETE  
**Status**: ✅ FIXED

**Changes Made**:
- Changed signature from 3 params to 2
- Added `requireTenantContext()` call at handler start
- Used `requireTenantContext()` to get userId, tenantId, role
- Fixed auth check: `!user.isAdmin` → check role directly

**Before**:
```typescript
export const PUT = withTenantContext(
  async (request, { user, tenantId }, { params }) => {
    if (!user.isAdmin) { ... }
```

**After**:
```typescript
export const PUT = withTenantContext(
  async (request: NextRequest, { params }: any) => {
    const { userId, tenantId, role } = requireTenantContext()
    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN'
    if (!isAdmin) { ... }
```

---

## Middleware Patterns Decoded

### Pattern 1: withTenantAuth

**File**: `src/lib/auth-middleware.ts`  
**How it works**:
```typescript
// Line 88-92: Attach user properties to request
authenticatedRequest.userId = user.id
authenticatedRequest.tenantId = user.tenantId
authenticatedRequest.userRole = user.role
authenticatedRequest.userEmail = user.email

// Line 95: Call handler with 2 args
return await handler(authenticatedRequest, context)
```

**Handler Pattern**:
```typescript
export const METHOD = withTenantAuth(async (request: any, { params }: any) => {
  const { userId, tenantId, userRole, userEmail } = request as any
  const { paramName } = params  // No await needed
  // ... handler logic
})
```

**Used By** (20+ files):
- Document APIs
- Service APIs  
- User APIs
- Authorization-heavy routes

---

### Pattern 2: withTenantContext

**File**: `src/lib/api-wrapper.ts`  
**How it works**:
```typescript
// Line 300: Call handler with 2 args within tenant context
res = await tenantContext.run(context, () => handler(request, routeContext))
// routeContext = { params }
```

**Handler Pattern**:
```typescript
export const METHOD = withTenantContext(
  async (request: NextRequest, { params }: any) => {
    const { userId, tenantId, role, isSuperAdmin } = requireTenantContext()
    const { paramName } = await params  // Needs await!
    // ... handler logic
  },
  { requireAuth: true }
)
```

**Used By** (20+ files):
- Task APIs
- Comment APIs
- Portal service request APIs
- Newer async-local context routes

---

## Remaining Files to Fix

### Document Routes

- [ ] `src/app/api/documents/[id]/route.ts` - GET, PUT, DELETE
- [ ] `src/app/api/documents/[id]/versions/route.ts` - GET, POST
- [ ] `src/app/api/documents/route.ts` - GET, POST
- [ ] `src/app/api/documents/stats/route.ts` - GET

### Task Routes

- [ ] `src/app/api/tasks/[id]/route.ts` - GET, PUT, DELETE
- [ ] `src/app/api/tasks/[id]/comments/route.ts` - GET, POST
- [ ] `src/app/api/tasks/route.ts` - GET, POST
- [ ] `src/app/api/admin/tasks/**` (multiple files)

### User Routes

- [ ] `src/app/api/users/[id]/route.ts` - GET, PUT, DELETE
- [ ] `src/app/api/users/me/route.ts` - GET, PUT
- [ ] `src/app/api/users/me/**` (multiple files)
- [ ] `src/app/api/users/team/route.ts` - GET
- [ ] `src/app/api/admin/users/**` (multiple files)

### Service Routes

- [ ] `src/app/api/services/[slug]/route.ts`
- [ ] `src/app/api/services/route.ts`
- [ ] `src/app/api/admin/services/**`

### Approval/Notification Routes

- [ ] `src/app/api/approvals/**` (multiple files)
- [ ] `src/app/api/notifications/**` (multiple files)

### Other Routes

- [ ] `src/app/api/admin/documents/**` (multiple files)
- [ ] `src/app/api/bookings/**`
- [ ] `src/app/api/admin/bpm/**`
- [ ] Plus 10+ more files

---

## Fix Checklist Template

For each file, follow this checklist:

### Before Starting
- [ ] Identify which middleware it uses (withTenantAuth or withTenantContext)
- [ ] Count number of handlers (GET, POST, PUT, DELETE, etc.)
- [ ] Check for audit log field issues (resourceType → resource)

### For Each Handler
- [ ] Remove middle parameter `{ tenantId, user }` from signature
- [ ] Keep second parameter as `{ params }`
- [ ] If withTenantAuth: Extract user data from request object
- [ ] If withTenantContext: Add `requireTenantContext()` call at start
- [ ] Update all `user.id` → `userId`
- [ ] Update all `user.role` → `userRole` (or check role from context)
- [ ] Update all `tenantId` to use extracted value
- [ ] Fix AuditLog field names if present

### Verification
- [ ] No references to `user` variable remain (unless from context)
- [ ] No references to `context.params.user` remain
- [ ] AuditLog uses `resource` not `resourceType`/`resourceId`
- [ ] params properly destructured or awaited

---

## Common Patterns to Search & Replace

### Search for handlers to fix:
```bash
# withTenantAuth handlers (most common):
grep -r "async (request.*{ tenantId, user }.*{ params }" src/app/api --include="*.ts"

# withTenantContext handlers:
grep -r "async (request.*{ user, tenantId }.*{ params }" src/app/api --include="*.ts"

# Any with user variable destructuring in second param:
grep -r "async (request.*{.*user.*}.*{.*params" src/app/api --include="*.ts"
```

### Replace user.id with userId:
```bash
# After fixing signature, in the file:
sed -i 's/user\.id/userId/g' src/app/api/path/to/file.ts
sed -i 's/user\.role/userRole/g' src/app/api/path/to/file.ts
sed -i 's/user\.isAdmin/isAdmin/g' src/app/api/path/to/file.ts
```

### Fix AuditLog fields:
```bash
# Replace resourceType with resource:
find src/app/api -name "*.ts" -exec sed -i "s/resourceType: '/resource: '/g" {} \;

# Replace resourceId with resource:
find src/app/api -name "*.ts" -exec sed -i "s/resourceId:/resource:/g" {} \;

# Replace details with metadata:
find src/app/api -name "*.ts" -exec sed -i "s/details: {/metadata: {/g" {} \;
```

---

## Validation Steps

### After Fixing Each File
```bash
# Type check the file
pnpm exec tsc --noEmit src/app/api/path/to/file.ts

# Check for remaining errors in that file
pnpm build 2>&1 | grep "src/app/api/path/to/file.ts"
```

### After Fixing All Phase 1 Files
```bash
# Count TS2345 errors (should be 0):
pnpm build 2>&1 | grep "TS2345" | wc -l

# Count remaining handler signature errors:
pnpm build 2>&1 | grep "Target signature provides too few arguments" | wc -l

# Full type check:
pnpm exec tsc --noEmit
```

---

## Edge Cases & Notes

### 1. params Await Timing
- **withTenantAuth**: `params.id` (no await)
- **withTenantContext**: `(await params).id` (needs await)

### 2. Role Checking
- **withTenantAuth**: Direct access to `userRole`
- **withTenantContext**: Get from `requireTenantContext()` - check against 'ADMIN' or 'SUPER_ADMIN'

### 3. AuditLog Fields
These are **ALWAYS WRONG** and need fixing:
- `resourceType` → `resource`
- `resourceId` → Move to metadata
- `details` → `metadata`
- `userId` → Check if valid field (usually it is)

### 4. Type Safety
- Use `as any` for request if needed
- Type params properly: `{ params }: any`
- Declare NextRequest type for better IDE support

---

## Session Summary

**Phase 1 Progress**:
- ✅ Identified root cause (3 vs 2 parameter mismatch)
- ✅ Discovered 2 middleware patterns
- ✅ Fixed 4 files with 8+ handlers  
- ✅ Documented patterns thoroughly
- ⏳ Remaining: ~32+ handlers in 20+ files

**Key Insights**:
- Middleware implementation must be understood first
- Two different context retrieval methods
- AuditLog field deprecation needs addressing
- All remaining fixes follow same pattern

**Estimated Time for Remaining Phase 1**:
- ~2-3 hours for 20+ files at current pace
- Or could be scripted for batch fixing
- Type check after each 3-5 files to catch issues early

---

## Next Steps

### Option 1: Continue Manual Fixing (Recommended for Learning)
1. Pick 5 remaining files
2. Apply the pattern from fixed files
3. Run type check after each file
4. Move to Phase 2 when all 40+ handlers are fixed

### Option 2: Batch Script Fixes (Faster)
1. Search for all problematic handlers
2. Apply sed/awk transformations
3. Manual verification of each file
4. Type check all at once

### Option 3: Phase 1 Block & Move to Phase 2
1. Note remaining files for later
2. Continue to Phase 2 (Field name corrections)
3. Come back to Phase 1 after Phase 2
4. Type check after both phases

---

## Files Reference

**All files mentioned in this session**:
- src/lib/auth-middleware.ts (Pattern 1 source)
- src/lib/api-wrapper.ts (Pattern 2 source)
- src/lib/api-response.ts (respond utility)
- src/lib/audit.ts (audit logging)
- src/lib/tenant-utils.ts (requireTenantContext)

---

**Created**: Phase 1 Session - API Handler Signature Fix Analysis  
**Updated**: Current Session  
**Status**: Ready for Phase 1 Completion or Phase 2 Handoff
