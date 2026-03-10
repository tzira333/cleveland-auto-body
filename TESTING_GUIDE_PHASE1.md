# Migration & Testing Guide - Shared Notes System

## 🧪 Testing Phase 1: Core Infrastructure

This guide will walk you through testing the database migration and core infrastructure before proceeding to Phase 2 (Staff UI integration).

---

## 📋 Pre-Testing Checklist

Before you begin:
- [ ] Access to Supabase dashboard (https://supabase.com/dashboard)
- [ ] Project: Cleveland Auto Body
- [ ] Admin/Owner permissions
- [ ] SQL Editor access
- [ ] Optional: API testing tool (Postman, curl, or browser DevTools)

---

## 🗄️ STEP 1: Run Database Migration

### 1.1 Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your Cleveland Auto Body project
3. Click **SQL Editor** in left sidebar
4. Click **New query**

### 1.2 Run Migration Script
1. Open the file: `/home/user/webapp/migrations/add_shared_notes_and_edit_history.sql`
2. Copy the ENTIRE contents
3. Paste into Supabase SQL Editor
4. Click **Run** button (or press Ctrl/Cmd + Enter)

**Expected Result:**
```
Migration Complete!
```

### 1.3 Review Migration Output
The migration should show:
- ✅ Tables Created: appointment_notes, appointment_edit_history, repair_order_notes
- ✅ New Appointment Columns: last_edited_by, last_edited_at, edit_count
- ✅ Migrated Notes Count: Shows existing notes migrated
- ✅ Views Created: customer_appointment_view, staff_appointment_view
- ✅ Triggers Created: trg_log_appointment_edit

**If you see errors:**
- Check error message carefully
- Common issue: Table already exists (safe to ignore if rerunning)
- Contact me with specific error message

---

## ✅ STEP 2: Verification Queries

Run these queries to verify the migration succeeded:

### 2.1 Verify Tables Exist
```sql
-- Should return 3 rows
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('appointment_notes', 'appointment_edit_history', 'repair_order_notes')
ORDER BY table_name;
```

**Expected Output:**
```
appointment_edit_history
appointment_notes
repair_order_notes
```

### 2.2 Verify New Columns in Appointments Table
```sql
-- Should return 3 rows
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'appointments' 
  AND column_name IN ('last_edited_by', 'last_edited_at', 'edit_count')
ORDER BY column_name;
```

**Expected Output:**
```
edit_count       | integer   | YES
last_edited_at   | timestamp | YES
last_edited_by   | text      | YES
```

### 2.3 Verify Views Created
```sql
-- Should return 2 rows
SELECT table_name as view_name
FROM information_schema.views 
WHERE table_schema = 'public' 
  AND table_name IN ('customer_appointment_view', 'staff_appointment_view')
ORDER BY table_name;
```

**Expected Output:**
```
customer_appointment_view
staff_appointment_view
```

### 2.4 Verify Trigger Created
```sql
-- Should return 1 row
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trg_log_appointment_edit';
```

**Expected Output:**
```
trg_log_appointment_edit | UPDATE | appointments
```

### 2.5 Check Migrated Notes Count
```sql
-- Shows how many notes were migrated
SELECT 
  COUNT(*) as total_notes,
  SUM(CASE WHEN customer_visible = TRUE THEN 1 ELSE 0 END) as customer_visible_notes,
  SUM(CASE WHEN customer_visible = FALSE THEN 1 ELSE 0 END) as staff_only_notes,
  COUNT(DISTINCT appointment_id) as appointments_with_notes
FROM appointment_notes;
```

**Expected Output:** (numbers will vary based on your data)
```
total_notes | customer_visible_notes | staff_only_notes | appointments_with_notes
     42     |          15            |        27        |          35
```

### 2.6 Sample Customer View (Privacy Check)
```sql
-- This should show ONLY customer-safe data (no staff_notes, no archived_by, etc.)
SELECT 
  id,
  customer_name,
  customer_email,
  appointment_date,
  appointment_time,
  status,
  notes,
  shared_notes
FROM customer_appointment_view
LIMIT 3;
```

**What to verify:**
- ✅ Customer contact info visible
- ✅ Appointment details visible
- ✅ Customer notes visible
- ✅ shared_notes array visible (staff notes marked customer_visible)
- ❌ NO staff_notes column
- ❌ NO archived_by column
- ❌ NO internal fields

### 2.7 Sample Staff View (Full Data Check)
```sql
-- This should show ALL data including internal fields
SELECT 
  id,
  customer_name,
  status,
  staff_notes,
  archived_by,
  all_notes,
  edit_history
FROM staff_appointment_view
LIMIT 3;
```

**What to verify:**
- ✅ All appointment fields visible
- ✅ staff_notes visible (old column, if exists)
- ✅ archived_by visible
- ✅ all_notes JSON array visible
- ✅ edit_history JSON array visible

---

## 🧪 STEP 3: Test Data Migration

### 3.1 Check Sample Appointment Note
```sql
-- Pick a specific appointment with notes
SELECT 
  an.id,
  an.appointment_id,
  an.note_text,
  an.customer_visible,
  an.created_by,
  an.created_at,
  a.customer_name
FROM appointment_notes an
JOIN appointments a ON a.id = an.appointment_id
ORDER BY an.created_at DESC
LIMIT 5;
```

**What to verify:**
- ✅ Notes exist in new table
- ✅ `customer_visible` flag is set correctly
  - Customer notes: `customer_visible = TRUE`
  - Staff notes: `customer_visible = FALSE`
- ✅ `created_by` shows 'customer' or 'system' or staff email
- ✅ Timestamps preserved

### 3.2 Check Edit History Structure (Empty for now)
```sql
-- Should be empty initially (no edits yet)
SELECT 
  id,
  appointment_id,
  edited_by,
  edit_type,
  changes,
  edited_at
FROM appointment_edit_history
LIMIT 5;
```

**Expected Output:**
```
(empty - no rows)
```
*This is normal - edit history starts tracking only after migration*

---

## 🔧 STEP 4: Test Edit History Trigger

### 4.1 Manually Update an Appointment
```sql
-- Pick any appointment ID from your database
-- Replace 'YOUR-APPOINTMENT-ID' with actual UUID
UPDATE appointments
SET 
  customer_name = 'Test Customer Updated',
  last_edited_by = 'test@example.com',
  appointment_date = '2024-02-15'
WHERE id = 'YOUR-APPOINTMENT-ID';
```

### 4.2 Verify Edit History Was Created
```sql
-- Check if trigger created edit history record
SELECT 
  id,
  appointment_id,
  edited_by,
  edit_type,
  changes,
  edited_at
FROM appointment_edit_history
WHERE appointment_id = 'YOUR-APPOINTMENT-ID'
ORDER BY edited_at DESC
LIMIT 1;
```

**Expected Output:**
```json
{
  "id": "uuid...",
  "appointment_id": "YOUR-APPOINTMENT-ID",
  "edited_by": "test@example.com",
  "edit_type": "customer_edit",
  "changes": {
    "customer_name": {
      "old": "Original Name",
      "new": "Test Customer Updated"
    },
    "appointment_date": {
      "old": "2024-01-20",
      "new": "2024-02-15"
    }
  },
  "edited_at": "2024-01-15T14:30:00Z"
}
```

**What to verify:**
- ✅ Record created automatically (trigger worked!)
- ✅ `changes` JSONB shows old/new values
- ✅ Only changed fields appear in `changes`
- ✅ `edit_type` is 'customer_edit' or 'staff_edit'
- ✅ Timestamp is current

---

## 🌐 STEP 5: Test API Endpoints

### 5.1 Test Customer-Safe Endpoint

**Using curl:**
```bash
curl -X GET "https://clevelandbody.com/api/appointments/customer/YOUR-APPOINTMENT-ID"
```

**Using browser DevTools:**
1. Open browser
2. Press F12 (DevTools)
3. Go to Console tab
4. Paste:
```javascript
fetch('/api/appointments/customer/YOUR-APPOINTMENT-ID')
  .then(r => r.json())
  .then(data => console.log(data))
```

**Expected Response:**
```json
{
  "appointment": {
    "id": "uuid...",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "(216) 481-8696",
    "appointment_date": "2024-01-20",
    "appointment_time": "10:00:00",
    "service_type": "estimate",
    "status": "confirmed",
    "notes": "Customer's own notes",
    "shared_notes": [
      {
        "id": "uuid...",
        "note_text": "Your estimate is ready!",
        "created_by": "staff@example.com",
        "created_at": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

**What to verify:**
- ✅ Response includes customer data
- ✅ Response includes shared_notes array
- ❌ Response does NOT include staff_notes
- ❌ Response does NOT include archived_by, archived_reason
- ❌ Response does NOT include edit_history

### 5.2 Test Customer Edit Endpoint

**Using curl:**
```bash
curl -X PUT "https://clevelandbody.com/api/appointments/customer/YOUR-APPOINTMENT-ID" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Updated Name",
    "customer_phone": "(216) 555-1234",
    "appointment_date": "2024-02-20",
    "appointment_time": "14:00:00",
    "edit_reason": "Testing the edit system"
  }'
