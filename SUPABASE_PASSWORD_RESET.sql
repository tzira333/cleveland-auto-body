-- ===================================================================
-- SUPABASE PASSWORD RESET UTILITIES
-- Cleveland Auto Body Site - Password Management
-- ===================================================================
-- 
-- This script provides SQL commands for resetting user passwords
-- in Supabase Auth. Use these queries in the Supabase SQL Editor.
--
-- IMPORTANT: 
-- - These queries work directly with Supabase's auth.users table
-- - Only use with proper authorization
-- - Passwords are automatically hashed by Supabase
-- ===================================================================

-- ===================================================================
-- OPTION 1: RESET STAFF USER PASSWORD (RECOMMENDED)
-- ===================================================================
-- This method updates the password for a staff member by their email

-- Step 1: Find the staff user's auth ID
SELECT 
    cu.email,
    cu.full_name,
    cu.role,
    cu.auth_user_id,
    au.email as auth_email,
    au.created_at as user_created,
    cu.is_active
FROM public.staff_users cu
LEFT JOIN auth.users au ON au.id = cu.auth_user_id
WHERE cu.email = 'staff@clevelandbody.com'  -- REPLACE WITH ACTUAL EMAIL
ORDER BY cu.created_at DESC;

-- Step 2: Reset password using the auth_user_id
-- REPLACE 'NEW_PASSWORD_HERE' with the new password
-- REPLACE 'AUTH_USER_ID_HERE' with the auth_user_id from Step 1
UPDATE auth.users
SET 
    encrypted_password = crypt('NEW_PASSWORD_HERE', gen_salt('bf')),
    updated_at = NOW(),
    email_confirmed_at = NOW(),  -- Ensures email is confirmed
    confirmation_token = NULL,
    recovery_token = NULL
WHERE id = 'AUTH_USER_ID_HERE';

-- Verify the update
SELECT 
    email,
    created_at,
    updated_at,
    email_confirmed_at,
    last_sign_in_at,
    raw_user_meta_data
FROM auth.users
WHERE id = 'AUTH_USER_ID_HERE';

-- ===================================================================
-- OPTION 2: RESET CUSTOMER USER PASSWORD
-- ===================================================================
-- This method updates the password for a customer by their email

-- Step 1: Find the customer user's auth ID
SELECT 
    cu.email,
    cu.full_name,
    cu.phone,
    cu.auth_user_id,
    au.email as auth_email,
    au.created_at as user_created,
    cu.is_active,
    cu.email_verified
FROM public.customer_users cu
LEFT JOIN auth.users au ON au.id = cu.auth_user_id
WHERE cu.email = 'customer@example.com'  -- REPLACE WITH ACTUAL EMAIL
ORDER BY cu.created_at DESC;

-- Step 2: Reset password using the auth_user_id
UPDATE auth.users
SET 
    encrypted_password = crypt('NEW_PASSWORD_HERE', gen_salt('bf')),
    updated_at = NOW(),
    email_confirmed_at = NOW(),
    confirmation_token = NULL,
    recovery_token = NULL
WHERE id = 'AUTH_USER_ID_HERE';

-- ===================================================================
-- OPTION 3: RESET PASSWORD BY EMAIL (ONE-STEP METHOD)
-- ===================================================================
-- This method finds and resets in one query

-- For Staff Users:
UPDATE auth.users
SET 
    encrypted_password = crypt('NEW_PASSWORD_HERE', gen_salt('bf')),
    updated_at = NOW(),
    email_confirmed_at = NOW(),
    confirmation_token = NULL,
    recovery_token = NULL
WHERE email = 'staff@clevelandbody.com'  -- REPLACE WITH ACTUAL EMAIL
RETURNING email, updated_at, email_confirmed_at;

-- For Customer Users:
UPDATE auth.users
SET 
    encrypted_password = crypt('NEW_PASSWORD_HERE', gen_salt('bf')),
    updated_at = NOW(),
    email_confirmed_at = NOW(),
    confirmation_token = NULL,
    recovery_token = NULL
WHERE email = 'customer@example.com'  -- REPLACE WITH ACTUAL EMAIL
RETURNING email, updated_at, email_confirmed_at;

-- ===================================================================
-- OPTION 4: LIST ALL STAFF USERS (FOR REFERENCE)
-- ===================================================================
-- Use this to find the correct email address

