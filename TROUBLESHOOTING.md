# Troubleshooting Guide - Common Issues

## Issue: Unable to Submit Appointment

### Problem
Appointment form submission fails with an error message.

### Solutions

#### Solution 1: Check Phone Number Format (FIXED)
**Status**: ✅ Fixed in latest commit

The API now automatically normalizes phone numbers:
- Removes all dashes, spaces, and special characters
- Validates that phone is exactly 10 digits
- Works with formats like: `216-481-8696`, `2164818696`, `(216) 481-8696`

**No action needed** - this is now automatic.

#### Solution 2: Required Fields
Make sure these fields are filled:
- ✅ Full Name
- ✅ Phone Number (10 digits)
- ✅ Service Type

**Optional fields** (not required):
- Email
- Vehicle Info
- Date/Time
- Additional Notes

#### Solution 3: Check RLS Policies

If you still get errors, verify the database policy allows anonymous inserts:

```sql
-- Check if policy exists
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'appointments' 
AND cmd = 'INSERT';

-- Should show: anyone_can_create_appointments

-- If missing, create it:
CREATE POLICY "anyone_can_create_appointments"
    ON public.appointments FOR INSERT
    WITH CHECK (true);
```

#### Solution 4: Check Service Role Key

Verify `.env.local` has the correct Supabase service role key:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Get it from: **Supabase Dashboard → Settings → API**

#### Solution 5: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try submitting appointment
4. Look for red error messages
5. Share error message for specific help

---

## Issue: Cannot View Appointments (Customer Portal)

### Problem
Customer cannot see their appointments after logging in.

### Solutions

#### Solution 1: Check Customer Account Exists

```sql
-- Verify customer_users record
SELECT * FROM public.customer_users 
WHERE email = 'customer-email@example.com';
```

If no record exists, customer needs to register first at `/portal/auth/register`.

#### Solution 2: Check Appointments Are Linked

```sql
-- Check if appointments have customer_user_id
SELECT 
    id, 
    customer_name, 
    customer_phone, 
    customer_user_id,
    created_at
FROM public.appointments 
WHERE customer_phone = '2164818696'
ORDER BY created_at DESC;
```

If `customer_user_id` is NULL, link them:

```sql
-- Link appointments to customer by phone
UPDATE public.appointments a
SET customer_user_id = cu.id
FROM public.customer_users cu
WHERE a.customer_phone = cu.phone
AND a.customer_user_id IS NULL;
```

#### Solution 3: Check RLS Policies

```sql
-- Verify customer view policy exists
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'appointments' 
AND policyname = 'customers_can_view_own_appointments';

-- If missing, run schema-customer-auth.sql
```

---

## Issue: Phone Lookup Not Working

### Problem
Quick lookup by phone number returns no results even though appointments exist.

### Solutions

#### Solution 1: Check Phone Number Format in Database

```sql
-- Check how phone is stored
SELECT customer_name, customer_phone 
FROM public.appointments 
LIMIT 5;
```

Phone numbers should be stored as **digits only** (no dashes):
- ✅ Correct: `2164818696`
- ❌ Wrong: `216-481-8696`

#### Solution 2: Normalize Existing Phone Numbers

```sql
-- Normalize all phone numbers in database
UPDATE public.appointments
SET customer_phone = regexp_replace(customer_phone, '[^0-9]', '', 'g')
WHERE customer_phone ~ '[^0-9]';

-- Verify
SELECT DISTINCT customer_phone FROM public.appointments LIMIT 10;
```

#### Solution 3: Check API Endpoint

Test the API directly:

```bash
# Replace with actual phone number
curl "http://localhost:3000/api/appointments?phone=2164818696"
```

Should return JSON with appointments array.

---

## Issue: Staff Portal Not Working

### Problem
Staff cannot log in or view appointments.

### Solutions

#### Solution 1: Verify Staff User Exists

```sql
-- Check staff_users table
SELECT * FROM public.staff_users 
WHERE email = 'staff-email@example.com';
```

#### Solution 2: Check Staff Permissions

```sql
-- Verify permissions
SELECT 
    email,
    role,
    is_active,
    can_access_appointments,
    can_access_crm
FROM public.staff_users 
WHERE email = 'staff-email@example.com';
```

Both `is_active` and `can_access_appointments` should be `true`.

#### Solution 3: Link Auth User to Staff

```sql
-- Get auth user ID
SELECT id FROM auth.users WHERE email = 'staff-email@example.com';

-- Update staff_users with correct auth_user_id
UPDATE public.staff_users
SET auth_user_id = 'auth-user-id-from-above'
WHERE email = 'staff-email@example.com';
```

---

## Issue: "Access Denied" Errors

### Problem
Getting "Access denied" when trying to access data.

### Solutions

#### Solution 1: Check Session

```sql
-- Test if you're authenticated
SELECT auth.uid();

-- Should return your user ID, not NULL
```

