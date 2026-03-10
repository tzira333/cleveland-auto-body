-- Migration: Service Inquiries and Appointment Workflow Redesign
-- This migration adds appointment_type to distinguish between service inquiries and confirmed appointments
-- and adds archive functionality for appointments converted to repair orders

-- CRITICAL: Add staff_notes column if it doesn't exist
-- This column is essential for tracking staff actions and notes on appointments
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS staff_notes TEXT;

COMMENT ON COLUMN appointments.staff_notes IS 'Internal notes added by staff members (e.g., confirmation details, follow-up actions)';

-- 1. Add appointment_type column to distinguish Service Inquiries from Confirmed Appointments
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS appointment_type TEXT DEFAULT 'inquiry' 
CHECK (appointment_type IN ('inquiry', 'confirmed'));

-- 3. Add archive columns for appointments
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS archived_by TEXT;

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS archived_reason TEXT;

-- 3. Update existing appointments based on status
-- All 'confirmed' status appointments should be appointment_type='confirmed'
UPDATE appointments 
SET appointment_type = 'confirmed' 
WHERE status = 'confirmed';

-- All other appointments default to 'inquiry'
UPDATE appointments 
SET appointment_type = 'inquiry' 
WHERE appointment_type IS NULL OR appointment_type = 'inquiry';

-- 4. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointments_type ON appointments(appointment_type);
CREATE INDEX IF NOT EXISTS idx_appointments_archived ON appointments(archived);
CREATE INDEX IF NOT EXISTS idx_appointments_type_archived ON appointments(appointment_type, archived);

-- 5. Add comment to clarify the new workflow
COMMENT ON COLUMN appointments.appointment_type IS 'inquiry: Initial service inquiry from customer, confirmed: Appointment confirmed by staff';
COMMENT ON COLUMN appointments.archived IS 'TRUE when appointment converted to RO or no longer active';
COMMENT ON COLUMN appointments.archived_at IS 'Timestamp when appointment was archived';
COMMENT ON COLUMN appointments.archived_by IS 'Staff member who archived the appointment';
COMMENT ON COLUMN appointments.archived_reason IS 'Reason for archiving (e.g., converted_to_ro, cancelled, no_show)';

-- 6. Create view for active service inquiries
CREATE OR REPLACE VIEW active_service_inquiries AS
SELECT * FROM appointments
WHERE appointment_type = 'inquiry' 
  AND archived = FALSE
ORDER BY created_at DESC;

-- 7. Create view for confirmed appointments
CREATE OR REPLACE VIEW confirmed_appointments AS
SELECT * FROM appointments
WHERE appointment_type = 'confirmed' 
  AND archived = FALSE
ORDER BY appointment_date, appointment_time;

-- 8. Create view for archived appointments
CREATE OR REPLACE VIEW archived_appointments AS
SELECT * FROM appointments
WHERE archived = TRUE
ORDER BY archived_at DESC;

-- Verification queries
SELECT 'Migration completed' AS status;
SELECT 
  appointment_type,
  archived,
  COUNT(*) as count
FROM appointments
GROUP BY appointment_type, archived;