```

**Using browser DevTools:**
```javascript
fetch('/api/appointments/customer/YOUR-APPOINTMENT-ID', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customer_name: 'Updated Name',
    customer_phone: '(216) 555-1234',
    appointment_date: '2024-02-20',
    appointment_time: '14:00:00',
    edit_reason: 'Testing the edit system'
  })
})
.then(r => r.json())
.then(data => console.log(data))
```

**Expected Response:**
```json
{
  "message": "Appointment updated successfully",
  "appointment": { /* updated data */ }
}
```

**Verify in Database:**
```sql
-- Check edit was logged
SELECT 
  changes,
  edit_reason,
  edited_at
FROM appointment_edit_history
WHERE appointment_id = 'YOUR-APPOINTMENT-ID'
ORDER BY edited_at DESC
LIMIT 1;
```

### 5.3 Test Staff Notes Creation

**Using curl:**
```bash
curl -X POST "https://clevelandbody.com/api/appointments/notes" \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_id": "YOUR-APPOINTMENT-ID",
    "note_text": "Test note - customer will see this",
    "customer_visible": true,
    "created_by": "staff@example.com"
  }'
```

**Using browser DevTools:**
```javascript
fetch('/api/appointments/notes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    appointment_id: 'YOUR-APPOINTMENT-ID',
    note_text: 'Test note - customer will see this',
    customer_visible: true,
    created_by: 'staff@example.com'
  })
})
.then(r => r.json())
.then(data => console.log(data))
```

**Expected Response:**
```json
{
  "message": "Note created successfully",
  "note": {
    "id": "uuid...",
    "appointment_id": "YOUR-APPOINTMENT-ID",
    "note_text": "Test note - customer will see this",
    "customer_visible": true,
    "created_by": "staff@example.com",
    "created_at": "2024-01-15T14:45:00Z"
  }
}
```

**Verify Customer Can See It:**
```bash
curl -X GET "https://clevelandbody.com/api/appointments/customer/YOUR-APPOINTMENT-ID"
```

Should show the new note in `shared_notes` array.

### 5.4 Test Staff-Only Note Creation

**Create internal note (customer_visible = false):**
```javascript
fetch('/api/appointments/notes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    appointment_id: 'YOUR-APPOINTMENT-ID',
    note_text: 'Internal note - customer should NOT see this',
    customer_visible: false,  // Staff-only
    created_by: 'staff@example.com'
  })
})
.then(r => r.json())
.then(data => console.log(data))
```

**Verify Customer CANNOT See It:**
```bash
curl -X GET "https://clevelandbody.com/api/appointments/customer/YOUR-APPOINTMENT-ID"
```

The `shared_notes` array should NOT include the internal note.

---

## 📊 STEP 6: Validation Checklist

Use this checklist to confirm everything works:

### Database Structure
- [ ] `appointment_notes` table exists
- [ ] `appointment_edit_history` table exists
- [ ] `repair_order_notes` table exists
- [ ] New columns added to `appointments` table
- [ ] `customer_appointment_view` exists
- [ ] `staff_appointment_view` exists
- [ ] Trigger `trg_log_appointment_edit` exists

### Data Migration
- [ ] Existing customer notes migrated (customer_visible = TRUE)
- [ ] Existing staff notes migrated (customer_visible = FALSE)
- [ ] Note count matches expectations
- [ ] No data loss

### Edit History Tracking
- [ ] Manual update creates edit history record
- [ ] `changes` JSONB contains old/new values
- [ ] `edit_count` increments
- [ ] `last_edited_by` and `last_edited_at` update
- [ ] Trigger works automatically

### API Endpoints - Customer Safety
- [ ] GET /api/appointments/customer/[id] returns customer-safe data only
- [ ] Customer endpoint excludes staff_notes
- [ ] Customer endpoint excludes archived_by, archived_reason
- [ ] Customer endpoint includes shared_notes (customer_visible = TRUE)
- [ ] Customer endpoint excludes internal notes (customer_visible = FALSE)

### API Endpoints - Customer Edit
- [ ] PUT /api/appointments/customer/[id] successfully updates appointment
- [ ] Edit automatically logs to edit_history
- [ ] edit_reason is saved if provided
- [ ] Old/new values captured correctly

### API Endpoints - Staff Notes
- [ ] POST /api/appointments/notes creates notes
- [ ] customer_visible flag works correctly
- [ ] Shared notes (customer_visible = TRUE) appear in customer view
- [ ] Internal notes (customer_visible = FALSE) do NOT appear in customer view
- [ ] GET /api/appointments/notes returns all notes for staff

### Security (RLS)
- [ ] Customers can only see their own appointments
- [ ] Customers can only see customer_visible = TRUE notes
- [ ] Staff can see all data
- [ ] Edit history not accessible to customers

---

## 🐛 Common Issues & Solutions

### Issue 1: Migration fails with "relation already exists"
**Solution:** Tables already created. Safe to ignore or:
```sql
-- Drop tables and rerun (CAUTION: loses data in new tables)
DROP TABLE IF EXISTS appointment_edit_history CASCADE;
DROP TABLE IF EXISTS appointment_notes CASCADE;
DROP TABLE IF EXISTS repair_order_notes CASCADE;
-- Then rerun migration
```

### Issue 2: Trigger not working
**Check trigger exists:**
```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'trg_log_appointment_edit';
```

**Recreate trigger:**
```sql
DROP TRIGGER IF EXISTS trg_log_appointment_edit ON appointments;
-- Then rerun trigger creation part of migration
```

### Issue 3: API returns 404 or 500
**Check Vercel deployment:**
1. Go to https://vercel.com/andres-projects-1b1915bc/clevelandbody-site
2. Check deployment status
3. View logs for errors
4. Redeploy if needed

**Check environment variables:**
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

### Issue 4: RLS blocking access
**Temporarily disable RLS for testing:**
```sql
-- CAUTION: Use only for testing
ALTER TABLE appointment_notes DISABLE ROW LEVEL SECURITY;
-- Remember to re-enable after testing
ALTER TABLE appointment_notes ENABLE ROW LEVEL SECURITY;
```

---

## 📝 Testing Report Template

After completing all tests, fill out this report:

```
=== MIGRATION & TESTING REPORT ===

