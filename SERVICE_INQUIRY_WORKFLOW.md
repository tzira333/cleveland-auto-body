# Service Inquiry and Appointment Workflow - Implementation Guide

## 🎯 Overview

This redesign creates a clear distinction between **Service Inquiries** (initial customer requests) and **Confirmed Appointments** (staff-confirmed appointments with specific dates/times).

---

## 📊 Workflow

```
┌─────────────────────┐
│  Customer submits   │
│  Repair Request     │
│  (Public Form)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────┐
│  SERVICE INQUIRY CREATED        │
│  appointment_type = 'inquiry'   │
│  status = 'pending'             │
│  archived = false               │
└──────────┬──────────────────────┘
           │
           │  ┌─── Staff Reviews ────┐
           │  │                      │
           ▼  │                      ▼
  ┌────────────────┐     ┌───────────────────┐
  │ CONFIRM        │     │ ARCHIVE/CANCEL    │
  │ (Add Date/Time)│     │ (Not needed)      │
  └───────┬────────┘     └─────────┬─────────┘
          │                        │
          ▼                        ▼
┌─────────────────────────┐  ┌──────────────────┐
│ CONFIRMED APPOINTMENT   │  │ ARCHIVED         │
│ appointment_type =      │  │ archived = true  │
│   'confirmed'           │  │ archived_reason  │
│ status = 'confirmed'    │  └──────────────────┘
│ appointment_date set    │
│ appointment_time set    │
└─────────┬───────────────┘
          │
          │  ┌─── Customer Arrives ───┐
          │  │                        │
          ▼  │                        ▼
┌────────────────────┐    ┌────────────────────┐
│ CONVERT TO RO      │    │ NO SHOW/CANCEL     │
│ Create Repair Order│    │ Archive manually   │
└─────────┬──────────┘    └──────────┬─────────┘
          │                          │
          ▼                          ▼
┌─────────────────────────┐  ┌──────────────────┐
│ ARCHIVED AUTOMATICALLY  │  │ ARCHIVED         │
│ archived = true         │  │ archived = true  │
│ archived_reason =       │  │ archived_reason  │
│   'Converted to RO'     │  └──────────────────┘
└─────────────────────────┘
```

---

## 🗄️ Database Changes

### New Columns Added to `appointments` Table

| Column | Type | Description |
|--------|------|-------------|
| `appointment_type` | TEXT | `'inquiry'` or `'confirmed'` |
| `archived` | BOOLEAN | `true` when archived |
| `archived_at` | TIMESTAMPTZ | When archived |
| `archived_by` | TEXT | Staff member who archived |
| `archived_reason` | TEXT | Why archived (e.g., "Converted to RO") |

### Views Created

1. **`active_service_inquiries`** - All non-archived inquiries
2. **`confirmed_appointments`** - All non-archived confirmed appointments
3. **`archived_appointments`** - All archived appointments

---

## 📱 UI Changes

### StaffDashboard Tabs

**Before:**
- Active Appointments
- Archived Appointments

**After:**
- **Service Inquiries** (appointment_type='inquiry', archived=false)
- **Confirmed Appointments** (appointment_type='confirmed', archived=false)
- **Archived** (archived=true, all types)

### Stat Cards

**Service Inquiries Section:**
- Total Inquiries
- Pending Review
- Needs Response

**Confirmed Appointments Section:**
- Today's Appointments
- Upcoming (Next 7 days)
- Total Confirmed

---

## 🔧 API Endpoints

### New Endpoints

1. **POST /api/appointments/confirm**
   - Converts inquiry → confirmed appointment
   - Sets appointment_type='confirmed', status='confirmed'
   - Optionally updates date/time

2. **POST /api/appointments/archive**
   - Manually archives an appointment
   - Sets archived=true, archived_at, archived_by, archived_reason

3. **DELETE /api/appointments/archive**
   - Unarchives an appointment
   - Sets archived=false, clears archive fields

### Updated Endpoints

1. **POST /api/appointments**
   - Now sets appointment_type='inquiry' by default
   - Sets archived=false

2. **POST /api/crm/convert-appointment-to-ro**
   - Now automatically archives the appointment
   - Sets archived_reason='Converted to RO #XXXX'

