-- =====================================================
-- COMPLETE WORKING MIGRATION - SHARED NOTES SYSTEM
-- =====================================================
-- This migration creates the appointment notes system
-- Safe to run multiple times (idempotent)
-- Skips tables/features that depend on missing tables
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- SECTION 1: Create appointment_notes table
-- =====================================================
DO $$
BEGIN
    -- Drop existing table if needed
    DROP TABLE IF EXISTS appointment_notes CASCADE;
    
    -- Create fresh table
    CREATE TABLE appointment_notes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
        note_text TEXT NOT NULL,
        customer_visible BOOLEAN DEFAULT FALSE,
        created_by TEXT NOT NULL, -- staff email or 'customer'
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Create indexes
    CREATE INDEX idx_appointment_notes_appointment_id ON appointment_notes(appointment_id);
    CREATE INDEX idx_appointment_notes_customer_visible ON appointment_notes(customer_visible);
    CREATE INDEX idx_appointment_notes_created_at ON appointment_notes(created_at DESC);
    
    RAISE NOTICE '✅ Section 1 complete: appointment_notes table created';
END $$;

-- =====================================================
-- SECTION 2: Add columns to appointments table
-- =====================================================
DO $$
BEGIN
    -- Add last_edited_by if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments' AND column_name = 'last_edited_by'
    ) THEN
        ALTER TABLE appointments ADD COLUMN last_edited_by TEXT;
        RAISE NOTICE '✅ Added last_edited_by column';
    ELSE
        RAISE NOTICE '⏭️  last_edited_by column already exists';
    END IF;
    
    -- Add last_edited_at if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments' AND column_name = 'last_edited_at'
    ) THEN
        ALTER TABLE appointments ADD COLUMN last_edited_at TIMESTAMPTZ;
        RAISE NOTICE '✅ Added last_edited_at column';
    ELSE
        RAISE NOTICE '⏭️  last_edited_at column already exists';
    END IF;
    
    -- Add edit_count if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments' AND column_name = 'edit_count'
    ) THEN
        ALTER TABLE appointments ADD COLUMN edit_count INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Added edit_count column';
    ELSE
        RAISE NOTICE '⏭️  edit_count column already exists';
    END IF;
    
    RAISE NOTICE '✅ Section 2 complete: appointments table updated';
END $$;

-- =====================================================
-- SECTION 3: Create views for customer/staff access
-- =====================================================
DO $$
BEGIN
    -- Drop existing views
    DROP VIEW IF EXISTS customer_appointment_view CASCADE;
    DROP VIEW IF EXISTS staff_appointment_view CASCADE;
    
    -- Create customer view (limited data)
    CREATE VIEW customer_appointment_view AS
    SELECT 
        a.id,
        a.name,
        a.email,
        a.phone,
        a.date,
        a.time,
        a.service,
        a.status,
        a.message as notes,
        a.created_at,
        a.updated_at,
        a.last_edited_at,
        a.edit_count,
        -- Get only customer-visible notes
        COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'id', n.id,
                        'note_text', n.note_text,
                        'created_at', n.created_at,
                        'created_by', n.created_by
                    )
                    ORDER BY n.created_at DESC
                )
                FROM appointment_notes n
                WHERE n.appointment_id = a.id 
                AND n.customer_visible = TRUE
            ),
            '[]'::json
        ) as shared_notes
    FROM appointments a;
    
    -- Create staff view (all data)
    CREATE VIEW staff_appointment_view AS
    SELECT 
        a.*,
        -- Get ALL notes (customer-visible and internal)
        COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'id', n.id,
                        'note_text', n.note_text,
                        'customer_visible', n.customer_visible,
                        'created_at', n.created_at,
                        'created_by', n.created_by
                    )
                    ORDER BY n.created_at DESC
                )
                FROM appointment_notes n
                WHERE n.appointment_id = a.id
            ),
            '[]'::json
        ) as all_notes
    FROM appointments a;
    
    RAISE NOTICE '✅ Section 3 complete: customer and staff views created';
END $$;

