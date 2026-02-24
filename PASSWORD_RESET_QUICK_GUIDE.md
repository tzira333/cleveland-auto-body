# Supabase Password Reset Guide
## Cleveland Auto Body Site

## Quick Start - Reset a Password in 2 Steps

### For Staff Users

**Step 1: Run this query to find the user**
```sql
SELECT 
    email,
    full_name,
    auth_user_id,
    is_active
FROM public.staff_users
WHERE email = 'staff@clevelandbody.com';  -- REPLACE WITH ACTUAL EMAIL
```

**Step 2: Reset the password**
```sql
UPDATE auth.users
SET 
    encrypted_password = crypt('NewPassword123!', gen_salt('bf')),
    updated_at = NOW(),
    email_confirmed_at = NOW()
WHERE email = 'staff@clevelandbody.com';  -- REPLACE WITH ACTUAL EMAIL
```

### For Customer Users

**Step 1: Run this query to find the user**
```sql
SELECT 
    email,
    full_name,
    phone,
    auth_user_id,
    is_active
FROM public.customer_users
WHERE email = 'customer@example.com';  -- REPLACE WITH ACTUAL EMAIL
```

**Step 2: Reset the password**
```sql
UPDATE auth.users
SET 
    encrypted_password = crypt('NewPassword123!', gen_salt('bf')),
    updated_at = NOW(),
    email_confirmed_at = NOW()
WHERE email = 'customer@example.com';  -- REPLACE WITH ACTUAL EMAIL
```

---

## How to Run These Queries

### Using Supabase Dashboard (Recommended)

1. **Login to Supabase**
   - Go to https://app.supabase.com
   - Select your Cleveland Auto Body project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Paste the SQL Query**
   - Copy one of the queries above
   - Replace the email address with the actual user's email
   - Replace 'NewPassword123!' with the new password

4. **Execute the Query**
   - Click "Run" button or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
   - You should see: "Success. 1 row affected"

5. **Test the New Password**
   - Have the user login with their email and new password
   - Staff: https://clevelandbody.com/admin/staff/login
   - Customers: https://clevelandbody.com/portal

---

## One-Line Password Reset (Fastest Method)

### Staff User Password Reset
```sql
UPDATE auth.users SET encrypted_password = crypt('NewPass123!', gen_salt('bf')), updated_at = NOW(), email_confirmed_at = NOW() WHERE email = 'staff@clevelandbody.com';
```

### Customer User Password Reset
```sql
UPDATE auth.users SET encrypted_password = crypt('NewPass123!', gen_salt('bf')), updated_at = NOW(), email_confirmed_at = NOW() WHERE email = 'customer@example.com';
```

**Usage:**
1. Copy the appropriate line above
2. Replace `NewPass123!` with your desired password
3. Replace the email address
4. Paste and run in Supabase SQL Editor

---

## Common Scenarios

### Scenario 1: Staff Member Forgot Password

```sql
-- List all staff users to find the correct email
SELECT email, full_name, role, is_active 
FROM public.staff_users 
ORDER BY created_at DESC;

-- Reset password for the staff member
UPDATE auth.users
SET encrypted_password = crypt('TempPassword2024!', gen_salt('bf')),
    updated_at = NOW(),
    email_confirmed_at = NOW()
WHERE email = 'john.doe@clevelandbody.com';
```

### Scenario 2: Customer Can't Login

```sql
-- Find the customer by email or phone
SELECT email, full_name, phone, is_active, email_verified
FROM public.customer_users
WHERE email = 'customer@example.com' OR phone = '2165551234';

-- Reset password
UPDATE auth.users
SET encrypted_password = crypt('CustomerTemp123!', gen_salt('bf')),
    updated_at = NOW(),
    email_confirmed_at = NOW()
WHERE email = 'customer@example.com';
```

### Scenario 3: New Staff Member Never Set Password

```sql
-- Check if user exists and is active
SELECT su.email, su.full_name, su.is_active, au.email_confirmed_at
FROM public.staff_users su
LEFT JOIN auth.users au ON au.id = su.auth_user_id
WHERE su.email = 'newstaff@clevelandbody.com';

-- Set initial password
UPDATE auth.users
SET encrypted_password = crypt('Welcome2024!', gen_salt('bf')),
    updated_at = NOW(),
    email_confirmed_at = NOW()
WHERE email = 'newstaff@clevelandbody.com';
```

### Scenario 4: Reactivate Locked Account

```sql
-- Reactivate staff user
UPDATE public.staff_users
SET is_active = true, updated_at = NOW()
WHERE email = 'staff@clevelandbody.com';

-- Clear any bans and set new password
UPDATE auth.users
SET encrypted_password = crypt('ResetPass123!', gen_salt('bf')),
    updated_at = NOW(),
    email_confirmed_at = NOW(),
    banned_until = NULL
WHERE email = 'staff@clevelandbody.com';
```

---

## Verification Queries

### Check if Password Reset Worked

