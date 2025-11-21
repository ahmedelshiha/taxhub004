# AI Agent Comprehensive Ruleset — Full Project Repair Guidelines

### Version: 2.2 (Explicit Tenant Context Validation)

### Purpose: A complete, persistent knowledge base containing **all guidelines, rules, insights, decisions, and reasoning** collected from the entire AI agent development journey.

This file ensures consistent execution, prevents overthinking, and minimizes credit usage.

---

# 1. Mandatory Workflow Execution Order

The agent must **always** execute fixes in this sequence:

1. **Fix Prisma Schema mismatches**
2. Generate migration → regenerate Prisma Client
3. Update all API handler signatures to match middleware
4. Fix incorrect context destructuring (`user`, `tenantId`, `params`)
5. Fix enum value mismatches (casing & typing)
6. Fix hooks response parsing (`response.json()` only)
7. Resolve missing modules / missing exports
8. Fix UI components expecting non‑existent model fields
9. Validate build after each phase

❗ **Never change this order**
❗ **Never skip schema-related fixes**

---

# 2. Prisma Schema Rules

All model fields referenced in the frontend or backend must exist in Prisma schema.

### Required fields based on full analysis:

#### Document Model

* `url? : String`

#### Task Model

* `tags? : String[]`
* `estimatedHours? : Int`
* `clientId? : String`
* `bookingId? : String`
* `client   : Client? @relation(fields: [clientId], references: [id])`
* `booking  : Booking? @relation(fields: [bookingId], references: [id])`

#### Booking Model

* `assignedToId? : String`
* `completedAt? : DateTime`
* `amount? : Decimal`
* `rating? : Int`

#### User Model

* `isAdmin : Boolean @default(false)`
* `bio? : String`
* `lastLogin? : DateTime`

#### TeamMember Model

* `image? : String`

#### AuditLog Model (rename rule)

* Replace **resourceType → resource**

#### Attachment Model

* Field should be **uploaderId**, not `uploadedBy`

---

# 3. API Handler Signature Rules — CRITICAL FIX (Phase 1)

## Root Cause Discovery (Session Finding)

**CRITICAL FINDING**: All 40+ API handler signature errors stem from handlers expecting **3 arguments** when middleware only passes **2 arguments**.

### Current (WRONG) Pattern:
```ts
// ❌ WRONG - expects 3 args
export const GET = withTenantContext(async (
  request,
  { tenantId, user },  // ← These don't exist here!
  { params }           // ← Middleware only passes THIS
) => { ... })
```

### Correct Pattern:
```ts
// ✅ CORRECT - expects 2 args
export const GET = withTenantContext(async (
  request,
  { params }  // ← Only argument from middleware
) => {
  // Then inside handler, retrieve tenant context:
  const { user, tenantId } = requireTenantContext()

  // Now use them:
  const id = (await params).id
  // ... handler code
})
```

### Middleware Truth (from src/lib/api-wrapper.ts:300):
The actual middleware call is:
```ts
res = await tenantContext.run(context, () => handler(request, routeContext))
// routeContext = { params }
// handler receives ONLY: (request, { params })
```

### Forbidden:

❌ Handler with 3+ parameters
❌ `context.params.user` - doesn't exist
❌ `context.params.tenantId` - doesn't exist
❌ Accessing user/tenantId from destructured context parameters

### Required:

✔ **ALL handlers use 2-argument signature**: `async (request, { params })`
✔ **Call `requireTenantContext()` inside handler** to get user and tenantId
✔ **Properly `await params`** before accessing param values
✔ Uniform pattern for GET, POST, PUT, DELETE

### Critical Rules for Handler Fix:

1. **Remove the middle parameter** from ALL handler signatures
   - Before: `(request, { tenantId, user }, { params })`
   - After: `(request, { params })`

2. **Add `requireTenantContext()` call at handler start**
   ```ts
   const { user, tenantId } = requireTenantContext()
   ```

3. **Await params before using**
   ```ts
   const { id } = await params
   ```

4. **No changes to middleware wrappers** - they already work correctly

### Files Affected by Phase 1 Fix (40+ files):

**Pattern to search for**:
```bash
grep -r "async (request.*{ tenantId, user }.*{ params }" src/app/api --include="*.ts"
```

Each file matching this pattern needs the 3→2 argument transformation.

---

# 4. Enum Rules

Enums must match Prisma‑generated values:

### ServiceStatus:

* MUST use lowercase if Prisma uses lowercase
* e.g. `"active"` not `"ACTIVE"`

### ApprovalPriority:

* MUST use uppercase
* e.g. `ApprovalPriority.LOW` not `"low"`

### General Rule:

Never write enum values as raw strings unless schema explicitly defines them as such.

