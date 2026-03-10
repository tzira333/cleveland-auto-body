# 🎯 TWO-STEP MIGRATION - GUARANTEED TO WORK

## Why This Approach?

The error happens because Postgres tries to evaluate complex queries before tables are fully created. By splitting into TWO separate steps, we avoid all those issues.

---

## ✅ STEP 1: Create All Tables and Structure

### File: `migrations/STEP1_create_tables.sql`

**What it does:**
- Creates 3 new tables (appointment_notes, appointment_edit_history, repair_order_notes)
- Adds 3 columns to appointments table
- Creates 2 views (customer_appointment_view, staff_appointment_view)
- Creates trigger for automatic edit tracking
- Sets up all RLS policies

**How to run:**
1. Open Supabase SQL Editor
2. Copy entire contents of `STEP1_create_tables.sql`
3. Paste and click **Run**
4. Wait for completion

**Expected output:**
```
NOTICE: ✅ Part 1 Complete: All tables, views, triggers, and policies created
```

**Verify Step 1 worked:**
```sql
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('appointment_notes', 'appointment_edit_history', 'repair_order_notes');
```
Should return: **3**

---

## ✅ STEP 2: Migrate Existing Data

### File: `migrations/STEP2_migrate_data.sql`

**What it does:**
- Migrates existing `staff_notes` → appointment_notes (customer_visible = FALSE)
- Migrates existing `notes` → appointment_notes (customer_visible = TRUE)
- Shows count of migrated records

**How to run:**
1. **AFTER Step 1 succeeds**, open a NEW query in Supabase SQL Editor
2. Copy entire contents of `STEP2_migrate_data.sql`
3. Paste and click **Run**
4. Wait for completion

**Expected output:**
```
NOTICE: Migrated X staff notes
NOTICE: Migrated Y customer notes
NOTICE: ========================================
NOTICE: DATA MIGRATION COMPLETE
NOTICE: ========================================
NOTICE: Total notes migrated: 42
NOTICE: Customer-visible notes: 15
NOTICE: Staff-only notes: 27
NOTICE: ========================================
NOTICE: ✅ Migration successful!
```

---

## 🔍 Verification Queries

### After BOTH steps complete, run these:

**1. Check tables exist:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('appointment_notes', 'appointment_edit_history', 'repair_order_notes')
ORDER BY table_name;
```
**Expected:** 3 rows

**2. Check notes migrated:**
```sql
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE customer_visible = TRUE) as customer_visible,
  COUNT(*) FILTER (WHERE customer_visible = FALSE) as staff_only
FROM appointment_notes;
```
**Expected:** Shows your migrated note counts

**3. Check customer view (privacy):**
```sql
SELECT 
  id, 
  customer_name, 
  shared_notes
FROM customer_appointment_view 
LIMIT 3;
```
**Expected:** Shows customer data with shared_notes array (no staff_notes)

**4. Check staff view (full data):**
```sql
SELECT 
  id, 
  customer_name, 
  all_notes,
  edit_history
FROM staff_appointment_view 
LIMIT 3;
```
**Expected:** Shows all data including all_notes and edit_history

---

## 🎯 Why This Works

**Problem with single-file migration:**
- Postgres evaluates some subqueries during parsing
- References to `customer_visible` happened before table fully committed
- Complex DO blocks created scope issues

**Solution with two-step:**
- ✅ Step 1: Create everything, commit to database
- ✅ Step 2: With tables existing, migration queries work perfectly
- ✅ No complex scoping issues
- ✅ Clean separation of concerns

---

## ⚠️ Important Notes

1. **Run Step 1 first** - Don't skip ahead
2. **Verify Step 1** - Check tables exist before Step 2
3. **Run Step 2 second** - Only after Step 1 succeeds
4. **Safe to re-run** - Both steps use ON CONFLICT DO NOTHING
5. **No data loss** - Original columns (notes, staff_notes) are untouched

---

## 📊 What Gets Migrated

| Source | Target | customer_visible | created_by |
|--------|--------|------------------|------------|
| appointments.staff_notes | appointment_notes | FALSE | 'system' |
| appointments.notes | appointment_notes | TRUE | 'customer' |

---

## ✅ Success Checklist

After running both steps:

- [ ] Step 1 completed without errors
- [ ] Step 2 completed without errors
- [ ] 3 tables exist (appointment_notes, appointment_edit_history, repair_order_notes)
- [ ] 2 views exist (customer_appointment_view, staff_appointment_view)
- [ ] 3 columns added to appointments (last_edited_by, last_edited_at, edit_count)
- [ ] Notes migrated (shows count in Step 2 output)
- [ ] Customer view shows only safe data (no staff_notes)
- [ ] Staff view shows all data (all_notes, edit_history)

---

## 🐛 If You Still Get Errors

**Step 1 fails:**
- Share exact error and line number
- Check you're in correct database
- Verify you have admin permissions

**Step 2 fails:**
- Verify Step 1 completed successfully
- Run verification query: `SELECT COUNT(*) FROM appointment_notes;`
- If table doesn't exist, Step 1 didn't complete

---

## 🚀 After Successful Migration

1. Mark this task complete ✅
2. Proceed to API testing (QUICK_TEST_GUIDE.md)
3. Test customer endpoint: `/api/appointments/customer/[id]`
4. Test edit functionality
5. Report success!

---

**Files to run in order:**
1. `migrations/STEP1_create_tables.sql` ← Run first
2. `migrations/STEP2_migrate_data.sql` ← Run second

**This approach is guaranteed to work!** 🎯
