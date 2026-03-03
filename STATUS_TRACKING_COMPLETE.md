# Status Tracking & Countdown System - Complete Implementation

## Overview
Comprehensive system to track how long repair orders stay in each status and display countdown timers to the absolute end date.

---

## Features Implemented

### 1. Database Schema (Status Tracking)

**Tables Created:**
- `status_history` - Logs every status change with timestamps
- `status_metrics` - Aggregates time spent in each status
- `vw_repair_order_status_durations` - Convenient view for querying

**Automatic Tracking:**
- Trigger `trigger_log_status_change` automatically logs status changes
- Function `log_status_change()` calculates duration in each status
- Function `get_status_duration_report()` provides formatted reports

**Tracked Statuses:**
- Pending
- Parts Ordered
- Waiting for Parts
- In Progress
- Waiting for Customer
- Waiting for Insurance
- Quality Check
- Completed
- Ready for Pickup
- Delivered
- Cancelled

---

### 2. API Endpoint

**Route:** `/api/crm/status-metrics`

**GET Requests:**
```typescript
// Get all repair orders with status metrics
GET /api/crm/status-metrics

// Get specific repair order metrics
GET /api/crm/status-metrics?ro_id=<uuid>

Response:
{
  metrics: { /* aggregated time in each status */ },
  history: [ /* array of status changes */ ],
  durationReport: [ /* formatted duration breakdown */ ]
}
```

**POST Requests:**
```typescript
// Update repair order status (automatically tracked)
POST /api/crm/status-metrics
{
  repair_order_id: "uuid",
  new_status: "In Progress",
  changed_by: "user@example.com",
  notes: "Optional notes"
}
```

---

### 3. Countdown Column Component

**Component:** `CountdownColumn.tsx`

**Features:**
- Calculates days remaining until `absolute_end_date`
- Color-coded urgency indicators:
  - 🔴 **Red**: Overdue or due today (animated pulse)
  - 🟠 **Orange**: 1-3 days remaining (animated pulse)
  - 🟡 **Yellow**: 4-7 days remaining
  - 🟢 **Green**: 8-14 days remaining
  - 🟢 **Light Green**: 15+ days remaining

**Display:**
- Icon + countdown text + actual date
- Tooltip shows full absolute end date
- Pulsing animation for urgent items (≤3 days)

**Example Output:**
```
🔴 2 days OVERDUE | Feb 28, 2026
⚠️  1 day left     | Mar 4, 2026
🟢 15 days left    | Mar 18, 2026
```

---

### 4. Status Metrics Tab

**Component:** `StatusMetricsTab.tsx`

**Features:**

#### Left Panel - RO List
- Shows all repair orders with status metrics
- Columns:
  - RO# (number)
  - Customer name
  - Current status (badge)
  - Time in current status
  - Total active time
- Search and filter by status
- Click any row to view detailed metrics

#### Right Panel - Detailed Metrics
- **Current Status Card:**
  - Current status badge
  - Duration in current status
  - Timestamp when entered status

- **Status Duration Breakdown:**
  - Bar chart showing % of time in each status
  - Duration formatted (e.g., "2d 5h", "3h 20m", "45m")
  - Percentage of total time

- **Total Time Active:**
  - Sum of all time in all statuses

- **Countdown to Deadline:**
  - Days until absolute end date
  - Color-coded (red=overdue, green=on track)
  - Shows actual due date

**Visual Example:**
```
┌─────────────────────────────────────────────────────┐
│ RO-2024-001 - John Smith                          │
│ 2019 Honda Civic                                   │
├─────────────────────────────────────────────────────┤
│ Current Status: In Progress                         │
│ Duration: 2d 5h                                     │
│ Since: Mar 1, 2026 10:30 AM                        │
├─────────────────────────────────────────────────────┤
│ Time in Each Status:                                │
│ Pending          ████░░░░░░  1d 2h   (20%)         │
│ Waiting Parts    ██████░░░░  2d 1h   (30%)         │
│ In Progress      ████░░░░░░  2d 5h   (35%)         │
│ Quality Check    ██░░░░░░░░  1d 0h   (15%)         │
├─────────────────────────────────────────────────────┤
│ Total Time Active: 6d 8h                           │
│ Days Until Deadline: 8 days (Mar 11, 2026)         │
└─────────────────────────────────────────────────────┘
```

---

### 5. CRM Dashboard Integration

**New Tab Added:**
- 📈 **Status Metrics** tab in navigation
- Located between "Archived ROs" and "Customers"

**Countdown Column Added:**
- Added to both:
  1. Dashboard view (Recent Repairs table)
  2. Full Repair Orders view (sortable table)
- Replaces plain date display with visual countdown
- Automatically updates calculations

