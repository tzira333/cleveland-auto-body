-- ============================================================================
-- Archive Functionality for Appointments and Repair Orders
-- ============================================================================
-- This migration adds archive columns to allow soft-deletion of completed
-- appointments and repair orders while preserving historical data.
--
-- Run this in Supabase SQL Editor before deploying archive features.
-- ============================================================================

-- ============================================================================
-- 1. ADD ARCHIVE COLUMNS TO APPOINTMENTS
-- ============================================================================

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS archived_by TEXT;

-- Add index for efficient archive queries
CREATE INDEX IF NOT EXISTS idx_appointments_archived ON appointments(archived);
CREATE INDEX IF NOT EXISTS idx_appointments_archived_at ON appointments(archived_at DESC) WHERE archived = TRUE;

-- Add comments
COMMENT ON COLUMN appointments.archived IS 'Soft delete flag - TRUE when appointment is archived';
COMMENT ON COLUMN appointments.archived_at IS 'Timestamp when appointment was archived';
COMMENT ON COLUMN appointments.archived_by IS 'Staff member who archived the appointment';

-- ============================================================================
-- 2. ADD ARCHIVE COLUMNS TO REPAIR ORDERS
-- ============================================================================

ALTER TABLE crm_repair_orders 
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS archived_by TEXT;

-- Add indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_crm_repair_orders_archived ON crm_repair_orders(archived);
CREATE INDEX IF NOT EXISTS idx_crm_repair_orders_archived_at ON crm_repair_orders(archived_at DESC) WHERE archived = TRUE;

-- Add comments
COMMENT ON COLUMN crm_repair_orders.archived IS 'Soft delete flag - TRUE when RO is archived';
COMMENT ON COLUMN crm_repair_orders.archived_at IS 'Timestamp when RO was archived';
COMMENT ON COLUMN crm_repair_orders.archived_by IS 'Staff member who archived the RO';

-- ============================================================================
-- 3. CREATE REPAIR ORDER EDIT HISTORY TABLE
-- ============================================================================
-- Tracks all changes made to repair orders for audit purposes

