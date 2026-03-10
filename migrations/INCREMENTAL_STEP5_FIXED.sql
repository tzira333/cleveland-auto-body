-- INCREMENTAL MIGRATION - Section 5 (FIXED)
-- Only run this AFTER Section 4 succeeds

-- =====================================================
-- SECTION 5: Create views (only essential columns)
-- =====================================================

DROP VIEW IF EXISTS customer_appointment_view CASCADE;
DROP VIEW IF EXISTS staff_appointment_view CASCADE;

-- Create customer view with only columns that exist in all setups
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

-- Create staff view with all columns (use a.* for everything)
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

SELECT 'Section 5 complete: views created (with only existing columns)' as status;

-- STOP HERE - Tell me if this works
-- If it works, continue to Section 6 in a NEW query
