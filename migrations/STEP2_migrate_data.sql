-- Migration: Part 2 - Migrate Existing Notes Data
-- Run this AFTER Part 1 (STEP1_create_tables.sql) completes successfully
-- This migrates existing notes/staff_notes to the new appointment_notes table

-- =====================================================
-- MIGRATE STAFF NOTES
-- =====================================================

-- Migrate staff_notes (mark as internal/staff-only)
INSERT INTO appointment_notes (appointment_id, note_text, customer_visible, created_by, created_at)
SELECT 
  id AS appointment_id,
  staff_notes AS note_text,
  FALSE AS customer_visible,
  'system' AS created_by,
  COALESCE(updated_at, created_at, NOW()) AS created_at
FROM appointments
WHERE staff_notes IS NOT NULL 
  AND staff_notes != ''
  AND staff_notes != ' '
ON CONFLICT DO NOTHING;

-- Show count
DO $$ 
DECLARE 
  staff_count INTEGER;
BEGIN
  GET DIAGNOSTICS staff_count = ROW_COUNT;
  RAISE NOTICE 'Migrated % staff notes', staff_count;
END $$;

-- =====================================================
-- MIGRATE CUSTOMER NOTES
-- =====================================================

-- Migrate customer notes (mark as customer-visible)
INSERT INTO appointment_notes (appointment_id, note_text, customer_visible, created_by, created_at)
SELECT 
  id AS appointment_id,
  notes AS note_text,
  TRUE AS customer_visible,
  'customer' AS created_by,
  COALESCE(created_at, NOW()) AS created_at
FROM appointments
WHERE notes IS NOT NULL 
  AND notes != ''
  AND notes != ' '
  AND id NOT IN (
    SELECT appointment_id FROM appointment_notes WHERE created_by = 'customer'
  )
ON CONFLICT DO NOTHING;

-- Show count
DO $$ 
DECLARE 
  customer_count INTEGER;
BEGIN
  GET DIAGNOSTICS customer_count = ROW_COUNT;
  RAISE NOTICE 'Migrated % customer notes', customer_count;
END $$;

-- =====================================================
-- FINAL VERIFICATION
-- =====================================================

DO $$
DECLARE
  total_notes INTEGER;
  visible_notes INTEGER;
  staff_notes INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_notes FROM appointment_notes;
  SELECT COUNT(*) INTO visible_notes FROM appointment_notes WHERE customer_visible = TRUE;
  SELECT COUNT(*) INTO staff_notes FROM appointment_notes WHERE customer_visible = FALSE;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DATA MIGRATION COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total notes migrated: %', total_notes;
  RAISE NOTICE 'Customer-visible notes: %', visible_notes;
  RAISE NOTICE 'Staff-only notes: %', staff_notes;
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Migration successful!';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Verify data with: SELECT * FROM appointment_notes LIMIT 5;';
  RAISE NOTICE '2. Test customer view: SELECT * FROM customer_appointment_view LIMIT 3;';
  RAISE NOTICE '3. Test staff view: SELECT * FROM staff_appointment_view LIMIT 3;';
  RAISE NOTICE '========================================';
END $$;
