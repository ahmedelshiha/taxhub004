# TypeScript Errors Resolution Tracker

**Date Created**: 2025-11-22  
**Total Errors**: 68  
**Status**: Ready for systematic resolution  
**Estimated Time**: 4-6 hours

---

## 📊 Error Summary by Category

| Category | Count | Priority | Status |
|----------|-------|----------|--------|
| [Missing Prisma Fields](#category-1-missing-prisma-model-fields-25-errors) | 25 | 🔴 HIGH | Not Started |
| [Missing Prisma Models](#category-2-missing-prisma-models-7-errors) | 7 | 🔴 HIGH | Not Started |
| [Spread Type Errors](#category-3-spread-type-errors-5-errors) | 5 | 🟡 MEDIUM | Not Started |
| [Zod Validation Errors](#category-4-zod-validation-errors-5-errors) | 5 | 🟡 MEDIUM | Not Started |
| [Missing Exports/Imports](#category-5-missing-exportsimports-10-errors) | 10 | 🟡 MEDIUM | Not Started |
| [Type Safety Issues](#category-6-type-safety-issues-8-errors) | 8 | 🟢 LOW | Not Started |
| [Variable Scope Issues](#category-7-variable-scope-issues-3-errors) | 3 | 🟡 MEDIUM | Not Started |
| [Miscellaneous](#category-8-miscellaneous-5-errors) | 5 | 🟢 LOW | Not Started |

---

## Category 1: Missing Prisma Model Fields (25 errors)

**Root Cause**: Code references fields that don't exist in Prisma schema  
**Solution**: Add missing fields to schema OR update code to use existing fields

### Task Model Missing Fields

- [ ] **Error 1**: `src/app/admin/tasks/components/modals/TaskDetailsModal.tsx:108:38`
  - **Issue**: Property `tags` does not exist on type 'Task'
  - **Fix**: Add `tags String[]` to Task model in `schema.prisma`
  - **Alternative**: Remove tags usage from component

- [ ] **Error 2**: `src/app/admin/tasks/components/modals/TaskDetailsModal.tsx:108:52`
  - **Issue**: Property `tags` does not exist on type 'Task' (same as above)
  - **Fix**: Same as Error 1

- [ ] **Error 3**: `src/app/admin/tasks/components/modals/TaskDetailsModal.tsx:108:76`
  - **Issue**: Property `tags` does not exist on type 'Task' (same as above)
  - **Fix**: Same as Error 1

- [ ] **Error 4**: `src/app/admin/tasks/components/modals/TaskDetailsModal.tsx:126:90`
  - **Issue**: Property `estimatedHours` does not exist on type 'Task'
  - **Fix**: Add `estimatedHours Int?` to Task model

- [ ] **Error 5**: `src/app/admin/tasks/components/modals/TaskDetailsModal.tsx:126:128`
  - **Issue**: Property `estimatedHours` does not exist on type 'Task' (same as above)
  - **Fix**: Same as Error 4

- [ ] **Error 6**: `src/app/admin/tasks/components/modals/TaskDetailsModal.tsx:130:23`
  - **Issue**: Property `clientId` does not exist on type 'Task'
  - **Fix**: Add `clientId String?` and `client Client? @relation(fields: [clientId], references: [id])` to Task model

- [ ] **Error 7**: `src/app/admin/tasks/components/modals/TaskDetailsModal.tsx:130:41`
  - **Issue**: Property `bookingId` does not exist on type 'Task'
  - **Fix**: Add `bookingId String?` and `booking Booking? @relation(fields: [bookingId], references: [id])` to Task model

- [ ] **Error 8**: `src/app/admin/tasks/components/modals/TaskDetailsModal.tsx:132:79`
  - **Issue**: Property `clientId` does not exist on type 'Task' (same as Error 6)
  - **Fix**: Same as Error 6

- [ ] **Error 9**: `src/app/admin/tasks/components/modals/TaskDetailsModal.tsx:133:77`
  - **Issue**: Property `bookingId` does not exist on type 'Task' (same as Error 7)
  - **Fix**: Same as Error 7

### Document Model Missing Fields

- [ ] **Error 10**: `src/app/portal/documents/page.tsx:342:19`
  - **Issue**: Property `url` does not exist on type 'Document'
  - **Fix**: Add `url String?` to Document model in schema.prisma
  - **Code Change**:
    ```prisma
    model Document {
      // ... existing fields
      url String?
    }
    ```

### Service Model Invalid Fields

- [ ] **Error 11**: `src/app/api/services/[slug]/route.ts:71:11`
  - **Issue**: Property `reviews` does not exist in ServiceInclude
  - **Fix**: Remove `reviews: true` from include OR add Review relation to Service model
  - **Quick Fix**: Remove the line if reviews aren't needed

- [ ] **Error 12**: `src/app/api/services/[slug]/route.ts:204:11`
  - **Issue**: Property `deletedAt` does not exist in ServiceUpdateInput
  - **Fix**: Add `deletedAt DateTime?` to Service model for soft deletes
  - **Alternative**: Remove deletedAt usage and use active/inactive status

### User Model Field Issues

- [ ] **Error 13**: `src/app/api/users/me/route.ts:37:11`
  - **Issue**: Property `phoneNumber` does not exist in UserSelect
  - **Fix**: Check if field is `phone` or `phoneNumber` in schema, update code accordingly

- [ ] **Error 14**: `src/app/api/users/me/route.ts:85:11`
  - **Issue**: Property `phoneNumber` does not exist in UserUpdateInput
  - **Fix**: Same as Error 13

- [ ] **Error 15**: `src/app/api/users/me/route.ts:95:11`
  - **Issue**: Property `phoneNumber` does not exist in UserSelect
  - **Fix**: Same as Error 13

- [ ] **Error 16**: `src/app/api/users/[id]/route.ts:43:11`
  - **Issue**: Property `phone` does not exist in UserSelect
  - **Fix**: Verify actual field name in schema (phone vs phoneNumber)

### AuditLog Model Field Issues

- [ ] **Error 17**: `src/app/api/admin/documents/route.ts:139:9`
  - **Issue**: Property `details` does not exist in AuditLogCreateInput
  - **Fix**: Replace `details:` with `metadata:` (new format)
  - **Code Change**:
    ```typescript
    // Before:
    details: { documentId: newDoc.id }
    
    // After:
    metadata: { documentId: newDoc.id }
    ```

- [ ] **Error 18**: `src/app/api/admin/users/[id]/activity/route.ts:51:11`
  - **Issue**: Property `entity` does not exist in AuditLogSelect
  - **Fix**: Replace `entity: true` with `resource: true`

- [ ] **Error 19**: `src/app/api/users/me/activity/route.ts:70:11`
  - **Issue**: Property `entity` does not exist in AuditLogSelect
  - **Fix**: Replace `entity: true` with `resource: true`

### Booking Model Field Issues

- [ ] **Error 20**: `src/app/api/users/[id]/route.ts:215:53`
  - **Issue**: Property `userId` does not exist in StringNullableFilter<"Booking">
  - **Fix**: Check actual Booking model - likely should use `clientId` or `assignedTeamMemberId`
  - **Code Change**:
    ```typescript
    // Before:
    where: { userId: id }
    
    // After:
    where: { clientId: id }  // or assignedTeamMemberId
    ```

- [ ] **Error 21**: `src/app/api/users/[id]/route.ts:216:59`
  - **Issue**: Property `userId` does not exist in StringNullableFilter<"Booking">
  - **Fix**: Same as Error 20

### Task Status Field Issue

- [ ] **Error 22**: `src/app/api/tasks/[id]/route.ts:145:19`
  - **Issue**: Property `status` does not exist on update data type
  - **Fix**: Verify TaskStatus enum is properly imported and used

- [ ] **Error 23**: `src/app/api/tasks/[id]/route.ts:145:37`
  - **Issue**: Property `status` does not exist (same as above)
  - **Fix**: Same as Error 22

- [ ] **Error 24**: `src/app/api/tasks/[id]/route.ts:146:64`
  - **Issue**: Property `status` does not exist (same as above)
  - **Fix**: Same as Error 22

### ProcessDefinition Model Issue

- [ ] **Error 25**: `src/app/api/admin/bpm/processes/route.ts:72:61`
  - **Issue**: Property `id` is optional but required in ProcessDefinition
  - **Fix**: Make `id` required in the object being passed
  - **Code Change**:
    ```typescript
    // Add id generation:
    const processData = {
      id: generateId(), // or use nanoid()
      name: body.name,
      // ... rest of fields
    }
    ```

---

## Category 2: Missing Prisma Models (7 errors)

**Root Cause**: Code references Prisma models that don't exist in schema  
**Solution**: Create missing models in schema.prisma

### DocumentSignatureRequest Model

- [ ] **Error 26**: `src/app/api/documents/[id]/sign/route.ts:89:43`
  - **Issue**: Property `documentSignatureRequest` does not exist on PrismaClient
  - **Fix**: Create DocumentSignatureRequest model in schema.prisma

- [ ] **Error 27**: `src/app/api/documents/[id]/sign/route.ts:175:37`
  - **Issue**: Same as Error 26

- [ ] **Error 28**: `src/app/api/documents/[id]/sign/route.ts:201:18`
  - **Issue**: Same as Error 26

- [ ] **Error 29**: `src/app/api/documents/[id]/sign/route.ts:280:44`
  - **Issue**: Same as Error 26

### DocumentSignature Model

- [ ] **Error 30**: `src/app/api/documents/[id]/sign/route.ts:188:36`
  - **Issue**: Property `documentSignature` does not exist on PrismaClient
  - **Fix**: Create DocumentSignature model in schema.prisma

- [ ] **Error 31**: `src/app/api/documents/[id]/sign/route.ts:285:37`
  - **Issue**: Same as Error 30

### AnalysisJob Model

- [ ] **Error 32**: `src/app/api/documents/[id]/analyze/route.ts:65:38`
  - **Issue**: Property `analysisJob` does not exist on PrismaClient
  - **Fix**: Create AnalysisJob model in schema.prisma

**Suggested Schema Addition**:
```prisma
model DocumentSignatureRequest {
  id          String   @id @default(cuid())
  documentId  String
  document    Document @relation(fields: [documentId], references: [id])
  requesterId String
  requester   User     @relation(fields: [requesterId], references: [id])
  signerId    String
  signer      User     @relation(fields: [signerId], references: [id])
  status      SignatureRequestStatus @default(PENDING)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
}

model DocumentSignature {
  id                String   @id @default(cuid())
  documentId        String
  document          Document @relation(fields: [documentId], references: [id])
  signerId          String
  signer            User     @relation(fields: [signerId], references: [id])
  signatureData     String   // Base64 or signature path
  signedAt          DateTime @default(now())
  ipAddress         String?
  tenantId          String
  tenant            Tenant   @relation(fields: [tenantId], references: [id])
}

model AnalysisJob {
  id          String   @id @default(cuid())
  documentId  String
  document    Document @relation(fields: [documentId], references: [id])
  status      AnalysisStatus @default(PENDING)
  results     Json?
  startedAt   DateTime @default(now())
  completedAt DateTime?
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
}

enum SignatureRequestStatus {
  PENDING
  SIGNED
  REJECTED
  EXPIRED
}

enum AnalysisStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}
```

---

## Category 3: Spread Type Errors (5 errors)

**Root Cause**: Attempting to spread unknown/any types without type checking  
**Solution**: Add type guards before spreading

### Fix Pattern:
```typescript
// BEFORE:
const merged = { ...existingMetadata, newField: true }

// AFTER:
const merged = typeof existingMetadata === 'object' && existingMetadata !== null
  ? { ...(existingMetadata as Record<string, any>), newField: true }
  : { newField: true }
```

- [ ] **Error 33**: `src/app/admin/settings/analytics/page.tsx:33:106`
  - **Issue**: Spread types may only be created from object types
  - **Fix**: Add type guard before spreading

- [ ] **Error 34**: `src/app/admin/settings/communication/page.tsx:38:9`
  - **Issue**: Spread types may only be created from object types
  - **Fix**: Add type guard before spreading

- [ ] **Error 35**: `src/app/api/documents/[id]/route.ts:172:11`
  - **Issue**: Spread types may only be created from object types
  - **Fix**: Add type guard before spreading

- [ ] **Error 36**: `src/app/api/documents/[id]/route.ts:288:13`
  - **Issue**: Spread types may only be created from object types
  - **Fix**: Add type guard before spreading

- [ ] **Error 37**: `src/app/api/users/me/settings/route.ts:94:9`
  - **Issue**: Spread types may only be created from object types
  - **Fix**: Add type guard before spreading

---

## Category 4: Zod Validation Errors (5 errors)

**Root Cause**: Throwing ZodIssue[] array instead of string message  
**Solution**: Convert ZodIssue[] to string

### Fix Pattern:
```typescript
// BEFORE:
throw new ApiError(validationResult.error.issues)

// AFTER:
throw new ApiError(
  validationResult.error.issues.map(i => i.message).join(', ')
)
```

- [ ] **Error 38**: `src/app/api/admin/notifications/route.ts:146:33`
  - **File**: `src/app/api/admin/notifications/route.ts`
  - **Line**: 146
  - **Fix**: Convert ZodIssue[] to string message

- [ ] **Error 39**: `src/app/api/approvals/[id]/route.ts:130:33`
  - **File**: `src/app/api/approvals/[id]/route.ts`
  - **Line**: 130
  - **Fix**: Convert ZodIssue[] to string message

- [ ] **Error 40**: `src/app/api/approvals/route.ts:130:33`
  - **File**: `src/app/api/approvals/route.ts`
  - **Line**: 130
  - **Fix**: Convert ZodIssue[] to string message

- [ ] **Error 41**: `src/app/api/notifications/preferences/route.ts:97:33`
  - **File**: `src/app/api/notifications/preferences/route.ts`
  - **Line**: 97
  - **Fix**: Convert ZodIssue[] to string message

- [ ] **Error 42**: `src/app/api/notifications/route.ts:108:33`
  - **File**: `src/app/api/notifications/route.ts`
  - **Line**: 108
  - **Fix**: Convert ZodIssue[] to string message

---

## Category 5: Missing Exports/Imports (10 errors)

**Root Cause**: Modules importing functions/components that aren't exported

### requireTenantContext Export Issue

- [ ] **Error 43**: `src/app/api/tasks/[id]/comments/[commentId]/route.ts:2:29`
  - **Issue**: Module '@/lib/api-wrapper' has no exported member 'requireTenantContext'
  - **Fix**: Import from correct location: `@/lib/tenant-utils`
  - **Code Change**:
    ```typescript
    // BEFORE:
    import { withTenantContext, requireTenantContext } from '@/lib/api-wrapper'
    
    // AFTER:
    import { withTenantContext } from '@/lib/api-wrapper'
    import { requireTenantContext } from '@/lib/tenant-utils'
    ```

### web-vitals Module Issues

- [ ] **Error 44**: `src/lib/frontend-optimization/web-vitals-monitor.ts:3:10`
  - **Issue**: Module 'web-vitals' has no exported member 'getCLS'
  - **Fix**: Update to web-vitals v3 API: `onCLS`, `onFID`, etc.
  - **Code Change**:
    ```typescript
    // BEFORE:
    import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'
    
    // AFTER:
    import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals'
    ```

- [ ] **Error 45**: `src/lib/frontend-optimization/web-vitals-monitor.ts:3:18`
  - **Issue**: Module 'web-vitals' has no exported member 'getFID'
  - **Fix**: Same as Error 44

- [ ] **Error 46**: `src/lib/frontend-optimization/web-vitals-monitor.ts:3:26`
  - **Issue**: Module 'web-vitals' has no exported member 'getFCP'
  - **Fix**: Same as Error 44

- [ ] **Error 47**: `src/lib/frontend-optimization/web-vitals-monitor.ts:3:34`
  - **Issue**: Module 'web-vitals' has no exported member 'getLCP'
  - **Fix**: Same as Error 44

- [ ] **Error 48**: `src/lib/frontend-optimization/web-vitals-monitor.ts:3:42`
  - **Issue**: Module 'web-vitals' has no exported member 'getTTFB'
  - **Fix**: Same as Error 44

### Component Export Issues

- [ ] **Error 49**: `src/lib/frontend/code-splitting.tsx:48:68`
  - **Issue**: Property 'BookingWizard' does not exist
  - **Fix**: Ensure BookingWizard is exported as default from component
  - **Code Change in BookingWizard.tsx**:
    ```typescript
    export default BookingWizard
    ```

- [ ] **Error 50**: `src/lib/frontend/code-splitting.tsx:57:20`
  - **Issue**: Property 'SharedDataTable' does not exist
  - **Fix**: Ensure SharedDataTable is exported as default
  - **Code Change in SharedDataTable.tsx**:
    ```typescript
    export default SharedDataTable
    ```

---

## Category 6: Type Safety Issues (8 errors)

### Error to ReactNode Conversion

- [ ] **Error 51**: `src/app/portal/tasks/page.tsx:359:41`
  - **Issue**: Type 'Error' is not assignable to type 'ReactNode'
  - **Fix**: Convert error to string
  - **Code Change**:
    ```typescript
    // BEFORE:
    {error}
    
    // AFTER:
    {error instanceof Error ? error.message : String(error)}
    ```

### Unknown Type Error Handling

- [ ] **Error 52**: `src/app/admin/settings/localization/hooks/useFetchWithTimeout.ts:46:46`
  - **Issue**: Property 'error' does not exist on type 'unknown'
  - **Fix**: Add type guard
  - **Code Change**:
    ```typescript
    // BEFORE:
    throw new Error(error.message)
    
    // AFTER:
    throw new Error(error instanceof Error ? error.message : 'Unknown error')
    ```

- [ ] **Error 53**: `src/app/admin/settings/localization/hooks/useFetchWithTimeout.ts:46:63`
  - **Issue**: Property 'message' does not exist on type 'unknown'
  - **Fix**: Same as Error 52

### Component Props Type Issues

- [ ] **Error 54**: `src/components/shared/cards/TaskDetailCard.tsx:247:19`
  - **Issue**: Property 'taskId' does not exist in TaskCommentCardProps
  - **Fix**: Add `taskId: string` to TaskCommentCardProps interface
  - **Code Change**:
    ```typescript
    interface TaskCommentCardProps {
      comment: TaskComment
      taskId: string  // Add this
      onDelete: () => void
      onEdit: () => void
    }
    ```

### Service API Response Issues

- [ ] **Error 55**: `src/app/api/services/route.ts:77:31`
  - **Issue**: Property 'data' does not exist on response type
  - **Fix**: Use correct response structure (services, not data.services)

- [ ] **Error 56**: `src/app/api/services/route.ts:78:14`
  - **Issue**: Property 'data' does not exist (same as above)

- [ ] **Error 57**: `src/app/api/services/route.ts:78:28`
  - **Issue**: Property 'data' does not exist (same as above)

- [ ] **Error 58**: `src/app/api/services/route.ts:124:31`
  - **Issue**: Property 'services' does not exist on NextResponse
  - **Fix**: Parse response body correctly

---

## Category 7: Variable Scope Issues (3 errors)

**Root Cause**: Variable 'user' referenced but not in scope

- [ ] **Error 59**: `src/app/api/admin/users/[id]/route.ts:167:17`
  - **Issue**: Cannot find name 'user'
  - **Fix**: Get user from context: `const { userId } = requireTenantContext()`

- [ ] **Error 60**: `src/app/api/admin/users/route.ts:158:17`
  - **Issue**: Cannot find name 'user'
  - **Fix**: Same as Error 59

- [ ] **Error 61**: `src/app/api/users/[id]/route.ts:43:18`
  - **Issue**: Cannot find name 'user'
  - **Fix**: Same as Error 59

---

## Category 8: Miscellaneous (5 errors)

### Task Creation Type Issues

- [ ] **Error 62**: `src/app/api/admin/tasks/route.ts:171:9`
  - **Issue**: Type incompatibility - tenantId is type 'never'
  - **Fix**: Ensure tenantId is properly typed as string in TaskCreateInput

- [ ] **Error 63**: `src/app/api/tasks/route.ts:158:9`
  - **Issue**: Same as Error 62
  - **Fix**: Same as Error 62

### Function Argument Count

- [ ] **Error 64**: `src/app/api/services/route.ts:168:33`
  - **Issue**: Expected 3 arguments, but got 2
  - **Fix**: Check function signature and add missing argument

### Dynamic Import Type Issues

- [ ] **Error 65**: `src/lib/frontend-optimization/dynamic-imports.tsx:100:33`
  - **Issue**: Promise<Element> incompatible with synchronous Element
  - **Fix**: Update loader return type signature

### Web Vitals Rating Issue

- [ ] **Error 66**: `src/lib/frontend-optimization/web-vitals-monitor.ts:88:7`
  - **Issue**: Type 'string' not assignable to metric enum
  - **Fix**: Add proper type assertion for metric name

- [ ] **Error 67**: `src/lib/frontend-optimization/web-vitals-monitor.ts:90:7`
  - **Issue**: Type '"fair"' not assignable (should be "needs-improvement")
  - **Fix**: Replace 'fair' with 'needs-improvement'
  - **Code Change**:
    ```typescript
    // BEFORE:
    rating = 'fair'
    
    // AFTER:
    rating = 'needs-improvement'
    ```

### Template Permission Issue

- [ ] **Error 68**: `templates/component.template.tsx:111:16`
  - **Issue**: Property 'can' does not exist on permission type
  - **Fix**: Update permission hook to include 'can' method or remove usage

---

## 🎯 Resolution Strategy

### Phase 1: Critical Schema Updates (Priority 🔴)
**Time**: 1-2 hours

1. Add missing fields to Task model (tags, estimatedHours, clientId, bookingId)
2. Add missing fields to Document model (url)
3. Create missing models (DocumentSignatureRequest, DocumentSignature, AnalysisJob)
4. Run `pnpm prisma generate` after schema changes

### Phase 2: Quick Code Fixes (Priority 🟡)
**Time**: 1-2 hours

1. Fix all Zod validation errors (5 files)
2. Fix import paths (requireTenantContext, web-vitals)
3. Fix spread type errors (5 files)
4. Fix variable scope issues (3 files)

### Phase 3: Type Safety & Cleanup (Priority 🟢)
**Time**: 1-2 hours

1. Fix component props issues
2. Fix service API response handling
3. Fix web-vitals API updates
4. Fix remaining type safety issues

### Phase 4: Validation
**Time**: 30 minutes

1. Run `pnpm exec tsc --noEmit`
2. Verify 0 errors
3. Test build: `pnpm build`

---

## 📝 Progress Tracking

- [ ] Phase 1 Complete (32 errors)
- [ ] Phase 2 Complete (18 errors)
- [ ] Phase 3 Complete (13 errors)
- [ ] Phase 4 Complete (5 errors)
- [ ] All errors resolved (68/68)
- [ ] Build successful
- [ ] Tests passing

---

## 🔧 Quick Commands

### Type Check Specific File
```bash
pnpm exec tsc --noEmit [file-path]
```

### Count Remaining Errors
```bash
pnpm exec tsc --noEmit 2>&1 | grep "error TS" | wc -l
```

### Run Full Build
```bash
pnpm build
```

### Prisma Commands
```bash
# After schema changes:
pnpm prisma format
pnpm prisma generate
pnpm prisma migrate dev --name add_missing_fields
```

---

**Next Action**: Start with Phase 1 - Update Prisma schema with missing fields
