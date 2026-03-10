-- INCREMENTAL MIGRATION - Section 8 (Data Migration)
-- Only run this AFTER Section 7 succeeds
-- This migrates your existing notes/staff_notes to the new system

-- =====================================================
-- SECTION 8: Migrate existing data
-- =====================================================

-- Migrate staff_notes (if column exists)
INSERT INTO appointment_notes (appointment_id, note_text, customer_visible, created_by, created_at)
SELECT 
  id,
  staff_notes,
  FALSE,
  'system',
  COALESCE(updated_at, created_at, NOW())
FROM appointments
WHERE staff_notes IS NOT NULL 
  AND staff_notes != ''
  AND staff_notes != ' '
ON CONFLICT DO NOTHING;

-- Get count
DO $$ 
DECLARE staff_count INTEGER;
BEGIN
  GET DIAGNOSTICS staff_count = ROW_COUNT;
  RAISE NOTICE 'Migrated % staff notes', staff_count;
END $$;

-- Migrate customer notes (if column exists)
INSERT INTO appointment_notes (appointment_id, note_text, customer_visible, created_by, created_at)
SELECT 
  id,
  notes,
  TRUE,
  'customer',
  COALESCE(created_at, NOW())
FROM appointments
WHERE notes IS NOT NULL 
  AND notes != ''
  AND notes != ' '
ON CONFLICT DO NOTHING;

-- Get count
DO $$ 
DECLARE customer_count INTEGER;
BEGIN
  GET DIAGNOSTICS customer_count = ROW_COUNT;
  RAISE NOTICE 'Migrated % customer notes', customer_count;
END $$;

-- Final summary
DO $$
DECLARE
  total INTEGER;
  visible INTEGER;
  internal INTEGER;
BEGIN
  SELECT COUNT(*) INTO total FROM appointment_notes;
  SELECT COUNT(*) INTO visible FROM appointment_notes WHERE customer_visible = TRUE;
  SELECT COUNT(*) INTO internal FROM appointment_notes WHERE customer_visible = FALSE;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ DATA MIGRATION COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total notes: %', total;
  RAISE NOTICE 'Customer-visible: %', visible;
  RAISE NOTICE 'Staff-only: %', internal;
  RAISE NOTICE '========================================';
END $$;
