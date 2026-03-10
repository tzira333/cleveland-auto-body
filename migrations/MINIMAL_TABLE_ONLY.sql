-- ABSOLUTE MINIMAL TEST
-- Just create table, no views, no policies, no DO blocks

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS appointment_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID,
  note_text TEXT NOT NULL,
  customer_visible BOOLEAN DEFAULT FALSE,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

SELECT 'SUCCESS: Table created' as result;
