# 🤖 AI Agent Development Rules - TaxHub Project

> **Purpose**: Comprehensive rules to ensure type-safe, compliant code generation and avoid common errors.

---

## 🎯 Core Architectural Patterns

### 1. Tenant Context Pattern (MANDATORY)

**✅ ALWAYS Use:** `withTenantContext` from `@/lib/api-wrapper`

**❌ NEVER Use:** `withTenantAuth` from `@/lib/auth-middleware` (legacy pattern)

#### Correct Implementation Pattern

```typescript
import { NextRequest } from 'next/server'
import { withTenantContext } from '@/lib/api-wrapper'
import { requireTenantContext } from '@/lib/tenant-utils'
import { respond } from '@/lib/api-response'
import prisma from '@/lib/prisma'

export const GET = withTenantContext(
  async (request: NextRequest, { params }: any) => {
    const ctx = requireTenantContext()
    const { userId, tenantId, role } = ctx
    
    // Always add type assertions for tenantId
    const data = await prisma.model.findMany({
      where: { tenantId: tenantId as string }
    })
    
    return respond.ok(data)
  },
  { requireAuth: true }
)
```

#### Critical Rules

1. **ALWAYS** import `NextRequest` as first parameter type
2. **ALWAYS** call `requireTenantContext()` inside handler
3. **ALWAYS** destructure `{ userId, tenantId, role }` from context
4. **ALWAYS** add `as string` type assertion for tenantId in Prisma queries
5. **NEVER** mix `withTenantContext` and `withTenantAuth` patterns
6. **ALWAYS** use `{ requireAuth: true }` option for authenticated routes

---

## 📊 Prisma Schema Field Mappings

### Critical Schema Corrections

> **Before creating/updating any Prisma queries, verify field names in `schema.prisma`**

#### Common Schema Mismatches

| ❌ WRONG Field Name | ✅ CORRECT Field Name | Model |
|---------------------|----------------------|-------|
| `requestedBy` | `requesterId` | DocumentSignatureRequest |
| `signedBy` | `signerId` | DocumentSignature |
| `documentId` | `attachmentId` | DocumentSignature |
| `documentSignatureRequestId` | `signatureRequestId` | DocumentSignature |
| `type` | `analysisType` | AnalysisJob |
| `signedAt` (in update) | `completedAt` | DocumentSignatureRequest |

#### Enum Value Rules

**ALWAYS use UPPERCASE for enum values:**

```typescript
// ✅ CORRECT
status: 'PENDING'
status: 'SIGNED'
priority: 'HIGH'

// ❌ WRONG
status: 'pending'
status: 'signed'
priority: 'high'
```

#### Common Enums

- **SignatureRequestStatus**: `PENDING`, `SIGNED`, `DECLINED`, `EXPIRED`
- **AnalysisStatus**: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`, `INFECTED`
- **BookingStatus**: `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`
- **TaskStatus**: `OPEN`, `IN_PROGRESS`, `REVIEW`, `BLOCKED`, `COMPLETED`
- **TaskPriority**: `HIGH`, `MEDIUM`, `LOW`

---

## 🔒 Type Safety Rules

### 1. TenantId Assertions

**ALWAYS** add type assertions for nullable context properties:

```typescript
// ✅ CORRECT
where: {
  tenantId: tenantId as string,
  userId: userId as string,
}

// ❌ WRONG
where: {
  tenantId,  // Type error: string | null | undefined
  userId,
}
```

### 2. Function Parameter Types

**ALWAYS** explicitly type function parameters:

```typescript
// ✅ CORRECT
tasks.sort((a: Task, b: Task) => {
  return priorityOrder[a.priority] - priorityOrder[b.priority]
})

// ❌ WRONG
tasks.sort((a, b) => {  // Implicit 'any' error
  return priorityOrder[a.priority] - priorityOrder[b.priority]
})
```

### 3. Error Handling

**ALWAYS** use proper error type guards:

```typescript
// ✅ CORRECT
catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(message)
}

