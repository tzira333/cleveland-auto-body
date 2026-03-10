-- Migration: Add Shared Notes System and Edit History Tracking (FIXED)
-- Purpose: Enable staff to share notes with customers and track customer edits
-- Date: 2024-01-15 (Updated: 2024-03-10)
-- SAFE: Can be run multiple times without errors

-- =====================================================
-- PART 0: ENABLE UUID EXTENSION (if not already enabled)
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PART 1: CREATE APPOINTMENT NOTES TABLE
-- =====================================================

-- Drop existing table if recreating (CAUTION: Comment out if preserving data)
-- DROP TABLE IF EXISTS appointment_notes CASCADE;

-- Create appointment_notes table for structured note management
CREATE TABLE IF NOT EXISTS appointment_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  customer_visible BOOLEAN DEFAULT FALSE,
  created_by TEXT NOT NULL, -- Staff email or 'customer'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointment_notes_appointment_id ON appointment_notes(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_notes_customer_visible ON appointment_notes(customer_visible);
CREATE INDEX IF NOT EXISTS idx_appointment_notes_created_at ON appointment_notes(created_at DESC);

-- Add comments
COMMENT ON TABLE appointment_notes IS 'Stores notes for appointments with customer visibility control';
COMMENT ON COLUMN appointment_notes.customer_visible IS 'TRUE = visible to customer, FALSE = staff-only (internal)';
COMMENT ON COLUMN appointment_notes.created_by IS 'Email of staff member who created note, or "customer" if created by customer';

-- =====================================================
-- PART 2: CREATE APPOINTMENT EDIT HISTORY TABLE
-- =====================================================

-- Drop existing table if recreating (CAUTION: Comment out if preserving data)
-- DROP TABLE IF EXISTS appointment_edit_history CASCADE;

-- Create appointment_edit_history table to track all customer changes
CREATE TABLE IF NOT EXISTS appointment_edit_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  edited_by TEXT NOT NULL, -- Customer email
  edit_type TEXT NOT NULL, -- 'customer_edit', 'staff_edit'
  
  -- Fields that changed (JSON format for flexibility)
  changes JSONB NOT NULL,
  -- Example: {"customer_name": {"old": "John", "new": "John Doe"}, "appointment_date": {"old": "2024-01-10", "new": "2024-01-15"}}
  
  -- Snapshot of full record before change (optional but useful)
  previous_values JSONB,
  
  edit_reason TEXT, -- Optional: why customer made the change
  edited_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_appointment_edit_history_appointment_id ON appointment_edit_history(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_edit_history_edited_at ON appointment_edit_history(edited_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointment_edit_history_edit_type ON appointment_edit_history(edit_type);

-- Add comments
COMMENT ON TABLE appointment_edit_history IS 'Tracks all edits made to appointments by customers and staff';
COMMENT ON COLUMN appointment_edit_history.changes IS 'JSON object containing fields that changed with old/new values';
COMMENT ON COLUMN appointment_edit_history.previous_values IS 'Full snapshot of appointment data before edit';

-- =====================================================
-- PART 3: CREATE REPAIR ORDER NOTES TABLE
-- =====================================================

-- Drop existing table if recreating (CAUTION: Comment out if preserving data)
-- DROP TABLE IF EXISTS repair_order_notes CASCADE;

-- Create repair_order_notes table for RO communication
CREATE TABLE IF NOT EXISTS repair_order_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repair_order_id UUID NOT NULL REFERENCES repair_orders(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  customer_visible BOOLEAN DEFAULT FALSE,
  created_by TEXT NOT NULL, -- Staff email or 'customer'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_repair_order_notes_repair_order_id ON repair_order_notes(repair_order_id);
CREATE INDEX IF NOT EXISTS idx_repair_order_notes_customer_visible ON repair_order_notes(customer_visible);
CREATE INDEX IF NOT EXISTS idx_repair_order_notes_created_at ON repair_order_notes(created_at DESC);

-- Add comments
COMMENT ON TABLE repair_order_notes IS 'Stores notes for repair orders with customer visibility control';
COMMENT ON COLUMN repair_order_notes.customer_visible IS 'TRUE = visible to customer, FALSE = staff-only (internal)';

-- =====================================================
-- PART 4: MIGRATE EXISTING NOTES DATA
-- =====================================================

-- Only migrate if data doesn't already exist (safe for re-runs)
DO $$
BEGIN
  -- Migrate existing staff_notes from appointments to appointment_notes table
  -- All existing staff notes are marked as NOT customer_visible (internal only)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'staff_notes') THEN
    INSERT INTO appointment_notes (appointment_id, note_text, customer_visible, created_by, created_at)
    SELECT 
      id,
      staff_notes,
      FALSE, -- Existing staff notes are internal by default
      'system', -- Created by system during migration
      COALESCE(updated_at, created_at, NOW())
    FROM appointments
    WHERE staff_notes IS NOT NULL 
      AND staff_notes != ''
      AND id NOT IN (
        SELECT appointment_id FROM appointment_notes WHERE created_by = 'system'
      )
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Migrated staff_notes to appointment_notes';
  END IF;

  -- Migrate existing notes from appointments to appointment_notes table
  -- Customer notes are marked as customer_visible
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'notes') THEN
    INSERT INTO appointment_notes (appointment_id, note_text, customer_visible, created_by, created_at)
    SELECT 
      id,
      notes,
      TRUE, -- Customer-entered notes are visible to them
      'customer',
      COALESCE(created_at, NOW())
    FROM appointments
    WHERE notes IS NOT NULL 
      AND notes != ''
      AND id NOT IN (
        SELECT appointment_id FROM appointment_notes WHERE created_by = 'customer'
      )
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Migrated customer notes to appointment_notes';
  END IF;
END $$;

-- =====================================================
-- PART 5: ADD CUSTOMER EDIT TRACKING FIELDS
-- =====================================================

-- Add fields to track customer editing behavior
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS last_edited_by TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMPTZ;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS edit_count INTEGER DEFAULT 0;

-- Add comments
COMMENT ON COLUMN appointments.last_edited_by IS 'Email of last person to edit appointment (customer or staff)';
COMMENT ON COLUMN appointments.last_edited_at IS 'Timestamp of last edit';
COMMENT ON COLUMN appointments.edit_count IS 'Number of times customer has edited this appointment';

-- =====================================================
-- PART 6: CREATE VIEWS FOR EASY QUERYING
-- =====================================================

-- View: Customer-visible appointment data (what customers see in portal)
CREATE OR REPLACE VIEW customer_appointment_view AS
SELECT 
  a.id,
  a.customer_name,
  a.customer_email,
  a.customer_phone,
  a.appointment_date,
  a.appointment_time,
  a.duration_minutes,
  a.service_type,
  a.status,
  a.notes, -- Customer's own notes
  a.appointment_type,
  a.created_at,
  a.updated_at,
  -- Aggregated shared notes (staff notes marked as customer_visible)
  (
    SELECT json_agg(
      json_build_object(
        'id', n.id,
        'note_text', n.note_text,
        'created_by', n.created_by,
        'created_at', n.created_at
      ) ORDER BY n.created_at DESC
    )
    FROM appointment_notes n
    WHERE n.appointment_id = a.id AND n.customer_visible = TRUE
  ) AS shared_notes
FROM appointments a
WHERE a.deleted_at IS NULL;

COMMENT ON VIEW customer_appointment_view IS 'Customer-safe view showing only data customers should see';

-- View: Staff appointment view with all notes
CREATE OR REPLACE VIEW staff_appointment_view AS
SELECT 
  a.*,
  -- All notes (internal and shared)
  (
    SELECT json_agg(
      json_build_object(
        'id', n.id,
        'note_text', n.note_text,
        'customer_visible', n.customer_visible,
        'created_by', n.created_by,
        'created_at', n.created_at
      ) ORDER BY n.created_at DESC
    )
    FROM appointment_notes n
    WHERE n.appointment_id = a.id
  ) AS all_notes,
  -- Edit history
  (
    SELECT json_agg(
      json_build_object(
        'id', h.id,
        'edited_by', h.edited_by,
        'edit_type', h.edit_type,
        'changes', h.changes,
        'edited_at', h.edited_at
      ) ORDER BY h.edited_at DESC
    )
    FROM appointment_edit_history h
    WHERE h.appointment_id = a.id
  ) AS edit_history
FROM appointments a
WHERE a.deleted_at IS NULL;

COMMENT ON VIEW staff_appointment_view IS 'Staff view with all data including internal notes and edit history';

-- =====================================================
-- PART 7: CREATE TRIGGER FOR EDIT HISTORY TRACKING
-- =====================================================

-- Function to automatically log changes to appointment_edit_history
CREATE OR REPLACE FUNCTION log_appointment_edit()
RETURNS TRIGGER AS $$
DECLARE
  changes_json JSONB := '{}';
  previous_json JSONB;
BEGIN
  -- Build JSON of changed fields
  IF OLD.customer_name IS DISTINCT FROM NEW.customer_name THEN
    changes_json := changes_json || jsonb_build_object('customer_name', jsonb_build_object('old', OLD.customer_name, 'new', NEW.customer_name));
  END IF;
  
  IF OLD.customer_email IS DISTINCT FROM NEW.customer_email THEN
    changes_json := changes_json || jsonb_build_object('customer_email', jsonb_build_object('old', OLD.customer_email, 'new', NEW.customer_email));
  END IF;
  
  IF OLD.customer_phone IS DISTINCT FROM NEW.customer_phone THEN
    changes_json := changes_json || jsonb_build_object('customer_phone', jsonb_build_object('old', OLD.customer_phone, 'new', NEW.customer_phone));
  END IF;
  
  IF OLD.appointment_date IS DISTINCT FROM NEW.appointment_date THEN
    changes_json := changes_json || jsonb_build_object('appointment_date', jsonb_build_object('old', OLD.appointment_date, 'new', NEW.appointment_date));
  END IF;
  
  IF OLD.appointment_time IS DISTINCT FROM NEW.appointment_time THEN
    changes_json := changes_json || jsonb_build_object('appointment_time', jsonb_build_object('old', OLD.appointment_time, 'new', NEW.appointment_time));
  END IF;
  
  IF OLD.service_type IS DISTINCT FROM NEW.service_type THEN
    changes_json := changes_json || jsonb_build_object('service_type', jsonb_build_object('old', OLD.service_type, 'new', NEW.service_type));
  END IF;
  
  IF OLD.notes IS DISTINCT FROM NEW.notes THEN
    changes_json := changes_json || jsonb_build_object('notes', jsonb_build_object('old', OLD.notes, 'new', NEW.notes));
  END IF;
  
  -- Only log if there are actual changes
  IF changes_json != '{}' THEN
    -- Build previous values snapshot
    previous_json := jsonb_build_object(
      'customer_name', OLD.customer_name,
      'customer_email', OLD.customer_email,
      'customer_phone', OLD.customer_phone,
      'appointment_date', OLD.appointment_date,
      'appointment_time', OLD.appointment_time,
      'service_type', OLD.service_type,
      'notes', OLD.notes,
      'status', OLD.status
    );
    
    -- Insert into edit history
    INSERT INTO appointment_edit_history (
      appointment_id,
      edited_by,
      edit_type,
      changes,
      previous_values,
      edited_at
    ) VALUES (
      NEW.id,
      COALESCE(NEW.last_edited_by, 'unknown'),
      CASE 
        WHEN NEW.last_edited_by LIKE '%@%' AND NEW.last_edited_by NOT LIKE '%staff%' THEN 'customer_edit'
        ELSE 'staff_edit'
      END,
      changes_json,
      previous_json,
      NOW()
    );
    
    -- Increment edit count
    NEW.edit_count := COALESCE(OLD.edit_count, 0) + 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trg_log_appointment_edit ON appointments;
CREATE TRIGGER trg_log_appointment_edit
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION log_appointment_edit();

COMMENT ON FUNCTION log_appointment_edit() IS 'Automatically logs appointment changes to edit history';

-- =====================================================
-- PART 8: ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE appointment_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_edit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_order_notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean re-run)
DROP POLICY IF EXISTS "Staff can view all appointment notes" ON appointment_notes;
DROP POLICY IF EXISTS "Staff can insert appointment notes" ON appointment_notes;
DROP POLICY IF EXISTS "Customers can view their customer-visible notes" ON appointment_notes;
DROP POLICY IF EXISTS "Staff can view all edit history" ON appointment_edit_history;
DROP POLICY IF EXISTS "Staff can view all repair order notes" ON repair_order_notes;
DROP POLICY IF EXISTS "Staff can insert repair order notes" ON repair_order_notes;
DROP POLICY IF EXISTS "Customers can view their customer-visible RO notes" ON repair_order_notes;

-- Policies for appointment_notes
CREATE POLICY "Staff can view all appointment notes"
  ON appointment_notes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' IN ('admin', 'staff')
    )
  );