**Table Structure:**
```
RO# | Customer | Vehicle | Status | Priority | Date | End Date | Countdown | Actions
----|----------|---------|--------|----------|------|----------|-----------|--------
001 | John S.  | Honda   | Active | High     | 3/1  | 3/15     | 🟢 14 days | [Edit]
002 | Jane D.  | Ford    | Parts  | Medium   | 2/28 | 3/3      | 🔴 OVERDUE | [Edit]
```

---

## Database Migration

**File:** `migrations/add_status_tracking_and_metrics.sql`

**Run in Supabase:**
1. Open Supabase SQL Editor
2. Copy the entire migration file
3. Run the SQL
4. Verify success message

**What It Does:**
- Creates `status_history` table
- Creates `status_metrics` table
- Creates automatic trigger for status tracking
- Creates helper view and function
- Initializes existing repair orders

**Verification Query:**
```sql
-- Check if tables exist
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('status_history', 'status_metrics');

-- Check if trigger exists
SELECT tgname FROM pg_trigger 
WHERE tgname = 'trigger_log_status_change';
```

---

## How It Works

### Automatic Status Tracking

1. **User changes status** (e.g., "Pending" → "In Progress")
2. **Trigger fires** automatically (`trigger_log_status_change`)
3. **Function calculates** duration in previous status
4. **Updates `status_metrics`** table:
   - Adds duration to appropriate status column (e.g., `time_in_pending`)
   - Updates `current_status` and `current_status_started_at`
   - Increments `total_time_seconds`
5. **Logs to `status_history`**:
   - Records old status, new status, timestamp
   - Stores duration in previous status
   - Captures who made the change

### Example Timeline

```
Timeline for RO-2024-001:

Mar 1, 10:00 AM → Created with status "Pending"
├─ status_metrics: current_status = "Pending", started_at = Mar 1 10:00

Mar 2, 2:00 PM → Status changed to "Parts Ordered" (28 hours later)
├─ status_history: "Pending" → "Parts Ordered", duration = 28 hours
├─ status_metrics: time_in_pending = 28 hours (100,800 seconds)
└─ status_metrics: current_status = "Parts Ordered", started_at = Mar 2 14:00

Mar 4, 9:00 AM → Status changed to "In Progress" (43 hours later)
├─ status_history: "Parts Ordered" → "In Progress", duration = 43 hours
├─ status_metrics: time_in_parts_ordered = 43 hours (154,800 seconds)
├─ status_metrics: total_time_seconds = 255,600 (71 hours total)
└─ status_metrics: current_status = "In Progress", started_at = Mar 4 09:00
```

---

## Usage Examples

### For Staff Users

**View Status Metrics:**
1. Go to CRM Dashboard
2. Click "Status Metrics" tab
3. Browse list of repair orders
4. Click any RO to see detailed breakdown

**Monitor Countdown:**
- Countdown column automatically appears in all RO tables
- Color changes as deadline approaches
- Red and pulsing = urgent action needed

**Understanding Colors:**
- 🟢 Green (15+ days): On track, no concerns
- 🟡 Yellow (8-14 days): Monitor progress
- 🟠 Orange (4-7 days): Prioritize completion
- 🔴 Red (1-3 days): **URGENT** - deadline soon
- 🔴 Red OVERDUE: **CRITICAL** - missed deadline

### For Admins

**Analyze Bottlenecks:**
1. Open Status Metrics tab
2. Look for ROs with high time in specific statuses
3. Example: If many ROs spend 5+ days in "Waiting for Parts"
   - Consider improving parts ordering process
   - Review parts supplier relationships
   - Stock common parts

**Track Performance:**
- Compare total time across similar repairs
- Identify patterns in status durations
- Measure impact of process improvements

---

## API Usage Examples

### Get All Metrics
```javascript
const response = await fetch('/api/crm/status-metrics')
const { data } = await response.json()

// data is array of all ROs with metrics
data.forEach(ro => {
  console.log(`${ro.ro_number}: ${ro.total_seconds}s total time`)
  console.log(`Current: ${ro.current_status} for ${ro.current_status_duration_seconds}s`)
  console.log(`Countdown: ${ro.countdown_days} days`)
})
```

### Get Specific RO Metrics
```javascript
const roId = 'uuid-here'
const response = await fetch(`/api/crm/status-metrics?ro_id=${roId}`)
const { metrics, history, durationReport } = await response.json()

// metrics: aggregated time in each status
console.log('Time in pending:', metrics.time_in_pending, 'seconds')

// history: timeline of all status changes
history.forEach(change => {
  console.log(`${change.old_status} → ${change.new_status} at ${change.changed_at}`)
})

// durationReport: formatted breakdown with percentages
durationReport.forEach(status => {
  console.log(`${status.status_name}: ${status.duration_formatted} (${status.percentage}%)`)
})
```

### Update Status (Auto-tracked)
```javascript
// Simply update the repair order status - tracking is automatic
const response = await supabase
  .from('crm_repair_orders')
  .update({ status: 'In Progress' })
  .eq('id', roId)

// Behind the scenes:
// - Trigger calculates duration in previous status
// - Updates status_metrics table
// - Logs to status_history
```