```sql
SELECT 
    email,
    updated_at as password_last_updated,
    email_confirmed_at,
    last_sign_in_at,
    CASE 
        WHEN last_sign_in_at > updated_at THEN '✅ User logged in after reset'
        ELSE '⏳ Waiting for first login'
    END as login_status
FROM auth.users
WHERE email = 'staff@clevelandbody.com';
```

### List All Active Staff Users

```sql
SELECT 
    su.email,
    su.full_name,
    su.role,
    au.last_sign_in_at,
    CASE 
        WHEN au.last_sign_in_at IS NULL THEN '🆕 Never logged in'
        WHEN au.last_sign_in_at < NOW() - INTERVAL '30 days' THEN '⚠️ Inactive 30+ days'
        ELSE '✅ Active'
    END as status
FROM public.staff_users su
LEFT JOIN auth.users au ON au.id = su.auth_user_id
WHERE su.is_active = true
ORDER BY au.last_sign_in_at DESC NULLS LAST;
```

---

## Password Requirements

### Recommended Password Format
- **Minimum**: 8 characters
- **Uppercase**: At least 1 letter (A-Z)
- **Lowercase**: At least 1 letter (a-z)
- **Numbers**: At least 1 digit (0-9)
- **Symbols**: At least 1 special character (!@#$%^&*)

### Good Password Examples
- `StrongPass2024!`
- `Cleveland#Body99`
- `AutoShop@2024`
- `Repair$Service1`

### Bad Password Examples (Don't Use)
- `password` (too simple)
- `12345678` (no letters)
- `Cleveland` (no numbers/symbols)
- `admin` (too common)

---

## Troubleshooting

### Issue: "No rows affected" after running UPDATE

**Cause**: Email address doesn't exist in database

**Solution**:
```sql
-- Check if email exists in auth.users
SELECT email, created_at FROM auth.users WHERE email = 'user@example.com';

-- Check if email exists in staff_users
SELECT email, full_name FROM public.staff_users WHERE email = 'user@example.com';

-- If not found, user doesn't exist - create new user instead
```

### Issue: User can't login after password reset

**Possible Causes**:
1. Email is not confirmed
2. Account is inactive
3. User is typing wrong email/password

**Solution**:
```sql
-- Fix all common issues at once
UPDATE auth.users
SET 
    encrypted_password = crypt('NewPassword123!', gen_salt('bf')),
    updated_at = NOW(),
    email_confirmed_at = NOW(),
    confirmation_token = NULL,
    recovery_token = NULL,
    banned_until = NULL
WHERE email = 'user@example.com';

-- Also ensure user is active in staff_users
UPDATE public.staff_users
SET is_active = true, updated_at = NOW()
WHERE email = 'user@example.com';
```

### Issue: "Function crypt does not exist"

**Cause**: pgcrypto extension not enabled

**Solution**:
```sql
-- Enable pgcrypto extension (run once)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Then run your password reset query again
```

---

## Security Best Practices

### ✅ DO
- Use strong, unique passwords
- Set `email_confirmed_at` when resetting passwords
- Clear recovery/confirmation tokens after manual reset
- Document password resets for audit trail
- Inform users when their password is reset
- Test login immediately after reset
- Use temporary passwords and force change on first login

### ❌ DON'T
- Use weak passwords (e.g., "password123")
- Share passwords via email/text
- Reuse the same password for multiple users
- Leave accounts with default passwords
- Skip verification after password reset
- Forget to activate the account (`is_active = true`)

---

## Complete File Reference

For more advanced scenarios, see the full SQL file:
- **File**: `/SUPABASE_PASSWORD_RESET.sql`
- **Includes**: 10+ options for password management
- **Features**: Bulk operations, user creation, troubleshooting queries

---

## Quick Command Reference

| Task | SQL Command |
|------|-------------|
| **Reset staff password** | `UPDATE auth.users SET encrypted_password = crypt('NewPass!', gen_salt('bf')) WHERE email = 'staff@example.com';` |
| **Reset customer password** | `UPDATE auth.users SET encrypted_password = crypt('NewPass!', gen_salt('bf')) WHERE email = 'customer@example.com';` |
| **List all staff** | `SELECT email, full_name FROM public.staff_users;` |
| **List all customers** | `SELECT email, full_name, phone FROM public.customer_users;` |
| **Check user exists** | `SELECT email FROM auth.users WHERE email = 'user@example.com';` |
| **Activate user** | `UPDATE public.staff_users SET is_active = true WHERE email = 'user@example.com';` |
| **Confirm email** | `UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = 'user@example.com';` |

---

## Need More Help?

1. **Check the full SQL file**: `SUPABASE_PASSWORD_RESET.sql`
2. **Review Supabase docs**: https://supabase.com/docs/guides/auth
3. **Check auth.users table**: All authentication data stored here
4. **Verify staff_users table**: Links auth to staff permissions
5. **Test in SQL Editor**: Always test queries before sharing passwords

---

## Login URLs

After resetting a password, users can login at:

- **Staff Portal**: https://clevelandbody.com/admin/staff/login
- **Customer Portal**: https://clevelandbody.com/portal

---

**Last Updated**: February 20, 2026  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
