-- INCREMENTAL MIGRATION - Section 7 (FINAL)
-- Only run this AFTER Section 6 succeeds

-- =====================================================
-- SECTION 7: Enable RLS and create policies
-- =====================================================

-- Enable RLS
ALTER TABLE appointment_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_edit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_order_notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Staff can view all appointment notes" ON appointment_notes;
DROP POLICY IF EXISTS "Staff can insert appointment notes" ON appointment_notes;
DROP POLICY IF EXISTS "Customers can view their customer-visible notes" ON appointment_notes;
DROP POLICY IF EXISTS "Staff can view all edit history" ON appointment_edit_history;
DROP POLICY IF EXISTS "Staff can view all repair order notes" ON repair_order_notes;
DROP POLICY IF EXISTS "Staff can insert repair order notes" ON repair_order_notes;
DROP POLICY IF EXISTS "Customers can view their customer-visible RO notes" ON repair_order_notes;

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

-- Create policy for appointment_edit_history
CREATE POLICY "Staff can view all edit history" 
  ON appointment_edit_history FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = id AND raw_user_meta_data->>'role' IN ('admin', 'staff')));

-- Create policies for repair_order_notes
CREATE POLICY "Staff can view all repair order notes" 
  ON repair_order_notes FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = id AND raw_user_meta_data->>'role' IN ('admin', 'staff')));

CREATE POLICY "Staff can insert repair order notes" 
  ON repair_order_notes FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = id AND raw_user_meta_data->>'role' IN ('admin', 'staff')));

CREATE POLICY "Customers can view their customer-visible RO notes" 
  ON repair_order_notes FOR SELECT TO authenticated
  USING (customer_visible = TRUE AND EXISTS (SELECT 1 FROM repair_orders WHERE repair_orders.id = repair_order_notes.repair_order_id AND repair_orders.customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())));

SELECT 'Section 7 complete: RLS enabled and all policies created' as status;

-- =====================================================
-- ALL DONE!
-- =====================================================

SELECT '========================================' as msg
UNION ALL SELECT '✅ MIGRATION COMPLETE!'
UNION ALL SELECT '========================================'
UNION ALL SELECT 'All 7 sections completed successfully'
UNION ALL SELECT 'Tables, views, triggers, and policies are ready'
UNION ALL SELECT 'Proceed to data migration (INCREMENTAL_STEP8.sql)';
