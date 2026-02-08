-- ===========================================
-- Customer Portal Authentication Schema
-- ===========================================

-- This script adds customer authentication support to the existing schema
-- Run this AFTER the main schema.sql

-- ===========================================
-- CUSTOMER USERS TABLE
-- ===========================================
-- Tracks customer-specific information and authentication
CREATE TABLE IF NOT EXISTS public.customer_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_customer_users_auth_user_id ON public.customer_users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_customer_users_email ON public.customer_users(email);
CREATE INDEX IF NOT EXISTS idx_customer_users_phone ON public.customer_users(phone);

-- RLS Policies for customer_users
ALTER TABLE public.customer_users ENABLE ROW LEVEL SECURITY;

-- Customers can view their own record
CREATE POLICY "customer_can_view_own_record"
    ON public.customer_users FOR SELECT
    USING (auth_user_id = auth.uid());

-- Customers can update their own record
CREATE POLICY "customer_can_update_own_record"
    ON public.customer_users FOR UPDATE
    USING (auth_user_id = auth.uid());

-- Staff can view all customer records
CREATE POLICY "staff_can_view_all_customers"
    ON public.customer_users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.staff_users
            WHERE auth_user_id = auth.uid()
            AND is_active = true
        )
    );

-- ===========================================
-- UPDATE APPOINTMENTS TABLE
-- ===========================================
-- Add customer_user_id to link appointments to authenticated customers
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS customer_user_id UUID REFERENCES public.customer_users(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_appointments_customer_user_id ON public.appointments(customer_user_id);

-- ===========================================
-- UPDATE APPOINTMENTS RLS POLICIES
-- ===========================================
-- Drop existing problematic policies
DROP POLICY IF EXISTS "public_can_create_appointments" ON public.appointments;
DROP POLICY IF EXISTS "public_can_view_appointments" ON public.appointments;
DROP POLICY IF EXISTS "appointments_public_insert" ON public.appointments;
DROP POLICY IF EXISTS "appointments_public_select" ON public.appointments;
DROP POLICY IF EXISTS "appointments_staff_update" ON public.appointments;
DROP POLICY IF EXISTS "appointments_staff_delete" ON public.appointments;
DROP POLICY IF EXISTS "allow_insert_appointments" ON public.appointments;
DROP POLICY IF EXISTS "allow_staff_view_appointments" ON public.appointments;
DROP POLICY IF EXISTS "allow_staff_update_appointments" ON public.appointments;
DROP POLICY IF EXISTS "customers_can_view_own_appointments" ON public.appointments;
DROP POLICY IF EXISTS "Anyone can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Staff can view all appointments" ON public.appointments;
DROP POLICY IF EXISTS "Staff can update all appointments" ON public.appointments;

-- Create new comprehensive RLS policies for appointments

-- 1. Anyone can create appointments (for initial booking before registration)
CREATE POLICY "anyone_can_create_appointments"
    ON public.appointments FOR INSERT
    WITH CHECK (true);

-- 2. Authenticated customers can view their own appointments (by auth_user_id)
CREATE POLICY "customers_can_view_own_appointments"
    ON public.appointments FOR SELECT
    USING (
        -- Authenticated customer viewing their own appointments
        customer_user_id IN (
            SELECT id FROM public.customer_users
            WHERE auth_user_id = auth.uid()
        )
        OR
        -- Staff can view all
        EXISTS (
            SELECT 1 FROM public.staff_users
            WHERE auth_user_id = auth.uid()
            AND is_active = true
        )
    );

-- 3. Customers can view appointments by phone (for unauthenticated access with verification)
-- This is handled in the application layer with additional verification

-- 4. Authenticated customers can update their own appointments
CREATE POLICY "customers_can_update_own_appointments"
    ON public.appointments FOR UPDATE
    USING (
        customer_user_id IN (
            SELECT id FROM public.customer_users
            WHERE auth_user_id = auth.uid()
        )
    );

-- 5. Staff can view all appointments
CREATE POLICY "staff_can_view_all_appointments"
    ON public.appointments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.staff_users
            WHERE auth_user_id = auth.uid()
            AND is_active = true
            AND can_access_appointments = true
        )
    );

-- 6. Staff can update all appointments
CREATE POLICY "staff_can_update_all_appointments"
    ON public.appointments FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.staff_users
            WHERE auth_user_id = auth.uid()
            AND is_active = true
            AND can_access_appointments = true
        )
    );

-- 7. Staff can delete appointments
CREATE POLICY "staff_can_delete_appointments"
    ON public.appointments FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.staff_users
            WHERE auth_user_id = auth.uid()
            AND is_active = true
            AND can_access_appointments = true
        )
    );

-- ===========================================
-- HELPER FUNCTIONS
-- ===========================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for customer_users
DROP TRIGGER IF EXISTS update_customer_users_updated_at ON public.customer_users;
CREATE TRIGGER update_customer_users_updated_at
    BEFORE UPDATE ON public.customer_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- VERIFICATION QUERY
-- ===========================================
-- Run this to verify the setup

SELECT 
    'Customer Users Table' as check_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'customer_users'
    ) THEN '✅ Exists' ELSE '❌ Missing' END as status
UNION ALL
SELECT 
    'RLS Enabled on customer_users',
    CASE WHEN (
        SELECT rowsecurity FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'customer_users'
    ) THEN '✅ Enabled' ELSE '❌ Disabled' END
UNION ALL
SELECT 
    'Appointments Policies Count',
    COUNT(*)::text || ' policies'
FROM pg_policies
WHERE tablename = 'appointments';

-- Display all appointment policies
SELECT 
    policyname,
    cmd as operation,
    CASE 
        WHEN qual IS NOT NULL AND with_check IS NOT NULL THEN 'USING + WITH CHECK'
        WHEN qual IS NOT NULL THEN 'USING'
        WHEN with_check IS NOT NULL THEN 'WITH CHECK'
        ELSE 'No conditions'
    END as policy_type
FROM pg_policies
WHERE tablename = 'appointments'
ORDER BY cmd, policyname;

-- ===========================================
-- NOTES
-- ===========================================
-- After running this script:
-- 1. Customers can register/login through the customer portal
-- 2. Authenticated customers can only see their own appointments
-- 3. Unauthenticated users can still create appointments (for initial booking)
-- 4. Phone lookup feature can be enhanced with email verification
-- 5. Staff portal access remains unchanged
