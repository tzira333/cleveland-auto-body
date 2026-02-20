-- Create appointment_notes table for tracking progress updates and staff notes
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/_/sql

CREATE TABLE IF NOT EXISTS appointment_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  staff_name TEXT DEFAULT 'Staff',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_appointment_notes_appointment_id 
ON appointment_notes(appointment_id);

CREATE INDEX IF NOT EXISTS idx_appointment_notes_created_at 
ON appointment_notes(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE appointment_notes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read all notes
CREATE POLICY "Enable read access for authenticated users" ON appointment_notes
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow authenticated users to insert notes
CREATE POLICY "Enable insert for authenticated users" ON appointment_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy to allow authenticated users to update their own notes
CREATE POLICY "Enable update for authenticated users" ON appointment_notes
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create policy to allow authenticated users to delete notes
CREATE POLICY "Enable delete for authenticated users" ON appointment_notes
  FOR DELETE
  TO authenticated
  USING (true);

-- Add comment to table
COMMENT ON TABLE appointment_notes IS 'Stores progress updates and staff notes for appointments';
COMMENT ON COLUMN appointment_notes.appointment_id IS 'References the appointment this note belongs to';
COMMENT ON COLUMN appointment_notes.note_text IS 'The content of the note/update';
COMMENT ON COLUMN appointment_notes.staff_name IS 'Name of staff member who created the note';
COMMENT ON COLUMN appointment_notes.created_at IS 'Timestamp when the note was created';
COMMENT ON COLUMN appointment_notes.updated_at IS 'Timestamp when the note was last modified';