Date: _____________
Tester: _____________

✅ STEP 1: Migration Run
- Migration completed: [ ] YES [ ] NO
- Errors encountered: _____________
- Notes: _____________

✅ STEP 2: Verification Queries
- Tables created: [ ] YES [ ] NO
- Columns added: [ ] YES [ ] NO
- Views created: [ ] YES [ ] NO
- Trigger created: [ ] YES [ ] NO

✅ STEP 3: Data Migration
- Notes migrated: [ ] YES [ ] NO
- Count matches: [ ] YES [ ] NO
- Data loss: [ ] NONE [ ] SOME (describe: _________)

✅ STEP 4: Edit History Trigger
- Trigger fires on UPDATE: [ ] YES [ ] NO
- Changes captured correctly: [ ] YES [ ] NO
- JSONB format correct: [ ] YES [ ] NO

✅ STEP 5: API Endpoints
- Customer GET endpoint works: [ ] YES [ ] NO
- Customer PUT endpoint works: [ ] YES [ ] NO
- Staff notes POST endpoint works: [ ] YES [ ] NO
- Privacy protection confirmed: [ ] YES [ ] NO

✅ STEP 6: Validation
- Total checks passed: _____ / 25
- Critical issues: _____________
- Non-critical issues: _____________

OVERALL STATUS: [ ] PASS [ ] FAIL

READY FOR PHASE 2: [ ] YES [ ] NO

Additional Notes:
_____________________________________________
_____________________________________________
```

---

## ✅ Next Steps After Testing

### If All Tests Pass:
1. **Report success** - Share your testing report
2. **Proceed to Phase 2** - Staff UI integration
   - Add "Share with Customer" checkbox to forms
   - Add visual indicators for note types
   - Create edit history viewer
   - Integrate components into pages

### If Tests Fail:
1. **Document the issue** - Note exact error message
2. **Share testing report** - Include which step failed
3. **Provide details:**
   - Error message
   - Screenshot if applicable
   - SQL query that failed
   - API response received
4. **I will help troubleshoot** - We'll fix issues before Phase 2

---

## 📞 Support

If you encounter issues during testing:
- Review error messages carefully
- Check the Common Issues section
- Document exactly what happened
- Share your testing report with specific failures
- I'll help resolve any issues before we proceed

---

**Good luck with testing! 🚀**

Let me know how it goes, and we'll proceed to Phase 2 once everything is verified working correctly.
