# Appointment Confirmation Troubleshooting Guide

## Issue: Staff Unable to Confirm Service Inquiries

### Symptoms
- Staff clicks the **[Confirm]** button on a service inquiry
- Button may show loading/processing state
- Appointment does not move to "Confirmed Appointments" tab
- May show error message or fail silently

---

## Root Cause Analysis

The issue is most likely one of the following:

### 1. Database Migration Not Run ⚠️ **MOST LIKELY**
**Symptom**: The `appointment_type` column doesn't exist in the database yet.

**Check**: Look at browser console (F12 → Console tab) for errors like:
```
column "appointment_type" does not exist
```

**Solution**: Run the database migration in Supabase:

```sql
-- In Supabase SQL Editor, run:
-- File: migrations/add_service_inquiry_workflow.sql

-- Or run directly:
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS appointment_type TEXT DEFAULT 'inquiry' 
CHECK (appointment_type IN ('inquiry', 'confirmed'));

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS archived_by TEXT;

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS archived_reason TEXT;

-- Update existing data
UPDATE appointments 
SET appointment_type = 'confirmed' 
WHERE status = 'confirmed';

UPDATE appointments 
SET appointment_type = 'inquiry' 
WHERE appointment_type IS NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_appointments_type ON appointments(appointment_type);
CREATE INDEX IF NOT EXISTS idx_appointments_archived ON appointments(archived);
```

---

### 2. Missing Environment Variables
**Symptom**: API endpoint returns 500 error with "supabaseUrl is not defined" or similar.

**Check**: Verify Vercel environment variables are set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` ⭐ **Critical for bypassing RLS**

**Solution**: 
1. Go to: https://vercel.com/andres-projects-1b1915bc/clevelandbody-site/settings/environment-variables
2. Add the missing variables
3. Redeploy the site

---

### 3. Row Level Security (RLS) Policy Issue
**Symptom**: Update succeeds but doesn't save, or returns "permission denied" error.

**Check**: Look for RLS-related errors in console or Vercel logs.

**Solution**: The API should be using `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS. Verify:
1. Service role key is set in Vercel environment variables
2. API route is using service role key (already implemented in code)
3. Check Supabase logs: https://supabase.com/dashboard/project/[project-id]/logs

**Temporary Workaround** (if needed):
```sql
-- In Supabase, temporarily disable RLS for testing:
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;

-- Test if confirmation works
-- If it works, RLS is the issue

-- Re-enable RLS:
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
```

---

### 4. API Endpoint Not Deployed
**Symptom**: 404 error when calling `/api/appointments/confirm`

**Check**: Visit https://clevelandbody.com/api/appointments/confirm (should return 405 Method Not Allowed, NOT 404)

**Solution**: 
1. Verify latest code is deployed to Vercel
2. Check Vercel deployments: https://vercel.com/andres-projects-1b1915bc/clevelandbody-site
3. If not deployed, trigger manual deployment or push to main branch

---

### 5. Frontend State Management Issue
**Symptom**: Confirmation succeeds but UI doesn't update.

**Check**: Look for success message in console but no tab change.

**Solution**: The `fetchAppointments()` function should be called after successful confirmation. This is already implemented, but if tabs don't update:

```javascript
// In StaffDashboard.tsx, confirmAppointment function
// After successful confirmation:
fetchAppointments()  // ✅ Already implemented
setSelectedAppointment(null)  // ✅ Already implemented
```

---

## Debugging Steps

### Step 1: Open Browser Console
1. Open the staff dashboard: https://clevelandbody.com/admin/staff/appointments
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Click the **[Confirm]** button on a service inquiry
5. Look for error messages

### Step 2: Check What's Logged
With the latest code (commit `f576310`), you should see detailed logs:

**Frontend Console:**
```
Confirming appointment: { appointmentId: "...", date: "...", time: "..." }
Confirm response: { status: 200, data: { success: true, ... } }
```

**If Error:**
```
Failed to confirm: { error: "...", details: { ... } }
```

### Step 3: Check Vercel Logs
1. Go to: https://vercel.com/andres-projects-1b1915bc/clevelandbody-site/logs
2. Filter by `/api/appointments/confirm`
3. Look for recent requests
4. Check for error messages

