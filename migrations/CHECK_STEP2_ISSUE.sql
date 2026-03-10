-- Check if appointment_edit_history table exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'appointment_edit_history'
) as table_exists;

-- If it doesn't exist, let's check if we can create it
-- First check if appointments table has the id column with correct type
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'appointments' 
AND column_name = 'id';

-- This will help us understand why Step 2 failed
