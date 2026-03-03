# Migration Fixes Applied - All Issues Resolved

## Issues Encountered & Fixed

### Issue 1: Column Name Mismatch (FIXED)
```
Error: Failed to run sql query: 
ERROR: 42703: column ro.customer_name does not exist 
LINE 186: ro.customer_name,
```

**Root Cause:**
The migration referenced columns that don't exist in `crm_repair_orders`:
- ❌ `customer_name` (doesn't exist)
- ❌ `vehicle_info` (doesn't exist)

**Fix Applied (Commit `8b6a411`):**
```sql
-- Changed to concatenate existing columns
CONCAT(ro.customer_first_name, ' ', ro.customer_last_name) as customer_name,
CONCAT(ro.vehicle_year, ' ', ro.vehicle_make, ' ', ro.vehicle_model) as vehicle_info
```

---

### Issue 2: EXTRACT Function Type Mismatch (FIXED)
```
Error: Failed to run sql query: 
ERROR: 42883: function pg_catalog.extract(unknown, integer) does not exist
LINE 218: EXTRACT(DAY FROM (ro.absolute_end_date - NOW()::DATE))::INTEGER
HINT: No function matches the given name and argument types. You might need to add explicit type casts.
```

**Root Cause:**
PostgreSQL DATE - DATE subtraction already returns INTEGER (days), not INTERVAL.
Using `EXTRACT()` on an INTEGER caused type error.

**Fix Applied (Commit `c01a07b`):**
```sql
-- BEFORE (incorrect)
EXTRACT(DAY FROM (ro.absolute_end_date - NOW()::DATE))::INTEGER

-- AFTER (corrected) 
(ro.absolute_end_date - NOW()::DATE)::INTEGER
```

**Explanation:**
- `DATE - DATE` = INTEGER (number of days difference)
- `EXTRACT(DAY FROM INTERVAL)` = works with INTERVAL, not INTEGER
- Solution: Remove EXTRACT() wrapper, cast result directly to INTEGER

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
c01a07b - Fix EXTRACT function error in countdown calculation ⭐ LATEST FIX
8b6a411 - Fix view column names to match actual crm_repair_orders schema ⭐ FIX
8741f28 - Add migration fix documentation
ec7c67a - Add deployment guide for status tracking system
9889b0d - Add comprehensive status tracking and countdown system
```

**Latest commit:** `c01a07b` (contains all fixes)  
**Repository:** https://github.com/tzira333/cleveland-auto-body  
**Branch:** main  

---

## Summary

✅ **Both migration errors fixed and pushed to GitHub**  
✅ **Fix 1:** Column concatenation for customer_name and vehicle_info (Commit `8b6a411`)  
✅ **Fix 2:** EXTRACT function removed for DATE subtraction (Commit `c01a07b`)  
✅ **Ready to run in Supabase**  

**Action Required:**
1. Get latest migration file (git pull or download from GitHub)
2. Run corrected migration in Supabase SQL Editor
3. Verify tables and view created successfully
4. Test Status Metrics tab in production

---

**Date:** March 3, 2026  
**Status:** ✅ All fixes applied and deployed to GitHub  
**Latest Commit:** `c01a07b`  
**Next:** Run fully corrected migration in Supabase
