-- ============================================
-- APPOINTMENT FILES TABLE SCHEMA
-- ============================================
-- This migration creates the appointment_files table
-- for storing uploaded photos and documents

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create appointment_files table
CREATE TABLE IF NOT EXISTS public.appointment_files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_appointment_files_appointment_id 
ON public.appointment_files(appointment_id);

CREATE INDEX IF NOT EXISTS idx_appointment_files_created_at 
ON public.appointment_files(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.appointment_files ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Customers can view files for their own appointments
CREATE POLICY "Customers can view own appointment files"
    ON public.appointment_files FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.appointments
            WHERE id = appointment_id 
            AND customer_phone IN (
                SELECT phone FROM public.customer_users
                WHERE auth_user_id = auth.uid()
            )
        )
    );

-- RLS Policy: Anyone can insert files (for public appointment uploads)
CREATE POLICY "Anyone can upload appointment files"
    ON public.appointment_files FOR INSERT
    WITH CHECK (true);

-- RLS Policy: Staff can view all appointment files
CREATE POLICY "Staff can view all appointment files"
    ON public.appointment_files FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.staff_users
            WHERE auth_user_id = auth.uid() AND is_active = true
        )
    );

-- RLS Policy: Staff can delete appointment files
CREATE POLICY "Staff can delete appointment files"
    ON public.appointment_files FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.staff_users
            WHERE auth_user_id = auth.uid() AND is_active = true
        )
    );

-- Add comment explaining the table
COMMENT ON TABLE public.appointment_files IS 
'Stores metadata for files uploaded to appointments (photos, documents, etc.)';

COMMENT ON COLUMN public.appointment_files.storage_path IS 
'Path to file in Supabase Storage bucket (appointment-files)';

COMMENT ON COLUMN public.appointment_files.public_url IS 
'Public URL for accessing the file';
