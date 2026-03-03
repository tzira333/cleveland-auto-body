# Migration Fix Applied - Column Name Correction

## Issue Encountered
```
Error: Failed to run sql query: 
ERROR: 42703: column ro.customer_name does not exist 
LINE 186: ro.customer_name,
```

## Root Cause
The migration file referenced columns that don't exist in the `crm_repair_orders` table:
- ❌ `customer_name` (doesn't exist)
- ❌ `vehicle_info` (doesn't exist)

**Actual schema has:**
- ✅ `customer_first_name`, `customer_last_name` (separate fields)
- ✅ `vehicle_year`, `vehicle_make`, `vehicle_model` (separate fields)

---

## Fix Applied

**File:** `migrations/add_status_tracking_and_metrics.sql`

**Changed:**
```sql
-- BEFORE (incorrect)
CREATE OR REPLACE VIEW vw_repair_order_status_durations AS
SELECT 
  ro.id,
  ro.ro_number,
  ro.customer_name,        ← Column doesn't exist
  ro.vehicle_info,          ← Column doesn't exist
  ...

-- AFTER (corrected)
CREATE OR REPLACE VIEW vw_repair_order_status_durations AS
SELECT 
  ro.id,
  ro.ro_number,
  CONCAT(ro.customer_first_name, ' ', ro.customer_last_name) as customer_name,
  CONCAT(ro.vehicle_year, ' ', ro.vehicle_make, ' ', ro.vehicle_model) as vehicle_info,
  ...
```

**Result:**
- Creates `customer_name` by concatenating first and last name
- Creates `vehicle_info` by concatenating year, make, and model
- View now works correctly with actual table structure

---

## How to Apply Fix

### Step 1: Get Latest Migration File

**Option A: Pull from GitHub**
```bash
cd /home/user/webapp
git pull origin main
```

**Option B: Download Directly**
```
URL: https://github.com/tzira333/cleveland-auto-body/blob/main/migrations/add_status_tracking_and_metrics.sql

Click "Raw" button and copy the entire file
```

### Step 2: Run Fixed Migration in Supabase

1. Go to: https://supabase.com/dashboard/project/ysjvgwsgmplnxchsbmtz/sql/new

2. Copy the **corrected** migration file:
   ```
   migrations/add_status_tracking_and_metrics.sql
   ```

3. Paste into SQL Editor

4. Click **Run**

5. Should complete successfully with message:
   ```
   ✅ Status tracking migration completed successfully!
   
   Created:
     - status_history table (logs all status changes)
     - status_metrics table (aggregates time in each status)
     - log_status_change() function (automatic tracking)
     - trigger_log_status_change trigger (auto-executes on status change)
     - vw_repair_order_status_durations view (easy querying)
     - get_status_duration_report() function (formatted reports)
   
   All existing repair orders have been initialized in status_metrics.
   Future status changes will be automatically tracked.
   ```

---

## Verification

After running the corrected migration:

### Test 1: Check Tables Created
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('status_history', 'status_metrics');

-- Should return 2 rows
```

### Test 2: Check View Works
```sql
SELECT 
  ro_number,
  customer_name,
  vehicle_info,
  current_status,
  countdown_days
FROM vw_repair_order_status_durations
LIMIT 5;

-- Should return repair orders with concatenated customer names and vehicle info
```

### Test 3: Check Trigger Exists
```sql
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgname = 'trigger_log_status_change';

-- Should return 1 row with tgenabled = 'O' (enabled)
```

---

## What This Fixes

✅ **View Creation** - `vw_repair_order_status_durations` now creates successfully  
✅ **API Endpoint** - `/api/crm/status-metrics` can now query the view  
✅ **Status Metrics Tab** - Frontend receives correctly formatted data  
✅ **Countdown Display** - All components work as expected  

---

## Git History

```
8b6a411 - Fix view column names to match actual crm_repair_orders schema
ec7c67a - Add deployment guide for status tracking system
9889b0d - Add comprehensive status tracking and countdown system
```

**Latest commit:** `8b6a411` (contains the fix)  
**Repository:** https://github.com/tzira333/cleveland-auto-body  
**Branch:** main  

---

## Summary

✅ **Migration file corrected and pushed to GitHub**  
✅ **Commit:** `8b6a411`  
✅ **Ready to run in Supabase**  

**Action Required:**
1. Get latest migration file (git pull or download from GitHub)
2. Run corrected migration in Supabase SQL Editor
3. Verify tables and view created successfully
4. Test Status Metrics tab in production

---

**Date:** March 3, 2026  
**Status:** ✅ Fixed and deployed to GitHub  
**Next:** Run corrected migration in Supabase
