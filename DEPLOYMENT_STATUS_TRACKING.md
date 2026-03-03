# Status Tracking System - Deployment Guide

## Quick Start Deployment

### Step 1: Run Database Migration (REQUIRED)

**Location:** Supabase Dashboard → SQL Editor

1. Go to: https://supabase.com/dashboard/project/ysjvgwsgmplnxchsbmtz/sql/new

2. Copy the entire contents of:
   ```
   migrations/add_status_tracking_and_metrics.sql
   ```

3. Paste into SQL Editor and click **Run**

4. Wait for success message:
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

5. Verify tables exist:
   ```sql
   SELECT tablename FROM pg_tables 
   WHERE schemaname = 'public' 
   AND tablename IN ('status_history', 'status_metrics');
   
   -- Should return 2 rows
   ```

---

### Step 2: Verify Vercel Auto-Deploy

1. Check deployment status:
   - Go to: https://vercel.com/andres-projects-1b1915bc/clevelandbody-site/deployments

2. Latest commit should be:
   - `9889b0d` - "Add comprehensive status tracking and countdown system"

3. Wait for deployment to complete (~5-10 minutes)

4. Status should show: ✅ **Ready**

---

### Step 3: Test in Production

1. **Open CRM Dashboard:**
   ```
   https://clevelandbody.com/admin/staff/crm
   ```

2. **Verify Countdown Column:**
   - Go to "Repair Orders" tab
   - Check that "Countdown" column appears
   - Should show color-coded badges:
     - 🟢 Green = 15+ days
     - 🟡 Yellow = 8-14 days
     - 🟠 Orange = 4-7 days
     - 🔴 Red = 1-3 days or overdue

3. **Verify Status Metrics Tab:**
   - Click "📈 Status Metrics" tab in navigation
   - Should see list of all repair orders
   - Click any repair order
   - Right panel should show:
     - Current status and duration
     - Bar chart breakdown by status
     - Total time active
     - Countdown to deadline

4. **Test Status Change Tracking:**
   - Open any repair order (View/Edit button)
   - Change the status (e.g., "Pending" → "In Progress")
   - Save the changes
   - Go to Status Metrics tab
   - Click that repair order
   - Should see time accumulated in previous status

---

## What Each Component Does

### 1. Database Migration (`migrations/add_status_tracking_and_metrics.sql`)

**Creates:**
- `status_history` table - Records every status change
- `status_metrics` table - Stores cumulative time in each status
- `trigger_log_status_change` - Automatically fires on status updates
- `log_status_change()` function - Calculates durations
- `vw_repair_order_status_durations` view - Pre-calculated countdowns
- `get_status_duration_report()` function - Formatted reports

**How It Works:**
```
User changes status → Trigger fires → Function calculates duration → 
Updates status_metrics → Logs to status_history
```

---

### 2. API Endpoint (`/api/crm/status-metrics`)

**GET All Metrics:**
```
URL: /api/crm/status-metrics
Returns: Array of all ROs with metrics
```

**GET Specific RO:**
```
URL: /api/crm/status-metrics?ro_id=<uuid>
Returns: {
  metrics: { time_in_each_status },
  history: [ all_status_changes ],
  durationReport: [ formatted_breakdown ]
}
```

---

### 3. Countdown Column (`CountdownColumn.tsx`)

**Features:**
- Calculates days until `absolute_end_date`
- Color-coded by urgency
- Animated pulse for urgent items (≤3 days)
- Shows icon + text + date

**Color Logic:**
```javascript
< 0 days:     🔴 Red + Pulse   "2 days OVERDUE"
0 days:       🔴 Red + Pulse   "DUE TODAY"
1-3 days:     🔴 Red + Pulse   "2 days left"
4-7 days:     🟠 Orange        "5 days left"
8-14 days:    🟡 Yellow        "10 days left"
15+ days:     🟢 Green         "20 days left"
No date set:  ⚪ Gray          "No deadline set"
```

---

