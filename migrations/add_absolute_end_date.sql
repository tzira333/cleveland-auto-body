-- Add Absolute End Date field to Repair Orders
-- Run this in Supabase SQL Editor

-- Add absolute_end_date column to crm_repair_orders
ALTER TABLE crm_repair_orders 
ADD COLUMN IF NOT EXISTS absolute_end_date DATE;

-- Add comment to explain the field
COMMENT ON COLUMN crm_repair_orders.absolute_end_date IS 'Hard deadline for repair completion - must be done by this date';

-- Create index for sorting and filtering
CREATE INDEX IF NOT EXISTS idx_crm_repair_orders_absolute_end_date 
ON crm_repair_orders(absolute_end_date);

-- Verification
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'crm_repair_orders' 
  AND column_name = 'absolute_end_date';

SELECT 'Absolute End Date field added successfully' AS status;
