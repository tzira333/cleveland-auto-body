-- QUICK SETUP: Customer SMS Only (No Staff Notifications)
-- Run this entire script in Supabase SQL Editor

-- Drop staff_sms_settings table if it exists (we don't need it anymore)
DROP TABLE IF EXISTS staff_sms_settings CASCADE;

-- 1. SMS templates
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

-- 2. SMS logs
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

-- 3. Customer SMS preferences
CREATE TABLE IF NOT EXISTS customer_sms_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL UNIQUE,
  opted_in BOOLEAN DEFAULT TRUE,
  opt_out_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sms_logs_to_phone ON sms_logs(to_phone);
CREATE INDEX IF NOT EXISTS idx_sms_logs_created_at ON sms_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_logs_ro_id ON sms_logs(related_ro_id);

-- Insert customer notification templates
INSERT INTO sms_templates (template_name, template_type, message_template, description) VALUES
('ro_status_insurance', 'customer_status_update', 'Cleveland Auto Body: Your vehicle is being reviewed by insurance. We will contact you soon. RO#{ro_number}', 'Insurance review'),
('ro_status_estimate_approval', 'customer_status_update', 'Cleveland Auto Body: Your estimate for {vehicle_info} is ready. Amount: ${estimate_amount}. Call (216) 288-0668. RO#{ro_number}', 'Estimate ready'),
('ro_status_parts_ordered', 'customer_status_update', 'Cleveland Auto Body: Parts ordered for your {vehicle_info}. We will notify you when work begins. RO#{ro_number}', 'Parts ordered'),
('ro_status_in_repair', 'customer_status_update', 'Cleveland Auto Body: Work started on your {vehicle_info}. Est. completion: {estimated_completion}. RO#{ro_number}', 'Repair in progress'),
('ro_status_painting', 'customer_status_update', 'Cleveland Auto Body: Your {vehicle_info} is in the paint booth. Great progress! RO#{ro_number}', 'Painting'),
('ro_status_quality_control', 'customer_status_update', 'Cleveland Auto Body: Your {vehicle_info} is in final inspection. Almost ready! RO#{ro_number}', 'Quality check'),
('ro_status_ready_pickup', 'customer_status_update', 'Cleveland Auto Body: Your {vehicle_info} is ready for pickup! Call (216) 288-0668 to schedule. RO#{ro_number}', 'Ready for pickup'),
('ro_status_completed', 'customer_status_update', 'Cleveland Auto Body: Thank you! Your {vehicle_info} repair is complete. We appreciate your business! RO#{ro_number}', 'Completed'),
('manual_customer_message', 'manual', '{custom_message}', 'Manual message')
ON CONFLICT (template_name) DO NOTHING;

-- Verification
SELECT 'SMS Tables Created' AS status, 
  (SELECT COUNT(*) FROM sms_templates) AS templates,
  (SELECT COUNT(*) FROM sms_logs) AS logs;

-- Show templates
SELECT template_name, LEFT(message_template, 50) || '...' AS preview 
FROM sms_templates 
ORDER BY template_name;