// ❌ WRONG
catch (error) {
  console.error(error.message)  // Property 'message' does not exist on type 'unknown'
}
```

### 4. Null/Undefined Handling

**ALWAYS** provide fallbacks for potentially undefined values:

```typescript
// ✅ CORRECT
const filteredBooking = filterBookingFields(booking, ctx.role || '', ctx.userId || '')

// ❌ WRONG
const filteredBooking = filterBookingFields(booking, ctx.role, ctx.userId)
// Type error: string | null | undefined not assignable to string
```

---

## 📁 File Structure Rules

### API Route Structure

```typescript
'use server'  // ALWAYS include for server components

import { NextRequest } from 'next/server'  // ALWAYS NextRequest, not Request
import { withTenantContext } from '@/lib/api-wrapper'
import { requireTenantContext } from '@/lib/tenant-utils'
import { respond } from '@/lib/api-response'
import prisma from '@/lib/prisma'
import { z } from 'zod'  // For validation schemas

// Schema definitions
const CreateSchema = z.object({
  field: z.string(),
})

// Route handlers
export const GET = withTenantContext(
  async (request: NextRequest, { params }: any) => {
    // Implementation
  },
  { requireAuth: true }
)

export const POST = withTenantContext(
  async (request: NextRequest) => {
    // Implementation
  },
  { requireAuth: true }
)
```

### Admin Routes

For admin-only routes, use `withAdminAuth` (which wraps `withTenantContext`):

```typescript
import { withAdminAuth } from '@/lib/api-wrapper'
import { requireTenantContext } from '@/lib/tenant-utils'

export const GET = withAdminAuth(
  async (request, { params }) => {
    const ctx = requireTenantContext()
    // Admin implementation
  },
  { requireAuth: true }
)
```

---

## ⚠️ Common Errors to Avoid

### Error 1: Missing TenantId Assertion

```typescript
// ❌ WRONG - Type error
const users = await prisma.user.findMany({
  where: { tenantId }  // string | null | undefined
})

// ✅ CORRECT
const users = await prisma.user.findMany({
  where: { tenantId: tenantId as string }
})
```

### Error 2: Incorrect Schema Field Names

```typescript
// ❌ WRONG - Field doesn't exist
await prisma.documentSignature.create({
  data: {
    documentId: params.id,  // Field 'documentId' doesn't exist
    signedBy: userId,        // Field 'signedBy' doesn't exist
  }
})

// ✅ CORRECT - Use actual schema fields
await prisma.documentSignature.create({
  data: {
    attachmentId: params.id,     // Correct field name
    signerId: userId as string,   // Correct field name + assertion
  }
})
```

### Error 3: Lowercase Enum Values

```typescript
// ❌ WRONG - Enum mismatch
status: 'pending'  // Error: 'pending' is not assignable to SignatureRequestStatus

// ✅ CORRECT
status: 'PENDING'  // Matches enum value
```

### Error 4: Mixing Middleware Patterns

```typescript
// ❌ WRONG - Incompatible patterns
import { withTenantAuth } from '@/lib/auth-middleware'
import { requireTenantContext } from '@/lib/tenant-utils'

export const GET = withTenantAuth(async (request: any) => {
  const ctx = requireTenantContext()  // Error: Context not available
})

// ✅ CORRECT - Use one pattern
import { withTenantContext } from '@/lib/api-wrapper'
import { requireTenantContext } from '@/lib/tenant-utils'

export const GET = withTenantContext(async (request: NextRequest) => {
  const ctx = requireTenantContext()  // Works correctly
}, { requireAuth: true })
```

### Error 5: Property Access on Wrong Return Type

```typescript
// ❌ WRONG - Accessing wrong property
const result = await getServicesList(tenantId, filters)
if (Array.isArray(result?.data)) {  // Property 'data' doesn't exist
  result.data = result.data.map(...)
}

