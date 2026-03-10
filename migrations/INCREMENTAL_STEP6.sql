-- INCREMENTAL MIGRATION - Section 6
-- Only run this AFTER Section 5 succeeds

-- =====================================================
-- SECTION 6: Create trigger and function
-- =====================================================

DROP TRIGGER IF EXISTS trg_log_appointment_edit ON appointments;
DROP FUNCTION IF EXISTS log_appointment_edit() CASCADE;

CREATE FUNCTION log_appointment_edit()
RETURNS TRIGGER AS $$
DECLARE
  changes_json JSONB := '{}';
  previous_json JSONB;
BEGIN
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
      appointment_id, edited_by, edit_type, changes, previous_values, edited_at
    ) VALUES (
      NEW.id,
      COALESCE(NEW.last_edited_by, 'unknown'),
      CASE WHEN NEW.last_edited_by LIKE '%@%' AND NEW.last_edited_by NOT LIKE '%staff%' THEN 'customer_edit' ELSE 'staff_edit' END,
      changes_json,
      previous_json,
      NOW()
    );
    
    NEW.edit_count := COALESCE(OLD.edit_count, 0) + 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_appointment_edit
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION log_appointment_edit();

SELECT 'Section 6 complete: trigger and function created' as status;

-- STOP HERE - Tell me if this works
-- If it works, continue to Section 7 in a NEW query
