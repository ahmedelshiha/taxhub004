import { z } from 'zod'

/**
 * Zod schema template for data validation
 * 
 * This template shows how to create validation schemas for:
 * - Create operations (POST requests)
 * - Update operations (PUT/PATCH requests)
 * - Filter/Query operations (GET requests)
 * - API responses
 * 
 * Features:
 * - Type inference with z.infer
 * - Custom error messages
 * - Refinements and transformations
 * - Optional and default fields
 * - Enum and union types
 */

// ============================================================================
// ENUMS AND CONSTANTS
// ============================================================================

export const ItemStatusEnum = z.enum([
  'ACTIVE',
  'INACTIVE',
  'ARCHIVED',
  'PENDING',
])
export type ItemStatus = z.infer<typeof ItemStatusEnum>

export const PriorityEnum = z.enum([
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT',
])
export type Priority = z.infer<typeof PriorityEnum>

// ============================================================================
// BASE SCHEMA - Shared fields
// ============================================================================

export const ItemBaseSchema = z.object({
  id: z.string().cuid().describe('Unique identifier'),
  
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be less than 255 characters')
    .trim()
    .describe('Item name'),

  description: z
    .string()
    .max(5000, 'Description must be less than 5000 characters')
    .optional()
    .describe('Item description'),

  status: ItemStatusEnum
    .default('ACTIVE')
    .describe('Item status'),

  priority: PriorityEnum
    .optional()
    .describe('Item priority level'),

  active: z
    .boolean()
    .default(true)
    .describe('Whether item is active'),

  createdAt: z
    .date()
    .describe('Creation timestamp'),

  updatedAt: z
    .date()
    .describe('Last update timestamp'),

  tenantId: z
    .string()
    .cuid()
    .describe('Tenant ID for multi-tenancy'),
})

// ============================================================================
// CREATE SCHEMA - For POST requests
// ============================================================================

export const ItemCreateSchema = ItemBaseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
}).extend({
  // Add or override fields specific to creation
  // Example: Add required field only on create
  // assigneeId: z.string().cuid('Assignee is required'),
}).refine(
  // Custom validation example
  // (data) => data.priority !== 'URGENT' || data.status === 'ACTIVE',
  // { message: 'Urgent items must be active' }
)

export type ItemCreate = z.infer<typeof ItemCreateSchema>

// ============================================================================
// UPDATE SCHEMA - For PUT/PATCH requests
// ============================================================================

export const ItemUpdateSchema = ItemBaseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
}).partial() // All fields optional on update
.refine(
  // Custom validation: ensure at least one field is being updated
  // (data) => Object.values(data).some(v => v !== undefined),
  // { message: 'At least one field must be updated' }
)

export type ItemUpdate = z.infer<typeof ItemUpdateSchema>

// ============================================================================
// FILTER SCHEMA - For GET request query parameters
// ============================================================================

export const ItemFilterSchema = z.object({
  // Pagination
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(50)
    .describe('Items per page'),

  offset: z
    .number()
    .int()
    .min(0)
    .default(0)
    .describe('Number of items to skip'),

  // Sorting
  sortBy: z
    .enum(['name', 'createdAt', 'updatedAt', 'status', 'priority'])
    .default('createdAt')
    .optional()
    .describe('Field to sort by'),

  sortOrder: z
    .enum(['asc', 'desc'])
    .default('desc')
    .optional()
    .describe('Sort direction'),

  // Filtering
  search: z
    .string()
    .max(255)
    .optional()
    .describe('Search term for name/description'),

  status: ItemStatusEnum
    .optional()
    .describe('Filter by status'),

  priority: PriorityEnum
    .optional()
    .describe('Filter by priority'),

  active: z
    .boolean()
    .optional()
    .describe('Filter by active status'),

  // Date range filtering
  createdFrom: z
    .date()
    .optional()
    .describe('Filter items created after this date'),

  createdTo: z
    .date()
    .optional()
    .describe('Filter items created before this date'),
})
.refine(
  // Ensure date range is valid
  // (data) => !data.createdFrom || !data.createdTo || data.createdFrom < data.createdTo,
  // { message: 'Start date must be before end date' }
)

export type ItemFilter = z.infer<typeof ItemFilterSchema>

// ============================================================================
// DETAIL RESPONSE SCHEMA - For single item response
// ============================================================================

export const ItemDetailSchema = ItemBaseSchema.extend({
  // Add computed or included fields
  // Example: Add related data
  // relatedItems: z.array(ItemBaseSchema).optional(),
  // assignee: z.object({
  //   id: z.string(),
  //   name: z.string(),
  //   email: z.string().email(),
  // }).optional(),
})

export type ItemDetail = z.infer<typeof ItemDetailSchema>

// ============================================================================
// LIST RESPONSE SCHEMA - For paginated response
// ============================================================================

export const ItemListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(ItemDetailSchema),
  meta: z.object({
    total: z.number().int().nonnegative(),
    limit: z.number().int().positive(),
    offset: z.number().int().nonnegative(),
    hasMore: z.boolean(),
  }),
})

export type ItemListResponse = z.infer<typeof ItemListResponseSchema>

// ============================================================================
// SINGLE ITEM RESPONSE SCHEMA
// ============================================================================

export const ItemResponseSchema = z.object({
  success: z.boolean(),
  data: ItemDetailSchema,
})

export type ItemResponse = z.infer<typeof ItemResponseSchema>

// ============================================================================
// ERROR RESPONSE SCHEMA
// ============================================================================

export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(z.object({
      field: z.string().optional(),
      message: z.string(),
    })).optional(),
  }),
})

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate create data
 * @example
 * ```ts
 * const validated = validateItemCreate(data)
 * ```
 */
export function validateItemCreate(data: unknown): ItemCreate {
  return ItemCreateSchema.parse(data)
}

/**
 * Validate update data
 * @example
 * ```ts
 * const validated = validateItemUpdate(data)
 * ```
 */
export function validateItemUpdate(data: unknown): ItemUpdate {
  return ItemUpdateSchema.parse(data)
}

/**
 * Validate filter parameters
 * @example
 * ```ts
 * const filters = validateItemFilters(queryParams)
 * ```
 */
export function validateItemFilters(data: unknown): ItemFilter {
  return ItemFilterSchema.parse(data)
}

/**
 * Safe validation with error handling
 * @example
 * ```ts
 * const result = safeValidate(ItemCreateSchema, data)
 * if (result.success) {
 *   // use result.data
 * } else {
 *   // handle result.error
 * }
 * ```
 */
export function safeValidate<T>(schema: z.ZodSchema<T>, data: unknown) {
  return schema.safeParse(data)
}

// ============================================================================
// EXPORTS SUMMARY
// ============================================================================

/**
 * Export all schemas and types for shared access
 * 
 * Usage:
 * ```ts
 * import { 
 *   ItemCreateSchema, 
 *   ItemUpdateSchema,
 *   ItemFilterSchema,
 *   type ItemCreate,
 *   type ItemUpdate,
 *   type ItemFilter,
 * } from '@/schemas/shared/items'
 * ```
 */

export {
  ItemCreateSchema,
  ItemUpdateSchema,
  ItemFilterSchema,
  ItemDetailSchema,
  ItemListResponseSchema,
  ItemResponseSchema,
  ErrorResponseSchema,
}

export type {
  ItemCreate,
  ItemUpdate,
  ItemFilter,
  ItemDetail,
  ItemListResponse,
  ItemResponse,
  ErrorResponse,
}