CREATE POLICY "Staff can insert appointment notes"
  ON appointment_notes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' IN ('admin', 'staff')
    )
  );

CREATE POLICY "Customers can view their customer-visible notes"
  ON appointment_notes FOR SELECT
  TO authenticated
  USING (
    customer_visible = TRUE
    AND EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.id = appointment_notes.appointment_id
      AND appointments.customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Policies for appointment_edit_history
CREATE POLICY "Staff can view all edit history"
  ON appointment_edit_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' IN ('admin', 'staff')
    )
  );

-- Policies for repair_order_notes (similar to appointment_notes)
CREATE POLICY "Staff can view all repair order notes"
  ON repair_order_notes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' IN ('admin', 'staff')
    )
  );

CREATE POLICY "Staff can insert repair order notes"
  ON repair_order_notes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' IN ('admin', 'staff')
    )
  );

CREATE POLICY "Customers can view their customer-visible RO notes"
  ON repair_order_notes FOR SELECT
  TO authenticated
  USING (
    customer_visible = TRUE
    AND EXISTS (
      SELECT 1 FROM repair_orders
      WHERE repair_orders.id = repair_order_notes.repair_order_id
      AND repair_orders.customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- =====================================================
-- PART 9: VERIFICATION QUERIES
-- =====================================================

-- Verify tables created
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_name IN ('appointment_notes', 'appointment_edit_history', 'repair_order_notes');
  
  RAISE NOTICE 'Tables Created: % of 3', table_count;
  
  IF table_count = 3 THEN
    RAISE NOTICE '✓ All tables created successfully';
  ELSE
    RAISE WARNING '✗ Only % tables created (expected 3)', table_count;
  END IF;
END $$;

-- Verify columns added to appointments
DO $$
DECLARE
  column_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO column_count
  FROM information_schema.columns 
  WHERE table_name = 'appointments' 
    AND column_name IN ('last_edited_by', 'last_edited_at', 'edit_count');
  
  RAISE NOTICE 'New Appointment Columns: % of 3', column_count;
  
  IF column_count = 3 THEN
    RAISE NOTICE '✓ All columns added successfully';
  ELSE
    RAISE WARNING '✗ Only % columns added (expected 3)', column_count;
  END IF;
END $$;

-- Count migrated notes (only if table exists)
DO $$
DECLARE
  total_count INTEGER;
  visible_count INTEGER;
  internal_count INTEGER;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointment_notes') THEN
    SELECT 
      COUNT(*),
      COUNT(*) FILTER (WHERE customer_visible = TRUE),
      COUNT(*) FILTER (WHERE customer_visible = FALSE)
    INTO total_count, visible_count, internal_count
    FROM appointment_notes;
    
    RAISE NOTICE 'Migrated Notes: % total (% customer-visible, % staff-only)', 
      total_count, visible_count, internal_count;
  ELSE
    RAISE WARNING 'appointment_notes table does not exist';
  END IF;
END $$;

-- Verify views created
DO $$
DECLARE
  view_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO view_count
  FROM information_schema.views 
  WHERE table_schema = 'public' 
    AND table_name IN ('customer_appointment_view', 'staff_appointment_view');
  
  RAISE NOTICE 'Views Created: % of 2', view_count;
  
  IF view_count = 2 THEN
    RAISE NOTICE '✓ All views created successfully';
  ELSE
    RAISE WARNING '✗ Only % views created (expected 2)', view_count;
  END IF;
END $$;

-- Verify trigger created
DO $$
DECLARE
  trigger_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'trg_log_appointment_edit'
  ) INTO trigger_exists;
  
  IF trigger_exists THEN
    RAISE NOTICE '✓ Trigger created successfully';
  ELSE
    RAISE WARNING '✗ Trigger not found';
  END IF;
END $$;

-- Final success message
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ MIGRATION COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Review the notices above for any warnings';
  RAISE NOTICE '2. Test the customer API endpoint';
  RAISE NOTICE '3. Test creating notes with customer_visible flag';
  RAISE NOTICE '4. Test edit history tracking';
  RAISE NOTICE '========================================';
END $$;
