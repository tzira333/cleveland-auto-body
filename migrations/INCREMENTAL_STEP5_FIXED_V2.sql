-- INCREMENTAL MIGRATION - Section 5 (FIXED v2)
-- Only run this AFTER Section 4 succeeds

-- =====================================================
-- SECTION 5: Create views (minimal - no edit_history)
-- =====================================================

DROP VIEW IF EXISTS customer_appointment_view CASCADE;
DROP VIEW IF EXISTS staff_appointment_view CASCADE;

-- Create customer view with only essential columns
CREATE VIEW customer_appointment_view AS
SELECT 
  a.id,
  a.customer_name,
  a.customer_email,
  a.customer_phone,
  a.appointment_date,
  a.appointment_time,
  a.service_type,
  a.status,
  a.notes,
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

-- Create staff view with all notes but NO edit_history (table doesn't exist)
CREATE VIEW staff_appointment_view AS
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
  ) AS all_notes
FROM appointments a
WHERE a.deleted_at IS NULL;

SELECT 'Section 5 complete: views created (without edit_history)' as status;
SELECT 'Note: appointment_edit_history table was not created in Step 2' as note;

-- STOP HERE - Tell me if this works
-- If it works, continue to Section 6 in a NEW query
