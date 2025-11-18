/**
 * Shared Task Entity Type Definitions
 * Used by Admin for full management and Portal for assigned task viewing/updating
 * 
 * [PORTAL] = visible to portal users
 * [ADMIN] = visible only to admins
 */

/**
 * Task status enumeration
 */
export enum TaskStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  BLOCKED = 'BLOCKED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD',
}

/**
 * Task priority enumeration
 */
export enum TaskPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL',
}

/**
 * Core Task entity
 */
export interface Task {
  // Core identification
  id: string; // [PORTAL] [ADMIN]
  tenantId: string; // [ADMIN]
  
  // Task information
  title: string; // [PORTAL] [ADMIN]
  description?: string | null; // [PORTAL] [ADMIN]
  
  // Status and priority
  status: TaskStatus; // [PORTAL] [ADMIN]
  priority: TaskPriority; // [ADMIN]
  
  // Assignment
  assigneeId?: string | null; // [PORTAL] [ADMIN]
  createdBy: string; // [ADMIN]
  
  // Category and tagging (admin-only)
  category?: string | null; // [ADMIN]
  tags?: string[]; // [ADMIN]
  relatedEntityType?: string | null; // [ADMIN] - e.g., "booking", "service_request", "invoice"
  relatedEntityId?: string | null; // [ADMIN] - Reference to the related entity
  
  // Scheduling
  dueDate?: string | null; // ISO-8601 date [PORTAL] [ADMIN]
  startDate?: string | null; // ISO-8601 date [ADMIN]
  estimatedHours?: number | null; // [ADMIN]
  actualHours?: number | null; // [ADMIN]
  
  // Progress tracking
  completionPercentage?: number; // 0-100 [ADMIN]
  
  // Notes and discussion
  notes?: string | null; // [PORTAL] [ADMIN]
  internalNotes?: string | null; // [ADMIN]
  
  // Workflow and approval (admin-only)
  requiresApproval?: boolean; // [ADMIN]
  approverIds?: string[]; // [ADMIN]
  approvedBy?: string | null; // [ADMIN]
  approvedAt?: string | null; // ISO-8601 datetime [ADMIN]
  
  // Timeline
  createdAt: string; // ISO-8601 datetime
  updatedAt: string; // ISO-8601 datetime
  startedAt?: string | null; // ISO-8601 datetime [ADMIN]
  completedAt?: string | null; // ISO-8601 datetime [ADMIN]
  
  // Metadata
  metadata?: Record<string, unknown> | null; // [ADMIN]
  
  // Relations (optional)
  assignee?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  
  creator?: {
    id: string;
    name: string | null;
    email: string;
  };
  
  comments?: TaskComment[];
}

/**
 * Task comment
 */
export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  isInternal?: boolean; // [ADMIN] - Not visible to portal users
  createdAt: string;
  updatedAt: string;
  
  author?: {
    id: string;
    name: string | null;
    email: string;
  };
}

/**
 * Task form data for create/update
 */
export interface TaskFormData {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string | null;
  category?: string | null;
  tags?: string[];
  dueDate?: string | null;
  startDate?: string | null;
  estimatedHours?: number | null;
  notes?: string | null;
  internalNotes?: string | null;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
}

/**
 * Task filters for list queries
 */
export interface TaskFilters {
  status?: TaskStatus | 'all';
  priority?: TaskPriority | 'all';
  assigneeId?: string;
  createdBy?: string;
  category?: string;
  tags?: string[];
  search?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

/**
 * Task list request parameters
 */
export interface TaskListParams extends TaskFilters {
  limit?: number;
  offset?: number;
  sortBy?: 'dueDate' | 'priority' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Portal-safe task view (excludes admin-only fields)
 */
export type TaskPortalView = Omit<
  Task,
  | 'priority'
  | 'createdBy'
  | 'category'
  | 'tags'
  | 'relatedEntityType'
  | 'relatedEntityId'
  | 'startDate'
  | 'estimatedHours'
  | 'actualHours'
  | 'completionPercentage'
  | 'internalNotes'
  | 'requiresApproval'
  | 'approverIds'
  | 'approvedBy'
  | 'approvedAt'
  | 'startedAt'
  | 'metadata'
>;

/**
 * Task list API response
 */
export interface TaskListResponse {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Task statistics (admin-only)
 */
export interface TaskStats {
  total: number;
  open: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  overdue: number;
  byPriority: Record<string, number>;
  byStatus: Record<string, number>;
  averageCompletionTime: number; // in hours
  completionRate: number; // percentage
}

/**
 * Task status update request
 */
export interface TaskStatusUpdateRequest {
  taskId: string;
  status: TaskStatus;
  completionPercentage?: number;
  notes?: string;
}

/**
 * Task template for bulk task creation
 */
export interface TaskTemplate {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  priority: TaskPriority;
  estimatedHours?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Task board view (admin-only)
 */
export interface TaskBoardColumn {
  status: TaskStatus;
  tasks: Task[];
  count: number;
}

/**
 * Task Gantt chart data (admin-only)
 */
export interface TaskGanttItem {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  progress: number;
  assigneeId?: string;
  dependencies?: string[];
}

/**
 * Task kanban card data
 */
export interface TaskKanbanCard {
  id: string;
  title: string;
  priority: TaskPriority;
  assigneeName?: string;
  dueDate?: string;
  labels: string[];
  completionPercentage?: number;
}