---

## 🎨 UI Components

### Action Buttons

**Service Inquiries:**
- ✅ **Confirm Appointment** (blue) - Opens modal to set date/time
- 👁️ **View Details** (blue outline)
- 🗑️ **Archive** (red) - Cancel/reject inquiry

**Confirmed Appointments:**
- 🔄 **Convert to RO** (green) - Creates repair order, auto-archives
- 👁️ **View Details** (blue outline)
- 🗑️ **Archive** (red) - Cancel/no-show

**Archived:**
- 👁️ **View Details** (blue outline)
- ♻️ **Unarchive** (gray) - Restore if archived by mistake

---

## 📋 Migration Steps

### Step 1: Run Database Migration

```sql
-- See migrations/add_service_inquiry_workflow.sql
-- Run in Supabase SQL Editor
```

**What it does:**
- Adds appointment_type column
- Adds archive columns
- Updates existing appointments
- Creates views for filtering
- Adds indexes for performance

### Step 2: Deploy Code Changes

Files modified:
- `app/api/appointments/route.ts` - Set appointment_type='inquiry'
- `app/api/crm/convert-appointment-to-ro/route.ts` - Auto-archive on convert
- `app/admin/staff/StaffDashboard.tsx` - New UI with tabs
- Created: `app/api/appointments/confirm/route.ts` - Confirm inquiry API
- Created: `app/api/appointments/archive/route.ts` - Archive API

### Step 3: Test Workflow

1. **Submit inquiry** from public form → Verify appears in "Service Inquiries"
2. **Confirm appointment** → Verify moves to "Confirmed Appointments"
3. **Convert to RO** → Verify auto-archives and appears in "Archived"
4. **Archive inquiry** → Verify appears in "Archived" with reason

---

## 🧪 Testing Checklist

### Service Inquiry Flow
- [ ] Public form creates inquiry (appointment_type='inquiry')
- [ ] Inquiry appears in "Service Inquiries" tab
- [ ] Click "Confirm Appointment" opens modal
- [ ] Set date/time and confirm moves to "Confirmed Appointments"
- [ ] Archived inquiry shows in "Archived" tab

### Confirmed Appointment Flow
- [ ] Confirmed appointment shows in "Confirmed Appointments" tab
- [ ] "Convert to RO" button works
- [ ] After conversion, appointment auto-archives
- [ ] Archived appointment shows reason "Converted to RO #XXX"
- [ ] RO contains all appointment data

### Archive/Unarchive
- [ ] Manual archive sets archived=true
- [ ] Archived appointments show in "Archived" tab
- [ ] Unarchive button restores appointment
- [ ] Unarchived inquiry returns to "Service Inquiries"
- [ ] Unarchived confirmed returns to "Confirmed Appointments"

---

## 📊 Data Migration

### Existing Data Handling

**Current appointments with status='confirmed':**
- Automatically set to appointment_type='confirmed'
- Remain in "Confirmed Appointments" tab

**All other appointments:**
- Set to appointment_type='inquiry'
- Appear in "Service Inquiries" tab

### SQL to Review Data

```sql
-- Check appointment distribution
SELECT 
  appointment_type,
  archived,
  COUNT(*) as count
FROM appointments
GROUP BY appointment_type, archived;

-- View active inquiries
SELECT * FROM active_service_inquiries LIMIT 10;

-- View confirmed appointments
SELECT * FROM confirmed_appointments LIMIT 10;

-- View archived appointments
SELECT * FROM archived_appointments LIMIT 10;
```

---

## 🎯 Benefits

1. **Clear Workflow** - Staff know which require scheduling vs which are scheduled
2. **Better Organization** - Inquiries and appointments separated
3. **Auto-Archiving** - Converted appointments automatically archived
4. **Audit Trail** - Archive reason tracks why each was archived
5. **Data Integrity** - Appointments linked to ROs remain in database

---

## 📞 Support

**Files Reference:**
- Migration: `migrations/add_service_inquiry_workflow.sql`
- API Docs: This document
- UI Components: `app/admin/staff/StaffDashboard.tsx`

**Ready for Production** ✅
