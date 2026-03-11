# 🚀 DEPLOYMENT & LIVE TESTING GUIDE

## Deployment Status

### ✅ Code Status
- **Latest Commit**: `5676ebc` - "Add Phase 1 verification guide and next steps"
- **Branch**: `main`
- **Repository**: https://github.com/tzira333/cleveland-auto-body
- **Status**: All changes committed and pushed

### ✅ Database Status
- **Migration**: ✅ Complete (FINAL_MIGRATION_CORRECT_SCHEMA.sql)
- **Tables Created**: `appointment_notes`
- **Views Created**: `customer_appointment_view`, `staff_appointment_view`
- **RLS Enabled**: ✅ Security policies active

### 🔄 Vercel Deployment
Your code should auto-deploy via Vercel. Check status at:
- **Vercel Dashboard**: https://vercel.com/andres-projects-1b1915bc/clevelandbody-site
- **Production URL**: https://clevelandbody.com

If auto-deploy didn't trigger:
1. Go to Vercel dashboard
2. Click "Deploy" or "Redeploy"
3. Wait 2-3 minutes for build to complete

---

## Live Testing Plan

Once Vercel deployment completes, we'll test:

### Test 1: Verify New API Endpoints Are Live ✅

**Test customer appointment endpoint**:
```bash
# Replace YOUR_APPOINTMENT_ID with a real ID from your database
curl "https://clevelandbody.com/api/appointments/customer/YOUR_APPOINTMENT_ID"
```

**Expected Response**:
```json
{
  "appointment": {
    "id": "...",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "(216) 555-0123",
    "appointment_date": "2024-01-20",
    "appointment_time": "10:00:00",
    "service_type": "Collision Repair",
    "status": "pending",
    "notes": "Customer's original notes",
    "shared_notes": []  // Empty if no notes marked customer_visible yet
  }
}
```

### Test 2: Test Customer Edit Functionality ✏️

**Edit an appointment**:
```bash
curl -X PUT "https://clevelandbody.com/api/appointments/customer/YOUR_APPOINTMENT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_phone": "(216) 555-9999",
    "appointment_date": "2024-01-25",
    "appointment_time": "14:00:00",
    "notes": "Changed my availability - prefer afternoon"
  }'
```

**Expected Response**:
```json
{
  "message": "Appointment updated successfully",
  "appointment": {
    "id": "...",
    "customer_phone": "(216) 555-9999",
    "appointment_date": "2024-01-25",
    "appointment_time": "14:00:00",
    "last_edited_by": "john@example.com",
    "last_edited_at": "2024-01-15T...",
    "edit_count": 1
  }
}
```

### Test 3: Create a Shared Note (Staff Feature) 📝

**Create a note visible to customer**:
```bash
curl -X POST "https://clevelandbody.com/api/appointments/notes" \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_id": "YOUR_APPOINTMENT_ID",
    "note_text": "Your estimate is ready! We can start repairs on Monday.",
    "customer_visible": true,
    "created_by": "staff@clevelandbody.com"
  }'
```

**Expected Response**:
```json
{
  "message": "Note added successfully",
  "note": {
    "id": "...",
    "appointment_id": "...",
    "note_text": "Your estimate is ready! We can start repairs on Monday.",
    "customer_visible": true,
    "created_by": "staff@clevelandbody.com",
    "created_at": "2024-01-15T..."
  }
}
```

### Test 4: Verify Customer Sees Shared Note 👀

**Get appointment again (after adding shared note)**:
```bash
curl "https://clevelandbody.com/api/appointments/customer/YOUR_APPOINTMENT_ID"
```

**Expected Response** (note the `shared_notes` array now has content):
```json
{
  "appointment": {
    "id": "...",
    "customer_name": "John Doe",
    ...
    "shared_notes": [
      {
        "id": "...",
        "note_text": "Your estimate is ready! We can start repairs on Monday.",
        "created_at": "2024-01-15T...",
        "created_by": "staff@clevelandbody.com"
      }
    ]
  }
}
```

### Test 5: Verify Staff Notes Are Hidden 🔒