// ✅ CORRECT - Check schema/return type first
const result = await getServicesList(tenantId, filters)
if (Array.isArray(result?.services)) {  // Correct property name
  result.services = result.services.map(...)
}
```

---

## 🔍 Pre-Flight Checklist

Before creating or modifying any API route, verify:

### ✅ Checklist

- [ ] Using `withTenantContext` (NOT `withTenantAuth`)
- [ ] Importing `NextRequest` type
- [ ] Calling `requireTenantContext()` inside handler
- [ ] All tenantId/userId have `as string` assertions
- [ ] All enum values are UPPERCASE
- [ ] All Prisma field names verified in `schema.prisma`
- [ ] Error handling uses `instanceof Error` checks
- [ ] No implicit `any` types in callbacks/parameters
- [ ] Response uses `respond` helper (not raw NextResponse)
- [ ] `{ requireAuth: true }` option set for protected routes

---

## 📚 Quick Reference

### Import Statements (Copy-Paste Ready)

```typescript
import { NextRequest } from 'next/server'
import { withTenantContext } from '@/lib/api-wrapper'
import { requireTenantContext } from '@/lib/tenant-utils'
import { respond } from '@/lib/api-response'
import prisma from '@/lib/prisma'
import { z } from 'zod'
```

### Admin Route Imports

```typescript
import { NextRequest } from 'next/server'
import { withAdminAuth } from '@/lib/api-wrapper'
import { requireTenantContext } from '@/lib/tenant-utils'
import { respond } from '@/lib/api-response'
import prisma from '@/lib/prisma'
```

### Standard Handler Template

```typescript
export const METHOD = withTenantContext(
  async (request: NextRequest, { params }: any) => {
    try {
      const ctx = requireTenantContext()
      const { userId, tenantId, role } = ctx
      
      // Your implementation here
      
      return respond.ok(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('Handler error:', message)
      return respond.serverError()
    }
  },
  { requireAuth: true }
)
```

---

## 🎓 Learning from Past Errors

### Top 5 Most Common Errors Fixed

1. **TenantId Type Assertions** (24 occurrences)
   - Solution: Always use `tenantId as string`

2. **Incorrect Schema Field Names** (12 occurrences)
   - Solution: Verify in schema.prisma before coding

3. **Lowercase Enum Values** (8 occurrences)
   - Solution: Always use UPPERCASE enums

4. **Implicit Any Types** (6 occurrences)
   - Solution: Explicitly type all parameters

5. **Wrong Middleware Pattern** (4 occurrences)
   - Solution: Use withTenantContext exclusively

---

## 🚀 Best Practices

1. **Always Check Schema First**: Before writing Prisma queries, open `schema.prisma` and verify field names and relationships

2. **Use Type Assertions Liberally**: TypeScript's strict null checks require explicit assertions for context properties

3. **Follow Existing Patterns**: Look at working routes (bookings, admin/users, tasks) for reference implementations

4. **Test TypeScript Compilation**: Run `npx tsc --noEmit` before committing

5. **Never Skip Error Handling**: Always include try/catch with proper type guards

6. **Document Complex Logic**: Add comments for non-obvious business logic

7. **Keep Handlers Focused**: Extract complex logic into service functions

---

## 📖 Additional Resources

- **Schema Reference**: `prisma/schema.prisma`
- **Tenant Context**: `src/lib/tenant-context.ts`
- **API Wrapper**: `src/lib/api-wrapper.ts`
- **Response Helpers**: `src/lib/api-response.ts`

---

## 🔄 Version History

- **v1.0** (2025-11-22) - Initial comprehensive rules based on TypeScript error resolution session
- Fixed 80+ TypeScript errors following these patterns
- Established withTenantContext as exclusive pattern

---

**Last Updated**: 2025-11-22  
**Maintained By**: AI Agent Development Team  
**Status**: Production-Ready ✅
