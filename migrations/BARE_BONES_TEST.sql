-- ULTRA MINIMAL TEST - Just create the table, nothing else

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop table if exists (start fresh)
DROP TABLE IF EXISTS appointment_notes CASCADE;

-- Create the table
CREATE TABLE appointment_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  customer_visible BOOLEAN DEFAULT FALSE,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create one simple index
CREATE INDEX idx_appointment_notes_appointment_id ON appointment_notes(appointment_id);

-- Test query
SELECT 'Table created successfully!' as status;

-- Verify column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'appointment_notes' 
AND column_name = 'customer_visible';

-- This should show: customer_visible | boolean
