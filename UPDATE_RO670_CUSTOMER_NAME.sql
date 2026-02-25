-- Update RO#670 Customer Name to Jerome
-- Run this in Supabase SQL Editor

-- Option 1: Update first name only (assumes last name exists)
UPDATE crm_repair_orders 
SET 
  customer_first_name = 'Jerome',
  updated_at = NOW()
WHERE ro_number = '670';

-- Option 2: Update full name (first and last name)
-- Uncomment this if you want to set both names:
-- UPDATE crm_repair_orders 
-- SET 
--   customer_first_name = 'Jerome',
--   customer_last_name = '[LAST_NAME]',
--   updated_at = NOW()
-- WHERE ro_number = '670';

-- Verify the update
SELECT 
  ro_number,
  customer_first_name,
  customer_last_name,
  customer_phone,
  customer_email,
  vehicle_year,
  vehicle_make,
  vehicle_model,
  updated_at
FROM crm_repair_orders 
WHERE ro_number = '670';
