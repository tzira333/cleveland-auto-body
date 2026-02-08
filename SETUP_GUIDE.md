# Complete Setup Guide - Customer Portal Authentication

This guide provides step-by-step instructions to implement customer authentication for the Clevelandbody.com portal.

## Prerequisites

- Access to Supabase Dashboard
- Node.js 18+ installed
- Project source code in `/home/user/webapp`
- Environment variables configured

## Step 1: Database Setup

### 1.1 Open Supabase SQL Editor

1. Go to https://app.supabase.com
2. Select your project
3. Navigate to **SQL Editor** from the left sidebar
4. Click **New Query**

### 1.2 Run Customer Authentication Schema

Copy and paste the entire contents of `schema-customer-auth.sql` into the SQL Editor and click **Run**.

Alternatively, run these scripts in order:

#### Script 1: Create customer_users Table

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create customer_users table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_customer_users_auth_user_id ON public.customer_users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_customer_users_email ON public.customer_users(email);
CREATE INDEX IF NOT EXISTS idx_customer_users_phone ON public.customer_users(phone);

-- Enable RLS
ALTER TABLE public.customer_users ENABLE ROW LEVEL SECURITY;
```

#### Script 2: Create RLS Policies for customer_users

```sql
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
```

#### Script 3: Update appointments Table

```sql
-- Add customer_user_id column to link authenticated customers
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS customer_user_id UUID REFERENCES public.customer_users(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_appointments_customer_user_id 
ON public.appointments(customer_user_id);
```

#### Script 4: Update appointments RLS Policies

```sql
-- First, disable RLS temporarily
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on appointments
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'appointments') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.appointments';
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create new comprehensive policies

-- 1. Anyone can create appointments (for initial booking)
CREATE POLICY "anyone_can_create_appointments"
    ON public.appointments FOR INSERT
    WITH CHECK (true);

-- 2. Authenticated customers can view their own appointments
CREATE POLICY "customers_can_view_own_appointments"
    ON public.appointments FOR SELECT
    USING (
        customer_user_id IN (
            SELECT id FROM public.customer_users
            WHERE auth_user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.staff_users
            WHERE auth_user_id = auth.uid()
            AND is_active = true
        )
    );

-- 3. Customers can update their own appointments
CREATE POLICY "customers_can_update_own_appointments"
    ON public.appointments FOR UPDATE
    USING (
        customer_user_id IN (
            SELECT id FROM public.customer_users
            WHERE auth_user_id = auth.uid()
        )
    );

-- 4. Staff can view all appointments
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

-- 5. Staff can update all appointments
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

-- 6. Staff can delete appointments
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
```

#### Script 5: Create Triggers and Functions

```sql
-- Function to auto-update updated_at
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
```

### 1.3 Verify Database Setup

```sql
-- Check if tables exist
SELECT 
    'customer_users' as table_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'customer_users'
    ) THEN '✅ Exists' ELSE '❌ Missing' END as status
UNION ALL
SELECT 
    'appointments',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'appointments'
        AND column_name = 'customer_user_id'
    ) THEN '✅ Column Added' ELSE '❌ Column Missing' END;

-- Check RLS is enabled
SELECT 
    tablename,
    CASE WHEN rowsecurity THEN '✅ Enabled' ELSE '❌ Disabled' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('customer_users', 'appointments');

-- Check policies count
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN ('customer_users', 'appointments')
GROUP BY tablename;

-- Display all policies
SELECT 
    tablename,
    policyname,
    cmd as operation
FROM pg_policies
WHERE tablename IN ('customer_users', 'appointments')
ORDER BY tablename, cmd, policyname;
```

Expected output:
- `customer_users` table exists
- `appointments` has `customer_user_id` column
- RLS enabled on both tables
- 3 policies on `customer_users`
- 6 policies on `appointments`

## Step 2: Environment Configuration

### 2.1 Verify .env.local

Ensure your `.env.local` file contains:

```env
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Application Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Domestic and Foreign Auto Body Inc.
NEXT_PUBLIC_BUSINESS_PHONE=+12164818696
NEXT_PUBLIC_BUSINESS_ADDRESS=17017 Saint Clair Ave, Cleveland, OH 44110

# Staff Configuration
STAFF_SMS_RECIPIENTS=+12162880668,+14405300810,+14407491081
DEFAULT_EMAIL_RECIPIENTS=domesticandforeignab@gmail.com

# Email Configuration (Optional)
POSTMARK_API_KEY=your-postmark-key
POSTMARK_FROM_EMAIL=notifications@clevelandbody.com

# SMS Configuration (Optional)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+12164818696
```

### 2.2 Get Supabase Keys

1. Go to Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **IMPORTANT**: Never commit `SUPABASE_SERVICE_ROLE_KEY` to version control!

## Step 3: Application Setup

### 3.1 Install Dependencies

```bash
cd /home/user/webapp
npm install
```

### 3.2 Build Application

```bash
npm run build
```

If build fails, check for TypeScript errors:

```bash
npm run type-check
```

### 3.3 Start Development Server

```bash
npm run dev
```

Application should be running at http://localhost:3000

## Step 4: Create Test Customer Account

### 4.1 Using the UI

1. Open browser to http://localhost:3000/portal/auth/register
2. Fill out registration form:
   - **Full Name**: Test Customer
   - **Email**: test@example.com
   - **Phone**: 216-555-0100
   - **Password**: TestPassword123
   - **Confirm Password**: TestPassword123
3. Click **Create Account**
4. You should be redirected to login page

### 4.2 Using Supabase Dashboard (Alternative)

```sql
-- Step 1: Create auth user manually in Supabase Dashboard
-- Go to Authentication → Users → Add User
-- Email: test@example.com
-- Password: TestPassword123
-- Auto Confirm User: YES