CREATE TABLE IF NOT EXISTS crm_repair_order_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_order_id UUID NOT NULL REFERENCES crm_repair_orders(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  edited_by TEXT NOT NULL,
  edited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_ro_edits_repair_order_id ON crm_repair_order_edits(repair_order_id);
CREATE INDEX IF NOT EXISTS idx_ro_edits_edited_at ON crm_repair_order_edits(edited_at DESC);

-- Add comments
COMMENT ON TABLE crm_repair_order_edits IS 'Audit log of all edits made to repair orders';
COMMENT ON COLUMN crm_repair_order_edits.repair_order_id IS 'Foreign key to the repair order that was edited';
COMMENT ON COLUMN crm_repair_order_edits.field_name IS 'Name of the field that was changed (e.g., ro_number, status, priority)';
COMMENT ON COLUMN crm_repair_order_edits.old_value IS 'Previous value before edit';
COMMENT ON COLUMN crm_repair_order_edits.new_value IS 'New value after edit';
COMMENT ON COLUMN crm_repair_order_edits.edited_by IS 'Staff member who made the edit';
COMMENT ON COLUMN crm_repair_order_edits.edited_at IS 'Timestamp when edit was made';

-- ============================================================================
-- 4. ADD APPOINTMENT REFERENCE TO REPAIR ORDERS
-- ============================================================================
-- Link ROs back to their source appointment for better tracking

ALTER TABLE crm_repair_orders
ADD COLUMN IF NOT EXISTS appointment_id UUID REFERENCES appointments(id),
ADD COLUMN IF NOT EXISTS original_service_type TEXT,
ADD COLUMN IF NOT EXISTS original_appointment_date DATE,
ADD COLUMN IF NOT EXISTS original_appointment_time TIME;

-- Add index
CREATE INDEX IF NOT EXISTS idx_crm_repair_orders_appointment_id ON crm_repair_orders(appointment_id);

-- Add comments
COMMENT ON COLUMN crm_repair_orders.appointment_id IS 'Reference to the appointment this RO was created from (if applicable)';
COMMENT ON COLUMN crm_repair_orders.original_service_type IS 'Original service type from appointment (e.g., collision-repair, dent-repair)';
COMMENT ON COLUMN crm_repair_orders.original_appointment_date IS 'Original appointment date when customer booked';
COMMENT ON COLUMN crm_repair_orders.original_appointment_time IS 'Original appointment time when customer booked';

-- ============================================================================
-- 5. HELPER FUNCTIONS
-- ============================================================================

-- Function to get archive statistics
CREATE OR REPLACE FUNCTION get_archive_stats()
RETURNS TABLE (
  entity_type TEXT,
  total_count BIGINT,
  archived_count BIGINT,
  active_count BIGINT,
  archive_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'appointments'::TEXT,
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE archived = TRUE)::BIGINT,
    COUNT(*) FILTER (WHERE archived = FALSE OR archived IS NULL)::BIGINT,
    ROUND((COUNT(*) FILTER (WHERE archived = TRUE)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2)
  FROM appointments
  UNION ALL
  SELECT 
    'repair_orders'::TEXT,
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE archived = TRUE)::BIGINT,
    COUNT(*) FILTER (WHERE archived = FALSE OR archived IS NULL)::BIGINT,
    ROUND((COUNT(*) FILTER (WHERE archived = TRUE)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2)
  FROM crm_repair_orders;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_archive_stats() IS 'Returns archive statistics for appointments and repair orders';

-- ============================================================================
-- 6. VERIFICATION QUERIES
-- ============================================================================

-- Verify appointments table has archive columns
SELECT 
    'appointments' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'appointments'
  AND column_name IN ('archived', 'archived_at', 'archived_by')
ORDER BY column_name;

-- Verify repair orders table has archive columns
SELECT 
    'crm_repair_orders' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'crm_repair_orders'
  AND column_name IN ('archived', 'archived_at', 'archived_by', 'appointment_id', 'original_service_type')
ORDER BY column_name;

-- Verify edit history table exists
SELECT 
    'crm_repair_order_edits' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'crm_repair_order_edits'
ORDER BY ordinal_position;

-- Check indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND (
    tablename IN ('appointments', 'crm_repair_orders', 'crm_repair_order_edits')
    AND indexname LIKE '%archived%' OR indexname LIKE '%ro_edits%'
  )
ORDER BY tablename, indexname;

-- Get archive statistics
SELECT * FROM get_archive_stats();

-- ============================================================================
-- 7. TEST QUERIES (OPTIONAL - FOR TESTING)
-- ============================================================================

-- Test archiving an appointment
-- UPDATE appointments 
-- SET archived = TRUE, archived_at = NOW(), archived_by = 'Test Staff'
-- WHERE id = 'YOUR_APPOINTMENT_ID';

-- Test archiving a repair order
-- UPDATE crm_repair_orders 
-- SET archived = TRUE, archived_at = NOW(), archived_by = 'Test Staff'
-- WHERE id = 'YOUR_RO_ID';

-- Test inserting an edit record
-- INSERT INTO crm_repair_order_edits (repair_order_id, field_name, old_value, new_value, edited_by)
-- VALUES ('YOUR_RO_ID', 'status', 'in_repair', 'completed', 'Test Staff');

-- Query active (non-archived) appointments
-- SELECT COUNT(*) as active_appointments 
-- FROM appointments 
-- WHERE archived = FALSE OR archived IS NULL;

-- Query archived appointments
-- SELECT COUNT(*) as archived_appointments 
-- FROM appointments 
-- WHERE archived = TRUE;

-- Query active repair orders
-- SELECT COUNT(*) as active_ros 
-- FROM crm_repair_orders 
-- WHERE archived = FALSE OR archived IS NULL;

-- Query archived repair orders
-- SELECT COUNT(*) as archived_ros 
-- FROM crm_repair_orders 
-- WHERE archived = TRUE;

-- ============================================================================
-- NOTES
-- ============================================================================
-- 
-- 1. SOFT DELETE PATTERN
--    - We use archived = TRUE instead of deleting records
--    - This preserves historical data for reporting and auditing
--    - Archived items can be unarchived if needed
--
-- 2. INDEXES
--    - Partial indexes on archived_at only for archived records (saves space)
--    - Standard index on archived boolean for filtering active vs archived
--
-- 3. EDIT HISTORY
--    - All RO edits are logged for audit trail
--    - Track what changed, when, and who made the change
--    - Use ON DELETE CASCADE so history is removed if RO is deleted
--
-- 4. APPOINTMENT LINKING
--    - ROs can reference their source appointment
--    - Preserves original appointment details even if appointment is edited
--    - Helps track the customer journey from booking to completion
--
-- 5. VERIFICATION
--    - Run the verification queries after applying migration
--    - Check that all columns exist and indexes are created
--    - Use get_archive_stats() to monitor archive usage over time
--
-- ============================================================================

-- Migration complete
SELECT 'Archive functionality migration completed successfully!' as status;
