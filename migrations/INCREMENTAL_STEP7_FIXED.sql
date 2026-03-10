-- INCREMENTAL MIGRATION - Section 7 (FIXED)
-- Only run this AFTER Section 5 succeeds

-- =====================================================
-- SECTION 7: Enable RLS and create policies (NO edit_history)
-- =====================================================

-- Enable RLS only on tables that exist
ALTER TABLE appointment_notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Staff can view all appointment notes" ON appointment_notes;
DROP POLICY IF EXISTS "Staff can insert appointment notes" ON appointment_notes;
DROP POLICY IF EXISTS "Customers can view their customer-visible notes" ON appointment_notes;

-- Create policies for appointment_notes
CREATE POLICY "Staff can view all appointment notes" 
  ON appointment_notes FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = id AND raw_user_meta_data->>'role' IN ('admin', 'staff')));

CREATE POLICY "Staff can insert appointment notes" 
  ON appointment_notes FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = id AND raw_user_meta_data->>'role' IN ('admin', 'staff')));

CREATE POLICY "Customers can view their customer-visible notes" 
  ON appointment_notes FOR SELECT TO authenticated
  USING (customer_visible = TRUE AND EXISTS (SELECT 1 FROM appointments WHERE appointments.id = appointment_notes.appointment_id AND appointments.customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())));

SELECT 'Section 7 complete: RLS enabled and policies created for appointment_notes' as status;
SELECT 'Note: Skipped appointment_edit_history and repair_order_notes (tables do not exist)' as note;

-- =====================================================
-- ALL DONE!
-- =====================================================

SELECT '========================================' as msg
UNION ALL SELECT '✅ STEP 7 COMPLETE!'
UNION ALL SELECT '========================================'
UNION ALL SELECT 'RLS and policies ready for appointment_notes'
UNION ALL SELECT 'Proceed to data migration (INCREMENTAL_STEP8_UPDATED.sql)';
