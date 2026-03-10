-- INCREMENTAL MIGRATION - Section 2
-- Only run this AFTER Section 1 succeeds

-- =====================================================
-- SECTION 2: Create appointment_edit_history table
-- =====================================================

DROP TABLE IF EXISTS appointment_edit_history CASCADE;

CREATE TABLE appointment_edit_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  edited_by TEXT NOT NULL,
  edit_type TEXT NOT NULL,
  changes JSONB NOT NULL,
  previous_values JSONB,
  edit_reason TEXT,
  edited_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointment_edit_history_appointment_id ON appointment_edit_history(appointment_id);
CREATE INDEX idx_appointment_edit_history_edited_at ON appointment_edit_history(edited_at DESC);

SELECT 'Section 2 complete: appointment_edit_history table created' as status;

-- STOP HERE - Tell me if this works
-- If it works, continue to Section 3 in a NEW query