If NULL, you're not logged in. Log in first.

#### Solution 2: Temporarily Disable RLS (Testing Only)

```sql
-- ONLY for testing - NOT for production
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;

-- Test if access works now
-- If yes, problem is with RLS policies

-- Re-enable after testing
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
```

#### Solution 3: Check Policy Matches Your Role

For customers:
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'appointments' 
AND policyname LIKE '%customer%';
```

For staff:
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'appointments' 
AND policyname LIKE '%staff%';
```

---

## Issue: Build Errors

### Problem
`npm run build` fails with errors.

### Solutions

#### Solution 1: Check TypeScript Errors

```bash
npm run type-check
```

Fix any TypeScript errors shown.

#### Solution 2: Clear Cache and Rebuild

```bash
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

#### Solution 3: Check Environment Variables

```bash
# Verify all required variables are set
grep SUPABASE .env.local
```

Should show three variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## Issue: Password Reset Not Working

### Problem
Password reset emails not being received.

### Solutions

#### Solution 1: Check Email Settings in Supabase

1. Go to Supabase Dashboard
2. Navigate to **Authentication → Email Templates**
3. Verify "Reset Password" template is enabled
4. Check "From Email" is configured

#### Solution 2: Check Spam Folder

Password reset emails might be in spam/junk folder.

#### Solution 3: Use Alternative Method

Manually reset password in Supabase Dashboard:
1. Go to **Authentication → Users**
2. Find user by email
3. Click "..." menu → "Reset Password"
4. Send reset link manually

---

## Issue: Duplicate Policy Errors

### Problem
Getting "policy already exists" errors when running SQL.

### Solutions

```sql
-- Drop all existing policies on appointments
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'appointments') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.appointments';
    END LOOP;
END $$;

-- Now re-run the schema-customer-auth.sql
```

---

## Issue: File Upload Failures

### Problem
Cannot upload files with appointment.

### Solutions

#### Solution 1: Check Storage Bucket Exists

```sql
-- In Supabase Dashboard:
-- Storage → Create bucket "appointment-files"
-- Make it public if you want URLs to be accessible
```

#### Solution 2: Check File Size

Maximum file size is 10MB per file, 10 files max.

#### Solution 3: Check File Type

Allowed types:
- Images: JPG, PNG, GIF, WebP
- Documents: PDF, DOC, DOCX

---

## Emergency: Reset Everything

If nothing works and you want to start fresh:

```sql
-- ⚠️ WARNING: This deletes ALL customer authentication data
-- Keep staff_users and appointments tables

BEGIN;

-- Drop customer authentication tables
DROP TABLE IF EXISTS public.customer_users CASCADE;

-- Re-run schema-customer-auth.sql to recreate

COMMIT;
```

---

## Getting Help

### 1. Check Logs

**Browser Console:**
```
F12 → Console tab → Look for errors
```

**Server Logs:**
```bash
npm run dev
# Watch terminal for error messages
```

### 2. Check Database

```sql
-- Verify all tables exist
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Should include:
-- appointments
-- customer_users
-- staff_users
```

### 3. Check Documentation

- `SETUP_GUIDE.md` - Setup instructions
- `CUSTOMER_AUTH_DOCUMENTATION.md` - Technical details
- `AUTHENTICATION_FLOW.md` - How auth works

### 4. Contact Support

**Business:**
- Phone: (216) 481-8696
- Email: domesticandforeignab@gmail.com

**Technical Issues:**
Include:
- Error message (exact text)
- Browser console errors
- Steps to reproduce
- What you've already tried

---

## Quick Diagnostic Script

Run this in Supabase SQL Editor to check everything:

```sql
-- Complete system check
SELECT 'Tables' as check_type, tablename as name, 'Exists' as status
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('appointments', 'customer_users', 'staff_users')

UNION ALL

SELECT 'RLS', tablename, CASE WHEN rowsecurity THEN 'Enabled' ELSE 'Disabled' END
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('appointments', 'customer_users', 'staff_users')

UNION ALL

SELECT 'Policies', tablename, COUNT(*)::text || ' policies'
FROM pg_policies
WHERE tablename IN ('appointments', 'customer_users', 'staff_users')
GROUP BY tablename

UNION ALL

SELECT 'Data', 'appointments', COUNT(*)::text || ' records'
FROM public.appointments

UNION ALL

SELECT 'Data', 'customer_users', COUNT(*)::text || ' records'
FROM public.customer_users

UNION ALL

SELECT 'Data', 'staff_users', COUNT(*)::text || ' records'
FROM public.staff_users;
```

Expected results:
- ✅ All 3 tables exist
- ✅ RLS enabled on all
- ✅ 6 policies on appointments
- ✅ 3 policies on customer_users
- ✅ At least 1 staff user exists

---

**Last Updated:** February 8, 2024  
**Version:** 1.1 (includes appointment submission fix)
