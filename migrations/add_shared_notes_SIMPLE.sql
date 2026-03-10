-- Migration: Add Shared Notes System and Edit History Tracking (SIMPLIFIED)
-- Purpose: Enable staff to share notes with customers and track customer edits
-- Date: 2024-03-10
-- SAFE: Handles all edge cases, can be run multiple times

-- =====================================================
-- PART 0: ENABLE UUID EXTENSION
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PART 1: CREATE APPOINTMENT NOTES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS appointment_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  customer_visible BOOLEAN DEFAULT FALSE,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointment_notes_appointment_id ON appointment_notes(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_notes_customer_visible ON appointment_notes(customer_visible);
CREATE INDEX IF NOT EXISTS idx_appointment_notes_created_at ON appointment_notes(created_at DESC);

COMMENT ON TABLE appointment_notes IS 'Stores notes for appointments with customer visibility control';
COMMENT ON COLUMN appointment_notes.customer_visible IS 'TRUE = visible to customer, FALSE = staff-only';

-- =====================================================
-- PART 2: CREATE APPOINTMENT EDIT HISTORY TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS appointment_edit_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  edited_by TEXT NOT NULL,
  edit_type TEXT NOT NULL,
  changes JSONB NOT NULL,
  previous_values JSONB,
  edit_reason TEXT,
  edited_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointment_edit_history_appointment_id ON appointment_edit_history(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_edit_history_edited_at ON appointment_edit_history(edited_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointment_edit_history_edit_type ON appointment_edit_history(edit_type);

COMMENT ON TABLE appointment_edit_history IS 'Tracks all edits made to appointments by customers and staff';

-- =====================================================
-- PART 3: CREATE REPAIR ORDER NOTES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS repair_order_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repair_order_id UUID NOT NULL REFERENCES repair_orders(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  customer_visible BOOLEAN DEFAULT FALSE,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_repair_order_notes_repair_order_id ON repair_order_notes(repair_order_id);
CREATE INDEX IF NOT EXISTS idx_repair_order_notes_customer_visible ON repair_order_notes(customer_visible);
CREATE INDEX IF NOT EXISTS idx_repair_order_notes_created_at ON repair_order_notes(created_at DESC);

COMMENT ON TABLE repair_order_notes IS 'Stores notes for repair orders with customer visibility control';

-- =====================================================
-- PART 4: ADD COLUMNS TO APPOINTMENTS TABLE
-- =====================================================

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS last_edited_by TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMPTZ;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS edit_count INTEGER DEFAULT 0;

-- =====================================================
-- PART 5: MIGRATE EXISTING NOTES (SIMPLIFIED)
-- =====================================================

-- Create temporary tracking table to avoid duplicates
CREATE TEMP TABLE IF NOT EXISTS migration_tracking (
  appointment_id UUID,
  note_type TEXT,
  migrated BOOLEAN DEFAULT TRUE
);

-- Migrate staff_notes (if column exists and not already migrated)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'staff_notes'
  ) THEN
    -- Insert staff notes that haven't been migrated yet
    INSERT INTO appointment_notes (appointment_id, note_text, customer_visible, created_by, created_at)
    SELECT 
      a.id,
      a.staff_notes,
      FALSE,
      'system',
      COALESCE(a.updated_at, a.created_at, NOW())
    FROM appointments a
    WHERE a.staff_notes IS NOT NULL 
      AND a.staff_notes != ''
      AND NOT EXISTS (
        SELECT 1 FROM appointment_notes an 
        WHERE an.appointment_id = a.id 
        AND an.created_by = 'system'
        AND an.note_text = a.staff_notes
      );
    
    RAISE NOTICE 'Migrated % staff notes', FOUND;
  END IF;
END $$;

-- Migrate customer notes (if column exists and not already migrated)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'notes'
  ) THEN
    -- Insert customer notes that haven't been migrated yet
    INSERT INTO appointment_notes (appointment_id, note_text, customer_visible, created_by, created_at)
    SELECT 
      a.id,
      a.notes,
      TRUE,
      'customer',
      COALESCE(a.created_at, NOW())
    FROM appointments a
    WHERE a.notes IS NOT NULL 
      AND a.notes != ''
      AND NOT EXISTS (
        SELECT 1 FROM appointment_notes an 
        WHERE an.appointment_id = a.id 
        AND an.created_by = 'customer'
        AND an.note_text = a.notes
      );
    
    RAISE NOTICE 'Migrated % customer notes', FOUND;
  END IF;
END $$;

-- =====================================================
-- PART 6: CREATE VIEWS
-- =====================================================

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
  a.notes,
  a.appointment_type,
  a.created_at,
  a.updated_at,
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

CREATE OR REPLACE VIEW staff_appointment_view AS
SELECT 
  a.*,
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

-- =====================================================
-- PART 7: CREATE TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION log_appointment_edit()
RETURNS TRIGGER AS $$
DECLARE
  changes_json JSONB := '{}';
  previous_json JSONB;
BEGIN
  -- Track changes
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
  
  -- Only log if there are changes
  IF changes_json != '{}' THEN
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
    
    NEW.edit_count := COALESCE(OLD.edit_count, 0) + 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_appointment_edit ON appointments;
CREATE TRIGGER trg_log_appointment_edit
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION log_appointment_edit();

-- =====================================================
-- PART 8: ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE appointment_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_edit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_order_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view all appointment notes" ON appointment_notes;
DROP POLICY IF EXISTS "Staff can insert appointment notes" ON appointment_notes;
DROP POLICY IF EXISTS "Customers can view their customer-visible notes" ON appointment_notes;
DROP POLICY IF EXISTS "Staff can view all edit history" ON appointment_edit_history;
DROP POLICY IF EXISTS "Staff can view all repair order notes" ON repair_order_notes;
DROP POLICY IF EXISTS "Staff can insert repair order notes" ON repair_order_notes;
DROP POLICY IF EXISTS "Customers can view their customer-visible RO notes" ON repair_order_notes;

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
-- PART 9: FINAL VERIFICATION
-- =====================================================

DO $$
DECLARE
  table_count INTEGER;
  view_count INTEGER;
  column_count INTEGER;
  note_count INTEGER;
BEGIN
  -- Count tables
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN ('appointment_notes', 'appointment_edit_history', 'repair_order_notes');
  
  -- Count views
  SELECT COUNT(*) INTO view_count
  FROM information_schema.views 
  WHERE table_schema = 'public' 
  AND table_name IN ('customer_appointment_view', 'staff_appointment_view');
  
  -- Count columns
  SELECT COUNT(*) INTO column_count
  FROM information_schema.columns 
  WHERE table_name = 'appointments' 
  AND column_name IN ('last_edited_by', 'last_edited_at', 'edit_count');
  
  -- Count notes
  SELECT COUNT(*) INTO note_count FROM appointment_notes;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRATION SUMMARY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables created: %/3', table_count;
  RAISE NOTICE 'Views created: %/2', view_count;
  RAISE NOTICE 'Columns added: %/3', column_count;
  RAISE NOTICE 'Notes migrated: %', note_count;
  RAISE NOTICE '========================================';
  
  IF table_count = 3 AND view_count = 2 AND column_count = 3 THEN
    RAISE NOTICE '✅ MIGRATION COMPLETED SUCCESSFULLY!';
  ELSE
    RAISE WARNING '⚠️ Migration incomplete - review output above';
  END IF;
  
  RAISE NOTICE '========================================';
END $$;
