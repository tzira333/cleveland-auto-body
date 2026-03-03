-- Complete Database Migration for New Supabase Pro Project
-- Run this in: https://supabase.com/dashboard/project/ysjvgwsgmplnxchsbmtz/sql/new
-- This adds all missing columns and features for the BodyShop Workflow

-- ============================================================================
-- 1. ADD ADMIN ROLE SYSTEM
-- ============================================================================

-- Add role column to staff_users table
ALTER TABLE staff_users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'staff';

-- Add check constraint for valid roles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'staff_users_role_check'
  ) THEN
    ALTER TABLE staff_users 
    ADD CONSTRAINT staff_users_role_check 
    CHECK (role IN ('admin', 'staff'));
  END IF;
END $$;

-- Update admin user
UPDATE staff_users 
SET role = 'admin' 
WHERE email = 'domesticandforeignab@gmail.com';

-- ============================================================================
-- 2. ADD SOFT DELETE COLUMNS (Appointments)
-- ============================================================================

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by TEXT;

-- Create indexes for soft delete queries
CREATE INDEX IF NOT EXISTS idx_appointments_deleted_at 
ON appointments(deleted_at) WHERE deleted_at IS NOT NULL;

-- ============================================================================
-- 3. ADD SOFT DELETE COLUMNS (Repair Orders)
-- ============================================================================

ALTER TABLE crm_repair_orders 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by TEXT;

-- Create indexes for soft delete queries
CREATE INDEX IF NOT EXISTS idx_crm_repair_orders_deleted_at 
ON crm_repair_orders(deleted_at) WHERE deleted_at IS NOT NULL;

-- ============================================================================
-- 4. ADD ABSOLUTE END DATE (Repair Orders)
-- ============================================================================

ALTER TABLE crm_repair_orders 
ADD COLUMN IF NOT EXISTS absolute_end_date DATE;

-- Create index
CREATE INDEX IF NOT EXISTS idx_crm_repair_orders_absolute_end_date 
ON crm_repair_orders(absolute_end_date);

-- ============================================================================
-- 5. ADD ARCHIVE FUNCTIONALITY (Appointments)
-- ============================================================================

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS archived_by TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_appointments_archived 
ON appointments(archived) WHERE archived = true;

CREATE INDEX IF NOT EXISTS idx_appointments_archived_at 
ON appointments(archived_at) WHERE archived_at IS NOT NULL;

-- ============================================================================
-- 6. ADD ARCHIVE FUNCTIONALITY (Repair Orders)
-- ============================================================================

ALTER TABLE crm_repair_orders 
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS archived_by TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_crm_repair_orders_archived 
ON crm_repair_orders(archived) WHERE archived = true;

CREATE INDEX IF NOT EXISTS idx_crm_repair_orders_archived_at 
ON crm_repair_orders(archived_at) WHERE archived_at IS NOT NULL;

-- ============================================================================
-- 7. SMS FUNCTIONALITY TABLES
-- ============================================================================

-- SMS Templates table
CREATE TABLE IF NOT EXISTS sms_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT UNIQUE NOT NULL,
  template_type TEXT NOT NULL, -- 'customer_update', 'manual'
  message_template TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SMS Logs table
CREATE TABLE IF NOT EXISTS sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_phone TEXT NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT NOT NULL, -- 'customer_update', 'manual'
  related_appointment_id UUID REFERENCES appointments(id),
  related_ro_id UUID REFERENCES crm_repair_orders(id),
  sent_by TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivery_status TEXT, -- 'queued', 'sent', 'delivered', 'failed'
  twilio_sid TEXT,
  error_message TEXT,
  cost NUMERIC(10, 4)
);

-- Customer SMS Preferences table
CREATE TABLE IF NOT EXISTS customer_sms_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES crm_customers(id),
  phone TEXT NOT NULL,
  opted_in BOOLEAN DEFAULT true,
  opt_in_date TIMESTAMPTZ DEFAULT NOW(),
  opt_out_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sms_logs_appointment 
ON sms_logs(related_appointment_id);

CREATE INDEX IF NOT EXISTS idx_sms_logs_ro 
ON sms_logs(related_ro_id);

CREATE INDEX IF NOT EXISTS idx_sms_logs_sent_at 
ON sms_logs(sent_at);

CREATE INDEX IF NOT EXISTS idx_customer_sms_prefs_customer 
ON customer_sms_preferences(customer_id);

