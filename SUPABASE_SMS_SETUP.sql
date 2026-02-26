-- QUICK SETUP: Run this entire script in Supabase SQL Editor
-- This will create all tables and insert your staff phone numbers

-- Drop existing tables if you want to start fresh (OPTIONAL - uncomment if needed)
-- DROP TABLE IF EXISTS sms_logs CASCADE;
-- DROP TABLE IF EXISTS sms_templates CASCADE;
-- DROP TABLE IF EXISTS staff_sms_settings CASCADE;
-- DROP TABLE IF EXISTS customer_sms_preferences CASCADE;

-- 1. Staff SMS notification settings
CREATE TABLE IF NOT EXISTS staff_sms_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_email TEXT NOT NULL UNIQUE,
  staff_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  notify_new_appointments BOOLEAN DEFAULT TRUE,
  notify_new_tow_requests BOOLEAN DEFAULT TRUE,
  notify_urgent_ros BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SMS templates
CREATE TABLE IF NOT EXISTS sms_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL UNIQUE,
  template_type TEXT NOT NULL,
  message_template TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SMS logs
CREATE TABLE IF NOT EXISTS sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_phone TEXT NOT NULL,
  from_phone TEXT NOT NULL,
  message_body TEXT NOT NULL,
  message_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  twilio_sid TEXT,
  error_message TEXT,
  cost NUMERIC(10, 4),
  related_appointment_id UUID,
  related_ro_id UUID,
  sent_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ
);

-- 4. Customer SMS preferences
CREATE TABLE IF NOT EXISTS customer_sms_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL UNIQUE,
  opted_in BOOLEAN DEFAULT TRUE,
  opt_out_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_staff_sms_settings_email ON staff_sms_settings(staff_email);
CREATE INDEX IF NOT EXISTS idx_staff_sms_settings_active ON staff_sms_settings(is_active);
CREATE INDEX IF NOT EXISTS idx_sms_logs_to_phone ON sms_logs(to_phone);
CREATE INDEX IF NOT EXISTS idx_sms_logs_created_at ON sms_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_logs_appointment_id ON sms_logs(related_appointment_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_ro_id ON sms_logs(related_ro_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_status ON sms_logs(status);
CREATE INDEX IF NOT EXISTS idx_sms_templates_type ON sms_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_customer_sms_prefs_phone ON customer_sms_preferences(phone_number);

-- Insert SMS templates
INSERT INTO sms_templates (template_name, template_type, message_template, description) VALUES
('new_appointment_staff', 'staff_notification', 'New Appointment Alert!\nCustomer: {customer_name}\nPhone: {customer_phone}\nService: {service_type}\nDate: {appointment_date} at {appointment_time}\nVehicle: {vehicle_info}', 'Notification sent to staff when a new appointment is created'),
('new_tow_request_staff', 'staff_notification', 'New Tow Request Alert!\nCustomer: {customer_name}\nPhone: {customer_phone}\nLocation: {location}\nVehicle: {vehicle_info}\nUrgent: {is_urgent}', 'Notification sent to staff when a new tow request is created'),
('ro_status_estimate_approval', 'customer_status_update', 'Cleveland Auto Body: Your estimate for {vehicle_info} is ready for approval. Amount: ${estimate_amount}. Please call us at (216) 288-0668 to discuss. RO#{ro_number}', 'Sent when RO status changes to estimate_approval'),
('ro_status_parts_ordered', 'customer_status_update', 'Cleveland Auto Body: Parts have been ordered for your {vehicle_info}. We will notify you when work begins. RO#{ro_number}', 'Sent when RO status changes to parts_ordered'),
('ro_status_in_repair', 'customer_status_update', 'Cleveland Auto Body: Work has started on your {vehicle_info}. Est. completion: {estimated_completion}. RO#{ro_number}', 'Sent when RO status changes to in_repair'),
('ro_status_ready_pickup', 'customer_status_update', 'Cleveland Auto Body: Great news! Your {vehicle_info} is ready for pickup. Please call (216) 288-0668 to schedule. RO#{ro_number}', 'Sent when RO status changes to ready_pickup'),
('ro_status_completed', 'customer_status_update', 'Cleveland Auto Body: Thank you for choosing us! Your {vehicle_info} repair is complete. We appreciate your business! RO#{ro_number}', 'Sent when RO status changes to completed'),
('manual_customer_message', 'manual', '{custom_message}', 'Template for manual messages sent from RO details page')
ON CONFLICT (template_name) DO NOTHING;

-- Create update triggers
CREATE OR REPLACE FUNCTION update_sms_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_staff_sms_settings_timestamp ON staff_sms_settings;
CREATE TRIGGER update_staff_sms_settings_timestamp
BEFORE UPDATE ON staff_sms_settings
FOR EACH ROW
EXECUTE FUNCTION update_sms_settings_timestamp();

DROP TRIGGER IF EXISTS update_customer_sms_preferences_timestamp ON customer_sms_preferences;
CREATE TRIGGER update_customer_sms_preferences_timestamp
BEFORE UPDATE ON customer_sms_preferences
FOR EACH ROW
EXECUTE FUNCTION update_sms_settings_timestamp();

-- INSERT YOUR STAFF PHONE NUMBERS HERE
INSERT INTO staff_sms_settings (staff_email, staff_name, phone_number, notify_new_appointments, notify_new_tow_requests) 
VALUES 
  ('domesticandforeignab@gmail.com', 'Shop Manager', '2162880668', true, true),
  ('domesticbody@gmail.com', 'Service Advisor', '4407491081', true, true)
ON CONFLICT (staff_email) DO UPDATE 
SET 
  phone_number = EXCLUDED.phone_number,
  staff_name = EXCLUDED.staff_name,
  notify_new_appointments = EXCLUDED.notify_new_appointments,
  notify_new_tow_requests = EXCLUDED.notify_new_tow_requests,
  updated_at = NOW();

-- VERIFICATION: Check that everything was created successfully
SELECT '✅ Tables Created' AS status;
SELECT 'staff_sms_settings' AS table_name, COUNT(*) AS row_count FROM staff_sms_settings
UNION ALL
SELECT 'sms_templates', COUNT(*) FROM sms_templates
UNION ALL
SELECT 'sms_logs', COUNT(*) FROM sms_logs
UNION ALL
SELECT 'customer_sms_preferences', COUNT(*) FROM customer_sms_preferences;

-- Show your staff configuration
SELECT '✅ Staff Phone Numbers Configured' AS status;
SELECT staff_email, staff_name, phone_number, notify_new_appointments, notify_new_tow_requests, is_active 
FROM staff_sms_settings 
ORDER BY staff_name;

-- Show SMS templates
SELECT '✅ SMS Templates Loaded' AS status;
SELECT template_name, template_type, LEFT(message_template, 50) || '...' AS message_preview 
FROM sms_templates 
ORDER BY template_type, template_name;
