-- SMS Functionality Database Schema
-- Run this in Supabase SQL Editor

-- 1. Staff SMS notification settings table
CREATE TABLE IF NOT EXISTS staff_sms_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_user_id UUID REFERENCES staff_users(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  notify_new_appointments BOOLEAN DEFAULT TRUE,
  notify_new_tow_requests BOOLEAN DEFAULT TRUE,
  notify_urgent_ros BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(staff_user_id)
);

-- 2. SMS templates table
CREATE TABLE IF NOT EXISTS sms_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL UNIQUE,
  template_type TEXT NOT NULL, -- 'staff_notification', 'customer_status_update', 'manual'
  message_template TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SMS logs table for tracking all sent messages
CREATE TABLE IF NOT EXISTS sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_phone TEXT NOT NULL,
  from_phone TEXT NOT NULL,
  message_body TEXT NOT NULL,
  message_type TEXT NOT NULL, -- 'staff_notification', 'customer_update', 'manual'
  status TEXT NOT NULL, -- 'sent', 'failed', 'delivered'
  twilio_sid TEXT,
  error_message TEXT,
  related_appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  related_ro_id UUID REFERENCES crm_repair_orders(id) ON DELETE SET NULL,
  sent_by TEXT, -- staff member who sent manual message
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Customer SMS preferences (opt-out capability)
CREATE TABLE IF NOT EXISTS customer_sms_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL UNIQUE,
  opted_in BOOLEAN DEFAULT TRUE,
  opt_out_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_sms_settings_staff_user_id ON staff_sms_settings(staff_user_id);
CREATE INDEX IF NOT EXISTS idx_staff_sms_settings_active ON staff_sms_settings(is_active);
CREATE INDEX IF NOT EXISTS idx_sms_logs_to_phone ON sms_logs(to_phone);
CREATE INDEX IF NOT EXISTS idx_sms_logs_created_at ON sms_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_sms_logs_appointment_id ON sms_logs(related_appointment_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_ro_id ON sms_logs(related_ro_id);
CREATE INDEX IF NOT EXISTS idx_sms_templates_type ON sms_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_customer_sms_prefs_phone ON customer_sms_preferences(phone_number);

-- Insert default SMS templates
INSERT INTO sms_templates (template_name, template_type, message_template, description) VALUES
(
  'new_appointment_staff',
  'staff_notification',
  'New Appointment Alert!\nCustomer: {customer_name}\nPhone: {customer_phone}\nService: {service_type}\nDate: {appointment_date} at {appointment_time}\nVehicle: {vehicle_info}',
  'Notification sent to staff when a new appointment is created'
),
(
  'new_tow_request_staff',
  'staff_notification',
  'New Tow Request Alert!\nCustomer: {customer_name}\nPhone: {customer_phone}\nLocation: {location}\nVehicle: {vehicle_info}\nUrgent: {is_urgent}',
  'Notification sent to staff when a new tow request is created'
),
(
  'ro_status_estimate_approval',
  'customer_status_update',
  'Cleveland Auto Body: Your estimate for {vehicle_info} is ready for approval. Amount: ${estimate_amount}. Please call us at (555) 123-4567 to discuss. RO#{ro_number}',
  'Sent when RO status changes to estimate_approval'
),
(
  'ro_status_parts_ordered',
  'customer_status_update',
  'Cleveland Auto Body: Parts have been ordered for your {vehicle_info}. We will notify you when work begins. RO#{ro_number}',
  'Sent when RO status changes to parts_ordered'
),
(
  'ro_status_in_repair',
  'customer_status_update',
  'Cleveland Auto Body: Work has started on your {vehicle_info}. Est. completion: {estimated_completion}. RO#{ro_number}',
  'Sent when RO status changes to in_repair'
),
(
  'ro_status_ready_pickup',
  'customer_status_update',
  'Cleveland Auto Body: Great news! Your {vehicle_info} is ready for pickup. Please call (555) 123-4567 to schedule. RO#{ro_number}',
  'Sent when RO status changes to ready_pickup'
),
(
  'ro_status_completed',
  'customer_status_update',
  'Cleveland Auto Body: Thank you for choosing us! Your {vehicle_info} repair is complete. We appreciate your business! RO#{ro_number}',
  'Sent when RO status changes to completed'
),
(
  'manual_customer_message',
  'manual',
  '{custom_message}',
  'Template for manual messages sent from RO details page'
)
ON CONFLICT (template_name) DO NOTHING;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sms_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_staff_sms_settings_timestamp
BEFORE UPDATE ON staff_sms_settings
FOR EACH ROW
EXECUTE FUNCTION update_sms_settings_timestamp();

CREATE TRIGGER update_customer_sms_preferences_timestamp
BEFORE UPDATE ON customer_sms_preferences
FOR EACH ROW
EXECUTE FUNCTION update_sms_settings_timestamp();

-- Verification queries
SELECT 'staff_sms_settings table created' AS status, COUNT(*) AS row_count FROM staff_sms_settings;
SELECT 'sms_templates table created' AS status, COUNT(*) AS row_count FROM sms_templates;
SELECT 'sms_logs table created' AS status, COUNT(*) AS row_count FROM sms_logs;
SELECT 'customer_sms_preferences table created' AS status, COUNT(*) AS row_count FROM customer_sms_preferences;

-- Show templates
SELECT template_name, template_type, description FROM sms_templates ORDER BY template_type, template_name;