**What to look for:**
- `Confirm appointment request: ...` - Request received
- `Found appointment: ...` - Appointment fetched successfully
- `Updating appointment with: ...` - About to update
- `Appointment confirmed successfully: ...` - Success!
- OR error messages with stack traces

### Step 4: Check Supabase Logs
1. Go to: https://supabase.com/dashboard/project/[project-id]/logs
2. Look for `UPDATE` queries on `appointments` table
3. Check for permission errors or constraint violations

---

## Quick Test Queries

### Check if columns exist:
```sql
-- Run in Supabase SQL Editor
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'appointments'
  AND column_name IN ('appointment_type', 'archived', 'archived_at', 'archived_by', 'archived_reason');
```

**Expected result**: 5 rows showing all these columns

**If 0 rows**: Migration not run ⚠️

### Check current appointments:
```sql
-- Run in Supabase SQL Editor
SELECT 
  id,
  customer_name,
  status,
  appointment_type,
  archived,
  created_at
FROM appointments
ORDER BY created_at DESC
LIMIT 10;
```

**Look for:**
- Does `appointment_type` column exist?
- Are there any with `appointment_type = 'inquiry'`?
- Are `archived` values set correctly?

### Test manual update:
```sql
-- Run in Supabase SQL Editor
-- Pick an inquiry appointment_id from above query
UPDATE appointments
SET 
  appointment_type = 'confirmed',
  status = 'confirmed'
WHERE id = 'YOUR-APPOINTMENT-ID-HERE'
RETURNING *;
```

**If this works**: API permissions issue  
**If this fails**: Database constraint or schema issue

---

## Solutions Summary

| Problem | Quick Fix |
|---------|-----------|
| Migration not run | Run `migrations/add_service_inquiry_workflow.sql` in Supabase |
| Missing env vars | Add `SUPABASE_SERVICE_ROLE_KEY` in Vercel |
| API not deployed | Check Vercel deployments, redeploy if needed |
| RLS blocking | Service role key should bypass (already implemented) |
| UI not updating | Already implemented, check browser console |

---

## Expected Behavior After Fix

1. **Service Inquiries Tab**: Shows new customer requests with 📩 **Inquiry** badge
2. **Click [Confirm]**: Shows confirmation dialog
3. **After Confirm**: 
   - Alert: "Appointment confirmed successfully!"
   - Appointment disappears from Service Inquiries tab
   - Appointment appears in Confirmed Appointments tab with 📅 **Confirmed** badge
4. **Console Logs**:
   ```
   Confirming appointment: { appointmentId: "uuid", ... }
   Confirm response: { status: 200, data: { success: true, ... } }
   ```

---

## Still Not Working?

### Collect This Information:

1. **Browser Console Output** (copy full text)
2. **Vercel Logs** for `/api/appointments/confirm` (copy recent entries)
3. **Supabase SQL Query Results**:
   ```sql
   -- Does column exist?
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'appointments' AND column_name = 'appointment_type';
   
   -- Sample appointment data
   SELECT id, customer_name, status, appointment_type, archived
   FROM appointments LIMIT 5;
   ```
4. **Environment Variables Check**:
   - Is `SUPABASE_SERVICE_ROLE_KEY` set in Vercel? (Yes/No)
   - Does it start with `eyJ...`? (Yes/No)

### Next Steps:
1. Run the database migration (most likely fix)
2. Check environment variables in Vercel
3. Review browser console for specific error messages
4. Check Vercel deployment logs for API errors

---

## Prevention

To avoid this issue in the future:

1. ✅ Always run database migrations before deploying new features
2. ✅ Test locally with production database (read-only connection)
3. ✅ Verify environment variables after deployment
4. ✅ Check Vercel logs after deployment for any errors
5. ✅ Test critical workflows (like confirmation) immediately after deployment

---

## Related Files

- **Migration**: `migrations/add_service_inquiry_workflow.sql`
- **API Endpoint**: `app/api/appointments/confirm/route.ts`
- **Frontend Component**: `app/admin/staff/StaffDashboard.tsx`
- **Documentation**: `SERVICE_INQUIRY_COMPLETE.md`, `WORKFLOW_VISUAL_GUIDE.md`

---

## Contact

If the issue persists after following this guide, provide:
1. Browser console logs
2. Vercel deployment logs
3. Supabase query results from "Quick Test Queries" section above

---

**Last Updated**: 2024-02-10  
**Latest Commit**: `f576310` - Added detailed logging for debugging
