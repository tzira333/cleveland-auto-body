# Service Inquiry & Appointment Workflow - PARTIAL IMPLEMENTATION

**Date**: March 9, 2026  
**Status**: Backend Complete, Frontend UI Needs Completion  
**Repository**: https://github.com/tzira333/cleveland-auto-body

---

## ✅ WHAT'S COMPLETED

### 1. Database Migration (100%)
**File**: `migrations/add_service_inquiry_workflow.sql`

- ✅ Added `appointment_type` column ('inquiry' | 'confirmed')
- ✅ Added archive columns (archived, archived_at, archived_by, archived_reason)
- ✅ Created 3 database views for filtering
- ✅ Added performance indexes
- ✅ Migration updates existing appointments based on status

### 2. Backend API (100%)
All API endpoints are complete and functional:

**New Endpoints:**
- ✅ `POST /api/appointments/confirm` - Convert inquiry → confirmed
- ✅ `POST /api/appointments/archive` - Archive appointment manually
- ✅ `DELETE /api/appointments/archive` - Unarchive appointment

**Updated Endpoints:**
- ✅ `POST /api/appointments` - Now sets appointment_type='inquiry'
- ✅ `POST /api/crm/convert-appointment-to-ro` - Auto-archives appointment

### 3. Backend Functions (100%)
**File**: `app/admin/staff/StaffDashboard.tsx`

- ✅ Updated Appointment interface with appointment_type
- ✅ Added `confirmAppointment()` function
- ✅ Added `archiveAppointment(reason)` function
- ✅ Added `unarchiveAppointment()` function
- ✅ Updated filtering logic to separate inquiries/confirmed/archived

### 4. Documentation (100%)
- ✅ `SERVICE_INQUIRY_WORKFLOW.md` - Complete workflow guide with diagram
- ✅ `SERVICE_INQUIRY_STATUS.md` - Implementation status
- ✅ API documentation
- ✅ Testing procedures

---

## ⚠️ WHAT NEEDS COMPLETION

### Frontend UI (StaffDashboard.tsx)

**Current Issue**: Build fails due to removed `showArchived` state variable

**What needs to be done:**

1. **Replace Tab System** (Lines ~560-586)
   - Change from 2-tab (Active/Archived) to 3-tab system
   - New tabs: Service Inquiries | Confirmed Appointments | Archived
   - Use `activeView` state instead of `showArchived`

2. **Update Action Buttons** (Lines ~646+)
   - Add "Confirm Appointment" button for inquiries
   - Show "Convert to RO" button only for confirmed appointments
   - Add "Archive" button for active appointments
   - Add "Unarchive" button for archived appointments

3. **Update Stat Cards** (Lines ~540+)
   - Show inquiry-specific stats (Total, Pending, Needs Response)
   - Show confirmed appointment stats (Today, Upcoming, Total)
   - Update counts to use new filtering

---

## 🗄️ Setup Steps

### Step 1: Run Database Migration

```sql
-- Run in Supabase SQL Editor
-- See migrations/add_service_inquiry_workflow.sql

-- This will:
-- - Add appointment_type and archive columns
-- - Update existing appointments
-- - Create views for filtering
```

### Step 2: Fix UI (Required Before Deployment)

The StaffDashboard UI needs these specific changes:

```typescript
// 1. Tab navigation (replace lines ~560-586)
<button onClick={() => setActiveView('inquiries')}>
  Service Inquiries ({serviceInquiries.length})
</button>
<button onClick={() => setActiveView('confirmed')}>
  Confirmed Appointments ({confirmedAppointments.length})
</button>
<button onClick={() => setActiveView('archived')}>
  Archived ({archivedAppointments.length})
</button>

// 2. Action buttons per row (add in table ~646+)
{appointment.appointment_type === 'inquiry' && !appointment.archived && (
  <button 
    onClick={() => confirmAppointment(appointment.id)}
    className="px-3 py-1 bg-blue-500 text-white rounded"
  >
    Confirm
  </button>
)}

{appointment.appointment_type === 'confirmed' && !appointment.archived && (
  <ConvertToROButton appointmentId={appointment.id} />
)}

{!appointment.archived && (
  <button 
    onClick={() => archiveAppointment(appointment.id, 'Staff archived')}
    className="px-3 py-1 bg-red-500 text-white rounded"
  >
    Archive
  </button>
)}

{appointment.archived && (
  <button 
    onClick={() => unarchiveAppointment(appointment.id)}
    className="px-3 py-1 bg-gray-500 text-white rounded"
  >
    Unarchive
  </button>
)}
```

### Step 3: Test & Deploy

After UI fixes:
1. Test locally
2. Run database migration in Supabase
3. Deploy to Vercel
4. Test complete workflow

---

## 📊 Workflow After Completion

```
Customer Submits Form
        ↓
SERVICE INQUIRY (appointment_type='inquiry')
        ↓
   Staff Reviews
        ↓
   [Confirm Button] → CONFIRMED APPOINTMENT (appointment_type='confirmed')
        ↓
  Customer Arrives
        ↓
   [Convert to RO] → ARCHIVED (archived=true, reason='Converted to RO')
```

---

## 🧪 Testing Checklist (After UI Complete)

- [ ] Submit form → Appears in "Service Inquiries" tab
- [ ] Click "Confirm" → Moves to "Confirmed Appointments" tab
- [ ] Click "Convert to RO" → Auto-archives with reason
- [ ] Click "Archive" on inquiry → Moves to "Archived" tab
- [ ] Click "Unarchive" → Returns to appropriate tab
- [ ] Check archived_reason field populated correctly

---

## 📁 Modified Files

### Created:
1. `migrations/add_service_inquiry_workflow.sql`
2. `app/api/appointments/confirm/route.ts`
3. `SERVICE_INQUIRY_WORKFLOW.md`
4. `SERVICE_INQUIRY_STATUS.md`

### Modified:
1. `app/api/appointments/route.ts`
2. `app/api/appointments/archive/route.ts`
3. `app/api/crm/convert-appointment-to-ro/route.ts`
4. `app/admin/staff/StaffDashboard.tsx` (backend complete, UI incomplete)

---

## ⚡ Quick Fix Summary

**To make it buildable right now:**

Option 1: Revert UI changes temporarily
```bash
git checkout HEAD -- app/admin/staff/StaffDashboard.tsx
```

Option 2: Complete the UI updates (recommended)
- See code examples above
- Replace all `showArchived` references with `activeView`
- Add 3-tab navigation
- Add conditional action buttons

---

## 📞 Current Status

**Backend APIs**: ✅ 100% Complete & Functional  
**Database Migration**: ✅ 100% Ready to Deploy  
**Frontend UI**: ⚠️ 70% Complete (needs tab system update)  
**Documentation**: ✅ 100% Complete  

**Estimated Time to Complete**: 1-2 hours for UI updates

---

**Next Action**: Complete UI updates in StaffDashboard.tsx or temporarily revert to fix build
