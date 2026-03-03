-- Add Admin Role and Dashboard Layout Management
-- Run this in Supabase SQL Editor

-- 1. Add role column to staff_users table
ALTER TABLE staff_users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'staff';

-- Add check constraint for valid roles
ALTER TABLE staff_users 
ADD CONSTRAINT staff_users_role_check 
CHECK (role IN ('admin', 'staff'));

-- Update specific user to admin
UPDATE staff_users 
SET role = 'admin' 
WHERE email = 'domesticandforeignab@gmail.com';

-- 2. Create dashboard_layout table for drag-and-drop positions
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

-- 3. Insert default dashboard layout for domesticandforeignab@gmail.com
INSERT INTO dashboard_layout (user_email, widget_id, widget_type, position, visible) VALUES
  ('domesticandforeignab@gmail.com', 'active_repairs', 'stat_card', 1, true),
  ('domesticandforeignab@gmail.com', 'overdue', 'stat_card', 2, true),
  ('domesticandforeignab@gmail.com', 'ready_pickup', 'stat_card', 3, true),
  ('domesticandforeignab@gmail.com', 'total_orders', 'stat_card', 4, true),
  ('domesticandforeignab@gmail.com', 'recent_orders_table', 'table', 5, true)
ON CONFLICT (user_email, widget_id) DO NOTHING;

-- 4. Add deleted_at for soft deletes (appointments)
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by TEXT;

-- 5. Add deleted_at for soft deletes (repair orders)
ALTER TABLE crm_repair_orders 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by TEXT;

-- Create indexes for soft delete queries
CREATE INDEX IF NOT EXISTS idx_appointments_deleted_at 
ON appointments(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_crm_repair_orders_deleted_at 
ON crm_repair_orders(deleted_at) WHERE deleted_at IS NOT NULL;

-- Verification
SELECT 'Admin role and dashboard layout tables created' AS status;

-- Show admin users
SELECT email, role 
FROM staff_users 
WHERE role = 'admin';

-- Show dashboard layouts
SELECT user_email, widget_id, widget_type, position, visible 
FROM dashboard_layout 
ORDER BY user_email, position;