**Create an internal staff note**:
```bash
curl -X POST "https://clevelandbody.com/api/appointments/notes" \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_id": "YOUR_APPOINTMENT_ID",
    "note_text": "Customer called 3 times today, seems anxious about timeline",
    "customer_visible": false,
    "created_by": "staff@clevelandbody.com"
  }'
```

Then fetch the appointment again as customer:
```bash
curl "https://clevelandbody.com/api/appointments/customer/YOUR_APPOINTMENT_ID"
```

**Expected**: The `shared_notes` array should NOT include the internal note.

---

## Quick Testing Steps

### Step 1: Get a Real Appointment ID
Run this in Supabase SQL Editor:
```sql
SELECT id, customer_name, customer_email, appointment_date 
FROM appointments 
WHERE deleted_at IS NULL 
LIMIT 5;
```

Pick one ID to use for testing.

### Step 2: Check Vercel Deployment
1. Go to https://vercel.com/andres-projects-1b1915bc/clevelandbody-site
2. Verify latest deployment shows commit `5676ebc`
3. Status should show "Ready" (green)

### Step 3: Run Tests
Use the curl commands above with your real appointment ID.

### Step 4: Verify in Database
After running tests, check the database:
```sql
-- Check if notes were created
SELECT * FROM appointment_notes 
WHERE appointment_id = 'YOUR_APPOINTMENT_ID';

-- Check edit tracking
SELECT id, customer_name, last_edited_by, last_edited_at, edit_count
FROM appointments 
WHERE id = 'YOUR_APPOINTMENT_ID';

-- Check customer view (what customer sees)
SELECT id, customer_name, shared_notes
FROM customer_appointment_view 
WHERE id = 'YOUR_APPOINTMENT_ID';

-- Check staff view (what staff sees)
SELECT id, customer_name, staff_notes, all_notes
FROM staff_appointment_view 
WHERE id = 'YOUR_APPOINTMENT_ID';
```

---

## Troubleshooting

### Issue: API returns 404
**Cause**: Routes not deployed or incorrect path
**Fix**: 
- Check Vercel deployment logs
- Verify files exist: `app/api/appointments/customer/[id]/route.ts`
- Check production build succeeded

### Issue: API returns 500 or database error
**Cause**: Supabase connection issue or missing environment variables
**Fix**:
- Check Vercel environment variables include `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Verify Supabase RLS policies allow the operations
- Check Vercel function logs for detailed errors

### Issue: Customer sees staff-only notes
**Cause**: RLS policies not working or `customer_visible` flag incorrect
**Fix**:
- Verify RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'appointment_notes';`
- Check policies exist: `SELECT * FROM pg_policies WHERE tablename = 'appointment_notes';`
- Verify notes have correct `customer_visible` value

### Issue: Edit doesn't update `last_edited_at`
**Cause**: Columns not being updated in PUT request
**Fix**: Check the API route is setting these fields in the update object

---

## Success Criteria

✅ **Test 1**: Customer GET endpoint returns appointment data
✅ **Test 2**: Customer PUT endpoint updates appointment and increments `edit_count`
✅ **Test 3**: POST notes endpoint creates note with `customer_visible` flag
✅ **Test 4**: Customer GET shows shared notes in `shared_notes` array
✅ **Test 5**: Customer GET does NOT show internal staff notes
✅ **Test 6**: Database queries confirm data integrity

---

## What to Report

After testing, please share:
1. **Vercel Deployment Status**: ✅ or ❌
2. **Test Results**: Which tests passed/failed
3. **Any Error Messages**: Copy full error output
4. **Next Steps**: Do you want to proceed to Phase 2 UI?

---

## Files Deployed

- ✅ `migrations/FINAL_MIGRATION_CORRECT_SCHEMA.sql` (run in Supabase)
- ✅ `app/api/appointments/customer/[id]/route.ts` (customer API)
- ✅ `app/api/appointments/notes/route.ts` (notes API)
- ✅ `app/api/crm/repair-orders/notes/route.ts` (repair order notes)
- ✅ `components/portal/EditAppointmentModal.tsx` (UI component)
- ✅ `components/portal/AccountCreationNotification.tsx` (UI component)

**Ready to test!** 🚀

Start with checking Vercel deployment status, then run the curl tests above!
