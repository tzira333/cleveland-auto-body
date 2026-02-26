-- SMS Functionality Database Schema - Customer Notifications Only
-- Run this in Supabase SQL Editor

-- 1. SMS templates table
CREATE TABLE IF NOT EXISTS sms_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL UNIQUE,
  template_type TEXT NOT NULL, -- 'customer_status_update', 'manual'
  message_template TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SMS logs table for tracking all sent messages
CREATE TABLE IF NOT EXISTS sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_phone TEXT NOT NULL,
  from_phone TEXT NOT NULL,
  message_body TEXT NOT NULL,
  message_type TEXT NOT NULL, -- 'customer_update', 'manual'
  status TEXT NOT NULL DEFAULT 'sent', -- 'sent', 'failed', 'delivered'
  twilio_sid TEXT,
  error_message TEXT,
  cost NUMERIC(10, 4), -- Track SMS costs
  related_appointment_id UUID,
  related_ro_id UUID,
  sent_by TEXT, -- staff member who sent manual message
  created_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ
);

-- 3. Customer SMS preferences (opt-out capability)
CREATE TABLE IF NOT EXISTS customer_sms_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL UNIQUE,
  opted_in BOOLEAN DEFAULT TRUE,
  opt_out_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sms_logs_to_phone ON sms_logs(to_phone);
CREATE INDEX IF NOT EXISTS idx_sms_logs_created_at ON sms_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_logs_appointment_id ON sms_logs(related_appointment_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_ro_id ON sms_logs(related_ro_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_status ON sms_logs(status);
CREATE INDEX IF NOT EXISTS idx_sms_templates_type ON sms_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_customer_sms_prefs_phone ON customer_sms_preferences(phone_number);

-- Insert customer notification SMS templates
INSERT INTO sms_templates (template_name, template_type, message_template, description) VALUES
(
  'ro_status_insurance',
  'customer_status_update',
  'Cleveland Auto Body: Your vehicle is being reviewed by insurance. We will contact you soon. RO#{ro_number}',
  'Sent when RO status changes to insurance'
),
(
  'ro_status_estimate_approval',
  'customer_status_update',
  'Cleveland Auto Body: Your estimate for {vehicle_info} is ready for approval. Amount: ${estimate_amount}. Please call us at (216) 288-0668 to discuss. RO#{ro_number}',
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
  'ro_status_painting',
  'customer_status_update',
  'Cleveland Auto Body: Your {vehicle_info} is now in the paint booth. We are making great progress! RO#{ro_number}',
  'Sent when RO status changes to painting'
),
(
  'ro_status_quality_control',
  'customer_status_update',
  'Cleveland Auto Body: Your {vehicle_info} is in final quality inspection. Almost ready! RO#{ro_number}',
  'Sent when RO status changes to quality_control'
),
(
  'ro_status_ready_pickup',
  'customer_status_update',
  'Cleveland Auto Body: Great news! Your {vehicle_info} is ready for pickup. Please call (216) 288-0668 to schedule. RO#{ro_number}',
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

DROP TRIGGER IF EXISTS update_customer_sms_preferences_timestamp ON customer_sms_preferences;
CREATE TRIGGER update_customer_sms_preferences_timestamp
BEFORE UPDATE ON customer_sms_preferences
FOR EACH ROW
EXECUTE FUNCTION update_sms_settings_timestamp();

-- Verification queries
SELECT 'sms_templates table created' AS status, COUNT(*) AS row_count FROM sms_templates;
SELECT 'sms_logs table created' AS status, COUNT(*) AS row_count FROM sms_logs;
SELECT 'customer_sms_preferences table created' AS status, COUNT(*) AS row_count FROM customer_sms_preferences;

-- Show templates
SELECT template_name, template_type, LEFT(message_template, 60) || '...' AS message_preview 
FROM sms_templates 
ORDER BY template_type, template_name;