---

# 5. Response Handling Rules (Hooks)

Hooks must **never** assume fetch responses contain `.data`.

Correct pattern:

```ts
const json = await response.json() as SomeType
```

### Hooks that must follow this:

* `useApprovals`
* `useNotifications`
* `useTeamMembers`

### Required:

Hooks must export:

* Response interfaces
* Filter interfaces
* Return types

---

# 6. Zod Validation Rules

API errors must be thrown as readable strings.

### Allowed:

```ts
throw new ApiError(
  issues.map(i => i.message).join(", ")
)
```

### Not Allowed:

```ts
throw new ApiError(issues) // ❌
```

---

# 7. Missing Modules & Missing Exports

Modules that must always exist:

* `web-vitals`
* `src/lib/database/prisma.ts`
* `src/lib/performance/performance-analytics.ts`

### Hook Export Rule

Hooks MUST re‑export every type they define:

```ts
export type { UseApprovalsResponse, ApprovalFilters }
```

---

# 8. UI Component Integration Rules

### Rule: UI Expected Fields Must Exist in Schema

Example fields that UI relies on:

* Task.tags
* Task.assignee
* Task.estimatedHours
* Task.client
* Task.booking
* Booking.assignedToId

If UI uses it → **schema must include it**.

### Error Rendering Rule

UI must display safe text:

```tsx
{error instanceof Error ? error.message : String(error)}
```

---

# 9. Dynamic Import Rules

Dynamic imports MUST wrap default export:

```ts
const loader = () =>
  import("./Component").then(m => ({ default: m.default }))
```

---

# 10. API Wrapper & Middleware Rules (v2.2 — Explicit Validation)

### Middleware Parameters:

Handlers must always receive:

* `request`
* `{ user, tenantId, params }`
* NO additional context unless defined in middleware

### Wrapper Options:

Use only valid wrapper options:

* `requireAuth`
* `requireSuperAdmin`
* `requireTenantAdmin`
* `allowedRoles`

❌ Do NOT use unsupported options (e.g., `requireAdmin`)

### Tenant Context Rule:

* Any route that is **tenant-specific must use `withTenantContext`**.
* Inside the handler, **always call `requireTenantContext()`** to get the proper tenant context.
* Ensure the handler **destructures `{ user, tenantId, params }`** properly from the context returned by `requireTenantContext()`.
* This prevents accidental misuse of tenant-specific parameters and avoids TypeScript errors.

### `withTenantContext` Validation Instructions:

The AI agent must verify the following for **every route using `withTenantContext`**:

1. **Handler Signature Check**

   * Must be:

     ```ts
     async (request: NextRequest, { user, tenantId, params }) => Promise<Response>
     ```
   * ❌ Fail if:

     * Only two arguments are received
     * `context.params.user` or `context.params.tenantId` is used

2. **Wrapper Option Check**

   * Must only use valid options (`requireAuth`, `requireTenantAdmin`, `requireSuperAdmin`, `allowedRoles`)
   * ❌ Fail if unsupported options (e.g., `requireAdmin`) are present

3. **Tenant Context Retrieval Check**

   * Must explicitly call:

     ```ts
     const { user, tenantId } = requireTenantContext()
     ```
   * ❌ Fail if handler relies solely on context passed by middleware without calling `requireTenantContext()`

4. **Params Usage Check**

   * Must properly `await` or destructure `params` from context for API logic
   * ❌ Fail if `params` is accessed incorrectly (e.g., `context.params` without destructuring)

5. **Return Type Check**

   * Must return a valid `Response` or `NextResponse`
   * ❌ Fail if any other type is returned

### Example of a Correct Route:

```ts
export default withTenantContext(async (request, { params }) => {
  const { user, tenantId } = requireTenantContext()
  const { id } = await params

  // API logic here

  return new Response(JSON.stringify({ success: true }))
}, { requireTenantAdmin: true })
```

* This example **passes all validation rules**:

  * Uses `withTenantContext` ✅
  * Correct handler signature ✅
  * Calls `requireTenantContext()` ✅
  * Destructures `params` correctly ✅
  * Uses a valid wrapper option ✅

✅ **Benefit:**
With these explicit validation rules, the AI agent can **automatically scan every tenant-specific route** and confirm:

* Middleware usage is correct
* Wrapper options are valid
* Tenant context is explicitly retrieved
* Parameters are correctly destructured
* TypeScript errors related to handler signature or context are prevented

---

# 11. Category Recognition Rules

When the agent sees an error, it must classify it into one of:

1. Schema mismatch
2. API signature mismatch
3. Enum mismatch
4. Context mismatch
5. Missing module
6. Hook response mis-parsing
7. UI expecting missing model fields
8. Invalid dynamic import
9. Zod errors
10. Spread type error on non-object