---

## Performance Considerations

### Indexes Created
```sql
-- For fast lookups
CREATE INDEX idx_status_history_repair_order_id ON status_history(repair_order_id)
CREATE INDEX idx_status_history_changed_at ON status_history(changed_at DESC)
CREATE INDEX idx_status_metrics_repair_order_id ON status_metrics(repair_order_id)
CREATE INDEX idx_status_metrics_current_status ON status_metrics(current_status)
```

### Optimized Queries
- View `vw_repair_order_status_durations` pre-calculates countdowns
- API endpoint uses indexed queries
- Frontend only fetches needed data (pagination, filtering)

---

## Files Created/Modified

### New Files
```
app/api/crm/status-metrics/route.ts        - API endpoint for metrics
app/admin/staff/crm/StatusMetricsTab.tsx   - Status metrics dashboard tab
app/admin/staff/crm/CountdownColumn.tsx    - Countdown display component
migrations/add_status_tracking_and_metrics.sql - Database migration
```

### Modified Files
```
app/admin/staff/crm/CRMDashboard.tsx       - Added Status Metrics tab
                                            - Added Countdown column to tables
                                            - Updated ViewType to include 'status-metrics'
```

---

## Testing Checklist

### Database
- [ ] Run migration in Supabase SQL Editor
- [ ] Verify tables created: `status_history`, `status_metrics`
- [ ] Verify trigger exists: `trigger_log_status_change`
- [ ] Test status change triggers automatic logging

### Countdown Column
- [ ] Appears in Dashboard view
- [ ] Appears in Repair Orders view
- [ ] Shows correct colors based on days remaining
- [ ] Pulses when urgent (≤3 days)
- [ ] Shows "No deadline set" when null

### Status Metrics Tab
- [ ] Tab appears in navigation
- [ ] Lists all repair orders
- [ ] Search functionality works
- [ ] Filter by status works
- [ ] Clicking RO shows detailed metrics
- [ ] Bar charts display correctly
- [ ] Percentages add up to 100%

### API
- [ ] GET `/api/crm/status-metrics` returns all ROs
- [ ] GET `/api/crm/status-metrics?ro_id=xxx` returns specific RO
- [ ] Status changes are automatically tracked
- [ ] History logs all changes

---

## Deployment Steps

1. **Run Database Migration:**
   ```sql
   -- In Supabase SQL Editor
   -- Copy and run: migrations/add_status_tracking_and_metrics.sql
   ```

2. **Verify Migration:**
   ```sql
   SELECT * FROM status_metrics LIMIT 5;
   SELECT * FROM status_history LIMIT 5;
   ```

3. **Build and Deploy:**
   ```bash
   npm run build
   git add .
   git commit -m "Add status tracking and countdown system"
   git push origin main
   ```

4. **Verify in Production:**
   - Open CRM Dashboard
   - Check Status Metrics tab loads
   - Verify Countdown column appears
   - Test changing a status
   - Check metrics update

---

## Future Enhancements

### Potential Additions
1. **Email Alerts:**
   - Notify when countdown reaches 3 days
   - Alert when deadline is missed

2. **Performance Reports:**
   - Average time per status across all ROs
   - Identify slowest statuses
   - Compare by priority level

3. **Predictive Analytics:**
   - Estimate completion based on historical data
   - Suggest optimal absolute_end_date

4. **Export Reports:**
   - Download status metrics as CSV
   - Generate PDF summaries

5. **Real-time Dashboard:**
   - Live updates using Supabase subscriptions
   - Show active status changes

---

## Troubleshooting

### Countdown Not Showing
- Check if `absolute_end_date` is set on the repair order
- Verify `CountdownColumn` component is imported
- Check browser console for errors

### Status Metrics Empty
- Ensure migration ran successfully
- Check if trigger is active: `SELECT * FROM pg_trigger WHERE tgname = 'trigger_log_status_change'`
- Try changing a status manually to trigger logging

### Time Not Tracking
- Verify `status_metrics` table has data
- Check trigger is firing: `SELECT * FROM status_history ORDER BY changed_at DESC LIMIT 10`
- Look for errors in Supabase logs

### API Errors
- Verify Supabase environment variables set
- Check service role key has proper permissions
- Review Supabase logs for query errors

---

## Summary

✅ **Complete status tracking system implemented**
- Automatic logging of all status changes
- Real-time duration calculations
- Comprehensive metrics dashboard

✅ **Countdown system with visual indicators**
- Color-coded urgency levels
- Animated alerts for urgent items
- Integrated into all RO tables

✅ **Dedicated Status Metrics tab**
- View time in each status
- Percentage breakdowns
- Current status tracking

✅ **Production-ready**
- Optimized database queries
- Indexed for performance
- Documented and testable

---

**Created:** March 3, 2026  
**Status:** ✅ Complete and ready for deployment  
**Next Steps:** Run database migration, build, deploy, test
