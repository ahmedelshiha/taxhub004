# Quick Reference: Common TypeScript Fixes

## Tenant Context Pattern
```typescript
import { withTenantContext } from '@/lib/api-wrapper'
import { requireTenantContext } from '@/lib/tenant-utils'

export const GET = withTenantContext(
  async (request: NextRequest, { params }: any) => {
    const ctx = requireTenantContext()
    const { userId, tenantId } = ctx
    // Use tenantId as string in queries
  },
  { requireAuth: true }
)
```

## Common Fixes

### TenantId Assertion
```typescript
where: { tenantId: tenantId as string }
```

### Enum Values (UPPERCASE)
```typescript
status: 'PENDING'  // not 'pending'
```

### Schema Field Names
- `requesterId` not `requestedBy`
- `signerId` not `signedBy`
- `attachmentId` not `documentId`
- `analysisType` not `type`

### Error Handling
```typescript
catch (error) {
  const msg = error instanceof Error ? error.message : String(error)
}
```

### Function Parameters
```typescript
.sort((a: Task, b: Task) => ...)  // Explicit types
```
