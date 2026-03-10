-- INCREMENTAL MIGRATION - Step by step
-- Run each section separately and tell me which one fails

-- =====================================================
-- SECTION 1: Create appointment_notes table
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS appointment_notes CASCADE;

CREATE TABLE appointment_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  customer_visible BOOLEAN DEFAULT FALSE,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointment_notes_appointment_id ON appointment_notes(appointment_id);
CREATE INDEX idx_appointment_notes_customer_visible ON appointment_notes(customer_visible);

SELECT 'Section 1 complete: appointment_notes table created' as status;

-- STOP HERE - Tell me if this works
-- If it works, continue to Section 2 in a NEW query