SELECT 
    su.email,
    su.full_name,
    su.role,
    su.is_active,
    su.created_at,
    au.last_sign_in_at,
    au.email_confirmed_at,
    CASE 
        WHEN su.is_active = false THEN '❌ Inactive'
        WHEN au.email_confirmed_at IS NULL THEN '⚠️ Unconfirmed'
        WHEN au.last_sign_in_at IS NULL THEN '🆕 Never logged in'
        ELSE '✅ Active'
    END as status
FROM public.staff_users su
LEFT JOIN auth.users au ON au.id = su.auth_user_id
ORDER BY su.created_at DESC;

-- ===================================================================
-- OPTION 5: LIST ALL CUSTOMER USERS (FOR REFERENCE)
-- ===================================================================
SELECT 
    cu.email,
    cu.full_name,
    cu.phone,
    cu.is_active,
    cu.email_verified,
    cu.created_at,
    au.last_sign_in_at,
    CASE 
        WHEN cu.is_active = false THEN '❌ Inactive'
        WHEN cu.email_verified = false THEN '⚠️ Unverified'
        WHEN au.last_sign_in_at IS NULL THEN '🆕 Never logged in'
        ELSE '✅ Active'
    END as status
FROM public.customer_users cu
LEFT JOIN auth.users au ON au.id = cu.auth_user_id
ORDER BY cu.created_at DESC;

-- ===================================================================
-- OPTION 6: CREATE NEW STAFF USER (IF NEEDED)
-- ===================================================================
-- If you need to create a brand new staff account

-- Step 1: Create auth user
-- Note: This uses Supabase's auth.users table directly
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    is_super_admin,
    raw_app_meta_data
) VALUES (
    '00000000-0000-0000-0000-000000000000',  -- instance_id
    gen_random_uuid(),                        -- id (auto-generated)
    'authenticated',                          -- aud
    'authenticated',                          -- role
    'newstaff@clevelandbody.com',            -- REPLACE WITH EMAIL
    crypt('INITIAL_PASSWORD', gen_salt('bf')), -- REPLACE WITH PASSWORD
    NOW(),                                    -- email_confirmed_at
    NOW(),                                    -- created_at
    NOW(),                                    -- updated_at
    '{"role": "staff"}'::jsonb,              -- raw_user_meta_data
    false,                                    -- is_super_admin
    '{"provider": "email", "providers": ["email"]}'::jsonb  -- raw_app_meta_data
)
RETURNING id, email;

-- Step 2: Create staff_users record
-- REPLACE 'AUTH_USER_ID' with the id returned from Step 1
INSERT INTO public.staff_users (
    auth_user_id,
    email,
    full_name,
    role,
    is_active,
    can_access_appointments,
    can_access_crm,
    can_manage_staff
) VALUES (
    'AUTH_USER_ID',                    -- From Step 1
    'newstaff@clevelandbody.com',      -- REPLACE
    'New Staff Member',                -- REPLACE
    'staff',                           -- or 'admin' or 'manager'
    true,                              -- is_active
    true,                              -- can_access_appointments
    true,                              -- can_access_crm
    false                              -- can_manage_staff (false for regular staff)
);

-- ===================================================================
-- OPTION 7: REACTIVATE DISABLED USER
-- ===================================================================
-- Enable a previously disabled user account

-- For Staff:
UPDATE public.staff_users
SET 
    is_active = true,
    updated_at = NOW()
WHERE email = 'staff@clevelandbody.com';  -- REPLACE

-- Also ensure auth user is not banned
UPDATE auth.users
SET 
    banned_until = NULL,
    updated_at = NOW()
WHERE email = 'staff@clevelandbody.com';  -- REPLACE

-- For Customers:
UPDATE public.customer_users
SET 
    is_active = true,
    email_verified = true,
    updated_at = NOW()
WHERE email = 'customer@example.com';  -- REPLACE

-- ===================================================================
-- OPTION 8: DEACTIVATE USER (WITHOUT DELETING)
-- ===================================================================
-- Disable a user account temporarily

-- For Staff:
UPDATE public.staff_users
SET 
    is_active = false,
    updated_at = NOW()
WHERE email = 'staff@clevelandbody.com';  -- REPLACE

-- For Customers:
UPDATE public.customer_users
SET 
    is_active = false,
    updated_at = NOW()
WHERE email = 'customer@example.com';  -- REPLACE

-- ===================================================================
-- OPTION 9: VERIFY PASSWORD RESET WAS SUCCESSFUL
-- ===================================================================
-- Run this after resetting a password to confirm

