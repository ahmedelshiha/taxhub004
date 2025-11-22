-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "PriorityStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'BLOCKED', 'DONE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DECOMMISSIONED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'UNPAID', 'PAID', 'VOID');

-- CreateEnum
CREATE TYPE "ExpertiseLevel" AS ENUM ('junior', 'mid', 'senior', 'lead', 'expert');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'BUSY', 'OFFLINE', 'ON_LEAVE');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'RETIRED');

-- CreateEnum
CREATE TYPE "RequestPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DefaultRole" AS ENUM ('TEAM_MEMBER', 'TEAM_LEAD', 'ADMIN');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PostPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WorkflowStatus" AS ENUM ('DRAFT', 'PENDING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StepStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "WorkflowType" AS ENUM ('ONBOARDING', 'OFFBOARDING', 'ROLE_CHANGE');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAID', 'FAILED', 'REFUNDED', 'PARTIAL');

-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('DRAFT', 'OPEN', 'IN_PROGRESS', 'ON_HOLD', 'BLOCKED', 'APPROVAL_PENDING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BookingType" AS ENUM ('STANDARD', 'RECURRING', 'EMERGENCY', 'CONSULTATION');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'TEAM_MEMBER', 'STAFF', 'TEAM_LEAD', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "BulkOperationType" AS ENUM ('ROLE_CHANGE', 'STATUS_UPDATE', 'PERMISSION_GRANT', 'PERMISSION_REVOKE', 'SEND_EMAIL', 'IMPORT_CSV', 'CUSTOM');

-- CreateEnum
CREATE TYPE "BulkOperationStatus" AS ENUM ('DRAFT', 'READY', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED', 'PAUSED');

-- CreateEnum
CREATE TYPE "PartyType" AS ENUM ('VENDOR', 'CUSTOMER', 'EMPLOYEE', 'PARTNER', 'INTERNAL');

-- CreateEnum
CREATE TYPE "PartyStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MERGED', 'DELETED');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('GOOD', 'SERVICE', 'BUNDLE');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DISCONTINUED', 'MERGED');

-- CreateEnum
CREATE TYPE "TaxType" AS ENUM ('VAT', 'INCOME_TAX', 'WITHHOLDING_TAX', 'ZAKAT', 'CORPORATE_TAX', 'STAMP_DUTY', 'OTHER');

-- CreateEnum
CREATE TYPE "TaxCodeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUPERSEDED', 'MERGED');

-- CreateEnum
CREATE TYPE "MergeRecordType" AS ENUM ('PARTY', 'PRODUCT', 'TAX_CODE');

-- CreateEnum
CREATE TYPE "MergeStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'ROLLED_BACK');

-- CreateEnum
CREATE TYPE "SurvivorshipStrategy" AS ENUM ('MANUAL', 'AUTOMATIC', 'RULE_BASED');

-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PAID');

-- CreateEnum
CREATE TYPE "OcrStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "SignatureRequestStatus" AS ENUM ('PENDING', 'SIGNED', 'REJECTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ApprovalItemType" AS ENUM ('BILL', 'EXPENSE', 'DOCUMENT', 'INVOICE', 'SERVICE_REQUEST', 'ENTITY', 'USER', 'OTHER');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'DELEGATED', 'ESCALATED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ApprovalPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "languages" (
    "code" VARCHAR(10) NOT NULL DEFAULT 'en',
    "name" VARCHAR(100) NOT NULL,
    "nativeName" VARCHAR(100) NOT NULL,
    "direction" VARCHAR(3) NOT NULL DEFAULT 'ltr',
    "flag" VARCHAR(5),
    "bcp47Locale" VARCHAR(10) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sessionVersion" INTEGER NOT NULL DEFAULT 0,
    "employeeId" TEXT,
    "department" TEXT,
    "position" TEXT,
    "skills" TEXT[],
    "expertiseLevel" "ExpertiseLevel",
    "hourlyRate" DECIMAL(65,30),
    "availabilityStatus" "AvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
    "maxConcurrentProjects" INTEGER DEFAULT 3,
    "hireDate" TIMESTAMP(3),
    "managerId" TEXT,
    "tier" TEXT,
    "workingHours" JSONB,
    "bookingBuffer" INTEGER,
    "autoAssign" BOOLEAN,
    "certifications" TEXT[],
    "experienceYears" INTEGER,
    "isActive" BOOLEAN DEFAULT true,
    "preferences" JSONB,
    "bio" TEXT,
    "isAdmin" BOOLEAN DEFAULT false,
    "lastLogin" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "acceptedBy" TEXT,
    "entityIds" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organization" TEXT,
    "phoneNumber" TEXT,
    "phoneNumberVerified" TIMESTAMP(3),
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "lastLoginIp" TEXT,
    "loginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockoutUntil" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bookingEmailCancellation" BOOLEAN DEFAULT true,
    "bookingEmailConfirm" BOOLEAN DEFAULT true,
    "bookingEmailReminder" BOOLEAN DEFAULT true,
    "bookingEmailReschedule" BOOLEAN DEFAULT true,
    "bookingSmsConfirmation" BOOLEAN DEFAULT false,
    "bookingSmsReminder" BOOLEAN DEFAULT false,
    "preferredLanguage" TEXT DEFAULT 'en',
    "reminderHours" INTEGER[] DEFAULT ARRAY[24, 2]::INTEGER[],
    "timezone" TEXT DEFAULT 'UTC',

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "filter_presets" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "filters" JSONB NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "filter_presets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preset_shares" (
    "id" TEXT NOT NULL,
    "presetId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "sharedWithUserId" TEXT,
    "teamId" TEXT,
    "permissionLevel" TEXT NOT NULL DEFAULT 'viewer',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "preset_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preset_share_logs" (
    "id" TEXT NOT NULL,
    "presetId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventDetails" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "preset_share_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verificationtokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "translation_priorities" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "notes" TEXT,
    "assignedToUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "languageCode" VARCHAR(10),
    "tenantId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "PriorityStatus" NOT NULL DEFAULT 'OPEN',

    CONSTRAINT "translation_priorities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "primaryDomain" TEXT,
    "description" TEXT,
    "featureFlags" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_memberships" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "coverImage" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "tags" TEXT[],
    "readTime" INTEGER,
    "views" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "scheduledAt" TIMESTAMP(3),
    "priority" "PostPriority" NOT NULL DEFAULT 'MEDIUM',
    "category" TEXT,
    "reviewRequired" BOOLEAN NOT NULL DEFAULT false,
    "isCompliant" BOOLEAN NOT NULL DEFAULT true,
    "approvedBy" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "subscribed" BOOLEAN NOT NULL DEFAULT true,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "newsletter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_settings" (
    "id" TEXT NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT false,
    "emailFrom" TEXT,
    "webhookUrl" TEXT,
    "templates" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDesc" TEXT,
    "features" TEXT[],
    "price" DECIMAL(65,30),
    "duration" INTEGER,
    "category" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "serviceSettings" JSONB,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "basePrice" DECIMAL(65,30),
    "estimatedDurationHours" INTEGER,
    "requiredSkills" TEXT[],
    "status" "ServiceStatus" NOT NULL DEFAULT 'ACTIVE',
    "tenantId" TEXT NOT NULL,
    "bookingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "advanceBookingDays" INTEGER NOT NULL DEFAULT 30,
    "minAdvanceHours" INTEGER NOT NULL DEFAULT 24,
    "maxDailyBookings" INTEGER,
    "bufferTime" INTEGER NOT NULL DEFAULT 0,
    "businessHours" JSONB,
    "blackoutDates" TIMESTAMP(3)[],

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_views" (
    "id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "ip" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "notes" TEXT,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientPhone" TEXT,
    "adminNotes" TEXT,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assignedTeamMemberId" TEXT,
    "serviceRequestId" TEXT,
    "createdById" TEXT,
    "completedAt" TIMESTAMP(3),
    "amount" DECIMAL(65,30),
    "rating" INTEGER,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_submissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "source" TEXT,
    "responded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthThreshold" (
    "id" SERIAL NOT NULL,
    "responseTime" INTEGER NOT NULL DEFAULT 100,
    "errorRate" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "storageGrowth" DOUBLE PRECISION NOT NULL DEFAULT 20.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthThreshold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sidebar_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "collapsed" BOOLEAN NOT NULL DEFAULT false,
    "width" INTEGER NOT NULL DEFAULT 256,
    "mobileOpen" BOOLEAN NOT NULL DEFAULT false,
    "expandedGroups" TEXT[] DEFAULT ARRAY['dashboard', 'business']::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sidebar_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Currency" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT,
    "decimals" INTEGER NOT NULL DEFAULT 2,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" SERIAL NOT NULL,
    "base" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "source" TEXT,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ttlSeconds" INTEGER,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceOverride" (
    "id" SERIAL NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueAt" TIMESTAMP(3),
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TaskStatus" NOT NULL DEFAULT 'OPEN',
    "assigneeId" TEXT,
    "createdById" TEXT,
    "complianceRequired" BOOLEAN NOT NULL DEFAULT false,
    "complianceDeadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "estimatedHours" INTEGER,
    "clientId" TEXT,
    "bookingId" TEXT,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceRecord" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "riskScore" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskComment" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "authorId" TEXT,
    "parentId" TEXT,
    "content" TEXT NOT NULL,
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "defaultPriority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "defaultCategory" TEXT,
    "estimatedHours" INTEGER,
    "checklistItems" TEXT[],
    "requiredSkills" TEXT[],
    "defaultAssigneeRole" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceRequest" (
    "id" TEXT NOT NULL,
    "uuid" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "description" TEXT,
    "priority" "RequestPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "RequestStatus" NOT NULL DEFAULT 'DRAFT',
    "budgetMin" DECIMAL(65,30),
    "budgetMax" DECIMAL(65,30),
    "deadline" TIMESTAMP(3),
    "requirements" JSONB,
    "attachments" JSONB,
    "isBooking" BOOLEAN NOT NULL DEFAULT false,
    "scheduledAt" TIMESTAMP(3),
    "duration" INTEGER,
    "clientName" TEXT,
    "clientEmail" TEXT,
    "clientPhone" TEXT,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "bookingType" "BookingType",
    "recurringPattern" JSONB,
    "parentBookingId" TEXT,
    "assignedTeamMemberId" TEXT,
    "assignedAt" TIMESTAMP(3),
    "assignedBy" TEXT,
    "completedAt" TIMESTAMP(3),
    "clientApprovalAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,
    "paymentStatus" "PaymentStatus",
    "paymentProvider" TEXT,
    "paymentSessionId" TEXT,
    "paymentAmountCents" INTEGER,
    "paymentCurrency" TEXT,
    "paymentUpdatedAt" TIMESTAMP(3),
    "paymentAttempts" INTEGER DEFAULT 0,

    CONSTRAINT "ServiceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_tasks" (
    "id" TEXT NOT NULL,
    "serviceRequestId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "request_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "userId" TEXT,
    "title" TEXT,
    "role" "UserRole" DEFAULT 'TEAM_MEMBER',
    "department" TEXT,
    "specialties" TEXT[],
    "hourlyRate" DECIMAL(65,30),
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT DEFAULT 'active',
    "workingHours" JSONB,
    "timeZone" TEXT DEFAULT 'UTC',
    "maxConcurrentBookings" INTEGER NOT NULL DEFAULT 3,
    "bookingBuffer" INTEGER NOT NULL DEFAULT 15,
    "autoAssign" BOOLEAN NOT NULL DEFAULT true,
    "stats" JSONB,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_request_comments" (
    "id" TEXT NOT NULL,
    "serviceRequestId" TEXT NOT NULL,
    "authorId" TEXT,
    "content" TEXT NOT NULL,
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_request_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_permissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "grantedById" TEXT,
    "permission" TEXT NOT NULL,
    "scope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilitySlot" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "teamMemberId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "reason" TEXT,
    "maxBookings" INTEGER NOT NULL DEFAULT 1,
    "currentBookings" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AvailabilitySlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailConfirmation" BOOLEAN NOT NULL DEFAULT true,
    "emailReminder" BOOLEAN NOT NULL DEFAULT true,
    "emailReschedule" BOOLEAN NOT NULL DEFAULT true,
    "emailCancellation" BOOLEAN NOT NULL DEFAULT true,
    "smsReminder" BOOLEAN NOT NULL DEFAULT false,
    "smsConfirmation" BOOLEAN NOT NULL DEFAULT false,
    "reminderHours" INTEGER[] DEFAULT ARRAY[24, 2]::INTEGER[],
    "timeZone" TEXT NOT NULL DEFAULT 'UTC',
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledReminder" (
    "id" TEXT NOT NULL,
    "serviceRequestId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'EMAIL',
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "ScheduledReminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "key" TEXT,
    "url" TEXT,
    "name" TEXT,
    "size" INTEGER,
    "contentType" TEXT,
    "avStatus" TEXT,
    "avDetails" JSONB,
    "avScanAt" TIMESTAMP(3),
    "avThreatName" TEXT,
    "avScanTime" DOUBLE PRECISION,
    "provider" TEXT,
    "isStarred" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaderId" TEXT,
    "entityId" TEXT,
    "serviceRequestId" TEXT,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentVersion" (
    "id" TEXT NOT NULL,
    "attachmentId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "name" TEXT,
    "size" INTEGER,
    "contentType" TEXT,
    "key" TEXT,
    "url" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaderId" TEXT,
    "changeDescription" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentLink" (
    "id" TEXT NOT NULL,
    "attachmentId" TEXT NOT NULL,
    "linkedToType" TEXT NOT NULL,
    "linkedToId" TEXT NOT NULL,
    "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "linkedBy" TEXT,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "DocumentLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentAuditLog" (
    "id" TEXT NOT NULL,
    "attachmentId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "performedBy" TEXT,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "DocumentAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrder" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "WorkOrderStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "RequestPriority" NOT NULL DEFAULT 'MEDIUM',
    "code" TEXT,
    "clientId" TEXT,
    "serviceId" TEXT,
    "serviceRequestId" TEXT,
    "bookingId" TEXT,
    "assigneeId" TEXT,
    "dueAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "estimatedHours" INTEGER,
    "actualHours" INTEGER,
    "costCents" INTEGER,
    "currency" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "bookingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "requireApproval" BOOLEAN NOT NULL DEFAULT false,
    "allowCancellation" BOOLEAN NOT NULL DEFAULT true,
    "allowRescheduling" BOOLEAN NOT NULL DEFAULT true,
    "cancellationDeadlineHours" INTEGER NOT NULL DEFAULT 24,
    "rescheduleDeadlineHours" INTEGER NOT NULL DEFAULT 4,
    "paymentRequired" BOOLEAN NOT NULL DEFAULT false,
    "acceptCash" BOOLEAN NOT NULL DEFAULT true,
    "acceptCard" BOOLEAN NOT NULL DEFAULT true,
    "acceptBankTransfer" BOOLEAN NOT NULL DEFAULT false,
    "acceptWire" BOOLEAN NOT NULL DEFAULT false,
    "acceptCrypto" BOOLEAN NOT NULL DEFAULT false,
    "requireFullPayment" BOOLEAN NOT NULL DEFAULT false,
    "allowPartialPayment" BOOLEAN NOT NULL DEFAULT true,
    "depositPercentage" INTEGER NOT NULL DEFAULT 50,
    "enableServiceSelection" BOOLEAN NOT NULL DEFAULT true,
    "enableDateTimeSelection" BOOLEAN NOT NULL DEFAULT true,
    "enableCustomerDetails" BOOLEAN NOT NULL DEFAULT true,
    "enableAdditionalServices" BOOLEAN NOT NULL DEFAULT true,
    "enablePaymentStep" BOOLEAN NOT NULL DEFAULT false,
    "enableConfirmationStep" BOOLEAN NOT NULL DEFAULT true,
    "enableFileUpload" BOOLEAN NOT NULL DEFAULT false,
    "enableSpecialRequests" BOOLEAN NOT NULL DEFAULT true,
    "advanceBookingDays" INTEGER NOT NULL DEFAULT 365,
    "minAdvanceBookingHours" INTEGER NOT NULL DEFAULT 2,
    "maxBookingsPerDay" INTEGER NOT NULL DEFAULT 50,
    "maxBookingsPerCustomer" INTEGER NOT NULL DEFAULT 5,
    "bufferTimeBetweenBookings" INTEGER NOT NULL DEFAULT 15,
    "businessHours" JSONB,
    "blackoutDates" JSONB,
    "holidaySchedule" JSONB,
    "sendBookingConfirmation" BOOLEAN NOT NULL DEFAULT true,
    "sendReminders" BOOLEAN NOT NULL DEFAULT true,
    "reminderHours" JSONB,
    "notifyTeamMembers" BOOLEAN NOT NULL DEFAULT true,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "smsNotifications" BOOLEAN NOT NULL DEFAULT false,
    "requireLogin" BOOLEAN NOT NULL DEFAULT false,
    "allowGuestBooking" BOOLEAN NOT NULL DEFAULT true,
    "showPricing" BOOLEAN NOT NULL DEFAULT true,
    "showTeamMemberSelection" BOOLEAN NOT NULL DEFAULT false,
    "allowRecurringBookings" BOOLEAN NOT NULL DEFAULT false,
    "enableWaitlist" BOOLEAN NOT NULL DEFAULT false,
    "enableAutoAssignment" BOOLEAN NOT NULL DEFAULT false,
    "assignmentStrategy" TEXT NOT NULL DEFAULT 'ROUND_ROBIN',
    "considerWorkload" BOOLEAN NOT NULL DEFAULT true,
    "considerSpecialization" BOOLEAN NOT NULL DEFAULT true,
    "enableDynamicPricing" BOOLEAN NOT NULL DEFAULT false,
    "peakHoursSurcharge" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "weekendSurcharge" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "emergencyBookingSurcharge" DECIMAL(65,30) NOT NULL DEFAULT 0.5,
    "calendarSync" BOOLEAN NOT NULL DEFAULT false,
    "webhookUrl" TEXT,
    "apiAccessEnabled" BOOLEAN NOT NULL DEFAULT false,
    "automation" JSONB,
    "integrations" JSONB,
    "capacity" JSONB,
    "forms" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "booking_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_step_config" (
    "id" TEXT NOT NULL,
    "bookingSettingsId" TEXT NOT NULL,
    "stepName" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "validationRules" JSONB,
    "customFields" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_step_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_hours_config" (
    "id" TEXT NOT NULL,
    "bookingSettingsId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "isWorkingDay" BOOLEAN NOT NULL DEFAULT true,
    "startTime" TEXT,
    "endTime" TEXT,
    "breakStartTime" TEXT,
    "breakEndTime" TEXT,
    "maxBookingsPerHour" INTEGER NOT NULL DEFAULT 4,

    CONSTRAINT "business_hours_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_method_config" (
    "id" TEXT NOT NULL,
    "bookingSettingsId" TEXT NOT NULL,
    "methodType" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "processingFee" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "minAmount" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "maxAmount" DECIMAL(65,30),
    "gatewayConfig" JSONB,

    CONSTRAINT "payment_method_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" TEXT NOT NULL,
    "bookingSettingsId" TEXT NOT NULL,
    "templateType" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "variables" JSONB,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_payment_methods" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "paymentMethodId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "last4" TEXT,
    "brand" TEXT,
    "expiryMonth" INTEGER,
    "expiryYear" INTEGER,
    "fingerprint" TEXT,
    "billingDetails" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banking_connections" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityId" TEXT,
    "provider" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastSyncAt" TIMESTAMP(3),
    "lastSyncError" TEXT,
    "sessionToken" TEXT,
    "syncFrequency" TEXT NOT NULL DEFAULT 'DAILY',
    "credentials" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banking_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banking_transactions" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "externalId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "type" TEXT NOT NULL,
    "balance" DECIMAL(19,4),
    "reference" TEXT,
    "tags" TEXT[],
    "matched" BOOLEAN NOT NULL DEFAULT false,
    "matchedToId" TEXT,
    "matchedToType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banking_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "bookingId" TEXT,
    "clientId" TEXT,
    "number" TEXT,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'UNPAID',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "totalCents" INTEGER NOT NULL DEFAULT 0,
    "paidAt" TIMESTAMP(3),
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPriceCents" INTEGER NOT NULL DEFAULT 0,
    "totalCents" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "category" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "date" TIMESTAMP(3) NOT NULL,
    "attachmentId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "room" TEXT,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdempotencyKey" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "userId" TEXT,
    "tenantId" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RESERVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "IdempotencyKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "setting_change_diffs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "category" TEXT NOT NULL,
    "resource" TEXT,
    "before" JSONB,
    "after" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "setting_change_diffs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "settingKey" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_events" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "resource" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "tagline" TEXT,
    "description" TEXT,
    "industry" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "address" JSONB,
    "defaultTimezone" TEXT DEFAULT 'UTC',
    "defaultCurrency" TEXT DEFAULT 'USD',
    "defaultLocale" TEXT DEFAULT 'en',
    "branding" JSONB,
    "legalLinks" JSONB,
    "termsUrl" TEXT,
    "privacyUrl" TEXT,
    "refundUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_management_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "roles" JSONB NOT NULL DEFAULT '{}',
    "permissions" JSONB NOT NULL DEFAULT '[]',
    "onboarding" JSONB NOT NULL DEFAULT '{}',
    "policies" JSONB NOT NULL DEFAULT '{}',
    "rateLimits" JSONB NOT NULL DEFAULT '{}',
    "sessions" JSONB NOT NULL DEFAULT '{}',
    "invitations" JSONB NOT NULL DEFAULT '{}',
    "clientSettings" JSONB,
    "teamSettings" JSONB,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,
    "lastUpdatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_management_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "translation_keys" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "namespace" TEXT,
    "enTranslated" BOOLEAN NOT NULL DEFAULT true,
    "arTranslated" BOOLEAN NOT NULL DEFAULT false,
    "hiTranslated" BOOLEAN NOT NULL DEFAULT false,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "translation_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "translation_metrics" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "enTotal" INTEGER NOT NULL DEFAULT 0,
    "enTranslated" INTEGER NOT NULL DEFAULT 0,
    "arTotal" INTEGER NOT NULL DEFAULT 0,
    "arTranslated" INTEGER NOT NULL DEFAULT 0,
    "hiTotal" INTEGER NOT NULL DEFAULT 0,
    "hiTranslated" INTEGER NOT NULL DEFAULT 0,
    "totalUniqueKeys" INTEGER NOT NULL DEFAULT 0,
    "usersWithArabic" INTEGER NOT NULL DEFAULT 0,
    "usersWithHindi" INTEGER NOT NULL DEFAULT 0,
    "usersWithEnglish" INTEGER NOT NULL DEFAULT 0,
    "enCoveragePct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "arCoveragePct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "hiCoveragePct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "translation_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "payments" JSONB,
    "calendars" JSONB,
    "comms" JSONB,
    "analytics" JSONB,
    "storage" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communication_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" JSONB,
    "sms" JSONB,
    "chat" JSONB,
    "notifications" JSONB,
    "newsletters" JSONB,
    "reminders" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "communication_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "passwordPolicy" JSONB,
    "sessionSecurity" JSONB,
    "twoFactor" JSONB,
    "network" JSONB,
    "dataProtection" JSONB,
    "compliance" JSONB,
    "superAdmin" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "security_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cron_telemetry_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "performance" JSONB,
    "reliability" JSONB,
    "monitoring" JSONB,
    "status" JSONB,
    "scheduling" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cron_telemetry_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_localization_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "defaultLanguage" VARCHAR(10) NOT NULL DEFAULT 'en',
    "fallbackLanguage" VARCHAR(10) NOT NULL DEFAULT 'en',
    "showLanguageSwitcher" BOOLEAN NOT NULL DEFAULT true,
    "persistLanguagePreference" BOOLEAN NOT NULL DEFAULT true,
    "autoDetectBrowserLanguage" BOOLEAN NOT NULL DEFAULT true,
    "allowUserLanguageOverride" BOOLEAN NOT NULL DEFAULT true,
    "enableRtlSupport" BOOLEAN NOT NULL DEFAULT true,
    "missingTranslationBehavior" VARCHAR(20) NOT NULL DEFAULT 'show-fallback',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "org_localization_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regional_formats" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "languageCode" VARCHAR(10) NOT NULL,
    "dateFormat" VARCHAR(50) NOT NULL,
    "timeFormat" VARCHAR(50) NOT NULL,
    "currencyCode" VARCHAR(3) NOT NULL,
    "currencySymbol" VARCHAR(10) NOT NULL,
    "numberFormat" VARCHAR(50) NOT NULL,
    "decimalSeparator" VARCHAR(1) NOT NULL,
    "thousandsSeparator" VARCHAR(1) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regional_formats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crowdin_integrations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" VARCHAR(100) NOT NULL,
    "apiTokenMasked" VARCHAR(20) NOT NULL,
    "apiTokenEncrypted" TEXT NOT NULL,
    "autoSyncDaily" BOOLEAN NOT NULL DEFAULT true,
    "syncOnDeploy" BOOLEAN NOT NULL DEFAULT false,
    "createPrs" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "lastSyncStatus" VARCHAR(50),
    "testConnectionOk" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crowdin_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_customizations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "practiceItems" JSONB NOT NULL DEFAULT '[]',
    "bookmarks" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sectionOrder" JSONB NOT NULL DEFAULT '[]',
    "hiddenItems" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "menu_customizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission_audits" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "oldRole" VARCHAR(100),
    "newRole" VARCHAR(100),
    "permissionsAdded" JSONB NOT NULL DEFAULT '[]',
    "permissionsRemoved" JSONB NOT NULL DEFAULT '[]',
    "reason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permission_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission_templates" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "icon" VARCHAR(50),
    "color" VARCHAR(20),
    "permissions" JSONB NOT NULL DEFAULT '[]',
    "isCustom" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permission_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_roles" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "color" VARCHAR(20),
    "icon" VARCHAR(50),
    "permissions" JSONB NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_workflows" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "WorkflowType" NOT NULL,
    "status" "WorkflowStatus" NOT NULL DEFAULT 'DRAFT',
    "triggeredBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "scheduledFor" TIMESTAMP(3),
    "totalSteps" INTEGER NOT NULL,
    "completedSteps" INTEGER NOT NULL DEFAULT 0,
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "lastErrorAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_steps" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "actionType" TEXT NOT NULL,
    "status" "StepStatus" NOT NULL DEFAULT 'PENDING',
    "config" JSONB,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "errorMessage" TEXT,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_templates" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "type" "WorkflowType" NOT NULL,
    "steps" JSONB NOT NULL,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "approvalEmails" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_notifications" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "emailTo" TEXT NOT NULL,
    "emailSubject" TEXT NOT NULL,
    "emailBody" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_history" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventDescription" TEXT,
    "changedBy" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedToId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "slaFirstResponseAt" TIMESTAMP(3),
    "slaResolutionAt" TIMESTAMP(3),
    "attachmentIds" TEXT[],
    "tags" TEXT[],
    "metadata" JSONB,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_ticket_comments" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachmentIds" TEXT[],
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_ticket_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_ticket_status_history" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "previousStatus" TEXT,
    "newStatus" TEXT NOT NULL,
    "changedBy" TEXT,
    "reason" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_ticket_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_base_categories" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "icon" VARCHAR(50),
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_base_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_base_articles" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "slug" VARCHAR(500) NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" VARCHAR(1000),
    "authorId" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "notHelpfulCount" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[],
    "relatedArticleIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "knowledge_base_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bulk_operations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type" "BulkOperationType" NOT NULL,
    "userFilter" JSONB,
    "operationConfig" JSONB NOT NULL,
    "status" "BulkOperationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "approvalRequired" BOOLEAN NOT NULL DEFAULT false,
    "approvalStatus" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "scheduledFor" TIMESTAMP(3),
    "notifyUsers" BOOLEAN NOT NULL DEFAULT true,
    "dryRunResults" JSONB,
    "totalUsersAffected" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "rollbackAvailable" BOOLEAN NOT NULL DEFAULT true,
    "rollbackUntilDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bulk_operations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bulk_operation_results" (
    "id" TEXT NOT NULL,
    "bulkOperationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "changesBefore" JSONB,
    "changesAfter" JSONB,
    "executionTimeMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bulk_operation_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bulk_operation_history" (
    "id" TEXT NOT NULL,
    "bulkOperationId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventDescription" TEXT,
    "changedBy" TEXT,
    "oldValue" JSONB,
    "newValue" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bulk_operation_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entities" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "country" VARCHAR(2) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "legalForm" VARCHAR(50),
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "fiscalYearStart" TIMESTAMP(3),
    "registrationCertUrl" TEXT,
    "registrationCertHash" TEXT,
    "activityCode" VARCHAR(20),
    "parentEntityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "entities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_on_entities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "role" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_on_entities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entity_licenses" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "country" VARCHAR(2) NOT NULL,
    "authority" VARCHAR(100) NOT NULL,
    "licenseNumber" VARCHAR(100) NOT NULL,
    "legalForm" VARCHAR(50),
    "issuedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "economicZoneId" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "entity_licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entity_registrations" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "value" VARCHAR(100) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "source" VARCHAR(50),
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entity_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "economic_zones" (
    "id" TEXT NOT NULL,
    "country" VARCHAR(2) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "authorityCode" VARCHAR(50),
    "city" VARCHAR(100),
    "region" VARCHAR(100),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "economic_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "obligations" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "country" VARCHAR(2) NOT NULL,
    "frequency" VARCHAR(20) NOT NULL,
    "ruleConfig" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "obligations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "filing_periods" (
    "id" TEXT NOT NULL,
    "obligationId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'UPCOMING',
    "assigneeId" TEXT,
    "snoozeUntil" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "filing_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consents" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityId" TEXT,
    "userId" TEXT,
    "type" VARCHAR(50) NOT NULL,
    "version" VARCHAR(20) NOT NULL,
    "acceptedBy" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" VARCHAR(45),
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_attempts" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "value" VARCHAR(255) NOT NULL,
    "country" VARCHAR(2) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "result" JSONB,
    "attemptedBy" TEXT,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "correlationId" VARCHAR(100),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entity_audit_logs" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "changes" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entity_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflows" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "nodes" JSONB NOT NULL DEFAULT '[]',
    "edges" JSONB NOT NULL DEFAULT '[]',
    "createdBy" TEXT NOT NULL DEFAULT 'system',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_simulations" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "testData" JSONB,
    "executionPath" JSONB NOT NULL DEFAULT '[]',
    "totalDuration" INTEGER NOT NULL DEFAULT 0,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "errors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_simulations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "format" TEXT NOT NULL DEFAULT 'table',
    "sections" JSONB NOT NULL DEFAULT '[]',
    "pageSize" TEXT NOT NULL DEFAULT 'A4',
    "orientation" TEXT NOT NULL DEFAULT 'portrait',
    "includeHeader" BOOLEAN NOT NULL DEFAULT true,
    "includeFooter" BOOLEAN NOT NULL DEFAULT true,
    "headerText" TEXT,
    "footerText" TEXT,
    "templateId" TEXT,
    "lastGeneratedAt" TIMESTAMP(3),
    "generationCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_executions" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "filePath" TEXT,
    "fileSizeBytes" INTEGER,
    "generationTimeMs" INTEGER,
    "errorMessage" TEXT,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "export_schedules" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "frequency" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "recipients" TEXT[],
    "dayOfWeek" TEXT,
    "dayOfMonth" INTEGER,
    "time" TEXT DEFAULT '09:00',
    "emailSubject" TEXT,
    "emailBody" TEXT,
    "filterPresetId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastExecutedAt" TIMESTAMP(3),
    "nextExecutedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "export_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "export_schedule_executions" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordCount" INTEGER NOT NULL DEFAULT 0,
    "fileSizeBytes" INTEGER,
    "errorMessage" TEXT,
    "deliveryStatus" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "export_schedule_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_filings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "country" VARCHAR(3) NOT NULL,
    "taxType" VARCHAR(50) NOT NULL,
    "periodStartDate" TIMESTAMP(3) NOT NULL,
    "periodEndDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "data" TEXT NOT NULL,
    "calculations" TEXT NOT NULL,
    "taxAmount" DECIMAL(19,4) NOT NULL,
    "attachmentIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "submittedAt" TIMESTAMP(3),
    "submittedBy" TEXT,
    "rejectionReason" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_filings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parties" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "partyType" "PartyType" NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "legalName" VARCHAR(255),
    "registrationNumber" VARCHAR(100),
    "taxId" VARCHAR(100),
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "address" TEXT,
    "city" VARCHAR(100),
    "country" VARCHAR(2),
    "status" "PartyStatus" NOT NULL DEFAULT 'ACTIVE',
    "isMasterRecord" BOOLEAN NOT NULL DEFAULT false,
    "masterRecordId" TEXT,
    "dataQualityScore" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "lastValidatedAt" TIMESTAMP(3),
    "validationErrors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "externalId" VARCHAR(255),
    "source" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "parties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "productCode" VARCHAR(100) NOT NULL,
    "productName" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "productType" "ProductType" NOT NULL,
    "category" VARCHAR(100),
    "unitOfMeasure" VARCHAR(50),
    "standardPrice" DECIMAL(19,4),
    "currency" VARCHAR(3),
    "taxCodeId" TEXT,
    "taxRate" DECIMAL(5,2),
    "isMasterRecord" BOOLEAN NOT NULL DEFAULT false,
    "masterRecordId" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "dataQualityScore" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "lastValidatedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "externalId" VARCHAR(255),
    "source" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_codes" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "taxCodeValue" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "taxType" "TaxType" NOT NULL,
    "country" VARCHAR(2) NOT NULL,
    "taxRate" DECIMAL(5,2) NOT NULL,
    "isMasterRecord" BOOLEAN NOT NULL DEFAULT false,
    "masterRecordId" TEXT,
    "status" "TaxCodeStatus" NOT NULL DEFAULT 'ACTIVE',
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "metadata" JSONB,
    "externalId" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "tax_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merge_logs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "recordType" "MergeRecordType" NOT NULL,
    "masterRecordId" TEXT NOT NULL,
    "masterRecordName" VARCHAR(255) NOT NULL,
    "duplicateRecordId" TEXT NOT NULL,
    "duplicateRecordName" VARCHAR(255) NOT NULL,
    "mergeReason" TEXT,
    "survivorshipRuleId" TEXT,
    "survivorshipStrategy" "SurvivorshipStrategy" NOT NULL DEFAULT 'MANUAL',
    "mergeStatus" "MergeStatus" NOT NULL DEFAULT 'PENDING',
    "mergeErrors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "canUnmerge" BOOLEAN NOT NULL DEFAULT true,
    "unmergeReason" TEXT,
    "unmergedAt" TIMESTAMP(3),
    "unmergedBy" TEXT,
    "mergedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mergedBy" TEXT NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "merge_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survivorship_rules" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "recordType" "MergeRecordType" NOT NULL,
    "ruleName" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "fieldMappings" JSONB NOT NULL,
    "customLogic" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "survivorship_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bills" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityId" TEXT,
    "billNumber" TEXT,
    "vendor" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "date" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "status" "BillStatus" NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "ocrStatus" "OcrStatus" NOT NULL DEFAULT 'PENDING',
    "ocrData" JSONB,
    "ocrConfidence" DOUBLE PRECISION,
    "attachmentId" TEXT,
    "category" TEXT,
    "description" TEXT,
    "notes" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approvals" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "itemType" "ApprovalItemType" NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemData" JSONB,
    "requesterId" TEXT NOT NULL,
    "requesterName" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approverId" TEXT NOT NULL,
    "approverName" TEXT,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "ApprovalPriority" NOT NULL DEFAULT 'NORMAL',
    "decision" TEXT,
    "decisionAt" TIMESTAMP(3),
    "decisionBy" TEXT,
    "decisionNotes" TEXT,
    "workflowId" TEXT,
    "workflowStep" INTEGER DEFAULT 1,
    "totalSteps" INTEGER DEFAULT 1,
    "reason" TEXT,
    "notes" TEXT,
    "tags" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_history" (
    "id" TEXT NOT NULL,
    "approvalId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fromStatus" "ApprovalStatus",
    "toStatus" "ApprovalStatus",
    "notes" TEXT,
    "metadata" JSONB,

    CONSTRAINT "approval_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "description" TEXT,
    "link" VARCHAR(500),
    "readAt" TIMESTAMP(3),
    "readBy" TEXT,
    "entityType" VARCHAR(50),
    "entityId" VARCHAR(100),
    "relatedUserId" VARCHAR(100),
    "channels" TEXT[] DEFAULT ARRAY['in_app']::TEXT[],
    "priority" VARCHAR(20) NOT NULL DEFAULT 'normal',
    "status" VARCHAR(20) NOT NULL DEFAULT 'sent',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "types" JSONB NOT NULL DEFAULT '{}',
    "emailDigest" VARCHAR(20) NOT NULL DEFAULT 'instant',
    "doNotDisturb" BOOLEAN NOT NULL DEFAULT false,
    "doNotDisturbStart" TEXT,
    "doNotDisturbEnd" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_signature_requests" (
    "id" TEXT NOT NULL,
    "attachmentId" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "signerId" TEXT NOT NULL,
    "status" "SignatureRequestStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "dueAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "document_signature_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_signatures" (
    "id" TEXT NOT NULL,
    "signatureRequestId" TEXT,
    "attachmentId" TEXT NOT NULL,
    "signerId" TEXT NOT NULL,
    "signatureData" TEXT,
    "signatureType" VARCHAR(50) NOT NULL DEFAULT 'digital',
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "location" TEXT,
    "certificateId" TEXT,
    "certificateFingerprint" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "document_signatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analysis_jobs" (
    "id" TEXT NOT NULL,
    "attachmentId" TEXT NOT NULL,
    "status" "AnalysisStatus" NOT NULL DEFAULT 'PENDING',
    "analysisType" VARCHAR(50) NOT NULL DEFAULT 'general',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "results" JSONB,
    "errorMessage" TEXT,
    "processingTime" INTEGER,
    "confidence" DECIMAL(5,2),
    "extractedText" TEXT,
    "extractedData" JSONB,
    "metadata" JSONB,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "analysis_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "languages_enabled_idx" ON "languages"("enabled");

-- CreateIndex
CREATE UNIQUE INDEX "users_employeeId_key" ON "users"("employeeId");

-- CreateIndex
CREATE INDEX "users_tenantId_role_idx" ON "users"("tenantId", "role");

-- CreateIndex
CREATE INDEX "users_tenantId_createdAt_idx" ON "users"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "users_tenantId_availabilityStatus_idx" ON "users"("tenantId", "availabilityStatus");

-- CreateIndex
CREATE INDEX "users_tenantId_department_idx" ON "users"("tenantId", "department");

-- CreateIndex
CREATE INDEX "users_tenantId_tier_idx" ON "users"("tenantId", "tier");

-- CreateIndex
CREATE INDEX "users_tenantId_experienceYears_idx" ON "users"("tenantId", "experienceYears");

-- CreateIndex
CREATE INDEX "users_tenantId_availabilityStatus_createdAt_idx" ON "users"("tenantId", "availabilityStatus", "createdAt");

-- CreateIndex
CREATE INDEX "users_tenantId_role_createdAt_idx" ON "users"("tenantId", "role", "createdAt");

-- CreateIndex
CREATE INDEX "idx_users_tenantid_email" ON "users"("tenantId", "email");

-- CreateIndex
CREATE INDEX "idx_users_tenantid_name" ON "users"("tenantId", "name");

-- CreateIndex
CREATE INDEX "idx_users_tenantid_role_status" ON "users"("tenantId", "role", "availabilityStatus");

-- CreateIndex
CREATE INDEX "idx_users_tenantid_tier_created" ON "users"("tenantId", "tier", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_users_tenantid_department_created" ON "users"("tenantId", "department", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "users_tenantId_email_key" ON "users"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_key" ON "invitations"("token");

-- CreateIndex
CREATE INDEX "invitations_tenantId_status_idx" ON "invitations"("tenantId", "status");

-- CreateIndex
CREATE INDEX "invitations_expiresAt_idx" ON "invitations"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_tenantId_email_key" ON "invitations"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");

-- CreateIndex
CREATE INDEX "user_profiles_userId_idx" ON "user_profiles"("userId");

-- CreateIndex
CREATE INDEX "filter_presets_tenantId_userId_idx" ON "filter_presets"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "filter_presets_userId_isPinned_idx" ON "filter_presets"("userId", "isPinned");

-- CreateIndex
CREATE INDEX "filter_presets_userId_updatedAt_idx" ON "filter_presets"("userId", "updatedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "filter_presets_userId_tenantId_name_key" ON "filter_presets"("userId", "tenantId", "name");

-- CreateIndex
CREATE INDEX "preset_shares_presetId_idx" ON "preset_shares"("presetId");

-- CreateIndex
CREATE INDEX "preset_shares_ownerId_idx" ON "preset_shares"("ownerId");

-- CreateIndex
CREATE INDEX "preset_shares_sharedWithUserId_idx" ON "preset_shares"("sharedWithUserId");

-- CreateIndex
CREATE INDEX "preset_shares_createdAt_idx" ON "preset_shares"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "preset_shares_presetId_sharedWithUserId_key" ON "preset_shares"("presetId", "sharedWithUserId");

-- CreateIndex
CREATE INDEX "preset_share_logs_presetId_createdAt_idx" ON "preset_share_logs"("presetId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "preset_share_logs_userId_eventType_createdAt_idx" ON "preset_share_logs"("userId", "eventType", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "preset_share_logs_eventType_createdAt_idx" ON "preset_share_logs"("eventType", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_token_key" ON "verificationtokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_identifier_token_key" ON "verificationtokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "translation_priorities_tenantId_idx" ON "translation_priorities"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "translation_priorities_tenantId_key_languageCode_key" ON "translation_priorities"("tenantId", "key", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_primaryDomain_key" ON "Tenant"("primaryDomain");

-- CreateIndex
CREATE INDEX "Tenant_status_idx" ON "Tenant"("status");

-- CreateIndex
CREATE INDEX "tenant_memberships_tenantId_idx" ON "tenant_memberships"("tenantId");

-- CreateIndex
CREATE INDEX "tenant_memberships_userId_idx" ON "tenant_memberships"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_memberships_userId_tenantId_key" ON "tenant_memberships"("userId", "tenantId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_action_createdAt_idx" ON "audit_logs"("action", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_userId_createdAt_idx" ON "audit_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_tenantId_createdAt_idx" ON "audit_logs"("tenantId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");

-- CreateIndex
CREATE INDEX "posts_publishedAt_idx" ON "posts"("publishedAt");

-- CreateIndex
CREATE INDEX "posts_featured_idx" ON "posts"("featured");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_email_key" ON "newsletter"("email");

-- CreateIndex
CREATE INDEX "services_tenantId_idx" ON "services"("tenantId");

-- CreateIndex
CREATE INDEX "services_active_bookingEnabled_idx" ON "services"("active", "bookingEnabled");

-- CreateIndex
CREATE INDEX "services_status_idx" ON "services"("status");

-- CreateIndex
CREATE INDEX "services_createdAt_idx" ON "services"("createdAt");

-- CreateIndex
CREATE INDEX "services_updatedAt_idx" ON "services"("updatedAt");

-- CreateIndex
CREATE INDEX "services_active_featured_idx" ON "services"("active", "featured");

-- CreateIndex
CREATE UNIQUE INDEX "services_tenantId_slug_key" ON "services"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "service_views_service_id_created_at_idx" ON "service_views"("service_id", "created_at");

-- CreateIndex
CREATE INDEX "bookings_scheduledAt_idx" ON "bookings"("scheduledAt");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_clientId_idx" ON "bookings"("clientId");

-- CreateIndex
CREATE INDEX "bookings_serviceId_idx" ON "bookings"("serviceId");

-- CreateIndex
CREATE INDEX "bookings_clientEmail_idx" ON "bookings"("clientEmail");

-- CreateIndex
CREATE INDEX "bookings_createdAt_idx" ON "bookings"("createdAt");

-- CreateIndex
CREATE INDEX "bookings_status_scheduledAt_idx" ON "bookings"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "bookings_tenantId_idx" ON "bookings"("tenantId");

-- CreateIndex
CREATE INDEX "contact_submissions_responded_createdAt_idx" ON "contact_submissions"("responded", "createdAt");

-- CreateIndex
CREATE INDEX "contact_submissions_createdAt_idx" ON "contact_submissions"("createdAt");

-- CreateIndex
CREATE INDEX "HealthLog_tenantId_idx" ON "HealthLog"("tenantId");

-- CreateIndex
CREATE INDEX "HealthLog_tenantId_checkedAt_idx" ON "HealthLog"("tenantId", "checkedAt");

-- CreateIndex
CREATE INDEX "HealthLog_tenantId_service_checkedAt_idx" ON "HealthLog"("tenantId", "service", "checkedAt");

-- CreateIndex
CREATE INDEX "HealthLog_tenantId_service_status_checkedAt_idx" ON "HealthLog"("tenantId", "service", "status", "checkedAt");

-- CreateIndex
CREATE UNIQUE INDEX "sidebar_preferences_userId_key" ON "sidebar_preferences"("userId");

-- CreateIndex
CREATE INDEX "sidebar_preferences_userId_idx" ON "sidebar_preferences"("userId");

-- CreateIndex
CREATE INDEX "ExchangeRate_base_target_idx" ON "ExchangeRate"("base", "target");

-- CreateIndex
CREATE INDEX "PriceOverride_entity_entityId_currencyCode_idx" ON "PriceOverride"("entity", "entityId", "currencyCode");

-- CreateIndex
CREATE INDEX "Task_tenantId_idx" ON "Task"("tenantId");

-- CreateIndex
CREATE INDEX "Task_tenantId_status_idx" ON "Task"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Task_tenantId_dueAt_idx" ON "Task"("tenantId", "dueAt");

-- CreateIndex
CREATE INDEX "Task_tenantId_createdAt_idx" ON "Task"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "Task_tenantId_assigneeId_idx" ON "Task"("tenantId", "assigneeId");

-- CreateIndex
CREATE INDEX "Task_tenantId_status_dueAt_idx" ON "Task"("tenantId", "status", "dueAt");

-- CreateIndex
CREATE INDEX "Task_clientId_idx" ON "Task"("clientId");

-- CreateIndex
CREATE INDEX "Task_bookingId_idx" ON "Task"("bookingId");

-- CreateIndex
CREATE INDEX "ComplianceRecord_tenantId_idx" ON "ComplianceRecord"("tenantId");

-- CreateIndex
CREATE INDEX "ComplianceRecord_tenantId_taskId_idx" ON "ComplianceRecord"("tenantId", "taskId");

-- CreateIndex
CREATE INDEX "TaskComment_taskId_idx" ON "TaskComment"("taskId");

-- CreateIndex
CREATE INDEX "task_templates_category_idx" ON "task_templates"("category");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceRequest_uuid_key" ON "ServiceRequest"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceRequest_paymentSessionId_key" ON "ServiceRequest"("paymentSessionId");

-- CreateIndex
CREATE INDEX "ServiceRequest_clientId_idx" ON "ServiceRequest"("clientId");

-- CreateIndex
CREATE INDEX "ServiceRequest_scheduledAt_idx" ON "ServiceRequest"("scheduledAt");

-- CreateIndex
CREATE INDEX "ServiceRequest_isBooking_status_idx" ON "ServiceRequest"("isBooking", "status");

-- CreateIndex
CREATE INDEX "ServiceRequest_tenantId_idx" ON "ServiceRequest"("tenantId");

-- CreateIndex
CREATE INDEX "ServiceRequest_tenantId_status_idx" ON "ServiceRequest"("tenantId", "status");

-- CreateIndex
CREATE INDEX "ServiceRequest_tenantId_assignedTeamMemberId_idx" ON "ServiceRequest"("tenantId", "assignedTeamMemberId");

-- CreateIndex
CREATE INDEX "ServiceRequest_tenantId_scheduledAt_idx" ON "ServiceRequest"("tenantId", "scheduledAt");

-- CreateIndex
CREATE INDEX "ServiceRequest_tenantId_isBooking_status_idx" ON "ServiceRequest"("tenantId", "isBooking", "status");

-- CreateIndex
CREATE UNIQUE INDEX "request_tasks_serviceRequestId_taskId_key" ON "request_tasks"("serviceRequestId", "taskId");

-- CreateIndex
CREATE INDEX "team_members_isAvailable_idx" ON "team_members"("isAvailable");

-- CreateIndex
CREATE INDEX "team_members_status_idx" ON "team_members"("status");

-- CreateIndex
CREATE INDEX "AvailabilitySlot_date_serviceId_idx" ON "AvailabilitySlot"("date", "serviceId");

-- CreateIndex
CREATE INDEX "AvailabilitySlot_teamMemberId_date_idx" ON "AvailabilitySlot"("teamMemberId", "date");

-- CreateIndex
CREATE INDEX "AvailabilitySlot_available_date_idx" ON "AvailabilitySlot"("available", "date");

-- CreateIndex
CREATE UNIQUE INDEX "AvailabilitySlot_serviceId_teamMemberId_date_startTime_key" ON "AvailabilitySlot"("serviceId", "teamMemberId", "date", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "BookingPreferences_userId_key" ON "BookingPreferences"("userId");

-- CreateIndex
CREATE INDEX "ScheduledReminder_scheduledAt_idx" ON "ScheduledReminder"("scheduledAt");

-- CreateIndex
CREATE INDEX "ScheduledReminder_serviceRequestId_idx" ON "ScheduledReminder"("serviceRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "Attachment_key_key" ON "Attachment"("key");

-- CreateIndex
CREATE INDEX "Attachment_serviceRequestId_idx" ON "Attachment"("serviceRequestId");

-- CreateIndex
CREATE INDEX "Attachment_tenantId_idx" ON "Attachment"("tenantId");

-- CreateIndex
CREATE INDEX "DocumentVersion_attachmentId_idx" ON "DocumentVersion"("attachmentId");

-- CreateIndex
CREATE INDEX "DocumentVersion_tenantId_idx" ON "DocumentVersion"("tenantId");

-- CreateIndex
CREATE INDEX "DocumentVersion_uploadedAt_idx" ON "DocumentVersion"("uploadedAt");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentVersion_attachmentId_versionNumber_key" ON "DocumentVersion"("attachmentId", "versionNumber");

-- CreateIndex
CREATE INDEX "DocumentLink_attachmentId_idx" ON "DocumentLink"("attachmentId");

-- CreateIndex
CREATE INDEX "DocumentLink_linkedToType_idx" ON "DocumentLink"("linkedToType");

-- CreateIndex
CREATE INDEX "DocumentLink_linkedToId_idx" ON "DocumentLink"("linkedToId");

-- CreateIndex
CREATE INDEX "DocumentLink_tenantId_idx" ON "DocumentLink"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentLink_attachmentId_linkedToType_linkedToId_key" ON "DocumentLink"("attachmentId", "linkedToType", "linkedToId");

-- CreateIndex
CREATE INDEX "DocumentAuditLog_attachmentId_idx" ON "DocumentAuditLog"("attachmentId");

-- CreateIndex
CREATE INDEX "DocumentAuditLog_performedAt_idx" ON "DocumentAuditLog"("performedAt");

-- CreateIndex
CREATE INDEX "DocumentAuditLog_tenantId_idx" ON "DocumentAuditLog"("tenantId");

-- CreateIndex
CREATE INDEX "DocumentAuditLog_action_idx" ON "DocumentAuditLog"("action");

-- CreateIndex
CREATE UNIQUE INDEX "WorkOrder_code_key" ON "WorkOrder"("code");

-- CreateIndex
CREATE INDEX "WorkOrder_tenantId_idx" ON "WorkOrder"("tenantId");

-- CreateIndex
CREATE INDEX "WorkOrder_status_priority_idx" ON "WorkOrder"("status", "priority");

-- CreateIndex
CREATE INDEX "WorkOrder_assigneeId_idx" ON "WorkOrder"("assigneeId");

-- CreateIndex
CREATE INDEX "WorkOrder_dueAt_idx" ON "WorkOrder"("dueAt");

-- CreateIndex
CREATE INDEX "WorkOrder_createdAt_idx" ON "WorkOrder"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "booking_settings_tenantId_key" ON "booking_settings"("tenantId");

-- CreateIndex
CREATE INDEX "booking_settings_tenantId_idx" ON "booking_settings"("tenantId");

-- CreateIndex
CREATE INDEX "booking_step_config_bookingSettingsId_stepOrder_idx" ON "booking_step_config"("bookingSettingsId", "stepOrder");

-- CreateIndex
CREATE INDEX "business_hours_config_bookingSettingsId_dayOfWeek_idx" ON "business_hours_config"("bookingSettingsId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "payment_method_config_bookingSettingsId_methodType_key" ON "payment_method_config"("bookingSettingsId", "methodType");

-- CreateIndex
CREATE INDEX "notification_templates_bookingSettingsId_templateType_idx" ON "notification_templates"("bookingSettingsId", "templateType");

-- CreateIndex
CREATE UNIQUE INDEX "user_payment_methods_paymentMethodId_key" ON "user_payment_methods"("paymentMethodId");

-- CreateIndex
CREATE INDEX "user_payment_methods_userId_idx" ON "user_payment_methods"("userId");

-- CreateIndex
CREATE INDEX "user_payment_methods_tenantId_idx" ON "user_payment_methods"("tenantId");

-- CreateIndex
CREATE INDEX "user_payment_methods_isDefault_idx" ON "user_payment_methods"("isDefault");

-- CreateIndex
CREATE INDEX "user_payment_methods_status_idx" ON "user_payment_methods"("status");

-- CreateIndex
CREATE UNIQUE INDEX "user_payment_methods_userId_paymentMethodId_key" ON "user_payment_methods"("userId", "paymentMethodId");

-- CreateIndex
CREATE INDEX "banking_connections_tenantId_idx" ON "banking_connections"("tenantId");

-- CreateIndex
CREATE INDEX "banking_connections_status_idx" ON "banking_connections"("status");

-- CreateIndex
CREATE INDEX "banking_connections_lastSyncAt_idx" ON "banking_connections"("lastSyncAt");

-- CreateIndex
CREATE INDEX "banking_transactions_tenantId_idx" ON "banking_transactions"("tenantId");

-- CreateIndex
CREATE INDEX "banking_transactions_connectionId_idx" ON "banking_transactions"("connectionId");

-- CreateIndex
CREATE INDEX "banking_transactions_date_idx" ON "banking_transactions"("date");

-- CreateIndex
CREATE INDEX "banking_transactions_matched_idx" ON "banking_transactions"("matched");

-- CreateIndex
CREATE UNIQUE INDEX "banking_transactions_connectionId_externalId_key" ON "banking_transactions"("connectionId", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_number_key" ON "invoices"("number");

-- CreateIndex
CREATE INDEX "invoices_tenantId_idx" ON "invoices"("tenantId");

-- CreateIndex
CREATE INDEX "invoices_bookingId_idx" ON "invoices"("bookingId");

-- CreateIndex
CREATE INDEX "invoices_clientId_idx" ON "invoices"("clientId");

-- CreateIndex
CREATE INDEX "invoice_items_invoiceId_idx" ON "invoice_items"("invoiceId");

-- CreateIndex
CREATE INDEX "expenses_tenantId_idx" ON "expenses"("tenantId");

-- CreateIndex
CREATE INDEX "expenses_date_idx" ON "expenses"("date");

-- CreateIndex
CREATE INDEX "expenses_status_idx" ON "expenses"("status");

-- CreateIndex
CREATE INDEX "chat_messages_tenantId_room_createdAt_idx" ON "chat_messages"("tenantId", "room", "createdAt");

-- CreateIndex
CREATE INDEX "IdempotencyKey_tenantId_idx" ON "IdempotencyKey"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "IdempotencyKey_tenantId_key_key" ON "IdempotencyKey"("tenantId", "key");

-- CreateIndex
CREATE INDEX "setting_change_diffs_tenantId_createdAt_idx" ON "setting_change_diffs"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "setting_change_diffs_tenantId_category_createdAt_idx" ON "setting_change_diffs"("tenantId", "category", "createdAt");

-- CreateIndex
CREATE INDEX "favorite_settings_tenantId_userId_idx" ON "favorite_settings"("tenantId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_settings_tenantId_userId_settingKey_key" ON "favorite_settings"("tenantId", "userId", "settingKey");

-- CreateIndex
CREATE INDEX "audit_events_createdAt_idx" ON "audit_events"("createdAt");

-- CreateIndex
CREATE INDEX "audit_events_tenantId_createdAt_idx" ON "audit_events"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_events_type_createdAt_idx" ON "audit_events"("type", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "organization_settings_tenantId_key" ON "organization_settings"("tenantId");

-- CreateIndex
CREATE INDEX "organization_settings_tenantId_idx" ON "organization_settings"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "user_management_settings_tenantId_key" ON "user_management_settings"("tenantId");

-- CreateIndex
CREATE INDEX "user_management_settings_tenantId_idx" ON "user_management_settings"("tenantId");

-- CreateIndex
CREATE INDEX "translation_keys_tenantId_namespace_idx" ON "translation_keys"("tenantId", "namespace");

-- CreateIndex
CREATE INDEX "translation_keys_tenantId_enTranslated_idx" ON "translation_keys"("tenantId", "enTranslated");

-- CreateIndex
CREATE INDEX "translation_keys_tenantId_arTranslated_idx" ON "translation_keys"("tenantId", "arTranslated");

-- CreateIndex
CREATE INDEX "translation_keys_tenantId_hiTranslated_idx" ON "translation_keys"("tenantId", "hiTranslated");

-- CreateIndex
CREATE INDEX "translation_keys_addedAt_idx" ON "translation_keys"("addedAt");

-- CreateIndex
CREATE UNIQUE INDEX "translation_keys_tenantId_key_key" ON "translation_keys"("tenantId", "key");

-- CreateIndex
CREATE INDEX "translation_metrics_tenantId_date_idx" ON "translation_metrics"("tenantId", "date");

-- CreateIndex
CREATE INDEX "translation_metrics_date_idx" ON "translation_metrics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "translation_metrics_tenantId_date_key" ON "translation_metrics"("tenantId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "integration_settings_tenantId_key" ON "integration_settings"("tenantId");

-- CreateIndex
CREATE INDEX "integration_settings_tenantId_idx" ON "integration_settings"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "communication_settings_tenantId_key" ON "communication_settings"("tenantId");

-- CreateIndex
CREATE INDEX "communication_settings_tenantId_idx" ON "communication_settings"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "security_settings_tenantId_key" ON "security_settings"("tenantId");

-- CreateIndex
CREATE INDEX "security_settings_tenantId_idx" ON "security_settings"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "cron_telemetry_settings_tenantId_key" ON "cron_telemetry_settings"("tenantId");

-- CreateIndex
CREATE INDEX "cron_telemetry_settings_tenantId_idx" ON "cron_telemetry_settings"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "org_localization_settings_tenantId_key" ON "org_localization_settings"("tenantId");

-- CreateIndex
CREATE INDEX "org_localization_settings_tenantId_idx" ON "org_localization_settings"("tenantId");

-- CreateIndex
CREATE INDEX "regional_formats_tenantId_idx" ON "regional_formats"("tenantId");

-- CreateIndex
CREATE INDEX "regional_formats_languageCode_idx" ON "regional_formats"("languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "regional_formats_tenantId_languageCode_key" ON "regional_formats"("tenantId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "crowdin_integrations_tenantId_key" ON "crowdin_integrations"("tenantId");

-- CreateIndex
CREATE INDEX "crowdin_integrations_tenantId_idx" ON "crowdin_integrations"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "menu_customizations_userId_key" ON "menu_customizations"("userId");

-- CreateIndex
CREATE INDEX "menu_customizations_userId_idx" ON "menu_customizations"("userId");

-- CreateIndex
CREATE INDEX "permission_audits_tenantId_idx" ON "permission_audits"("tenantId");

-- CreateIndex
CREATE INDEX "permission_audits_userId_idx" ON "permission_audits"("userId");

-- CreateIndex
CREATE INDEX "permission_audits_changedBy_idx" ON "permission_audits"("changedBy");

-- CreateIndex
CREATE INDEX "permission_audits_createdAt_idx" ON "permission_audits"("createdAt");

-- CreateIndex
CREATE INDEX "permission_audits_tenantId_createdAt_idx" ON "permission_audits"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "permission_templates_tenantId_idx" ON "permission_templates"("tenantId");

-- CreateIndex
CREATE INDEX "permission_templates_isActive_idx" ON "permission_templates"("isActive");

-- CreateIndex
CREATE INDEX "permission_templates_tenantId_isActive_idx" ON "permission_templates"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "permission_templates_tenantId_name_key" ON "permission_templates"("tenantId", "name");

-- CreateIndex
CREATE INDEX "custom_roles_tenantId_idx" ON "custom_roles"("tenantId");

-- CreateIndex
CREATE INDEX "custom_roles_tenantId_isActive_idx" ON "custom_roles"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "custom_roles_tenantId_name_key" ON "custom_roles"("tenantId", "name");

-- CreateIndex
CREATE INDEX "user_workflows_tenantId_status_createdAt_idx" ON "user_workflows"("tenantId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "user_workflows_userId_createdAt_idx" ON "user_workflows"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "workflow_steps_workflowId_stepNumber_idx" ON "workflow_steps"("workflowId", "stepNumber");

-- CreateIndex
CREATE INDEX "workflow_steps_status_idx" ON "workflow_steps"("status");

-- CreateIndex
CREATE INDEX "workflow_templates_tenantId_isActive_idx" ON "workflow_templates"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_templates_tenantId_name_key" ON "workflow_templates"("tenantId", "name");

-- CreateIndex
CREATE INDEX "workflow_notifications_workflowId_createdAt_idx" ON "workflow_notifications"("workflowId", "createdAt");

-- CreateIndex
CREATE INDEX "workflow_history_workflowId_createdAt_idx" ON "workflow_history"("workflowId", "createdAt");

-- CreateIndex
CREATE INDEX "support_tickets_tenantId_idx" ON "support_tickets"("tenantId");

-- CreateIndex
CREATE INDEX "support_tickets_userId_idx" ON "support_tickets"("userId");

-- CreateIndex
CREATE INDEX "support_tickets_assignedToId_idx" ON "support_tickets"("assignedToId");

-- CreateIndex
CREATE INDEX "support_tickets_status_idx" ON "support_tickets"("status");

-- CreateIndex
CREATE INDEX "support_tickets_priority_idx" ON "support_tickets"("priority");

-- CreateIndex
CREATE INDEX "support_tickets_category_idx" ON "support_tickets"("category");

-- CreateIndex
CREATE INDEX "support_tickets_createdAt_idx" ON "support_tickets"("createdAt");

-- CreateIndex
CREATE INDEX "support_tickets_dueAt_idx" ON "support_tickets"("dueAt");

-- CreateIndex
CREATE INDEX "support_ticket_comments_ticketId_idx" ON "support_ticket_comments"("ticketId");

-- CreateIndex
CREATE INDEX "support_ticket_comments_authorId_idx" ON "support_ticket_comments"("authorId");

-- CreateIndex
CREATE INDEX "support_ticket_comments_createdAt_idx" ON "support_ticket_comments"("createdAt");

-- CreateIndex
CREATE INDEX "support_ticket_status_history_ticketId_idx" ON "support_ticket_status_history"("ticketId");

-- CreateIndex
CREATE INDEX "support_ticket_status_history_changedAt_idx" ON "support_ticket_status_history"("changedAt");

-- CreateIndex
CREATE INDEX "knowledge_base_categories_tenantId_idx" ON "knowledge_base_categories"("tenantId");

-- CreateIndex
CREATE INDEX "knowledge_base_categories_published_idx" ON "knowledge_base_categories"("published");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_base_categories_tenantId_slug_key" ON "knowledge_base_categories"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "knowledge_base_articles_tenantId_idx" ON "knowledge_base_articles"("tenantId");

-- CreateIndex
CREATE INDEX "knowledge_base_articles_categoryId_idx" ON "knowledge_base_articles"("categoryId");

-- CreateIndex
CREATE INDEX "knowledge_base_articles_authorId_idx" ON "knowledge_base_articles"("authorId");

-- CreateIndex
CREATE INDEX "knowledge_base_articles_published_idx" ON "knowledge_base_articles"("published");

-- CreateIndex
CREATE INDEX "knowledge_base_articles_featured_idx" ON "knowledge_base_articles"("featured");

-- CreateIndex
CREATE INDEX "knowledge_base_articles_tags_idx" ON "knowledge_base_articles"("tags");

-- CreateIndex
CREATE INDEX "knowledge_base_articles_createdAt_idx" ON "knowledge_base_articles"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_base_articles_tenantId_slug_key" ON "knowledge_base_articles"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "bulk_operations_tenantId_status_createdAt_idx" ON "bulk_operations"("tenantId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "bulk_operations_createdBy_createdAt_idx" ON "bulk_operations"("createdBy", "createdAt");

-- CreateIndex
CREATE INDEX "bulk_operations_status_idx" ON "bulk_operations"("status");

-- CreateIndex
CREATE INDEX "bulk_operation_results_bulkOperationId_status_idx" ON "bulk_operation_results"("bulkOperationId", "status");

-- CreateIndex
CREATE INDEX "bulk_operation_results_userId_createdAt_idx" ON "bulk_operation_results"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "bulk_operation_history_bulkOperationId_createdAt_idx" ON "bulk_operation_history"("bulkOperationId", "createdAt");

-- CreateIndex
CREATE INDEX "entities_tenantId_country_idx" ON "entities"("tenantId", "country");

-- CreateIndex
CREATE INDEX "entities_tenantId_status_idx" ON "entities"("tenantId", "status");

-- CreateIndex
CREATE INDEX "entities_createdAt_idx" ON "entities"("createdAt");

-- CreateIndex
CREATE INDEX "entities_tenantId_createdAt_idx" ON "entities"("tenantId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "entities_tenantId_name_key" ON "entities"("tenantId", "name");

-- CreateIndex
CREATE INDEX "user_on_entities_entityId_idx" ON "user_on_entities"("entityId");

-- CreateIndex
CREATE UNIQUE INDEX "user_on_entities_userId_entityId_key" ON "user_on_entities"("userId", "entityId");

-- CreateIndex
CREATE INDEX "entity_licenses_entityId_idx" ON "entity_licenses"("entityId");

-- CreateIndex
CREATE INDEX "entity_licenses_status_idx" ON "entity_licenses"("status");

-- CreateIndex
CREATE INDEX "entity_licenses_createdAt_idx" ON "entity_licenses"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "entity_licenses_entityId_country_licenseNumber_key" ON "entity_licenses"("entityId", "country", "licenseNumber");

-- CreateIndex
CREATE INDEX "entity_registrations_entityId_idx" ON "entity_registrations"("entityId");

-- CreateIndex
CREATE INDEX "entity_registrations_status_idx" ON "entity_registrations"("status");

-- CreateIndex
CREATE INDEX "entity_registrations_createdAt_idx" ON "entity_registrations"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "entity_registrations_entityId_type_key" ON "entity_registrations"("entityId", "type");

-- CreateIndex
CREATE INDEX "economic_zones_country_idx" ON "economic_zones"("country");

-- CreateIndex
CREATE INDEX "economic_zones_city_idx" ON "economic_zones"("city");

-- CreateIndex
CREATE UNIQUE INDEX "economic_zones_country_name_key" ON "economic_zones"("country", "name");

-- CreateIndex
CREATE INDEX "obligations_entityId_idx" ON "obligations"("entityId");

-- CreateIndex
CREATE INDEX "obligations_country_idx" ON "obligations"("country");

-- CreateIndex
CREATE INDEX "obligations_type_idx" ON "obligations"("type");

-- CreateIndex
CREATE UNIQUE INDEX "obligations_entityId_type_country_key" ON "obligations"("entityId", "type", "country");

-- CreateIndex
CREATE INDEX "filing_periods_obligationId_idx" ON "filing_periods"("obligationId");

-- CreateIndex
CREATE INDEX "filing_periods_status_idx" ON "filing_periods"("status");

-- CreateIndex
CREATE INDEX "filing_periods_dueAt_idx" ON "filing_periods"("dueAt");

-- CreateIndex
CREATE INDEX "filing_periods_assigneeId_idx" ON "filing_periods"("assigneeId");

-- CreateIndex
CREATE INDEX "consents_tenantId_idx" ON "consents"("tenantId");

-- CreateIndex
CREATE INDEX "consents_entityId_idx" ON "consents"("entityId");

-- CreateIndex
CREATE INDEX "consents_acceptedBy_idx" ON "consents"("acceptedBy");

-- CreateIndex
CREATE INDEX "consents_createdAt_idx" ON "consents"("createdAt");

-- CreateIndex
CREATE INDEX "verification_attempts_tenantId_idx" ON "verification_attempts"("tenantId");

-- CreateIndex
CREATE INDEX "verification_attempts_status_idx" ON "verification_attempts"("status");

-- CreateIndex
CREATE INDEX "verification_attempts_createdAt_idx" ON "verification_attempts"("createdAt");

-- CreateIndex
CREATE INDEX "verification_attempts_correlationId_idx" ON "verification_attempts"("correlationId");

-- CreateIndex
CREATE INDEX "entity_audit_logs_entityId_idx" ON "entity_audit_logs"("entityId");

-- CreateIndex
CREATE INDEX "entity_audit_logs_userId_idx" ON "entity_audit_logs"("userId");

-- CreateIndex
CREATE INDEX "entity_audit_logs_action_idx" ON "entity_audit_logs"("action");

-- CreateIndex
CREATE INDEX "entity_audit_logs_createdAt_idx" ON "entity_audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "workflows_status_createdAt_idx" ON "workflows"("status", "createdAt");

-- CreateIndex
CREATE INDEX "workflows_createdBy_createdAt_idx" ON "workflows"("createdBy", "createdAt");

-- CreateIndex
CREATE INDEX "workflow_simulations_workflowId_createdAt_idx" ON "workflow_simulations"("workflowId", "createdAt");

-- CreateIndex
CREATE INDEX "reports_tenantId_createdAt_idx" ON "reports"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "reports_userId_createdAt_idx" ON "reports"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "report_executions_reportId_status_idx" ON "report_executions"("reportId", "status");

-- CreateIndex
CREATE INDEX "report_executions_executedAt_idx" ON "report_executions"("executedAt");

-- CreateIndex
CREATE INDEX "export_schedules_tenantId_isActive_idx" ON "export_schedules"("tenantId", "isActive");

-- CreateIndex
CREATE INDEX "export_schedules_userId_createdAt_idx" ON "export_schedules"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "export_schedules_nextExecutedAt_isActive_idx" ON "export_schedules"("nextExecutedAt", "isActive");

-- CreateIndex
CREATE INDEX "export_schedule_executions_scheduleId_status_idx" ON "export_schedule_executions"("scheduleId", "status");

-- CreateIndex
CREATE INDEX "export_schedule_executions_executedAt_idx" ON "export_schedule_executions"("executedAt");

-- CreateIndex
CREATE INDEX "tax_filings_tenantId_country_taxType_idx" ON "tax_filings"("tenantId", "country", "taxType");

-- CreateIndex
CREATE INDEX "tax_filings_tenantId_status_idx" ON "tax_filings"("tenantId", "status");

-- CreateIndex
CREATE INDEX "tax_filings_entityId_idx" ON "tax_filings"("entityId");

-- CreateIndex
CREATE INDEX "tax_filings_periodStartDate_periodEndDate_idx" ON "tax_filings"("periodStartDate", "periodEndDate");

-- CreateIndex
CREATE INDEX "tax_filings_submittedAt_idx" ON "tax_filings"("submittedAt");

-- CreateIndex
CREATE INDEX "parties_tenantId_partyType_idx" ON "parties"("tenantId", "partyType");

-- CreateIndex
CREATE INDEX "parties_tenantId_status_idx" ON "parties"("tenantId", "status");

-- CreateIndex
CREATE INDEX "parties_tenantId_isMasterRecord_idx" ON "parties"("tenantId", "isMasterRecord");

-- CreateIndex
CREATE INDEX "parties_masterRecordId_idx" ON "parties"("masterRecordId");

-- CreateIndex
CREATE INDEX "parties_dataQualityScore_idx" ON "parties"("dataQualityScore");

-- CreateIndex
CREATE UNIQUE INDEX "parties_tenantId_registrationNumber_key" ON "parties"("tenantId", "registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "parties_tenantId_taxId_key" ON "parties"("tenantId", "taxId");

-- CreateIndex
CREATE INDEX "products_tenantId_productType_idx" ON "products"("tenantId", "productType");

-- CreateIndex
CREATE INDEX "products_tenantId_status_idx" ON "products"("tenantId", "status");

-- CreateIndex
CREATE INDEX "products_tenantId_isMasterRecord_idx" ON "products"("tenantId", "isMasterRecord");

-- CreateIndex
CREATE INDEX "products_masterRecordId_idx" ON "products"("masterRecordId");

-- CreateIndex
CREATE INDEX "products_taxCodeId_idx" ON "products"("taxCodeId");

-- CreateIndex
CREATE UNIQUE INDEX "products_tenantId_productCode_key" ON "products"("tenantId", "productCode");

-- CreateIndex
CREATE INDEX "tax_codes_tenantId_taxType_idx" ON "tax_codes"("tenantId", "taxType");

-- CreateIndex
CREATE INDEX "tax_codes_tenantId_country_idx" ON "tax_codes"("tenantId", "country");

-- CreateIndex
CREATE INDEX "tax_codes_tenantId_status_idx" ON "tax_codes"("tenantId", "status");

-- CreateIndex
CREATE INDEX "tax_codes_tenantId_isMasterRecord_idx" ON "tax_codes"("tenantId", "isMasterRecord");

-- CreateIndex
CREATE INDEX "tax_codes_masterRecordId_idx" ON "tax_codes"("masterRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "tax_codes_tenantId_taxCodeValue_country_key" ON "tax_codes"("tenantId", "taxCodeValue", "country");

-- CreateIndex
CREATE INDEX "merge_logs_tenantId_recordType_idx" ON "merge_logs"("tenantId", "recordType");

-- CreateIndex
CREATE INDEX "merge_logs_tenantId_mergeStatus_idx" ON "merge_logs"("tenantId", "mergeStatus");

-- CreateIndex
CREATE INDEX "merge_logs_masterRecordId_idx" ON "merge_logs"("masterRecordId");

-- CreateIndex
CREATE INDEX "merge_logs_duplicateRecordId_idx" ON "merge_logs"("duplicateRecordId");

-- CreateIndex
CREATE INDEX "merge_logs_mergedAt_idx" ON "merge_logs"("mergedAt");

-- CreateIndex
CREATE INDEX "merge_logs_tenantId_mergedAt_idx" ON "merge_logs"("tenantId", "mergedAt" DESC);

-- CreateIndex
CREATE INDEX "survivorship_rules_tenantId_recordType_idx" ON "survivorship_rules"("tenantId", "recordType");

-- CreateIndex
CREATE INDEX "survivorship_rules_tenantId_isActive_idx" ON "survivorship_rules"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "survivorship_rules_tenantId_ruleName_key" ON "survivorship_rules"("tenantId", "ruleName");

-- CreateIndex
CREATE INDEX "bills_tenantId_status_idx" ON "bills"("tenantId", "status");

-- CreateIndex
CREATE INDEX "bills_tenantId_date_idx" ON "bills"("tenantId", "date");

-- CreateIndex
CREATE INDEX "bills_tenantId_vendor_idx" ON "bills"("tenantId", "vendor");

-- CreateIndex
CREATE INDEX "bills_attachmentId_idx" ON "bills"("attachmentId");

-- CreateIndex
CREATE INDEX "approvals_tenantId_status_idx" ON "approvals"("tenantId", "status");

-- CreateIndex
CREATE INDEX "approvals_tenantId_approverId_status_idx" ON "approvals"("tenantId", "approverId", "status");

-- CreateIndex
CREATE INDEX "approvals_tenantId_itemType_itemId_idx" ON "approvals"("tenantId", "itemType", "itemId");

-- CreateIndex
CREATE INDEX "approvals_expiresAt_idx" ON "approvals"("expiresAt");

-- CreateIndex
CREATE INDEX "approval_history_approvalId_idx" ON "approval_history"("approvalId");

-- CreateIndex
CREATE INDEX "approval_history_tenantId_idx" ON "approval_history"("tenantId");

-- CreateIndex
CREATE INDEX "notifications_tenantId_idx" ON "notifications"("tenantId");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_tenantId_userId_createdAt_idx" ON "notifications"("tenantId", "userId", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_tenantId_readAt_idx" ON "notifications"("tenantId", "readAt");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_key" ON "notification_preferences"("userId");

-- CreateIndex
CREATE INDEX "notification_preferences_tenantId_idx" ON "notification_preferences"("tenantId");

-- CreateIndex
CREATE INDEX "document_signature_requests_attachmentId_idx" ON "document_signature_requests"("attachmentId");

-- CreateIndex
CREATE INDEX "document_signature_requests_requesterId_idx" ON "document_signature_requests"("requesterId");

-- CreateIndex
CREATE INDEX "document_signature_requests_signerId_idx" ON "document_signature_requests"("signerId");

-- CreateIndex
CREATE INDEX "document_signature_requests_status_idx" ON "document_signature_requests"("status");

-- CreateIndex
CREATE INDEX "document_signature_requests_tenantId_status_idx" ON "document_signature_requests"("tenantId", "status");

-- CreateIndex
CREATE INDEX "document_signature_requests_tenantId_createdAt_idx" ON "document_signature_requests"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "document_signatures_attachmentId_idx" ON "document_signatures"("attachmentId");

-- CreateIndex
CREATE INDEX "document_signatures_signerId_idx" ON "document_signatures"("signerId");

-- CreateIndex
CREATE INDEX "document_signatures_signatureRequestId_idx" ON "document_signatures"("signatureRequestId");

-- CreateIndex
CREATE INDEX "document_signatures_tenantId_signedAt_idx" ON "document_signatures"("tenantId", "signedAt");

-- CreateIndex
CREATE INDEX "analysis_jobs_attachmentId_idx" ON "analysis_jobs"("attachmentId");

-- CreateIndex
CREATE INDEX "analysis_jobs_status_idx" ON "analysis_jobs"("status");

-- CreateIndex
CREATE INDEX "analysis_jobs_tenantId_status_idx" ON "analysis_jobs"("tenantId", "status");

-- CreateIndex
CREATE INDEX "analysis_jobs_tenantId_createdAt_idx" ON "analysis_jobs"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "analysis_jobs_createdAt_idx" ON "analysis_jobs"("createdAt");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filter_presets" ADD CONSTRAINT "filter_presets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filter_presets" ADD CONSTRAINT "filter_presets_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preset_shares" ADD CONSTRAINT "preset_shares_presetId_fkey" FOREIGN KEY ("presetId") REFERENCES "filter_presets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preset_shares" ADD CONSTRAINT "preset_shares_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preset_shares" ADD CONSTRAINT "preset_shares_sharedWithUserId_fkey" FOREIGN KEY ("sharedWithUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preset_share_logs" ADD CONSTRAINT "preset_share_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_memberships" ADD CONSTRAINT "tenant_memberships_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_memberships" ADD CONSTRAINT "tenant_memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_views" ADD CONSTRAINT "service_views_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_assignedTeamMemberId_fkey" FOREIGN KEY ("assignedTeamMemberId") REFERENCES "team_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthLog" ADD CONSTRAINT "HealthLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeRate" ADD CONSTRAINT "ExchangeRate_target_fkey" FOREIGN KEY ("target") REFERENCES "Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceOverride" ADD CONSTRAINT "PriceOverride_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceRecord" ADD CONSTRAINT "ComplianceRecord_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceRecord" ADD CONSTRAINT "ComplianceRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskComment" ADD CONSTRAINT "TaskComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskComment" ADD CONSTRAINT "TaskComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "TaskComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskComment" ADD CONSTRAINT "TaskComment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_templates" ADD CONSTRAINT "task_templates_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_assignedTeamMemberId_fkey" FOREIGN KEY ("assignedTeamMemberId") REFERENCES "team_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_parentBookingId_fkey" FOREIGN KEY ("parentBookingId") REFERENCES "ServiceRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_tasks" ADD CONSTRAINT "request_tasks_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_tasks" ADD CONSTRAINT "request_tasks_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_request_comments" ADD CONSTRAINT "service_request_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_request_comments" ADD CONSTRAINT "service_request_comments_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilitySlot" ADD CONSTRAINT "AvailabilitySlot_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilitySlot" ADD CONSTRAINT "AvailabilitySlot_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "team_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingPreferences" ADD CONSTRAINT "BookingPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledReminder" ADD CONSTRAINT "ScheduledReminder_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledReminder" ADD CONSTRAINT "ScheduledReminder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "entities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentLink" ADD CONSTRAINT "DocumentLink_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentLink" ADD CONSTRAINT "DocumentLink_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentAuditLog" ADD CONSTRAINT "DocumentAuditLog_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentAuditLog" ADD CONSTRAINT "DocumentAuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_settings" ADD CONSTRAINT "booking_settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_step_config" ADD CONSTRAINT "booking_step_config_bookingSettingsId_fkey" FOREIGN KEY ("bookingSettingsId") REFERENCES "booking_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_hours_config" ADD CONSTRAINT "business_hours_config_bookingSettingsId_fkey" FOREIGN KEY ("bookingSettingsId") REFERENCES "booking_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_method_config" ADD CONSTRAINT "payment_method_config_bookingSettingsId_fkey" FOREIGN KEY ("bookingSettingsId") REFERENCES "booking_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_templates" ADD CONSTRAINT "notification_templates_bookingSettingsId_fkey" FOREIGN KEY ("bookingSettingsId") REFERENCES "booking_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_payment_methods" ADD CONSTRAINT "user_payment_methods_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_payment_methods" ADD CONSTRAINT "user_payment_methods_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banking_connections" ADD CONSTRAINT "banking_connections_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banking_transactions" ADD CONSTRAINT "banking_transactions_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "banking_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banking_transactions" ADD CONSTRAINT "banking_transactions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdempotencyKey" ADD CONSTRAINT "IdempotencyKey_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "setting_change_diffs" ADD CONSTRAINT "setting_change_diffs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "setting_change_diffs" ADD CONSTRAINT "setting_change_diffs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_settings" ADD CONSTRAINT "favorite_settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_settings" ADD CONSTRAINT "favorite_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_settings" ADD CONSTRAINT "organization_settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_management_settings" ADD CONSTRAINT "user_management_settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "translation_keys" ADD CONSTRAINT "translation_keys_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "translation_metrics" ADD CONSTRAINT "translation_metrics_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_settings" ADD CONSTRAINT "integration_settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communication_settings" ADD CONSTRAINT "communication_settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_settings" ADD CONSTRAINT "security_settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cron_telemetry_settings" ADD CONSTRAINT "cron_telemetry_settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_localization_settings" ADD CONSTRAINT "org_localization_settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regional_formats" ADD CONSTRAINT "regional_formats_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crowdin_integrations" ADD CONSTRAINT "crowdin_integrations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_customizations" ADD CONSTRAINT "menu_customizations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_audits" ADD CONSTRAINT "permission_audits_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_audits" ADD CONSTRAINT "permission_audits_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_audits" ADD CONSTRAINT "permission_audits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_templates" ADD CONSTRAINT "permission_templates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_templates" ADD CONSTRAINT "permission_templates_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_roles" ADD CONSTRAINT "custom_roles_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_roles" ADD CONSTRAINT "custom_roles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_workflows" ADD CONSTRAINT "user_workflows_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_workflows" ADD CONSTRAINT "user_workflows_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_workflows" ADD CONSTRAINT "user_workflows_triggeredBy_fkey" FOREIGN KEY ("triggeredBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_workflows" ADD CONSTRAINT "user_workflows_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_steps" ADD CONSTRAINT "workflow_steps_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "user_workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_steps" ADD CONSTRAINT "workflow_steps_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_templates" ADD CONSTRAINT "workflow_templates_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_templates" ADD CONSTRAINT "workflow_templates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_notifications" ADD CONSTRAINT "workflow_notifications_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "user_workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_history" ADD CONSTRAINT "workflow_history_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "user_workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_history" ADD CONSTRAINT "workflow_history_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_ticket_comments" ADD CONSTRAINT "support_ticket_comments_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_ticket_comments" ADD CONSTRAINT "support_ticket_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_ticket_status_history" ADD CONSTRAINT "support_ticket_status_history_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_base_categories" ADD CONSTRAINT "knowledge_base_categories_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_base_articles" ADD CONSTRAINT "knowledge_base_articles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_base_articles" ADD CONSTRAINT "knowledge_base_articles_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "knowledge_base_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_base_articles" ADD CONSTRAINT "knowledge_base_articles_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bulk_operations" ADD CONSTRAINT "bulk_operations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bulk_operations" ADD CONSTRAINT "bulk_operations_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bulk_operations" ADD CONSTRAINT "bulk_operations_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bulk_operation_results" ADD CONSTRAINT "bulk_operation_results_bulkOperationId_fkey" FOREIGN KEY ("bulkOperationId") REFERENCES "bulk_operations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bulk_operation_results" ADD CONSTRAINT "bulk_operation_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bulk_operation_history" ADD CONSTRAINT "bulk_operation_history_bulkOperationId_fkey" FOREIGN KEY ("bulkOperationId") REFERENCES "bulk_operations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bulk_operation_history" ADD CONSTRAINT "bulk_operation_history_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entities" ADD CONSTRAINT "entities_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entities" ADD CONSTRAINT "entities_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entities" ADD CONSTRAINT "entities_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entities" ADD CONSTRAINT "entities_parentEntityId_fkey" FOREIGN KEY ("parentEntityId") REFERENCES "entities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_on_entities" ADD CONSTRAINT "user_on_entities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_on_entities" ADD CONSTRAINT "user_on_entities_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "entities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_licenses" ADD CONSTRAINT "entity_licenses_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "entities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_licenses" ADD CONSTRAINT "entity_licenses_economicZoneId_fkey" FOREIGN KEY ("economicZoneId") REFERENCES "economic_zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_registrations" ADD CONSTRAINT "entity_registrations_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "entities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "obligations" ADD CONSTRAINT "obligations_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "entities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filing_periods" ADD CONSTRAINT "filing_periods_obligationId_fkey" FOREIGN KEY ("obligationId") REFERENCES "obligations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filing_periods" ADD CONSTRAINT "filing_periods_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consents" ADD CONSTRAINT "consents_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consents" ADD CONSTRAINT "consents_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "entities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consents" ADD CONSTRAINT "consents_acceptedBy_fkey" FOREIGN KEY ("acceptedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_attempts" ADD CONSTRAINT "verification_attempts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_attempts" ADD CONSTRAINT "verification_attempts_attemptedBy_fkey" FOREIGN KEY ("attemptedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_audit_logs" ADD CONSTRAINT "entity_audit_logs_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "entities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_audit_logs" ADD CONSTRAINT "entity_audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_simulations" ADD CONSTRAINT "workflow_simulations_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_executions" ADD CONSTRAINT "report_executions_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "export_schedules" ADD CONSTRAINT "export_schedules_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "export_schedules" ADD CONSTRAINT "export_schedules_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "export_schedules" ADD CONSTRAINT "export_schedules_filterPresetId_fkey" FOREIGN KEY ("filterPresetId") REFERENCES "filter_presets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "export_schedule_executions" ADD CONSTRAINT "export_schedule_executions_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "export_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_filings" ADD CONSTRAINT "tax_filings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_filings" ADD CONSTRAINT "tax_filings_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "entities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parties" ADD CONSTRAINT "parties_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parties" ADD CONSTRAINT "parties_masterRecordId_fkey" FOREIGN KEY ("masterRecordId") REFERENCES "parties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_taxCodeId_fkey" FOREIGN KEY ("taxCodeId") REFERENCES "tax_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_masterRecordId_fkey" FOREIGN KEY ("masterRecordId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_id_fkey" FOREIGN KEY ("id") REFERENCES "parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_codes" ADD CONSTRAINT "tax_codes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_codes" ADD CONSTRAINT "tax_codes_masterRecordId_fkey" FOREIGN KEY ("masterRecordId") REFERENCES "tax_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merge_logs" ADD CONSTRAINT "merge_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survivorship_rules" ADD CONSTRAINT "survivorship_rules_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "entities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_decisionBy_fkey" FOREIGN KEY ("decisionBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_history" ADD CONSTRAINT "approval_history_approvalId_fkey" FOREIGN KEY ("approvalId") REFERENCES "approvals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_history" ADD CONSTRAINT "approval_history_performedBy_fkey" FOREIGN KEY ("performedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_history" ADD CONSTRAINT "approval_history_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_relatedUserId_fkey" FOREIGN KEY ("relatedUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_signature_requests" ADD CONSTRAINT "document_signature_requests_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_signature_requests" ADD CONSTRAINT "document_signature_requests_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_signature_requests" ADD CONSTRAINT "document_signature_requests_signerId_fkey" FOREIGN KEY ("signerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_signature_requests" ADD CONSTRAINT "document_signature_requests_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_signatures" ADD CONSTRAINT "document_signatures_signatureRequestId_fkey" FOREIGN KEY ("signatureRequestId") REFERENCES "document_signature_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_signatures" ADD CONSTRAINT "document_signatures_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_signatures" ADD CONSTRAINT "document_signatures_signerId_fkey" FOREIGN KEY ("signerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_signatures" ADD CONSTRAINT "document_signatures_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis_jobs" ADD CONSTRAINT "analysis_jobs_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis_jobs" ADD CONSTRAINT "analysis_jobs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
