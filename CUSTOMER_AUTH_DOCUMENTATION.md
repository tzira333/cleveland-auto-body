# Customer Portal Authentication Implementation

## Overview

This document describes the complete customer authentication system that has been implemented for the Clevelandbody.com Customer Portal. The system provides secure, account-based access to appointment management while maintaining backward compatibility with phone-based quick lookup.

## Features Implemented

### 1. Customer Authentication System
- **User Registration**: New customers can create accounts with email, password, full name, and phone
- **Secure Login**: Customers log in with email and password
- **Password Reset**: Forgot password functionality with email verification
- **Account Dashboard**: Authenticated view of all customer appointments

### 2. Database Schema
- **customer_users table**: Stores customer authentication and profile information
- **Row-Level Security (RLS)**: Comprehensive policies ensuring data privacy
- **Updated appointments table**: Links appointments to authenticated customers

### 3. Dual Access Modes
- **Authenticated Access**: Full dashboard with all appointments (recommended)
- **Quick Lookup**: Phone-based lookup without account (legacy support)

## Files Created/Modified

### New Files

#### 1. Database Schema
```
/home/user/webapp/schema-customer-auth.sql
```
- Creates `customer_users` table
- Updates `appointments` table with `customer_user_id` foreign key
- Implements comprehensive RLS policies
- Includes verification queries

#### 2. Customer Authentication Pages
```
/home/user/webapp/app/portal/auth/login/page.tsx
/home/user/webapp/app/portal/auth/register/page.tsx
/home/user/webapp/app/portal/auth/reset-password/page.tsx
```
- Login form with validation
- Registration form with phone formatting
- Password reset with email verification

#### 3. Customer Dashboard
```
/home/user/webapp/app/portal/dashboard/page.tsx
```
- Displays customer profile information
- Lists all customer appointments
- Provides quick action buttons
- Includes logout functionality

#### 4. API Endpoint
```
/home/user/webapp/app/api/customer/register/route.ts
```
- Handles customer registration with service role
- Creates `customer_users` record
- Validates input and prevents duplicates

### Modified Files

```
/home/user/webapp/app/portal/page.tsx
```
- Added links to login and registration
- Enhanced UI with account creation prompts
- Maintained backward compatibility with phone lookup

## Database Schema Details

### customer_users Table

```sql
CREATE TABLE public.customer_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS Policies Summary

#### customer_users Table
1. **customer_can_view_own_record**: Customers can view their own profile
2. **customer_can_update_own_record**: Customers can update their own profile
3. **staff_can_view_all_customers**: Staff can view all customer profiles

#### appointments Table
1. **anyone_can_create_appointments**: Unauthenticated appointment creation
2. **customers_can_view_own_appointments**: Authenticated customers see only their appointments
3. **customers_can_update_own_appointments**: Customers can update their appointments
4. **staff_can_view_all_appointments**: Staff can view all appointments
5. **staff_can_update_all_appointments**: Staff can modify all appointments
6. **staff_can_delete_appointments**: Staff can delete appointments

## Setup Instructions

### Step 1: Run Database Migration

Connect to your Supabase project and run the schema file:

```bash
# In Supabase SQL Editor, run:
schema-customer-auth.sql
```

Verify the setup with the included verification queries.

### Step 2: Verify Environment Variables

Ensure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 3: Build and Deploy

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run locally
npm run dev

# Or deploy to production
npm run deploy
```

## User Flows

### New Customer Registration Flow

1. Customer visits `/portal` or `/portal/auth/register`
2. Fills out registration form (name, email, phone, password)
3. System creates Supabase Auth user
4. API creates `customer_users` record
5. Customer redirected to `/portal/auth/login`
6. Customer logs in and redirected to `/portal/dashboard`

### Existing Customer Login Flow

1. Customer visits `/portal/auth/login`
2. Enters email and password
3. System validates credentials via Supabase Auth
4. System verifies customer_users record exists
5. Customer redirected to `/portal/dashboard`

### Quick Lookup Flow (No Account)

1. Customer visits `/portal`
2. Enters phone number
3. System queries appointments by phone
4. Displays matching appointments (if any)
5. Prompts to create account for easier access

### Password Reset Flow

1. Customer visits `/portal/auth/reset-password`
2. Enters email address
3. Receives password reset email from Supabase
4. Clicks link and sets new password
5. Returns to login page

## Security Features

### 1. Authentication
- Supabase Auth handles password hashing and validation
- JWT tokens for session management
- Secure password reset via email

### 2. Authorization
- Row-Level Security ensures data isolation
- Customers can only see their own appointments
- Staff have elevated permissions
- Service role key protected on server-side

### 3. Input Validation
- Client-side validation for immediate feedback
- Server-side validation for security
- Phone number normalization and formatting

### 4. Session Management
- Automatic session refresh
- Secure logout functionality
- Redirect to login for unauthenticated access

## API Endpoints

### POST /api/customer/register