-- Step 2: Get the user ID and create customer_users record
-- Replace 'YOUR_AUTH_USER_ID' with the actual UUID from step 1
INSERT INTO public.customer_users (
    auth_user_id,
    email,
    full_name,
    phone,
    is_active,
    email_verified
) VALUES (
    'YOUR_AUTH_USER_ID',
    'test@example.com',
    'Test Customer',
    '2165550100',
    true,
    true
);
```

## Step 5: Test All Features

### 5.1 Test Customer Registration

- [ ] Navigate to http://localhost:3000/portal/auth/register
- [ ] Fill out form with valid data
- [ ] Submit form
- [ ] Verify success message
- [ ] Verify redirect to login

### 5.2 Test Customer Login

- [ ] Navigate to http://localhost:3000/portal/auth/login
- [ ] Enter email and password
- [ ] Click Sign In
- [ ] Verify redirect to dashboard
- [ ] Verify customer name displayed

### 5.3 Test Customer Dashboard

- [ ] Verify customer information displayed
- [ ] Check appointment count is correct
- [ ] Verify quick action buttons work
- [ ] Test logout button

### 5.4 Test Quick Lookup (No Auth)

- [ ] Navigate to http://localhost:3000/portal
- [ ] Enter phone number
- [ ] Click search
- [ ] Verify appointments displayed (if any exist)
- [ ] Verify "create account" prompts shown

### 5.5 Test Password Reset

- [ ] Navigate to http://localhost:3000/portal/auth/reset-password
- [ ] Enter email address
- [ ] Check email for reset link
- [ ] Click link and set new password
- [ ] Verify can login with new password

### 5.6 Test Staff Portal (Should Still Work)

- [ ] Navigate to http://localhost:3000/admin/staff/login
- [ ] Login as staff user
- [ ] Verify staff dashboard works
- [ ] Verify can view/update appointments

## Step 6: Link Existing Appointments to Customers

If you have existing appointments that need to be linked to customer accounts:

```sql
-- Find appointments by phone and link to customer
UPDATE public.appointments a
SET customer_user_id = cu.id
FROM public.customer_users cu
WHERE a.customer_phone = cu.phone
AND a.customer_user_id IS NULL;

-- Verify linkage
SELECT 
    a.id,
    a.customer_name,
    a.customer_phone,
    cu.full_name as linked_customer,
    cu.email
FROM public.appointments a
LEFT JOIN public.customer_users cu ON a.customer_user_id = cu.id
LIMIT 10;
```

## Step 7: Production Deployment

### 7.1 Update Environment Variables

For production, update `.env.production` or your hosting platform:

```env
NEXT_PUBLIC_SITE_URL=https://clevelandbody.com
```

### 7.2 Build for Production

```bash
npm run build
```

### 7.3 Deploy

Follow your hosting provider's deployment instructions:

- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy`
- **Custom**: Copy `.next` folder to server

## Troubleshooting

### Error: "supabaseUrl is required"

**Solution**: Check `.env.local` file exists and contains `NEXT_PUBLIC_SUPABASE_URL`

```bash
# Verify environment variables are loaded
echo $NEXT_PUBLIC_SUPABASE_URL
```

### Error: "Failed to create customer account"

**Solution**: 
1. Check `SUPABASE_SERVICE_ROLE_KEY` is set
2. Verify customer_users table exists
3. Check API route logs

```bash
# Check API logs
npm run dev
# Look for errors in terminal
```

### Error: "Access denied" when viewing appointments

**Solution**: 
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'appointments';

-- Verify customer_users record exists
SELECT * FROM public.customer_users WHERE email = 'your-email@example.com';
```

### Error: Appointments not showing in dashboard

**Solution**:
```sql
-- Check if appointments are linked to customer
SELECT 
    a.*,
    cu.full_name
FROM public.appointments a
LEFT JOIN public.customer_users cu ON a.customer_user_id = cu.id
WHERE cu.email = 'your-email@example.com';

-- If customer_user_id is NULL, run the linkage script from Step 6
```

## Quick Reference

### Customer Portal URLs
- **Quick Lookup**: `/portal`
- **Login**: `/portal/auth/login`
- **Register**: `/portal/auth/register`
- **Reset Password**: `/portal/auth/reset-password`
- **Dashboard**: `/portal/dashboard`

### Staff Portal URLs
- **Login**: `/admin/staff/login`
- **Dashboard**: `/admin/staff`
- **Appointments**: `/admin/staff/appointments`
- **CRM**: `/admin/staff/crm`

### Database Tables
- `auth.users` - Supabase authentication
- `public.customer_users` - Customer profiles
- `public.staff_users` - Staff profiles
- `public.appointments` - Appointments
- `public.crm_*` - CRM tables

## Support

If you encounter issues:

1. Check the logs: `npm run dev` and look for errors
2. Verify database setup with verification queries
3. Check browser console for JavaScript errors
4. Review RLS policies in Supabase Dashboard
5. Contact support: domesticandforeignab@gmail.com

---

**Setup Guide Version**: 1.0.0
**Last Updated**: February 8, 2024