Each has a predefined fix method.

---

# 12. Minimal Fix Principle

The agent must:

* Apply **the smallest fix** needed
* Never introduce large refactors
* Never rewrite entire modules unless absolutely required
* Never change database logic beyond what UI/backend already expects

---

# 13. Permanent Memory & Reasoning Constraints

The agent must always remember:

* The project historically contains **150+ TypeScript errors**
* **80%** originate from **Prisma schema mismatches**
* UI is ahead of schema → schema must evolve
* API routes were updated but their handlers were NOT
* Hooks incorrectly rely on `.data`
* Enums across app have inconsistent casing
* `resourceType` is deprecated → must use `resource`
* Minimal fix is preferred over full rewrite
* Follow the workflow order without deviation

---

# 14. No Overthinking Rule

The agent should NOT:

* Re-scan the whole project repeatedly
* Guess new architectures
* Suggest changes outside the scope of identified errors

It must rely on this ruleset.

---

# 15. Phase 1 Execution Rules (API Handler Signatures)

## Session Analysis & Findings

**Session Date**: Current TypeScript Error Fix Session
**Finding Type**: CRITICAL - Root cause of 40+ errors identified

### The Problem (Context)

During systematic error analysis, discovered that 40+ API routes have handlers declaring **3 parameters** when middleware only provides **2 parameters**:

```ts
// Current broken pattern in 40+ files:
async (request, { tenantId, user }, { params })  // Expects 3, gets 2
```

### Root Cause Analysis

1. **Middleware Implementation** (`src/lib/api-wrapper.ts:300`):
   - Calls: `handler(request, routeContext)` where `routeContext = { params }`
   - Provides exactly **2 arguments** to handler

2. **Handler Expectations** (40+ files):
   - Declared to accept 3 arguments: `request`, `{ tenantId, user }`, `{ params }`
   - TypeScript error: "Expected 3 or more arguments, got 2"

3. **Missing Tenant Context**:
   - Handlers need `tenantId` and `user` but aren't receiving them as parameters
   - Solution: Call `requireTenantContext()` inside handler body

### The Fix (Phase 1 Strategy)

**Step 1**: Update handler signature (remove middle parameter)
```ts
// FROM:
export const GET = withTenantContext(async (request, { tenantId, user }, { params }) => {

// TO:
export const GET = withTenantContext(async (request, { params }) => {
```

**Step 2**: Add tenant context retrieval inside handler
```ts
export const GET = withTenantContext(async (request, { params }) => {
  const { user, tenantId } = requireTenantContext()
  const { id } = await params

  // Now handler has access to user, tenantId, and id
})
```

**Step 3**: Verify no other changes needed
- Middleware stays unchanged
- Response patterns stay unchanged
- Authorization checks stay unchanged
- Only signature and context retrieval change

### Phase 1 Execution Order

1. Find all files with 3-parameter handlers
2. Update signatures to 2 parameters
3. Add `requireTenantContext()` call at start of each handler
4. Verify no variable references change
5. Run type check
6. Move to Phase 2

### Files to Fix in Phase 1 (40+ instances across 10+ files):

**Document APIs** (6+ instances):
- `src/app/api/documents/[id]/analyze/route.ts`
- `src/app/api/documents/[id]/download/route.ts`
- `src/app/api/documents/[id]/sign/route.ts`
- `src/app/api/documents/[id]/versions/route.ts`

**Task APIs** (6+ instances):
- `src/app/api/tasks/[id]/comments/[commentId]/route.ts`
- `src/app/api/tasks/route.ts`

**User APIs** (4+ instances):
- `src/app/api/users/[id]/route.ts`
- `src/app/api/users/team/route.ts`
- `src/app/api/users/me/route.ts`

**Other APIs** (10+ more instances in services, approvals, notifications, etc.)

### Key Learning for Future Sessions

- **Always check middleware implementation** before assuming handler signatures
- **Middleware call pattern matters** - review how middleware actually invokes handlers
- **Context retrieval methods vary** - some pass as params, some require explicit calls
- **40+ handlers are affected** - indicates systematic pattern, not isolated issues

---

# End of Comprehensive Ruleset

**Changes from v2.2 → v2.3 (Current Session):**

* **CRITICAL FIX IDENTIFIED**: 40+ handler signature errors traced to middleware calling with 2 args, handlers expecting 3
* Added **Phase 1 Execution Rules** with detailed analysis and fix strategy
* Added **Session Analysis & Findings** section documenting root cause discovery
* Updated **API Handler Signature Rules** with correct patterns and middleware truth
* All changes based on deep code analysis of `src/lib/api-wrapper.ts` and 40+ affected routes