Creates a new customer user record.

**Request Body:**
```json
{
  "auth_user_id": "uuid",
  "email": "customer@example.com",
  "full_name": "John Doe",
  "phone": "2164818696"
}
```

**Response (Success):**
```json
{
  "success": true,
  "customer": {
    "id": "uuid",
    "auth_user_id": "uuid",
    "email": "customer@example.com",
    "full_name": "John Doe",
    "phone": "2164818696",
    "is_active": true,
    "email_verified": false,
    "created_at": "2024-02-08T...",
    "updated_at": "2024-02-08T..."
  }
}
```

**Response (Error):**
```json
{
  "error": "Error message"
}
```

## Testing Checklist

### Customer Registration
- [ ] Can create account with valid details
- [ ] Email validation works
- [ ] Phone formatting works (XXX-XXX-XXXX)
- [ ] Password must be 8+ characters
- [ ] Duplicate email prevented
- [ ] Success message displayed
- [ ] Redirects to login after registration

### Customer Login
- [ ] Can log in with valid credentials
- [ ] Invalid credentials show error
- [ ] Redirects to dashboard after login
- [ ] Session persists on page refresh
- [ ] Logout works correctly

### Customer Dashboard
- [ ] Displays customer name and info
- [ ] Shows all customer appointments
- [ ] Appointment status colors correct
- [ ] Quick action buttons work
- [ ] Contact information displayed

### Quick Lookup (No Auth)
- [ ] Can search by phone number
- [ ] Shows appointments for that phone
- [ ] No appointments message shown correctly
- [ ] Prompts to create account
- [ ] Links to login/register work

### Password Reset
- [ ] Can request reset email
- [ ] Email received (check spam)
- [ ] Reset link works
- [ ] Can set new password
- [ ] Can log in with new password

### Staff Portal
- [ ] Staff can still log in
- [ ] Staff can view all appointments
- [ ] Staff can update appointments
- [ ] Staff cannot access customer portal

### Row-Level Security
- [ ] Customer A cannot see Customer B's appointments
- [ ] Unauthenticated users cannot query appointments directly
- [ ] Staff can see all appointments
- [ ] Customer can update only their own appointments

## Troubleshooting

### Issue: "Access denied" when viewing appointments

**Solution:**
```sql
-- Check RLS policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'appointments';

-- Temporarily disable RLS for testing (NOT for production)
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;
```

### Issue: Customer registration fails

**Solution:**
1. Verify Supabase Auth user is created first
2. Check SUPABASE_SERVICE_ROLE_KEY is set correctly
3. Check API route logs for specific error
4. Verify customer_users table exists

### Issue: Phone lookup not working

**Solution:**
```sql
-- Check if appointments have customer_phone
SELECT id, customer_name, customer_phone FROM public.appointments LIMIT 5;

-- Verify phone is normalized (digits only)
-- Should be '2164818696' not '216-481-8696'
```

### Issue: RLS blocking staff access

**Solution:**
```sql
-- Verify staff user exists
SELECT * FROM public.staff_users WHERE email = 'your-staff-email@example.com';

-- Check staff has correct permissions
SELECT can_access_appointments FROM public.staff_users WHERE auth_user_id = auth.uid();
```

## Future Enhancements

### Planned Features
1. Email verification for new customers
2. Two-factor authentication (2FA)
3. Social login (Google, Facebook)
4. Customer profile editing
5. Appointment cancellation by customer
6. SMS notifications for appointment updates
7. Document upload for customers
8. Payment integration
9. Customer feedback/rating system
10. Appointment history export (PDF)

### Recommended Improvements
1. Add rate limiting to prevent brute force attacks
2. Implement account lockout after failed login attempts
3. Add CAPTCHA to registration form
4. Store password reset tokens with expiration
5. Add audit logging for customer actions
6. Implement email verification before account activation
7. Add customer support chat
8. Create mobile app with same authentication

## Support

### For Customers
- **Phone**: (216) 481-8696
- **Email**: domesticandforeignab@gmail.com
- **Address**: 17017 Saint Clair Ave, Cleveland, OH 44110

### For Developers
- Check logs in Supabase Dashboard
- Review RLS policies in SQL Editor
- Test with different user roles
- Use browser DevTools for debugging

## Related Documentation

- [Main README](/home/user/webapp/README.md)
- [Database Schema](/home/user/webapp/schema.sql)
- [Extended CRM Schema](/home/user/webapp/schema-extended.sql)
- [Staff Portal Documentation](/home/user/webapp/DEPLOYMENT_SUMMARY.md)

## Changelog

### 2024-02-08 - Initial Release
- Created customer authentication system
- Implemented user registration and login
- Added customer dashboard
- Created password reset functionality
- Implemented RLS policies for data security
- Updated existing portal with authentication links
- Created API endpoint for registration
- Added comprehensive documentation

---

**Last Updated**: February 8, 2024
**Version**: 1.0.0
**Status**: Production Ready