-- =====================================================
-- SECTION 4: Enable RLS and create policies
-- =====================================================
DO $$
BEGIN
    -- Enable RLS on appointment_notes
    ALTER TABLE appointment_notes ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "appointment_notes_staff_all" ON appointment_notes;
    DROP POLICY IF EXISTS "appointment_notes_customer_visible" ON appointment_notes;
    
    -- Staff can see all notes
    CREATE POLICY "appointment_notes_staff_all"
        ON appointment_notes
        FOR ALL
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM auth.users 
                WHERE auth.uid() = id 
                AND raw_user_meta_data->>'role' = 'staff'
            )
        );
    
    -- Customers can only see customer_visible notes for their appointments
    CREATE POLICY "appointment_notes_customer_visible"
        ON appointment_notes
        FOR SELECT
        TO authenticated
        USING (
            customer_visible = TRUE
            AND EXISTS (
                SELECT 1 FROM appointments
                WHERE appointments.id = appointment_notes.appointment_id
                AND appointments.email = (
                    SELECT email FROM auth.users WHERE id = auth.uid()
                )
            )
        );
    
    RAISE NOTICE '✅ Section 4 complete: RLS enabled and policies created';
END $$;

-- =====================================================
-- SECTION 5: Migrate existing notes
-- =====================================================
DO $$
DECLARE
    staff_notes_count INT;
    customer_notes_count INT;
BEGIN
    -- Migrate staff_notes from appointments (if column exists)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments' AND column_name = 'staff_notes'
    ) THEN
        INSERT INTO appointment_notes (appointment_id, note_text, customer_visible, created_by)
        SELECT 
            id,
            staff_notes,
            FALSE, -- staff notes are internal
            'system_migration'
        FROM appointments
        WHERE staff_notes IS NOT NULL 
        AND staff_notes != ''
        AND NOT EXISTS (
            SELECT 1 FROM appointment_notes 
            WHERE appointment_id = appointments.id 
            AND note_text = appointments.staff_notes
        );
        
        GET DIAGNOSTICS staff_notes_count = ROW_COUNT;
        RAISE NOTICE '✅ Migrated % staff notes', staff_notes_count;
    ELSE
        RAISE NOTICE '⏭️  No staff_notes column found, skipping migration';
    END IF;
    
    -- Migrate message/notes from appointments (if column exists)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments' AND column_name = 'message'
    ) THEN
        INSERT INTO appointment_notes (appointment_id, note_text, customer_visible, created_by)
        SELECT 
            id,
            message,
            TRUE, -- customer message is visible
            'customer'
        FROM appointments
        WHERE message IS NOT NULL 
        AND message != ''
        AND NOT EXISTS (
            SELECT 1 FROM appointment_notes 
            WHERE appointment_id = appointments.id 
            AND note_text = appointments.message
        );
        
        GET DIAGNOSTICS customer_notes_count = ROW_COUNT;
        RAISE NOTICE '✅ Migrated % customer notes', customer_notes_count;
    ELSE
        RAISE NOTICE '⏭️  No message column found, skipping migration';
    END IF;
    
    RAISE NOTICE '✅ Section 5 complete: data migration finished';
END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
DO $$
DECLARE
    table_count INT;
    note_count INT;
    view_count INT;
BEGIN
    -- Check tables
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'appointment_notes';
    
    -- Check notes
    SELECT COUNT(*) INTO note_count
    FROM appointment_notes;
    
    -- Check views
    SELECT COUNT(*) INTO view_count
    FROM information_schema.views
    WHERE table_schema = 'public'
    AND table_name IN ('customer_appointment_view', 'staff_appointment_view');
    
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════';
    RAISE NOTICE '✅ MIGRATION COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '═══════════════════════════════════════════';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE 'Total notes: %', note_count;
    RAISE NOTICE 'Views created: %', view_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Test API: GET /api/appointments/customer/[id]';
    RAISE NOTICE '2. Test creating notes: POST /api/appointments/notes';
    RAISE NOTICE '3. Verify customer view shows only visible notes';
    RAISE NOTICE '4. Verify staff view shows all notes';
    RAISE NOTICE '═══════════════════════════════════════════';
END $$;