SELECT 
    au.email,
    au.updated_at as password_updated,
    au.email_confirmed_at,
    au.last_sign_in_at,
    CASE 
        WHEN su.email IS NOT NULL THEN 'Staff User'
        WHEN cu.email IS NOT NULL THEN 'Customer User'
        ELSE 'Unknown Type'
    END as user_type,
    COALESCE(su.full_name, cu.full_name) as full_name,
    COALESCE(su.is_active, cu.is_active) as is_active
FROM auth.users au
LEFT JOIN public.staff_users su ON su.auth_user_id = au.id
LEFT JOIN public.customer_users cu ON cu.auth_user_id = au.id
WHERE au.email = 'email@example.com'  -- REPLACE
ORDER BY au.updated_at DESC;

-- ===================================================================
-- OPTION 10: RESET MULTIPLE USERS AT ONCE (BULK OPERATION)
-- ===================================================================
-- WARNING: Use with extreme caution!

-- Reset password for all staff users with a default password
-- (Useful for initial setup or after migration)
UPDATE auth.users
SET 
    encrypted_password = crypt('TempPassword123!', gen_salt('bf')),
    updated_at = NOW(),
    email_confirmed_at = NOW()
WHERE id IN (
    SELECT auth_user_id 
    FROM public.staff_users 
    WHERE is_active = true
);

-- ===================================================================
-- TROUBLESHOOTING QUERIES
-- ===================================================================

-- Check if user exists in both auth.users and staff_users
SELECT 
    'Auth User' as table_name,
    email,
    created_at,
    email_confirmed_at
FROM auth.users
WHERE email = 'staff@clevelandbody.com'  -- REPLACE
UNION ALL
SELECT 
    'Staff User' as table_name,
    email,
    created_at,
    created_at as email_confirmed_at
FROM public.staff_users
WHERE email = 'staff@clevelandbody.com';  -- REPLACE

-- Check for orphaned records (staff_users without auth.users)
SELECT 
    su.email,
    su.full_name,
    su.auth_user_id,
    CASE 
        WHEN au.id IS NULL THEN '❌ ORPHANED - No auth.users record'
        ELSE '✅ OK'
    END as status
FROM public.staff_users su
LEFT JOIN auth.users au ON au.id = su.auth_user_id
ORDER BY su.created_at DESC;

-- Check for duplicate emails
SELECT 
    email,
    COUNT(*) as count,
    STRING_AGG(id::text, ', ') as user_ids
FROM auth.users
GROUP BY email
HAVING COUNT(*) > 1;

-- ===================================================================
-- QUICK REFERENCE EXAMPLES
-- ===================================================================

-- Example 1: Reset password for staff@clevelandbody.com to "NewPass123!"
UPDATE auth.users
SET 
    encrypted_password = crypt('NewPass123!', gen_salt('bf')),
    updated_at = NOW(),
    email_confirmed_at = NOW()
WHERE email = 'staff@clevelandbody.com';

-- Example 2: Reset password for a customer by phone number
UPDATE auth.users
SET 
    encrypted_password = crypt('CustomerPass123', gen_salt('bf')),
    updated_at = NOW()
WHERE id IN (
    SELECT auth_user_id 
    FROM public.customer_users 
    WHERE phone = '2165551234'  -- REPLACE
);

-- Example 3: Reset password and force email confirmation
UPDATE auth.users
SET 
    encrypted_password = crypt('TemporaryPass!', gen_salt('bf')),
    updated_at = NOW(),
    email_confirmed_at = NOW(),
    confirmation_token = NULL,
    recovery_token = NULL,
    email_change_token_new = NULL
WHERE email = 'user@example.com';

-- ===================================================================
-- NOTES & BEST PRACTICES
-- ===================================================================
-- 
-- 1. ALWAYS use strong passwords (min 8 chars, uppercase, lowercase, numbers, symbols)
-- 2. NEVER hardcode passwords in application code
-- 3. Use Supabase's built-in password reset flow when possible
-- 4. Document any manual password resets for security audit
-- 5. Consider enabling MFA for admin/staff accounts
-- 6. Regularly review active user accounts
-- 7. Use email confirmation for new accounts
-- 8. Set email_confirmed_at when resetting passwords manually
-- 9. Clear any recovery/confirmation tokens after manual reset
-- 10. Test login immediately after password reset
--
-- ===================================================================
-- SECURITY WARNINGS
-- ===================================================================
--
-- ⚠️ Only run these queries if you have proper authorization
-- ⚠️ Manual password resets bypass normal security workflows
-- ⚠️ Log all manual password resets for audit purposes
-- ⚠️ Inform users when their password has been reset
-- ⚠️ Consider forcing password change on next login
-- ⚠️ Never share passwords via insecure channels
--
-- ===================================================================
