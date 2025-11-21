-- Add isActive and preferences columns to users table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'isActive') THEN
      EXECUTE 'ALTER TABLE public.users ADD COLUMN "isActive" BOOLEAN DEFAULT true';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'preferences') THEN
      EXECUTE 'ALTER TABLE public.users ADD COLUMN "preferences" JSONB';
    END IF;
  END IF;
END$$;

-- Add createdById column to tasks table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'createdById') THEN
      EXECUTE 'ALTER TABLE public.tasks ADD COLUMN "createdById" TEXT';
    END IF;
  END IF;
END$$;

-- Add foreign key constraint for Task.createdBy
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'tasks_createdById_fkey') THEN
      EXECUTE 'ALTER TABLE public.tasks ADD CONSTRAINT tasks_createdById_fkey FOREIGN KEY ("createdById") REFERENCES public.users(id) ON DELETE SET NULL';
    END IF;
  END IF;
END$$;

-- Add index for Task.createdById
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'tasks_createdById_idx') THEN
      EXECUTE 'CREATE INDEX tasks_createdById_idx ON public.tasks("createdById")';
    END IF;
  END IF;
END$$;

-- Add createdById column to bookings table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'createdById') THEN
      EXECUTE 'ALTER TABLE public.bookings ADD COLUMN "createdById" TEXT';
    END IF;
  END IF;
END$$;

-- Add foreign key constraint for Booking.createdBy
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'bookings_createdById_fkey') THEN
      EXECUTE 'ALTER TABLE public.bookings ADD CONSTRAINT bookings_createdById_fkey FOREIGN KEY ("createdById") REFERENCES public.users(id) ON DELETE SET NULL';
    END IF;
  END IF;
END$$;

-- Add index for Booking.createdById
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'bookings_createdById_idx') THEN
      EXECUTE 'CREATE INDEX bookings_createdById_idx ON public.bookings("createdById")';
    END IF;
  END IF;
END$$;
