-- DIAGNOSTIC TEST - Find where the error occurs
-- Run this to identify the exact problem

-- Test 1: Can we create the table?
DO $$
BEGIN
  CREATE TABLE IF NOT EXISTS appointment_notes_test (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID,
    note_text TEXT NOT NULL,
    customer_visible BOOLEAN DEFAULT FALSE,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  RAISE NOTICE '✅ Test 1 PASSED: Table creation works';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ Test 1 FAILED: %', SQLERRM;
END $$;

-- Test 2: Can we query the column?
DO $$
DECLARE
  test_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO test_count FROM appointment_notes_test WHERE customer_visible = TRUE;
  RAISE NOTICE '✅ Test 2 PASSED: Column query works (count: %)', test_count;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ Test 2 FAILED: %', SQLERRM;
END $$;

-- Test 3: Can we create the view?
DO $$
BEGIN
  CREATE OR REPLACE VIEW customer_appointment_view_test AS
  SELECT 
    a.id,
    a.customer_name,
    (
      SELECT json_agg(json_build_object('id', n.id, 'note_text', n.note_text))
      FROM appointment_notes_test n
      WHERE n.appointment_id = a.id AND n.customer_visible = TRUE
    ) AS shared_notes
  FROM appointments a
  WHERE a.deleted_at IS NULL
  LIMIT 1;
  
  RAISE NOTICE '✅ Test 3 PASSED: View creation works';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ Test 3 FAILED: %', SQLERRM;
END $$;

-- Test 4: Can we create a policy?
DO $$
BEGIN
  ALTER TABLE appointment_notes_test ENABLE ROW LEVEL SECURITY;
  
  DROP POLICY IF EXISTS "test_policy" ON appointment_notes_test;
  
  CREATE POLICY "test_policy" ON appointment_notes_test FOR SELECT
  USING (customer_visible = TRUE);
  
  RAISE NOTICE '✅ Test 4 PASSED: Policy creation works';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ Test 4 FAILED: %', SQLERRM;
END $$;

-- Cleanup
DROP VIEW IF EXISTS customer_appointment_view_test;
DROP TABLE IF EXISTS appointment_notes_test;

-- Summary
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DIAGNOSTIC COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Check the test results above.';
  RAISE NOTICE 'Share which test failed with the exact error message.';
  RAISE NOTICE '========================================';
END $$;