### 4. Status Metrics Tab (`StatusMetricsTab.tsx`)

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ 📈 Status Metrics & Analytics                          │
├─────────────────────────────────────────────────────────┤
│ [Search] [Filter by Status]                            │
├───────────────────────┬─────────────────────────────────┤
│ RO List               │ Detailed Metrics               │
│                       │                                │
│ ☑ RO-2024-001        │ Current Status: In Progress    │
│   John Smith          │ Duration: 2d 5h                │
│   Status: Active      │                                │
│   Time: 2d 5h         │ Time in Each Status:           │
│                       │ Pending     ████░ 1d 2h (20%) │
│ □ RO-2024-002        │ Parts       ██████ 2d 1h (30%)│
│   Jane Doe            │ In Progress ████░ 2d 5h (35%) │
│   Status: Parts       │ Quality     ██░░░ 1d 0h (15%) │
│   Time: 1d 3h         │                                │
│                       │ Total: 6d 8h                   │
│                       │ Countdown: 8 days              │
└───────────────────────┴─────────────────────────────────┘
```

**Features:**
- Real-time search
- Filter by status
- Click RO to see details
- Bar chart visualizations
- Formatted durations (2d 5h, 3h 20m, etc.)
- Percentage breakdowns

---

## Testing Checklist

### ✅ Database
- [ ] Run migration successfully
- [ ] Tables created: `status_history`, `status_metrics`
- [ ] Trigger exists: `trigger_log_status_change`
- [ ] View exists: `vw_repair_order_status_durations`

### ✅ Frontend
- [ ] Countdown column appears in Dashboard
- [ ] Countdown column appears in Repair Orders
- [ ] Status Metrics tab in navigation
- [ ] Status Metrics tab loads without errors
- [ ] Search and filter work

### ✅ Functionality
- [ ] Changing status logs to `status_history`
- [ ] Time accumulates in `status_metrics`
- [ ] Countdown colors change based on days
- [ ] Urgent items pulse (≤3 days)
- [ ] Clicking RO shows detailed metrics
- [ ] Bar charts display correctly

### ✅ Integration
- [ ] No console errors
- [ ] Data loads from Supabase
- [ ] API endpoint responds
- [ ] Metrics update in real-time

---

## Verification Queries

### Check Status History
```sql
-- See recent status changes
SELECT 
  ro.ro_number,
  sh.old_status,
  sh.new_status,
  sh.changed_at,
  sh.duration_in_previous_status
FROM status_history sh
JOIN crm_repair_orders ro ON ro.id = sh.repair_order_id
ORDER BY sh.changed_at DESC
LIMIT 10;
```

### Check Status Metrics
```sql
-- See time accumulated per status
SELECT 
  ro.ro_number,
  ro.status as current_status,
  sm.time_in_pending / 3600 as hours_in_pending,
  sm.time_in_in_progress / 3600 as hours_in_progress,
  sm.total_time_seconds / 3600 as total_hours
FROM status_metrics sm
JOIN crm_repair_orders ro ON ro.id = sm.repair_order_id
ORDER BY sm.total_time_seconds DESC
LIMIT 10;
```

### Check Countdown View
```sql
-- See all ROs with countdowns
SELECT 
  ro_number,
  customer_name,
  current_status,
  countdown_days,
  absolute_end_date
FROM vw_repair_order_status_durations
WHERE absolute_end_date IS NOT NULL
ORDER BY countdown_days ASC
LIMIT 10;
```

---

## Troubleshooting

### Issue: Countdown not showing
**Solution:**
1. Check if `absolute_end_date` is set on the repair order
2. Edit the RO and set the "Absolute End Date" field
3. Refresh the page

### Issue: Status Metrics tab empty
**Solution:**
1. Verify migration ran: `SELECT * FROM status_metrics LIMIT 1;`
2. If empty, try changing a status manually
3. Check browser console for API errors

### Issue: Time not tracking
**Solution:**
1. Check trigger is active:
   ```sql
   SELECT tgname, tgenabled 
   FROM pg_trigger 
   WHERE tgname = 'trigger_log_status_change';
   ```
2. If disabled, re-run migration
3. Test by changing a status

### Issue: API errors
**Solution:**
1. Check Vercel environment variables are set
2. Verify Supabase service role key
3. Check Vercel deployment logs
4. Verify API route exists: `/api/crm/status-metrics/route.ts`

---

## Production URLs

**Website:** https://clevelandbody.com  
**CRM Dashboard:** https://clevelandbody.com/admin/staff/crm  
**Status Metrics Tab:** https://clevelandbody.com/admin/staff/crm (Click "Status Metrics")  

**Admin Access:**
- Username: domesticandforeignab@gmail.com
- Password: (your staff password)

**GitHub Repository:** https://github.com/tzira333/cleveland-auto-body  
**Latest Commit:** `9889b0d` - Status tracking system  

**Vercel Dashboard:** https://vercel.com/andres-projects-1b1915bc/clevelandbody-site  
**Supabase Dashboard:** https://supabase.com/dashboard/project/ysjvgwsgmplnxchsbmtz  

---

## Summary

✅ **All code pushed to GitHub** (commit `9889b0d`)  
✅ **Vercel will auto-deploy** (5-10 minutes)  
⚠️ **Database migration required** (run in Supabase SQL Editor)  
✅ **Documentation complete** (STATUS_TRACKING_COMPLETE.md)  

**Next Steps:**
1. Run database migration in Supabase
2. Wait for Vercel deployment
3. Test in production
4. Verify countdown column appears
5. Verify Status Metrics tab works

**Features Delivered:**
- ⏱️ Automatic time tracking in each status
- 📊 Status Metrics dashboard tab
- ⏰ Countdown column with color-coded urgency
- 📈 Bar chart visualizations
- 🔍 Search and filter capabilities
- 📝 Complete status change history

---

**Created:** March 3, 2026  
**Status:** ✅ Ready for deployment  
**Estimated Deploy Time:** 15-20 minutes (including migration)