-- Insert SMS templates
INSERT INTO sms_templates (template_name, template_type, message_template, is_active) VALUES
  ('ro_insurance', 'customer_update', 'Hi {customerName}, your vehicle repair (RO#{roNumber}) is now with insurance. We''ll update you on the next steps. - Cleveland Auto Body', true),
  ('ro_estimate_approval', 'customer_update', 'Hi {customerName}, your repair estimate (RO#{roNumber}) is ready for approval. Please contact us at your earliest convenience. - Cleveland Auto Body', true),
  ('ro_parts_ordered', 'customer_update', 'Hi {customerName}, parts for your vehicle (RO#{roNumber}) have been ordered. We''ll notify you when they arrive. - Cleveland Auto Body', true),
  ('ro_in_repair', 'customer_update', 'Hi {customerName}, good news! Work on your vehicle (RO#{roNumber}) has started. We''ll keep you updated on progress. - Cleveland Auto Body', true),
  ('ro_painting', 'customer_update', 'Hi {customerName}, your vehicle (RO#{roNumber}) is now in the painting stage. Looking great! - Cleveland Auto Body', true),
  ('ro_quality_control', 'customer_update', 'Hi {customerName}, your vehicle (RO#{roNumber}) is in final quality control. Almost ready! - Cleveland Auto Body', true),
  ('ro_ready_pickup', 'customer_update', 'Hi {customerName}, your vehicle (RO#{roNumber}) is READY FOR PICKUP! Please call us to schedule: (216) 288-0668. - Cleveland Auto Body', true),
  ('ro_completed', 'customer_update', 'Hi {customerName}, thank you for choosing Cleveland Auto Body! Your repair (RO#{roNumber}) is complete. We appreciate your business! - Cleveland Auto Body', true),
  ('manual_message', 'manual', 'Custom message (edited by staff before sending)', true)
ON CONFLICT (template_name) DO NOTHING;

-- ============================================================================
-- 8. APPOINTMENT NOTES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS appointment_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  staff_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_appointment_notes_appointment 
ON appointment_notes(appointment_id);

-- ============================================================================
-- 9. DASHBOARD LAYOUT TABLE (For future drag-and-drop)
-- ============================================================================

CREATE TABLE IF NOT EXISTS dashboard_layout (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  widget_id TEXT NOT NULL,
  widget_type TEXT NOT NULL, -- 'stat_card', 'recent_orders', 'chart', etc.
  position INTEGER NOT NULL,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_email, widget_id)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_dashboard_layout_user 
ON dashboard_layout(user_email);

-- Insert default dashboard layout
INSERT INTO dashboard_layout (user_email, widget_id, widget_type, position, visible) VALUES
  ('domesticandforeignab@gmail.com', 'active_repairs', 'stat_card', 1, true),
  ('domesticandforeignab@gmail.com', 'overdue', 'stat_card', 2, true),
  ('domesticandforeignab@gmail.com', 'ready_pickup', 'stat_card', 3, true),
  ('domesticandforeignab@gmail.com', 'total_orders', 'stat_card', 4, true),
  ('domesticandforeignab@gmail.com', 'recent_orders_table', 'table', 5, true)
ON CONFLICT (user_email, widget_id) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check that all columns exist
SELECT 
  'appointments' as table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'appointments'
  AND column_name IN ('deleted_at', 'deleted_by', 'archived', 'archived_at', 'archived_by')
ORDER BY column_name;

SELECT 
  'crm_repair_orders' as table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'crm_repair_orders'
  AND column_name IN ('deleted_at', 'deleted_by', 'archived', 'archived_at', 'archived_by', 'absolute_end_date')
ORDER BY column_name;

-- Check admin role
SELECT email, role 
FROM staff_users 
WHERE role = 'admin';

-- Count SMS templates
SELECT COUNT(*) as sms_templates_count 
FROM sms_templates;

-- Show tables created
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('sms_templates', 'sms_logs', 'customer_sms_preferences', 'appointment_notes', 'dashboard_layout') 
    THEN '✅ Created'
    ELSE '✅ Exists'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'appointments',
    'crm_repair_orders',
    'staff_users',
    'sms_templates',
    'sms_logs',
    'customer_sms_preferences',
    'appointment_notes',
    'dashboard_layout'
  )
ORDER BY table_name;

-- Final success message
SELECT '✅ MIGRATION COMPLETE! All columns and tables created successfully.' as status;
