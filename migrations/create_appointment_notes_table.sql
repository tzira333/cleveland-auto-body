-- Create appointment_notes table for tracking progress updates and staff notes

CREATE TABLE IF NOT EXISTS appointment_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  staff_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries by appointment_id
CREATE INDEX IF NOT EXISTS idx_appointment_notes_appointment_id ON appointment_notes(appointment_id);

-- Create index for faster queries by created_at (for ordering)
CREATE INDEX IF NOT EXISTS idx_appointment_notes_created_at ON appointment_notes(created_at DESC);

-- Add comment to table
COMMENT ON TABLE appointment_notes IS 'Stores progress notes and updates for appointments, allowing staff to track job progress';

-- Add comments to columns
COMMENT ON COLUMN appointment_notes.id IS 'Unique identifier for the note';
COMMENT ON COLUMN appointment_notes.appointment_id IS 'Foreign key reference to the appointments table';
COMMENT ON COLUMN appointment_notes.note_text IS 'The content of the note or update';
COMMENT ON COLUMN appointment_notes.staff_name IS 'Name of the staff member who created the note';
COMMENT ON COLUMN appointment_notes.created_at IS 'Timestamp when the note was created';
COMMENT ON COLUMN appointment_notes.updated_at IS 'Timestamp when the note was last modified';
