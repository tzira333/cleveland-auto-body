# Admin Controls & Drag-and-Drop - Implementation Plan

## 📋 Status: Partial Implementation

This document outlines the admin controls and drag-and-drop dashboard feature. **Database migrations and core utilities are ready.** Frontend UI implementation is outlined below.

---

## ✅ Completed

### **1. Database Schema**
- ✅ Migration file created: `migrations/add_admin_role_and_dashboard_layout.sql`
- ✅ Added `role` column to `staff_users` table
- ✅ Created `dashboard_layout` table
- ✅ Added soft delete columns to `appointments` and `crm_repair_orders`
- ✅ Set domesticandforeignab@gmail.com as admin

### **2. Authentication Hook**
- ✅ Created `hooks/useAuth.ts`
- ✅ Returns user, isAdmin, isLoading
- ✅ Checks for admin role or specific email

### **3. Documentation**
- ✅ Complete implementation guide: `ADMIN_CONTROLS_GUIDE.md`
- ✅ Database setup instructions
- ✅ Testing procedures
- ✅ Security considerations

---

## 🔨 To Implement

### **1. Install Required Packages**

```bash
cd /home/user/webapp
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### **2. Create Drag-and-Drop Components**

**File**: `app/admin/staff/crm/DraggableDashboard.tsx`

Features needed:
- Wrap dashboard widgets in draggable containers
- Use `@dnd-kit/sortable` for reordering
- Save layout to `dashboard_layout` table
- Load saved layout on mount
- "Arrange Dashboard" toggle button (admin only)
- Visual drag handles

**File**: `app/admin/staff/crm/DraggableWidget.tsx`

Component for individual widgets:
- Drag handle icon (⋮⋮)
- Sortable item wrapper
- Active/dragging states

### **3. Update CRMDashboard.tsx**

Add admin controls:

```typescript
import { useAuth } from '@/hooks/useAuth'

// In component:
const { user, isAdmin } = useAuth()

// Add delete buttons (admin only):
{isAdmin && (
  <button 
    onClick={() => handleDeleteRO(ro.id)}
    className="text-red-600 hover:text-red-800"
    title="Delete (Admin Only)"
  >
    <svg>...</svg> {/* Trash icon */}
  </button>
)}

// Add arrange button:
{isAdmin && (
  <button onClick={() => setArrangeMode(!arrangeMode)}>
    {arrangeMode ? 'Save Layout' : 'Arrange Dashboard'}
  </button>
)}
```

### **4. Create Delete API Endpoints**

**File**: `app/api/appointments/[id]/route.ts`

```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verify admin role
  // Soft delete: update deleted_at and deleted_by
}
```

**File**: `app/api/crm/repair-orders/[id]/route.ts`

Add DELETE handler:
```typescript
export async function DELETE(...) {
  // Admin verification
  // Soft delete repair order
}
```

**File**: `app/api/dashboard/layout/route.ts`

```typescript
export async function POST(request: NextRequest) {
  // Save dashboard layout
}

export async function GET(request: NextRequest) {
  // Load dashboard layout for user
}
```

### **5. Update StaffDashboard.tsx**

Add delete functionality for appointments:

```typescript
const { isAdmin } = useAuth()

const deleteAppointment = async (id: string) => {
  if (!confirm('Delete this appointment? This action can be undone by an admin.')) return
  
  const response = await fetch(`/api/appointments/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deleted_by: user.email })
  })
  
  if (response.ok) {
    alert('Appointment deleted successfully')
    fetchAppointments()
  }
}

// In JSX:
{isAdmin && (
  <button onClick={() => deleteAppointment(appointment.id)}>
    Delete
  </button>
)}
```

### **6. Add Queries to Exclude Deleted Records**

Update all queries:

**Before:**
```typescript
.from('appointments')
.select('*')
```

**After:**
```typescript
.from('appointments')
.select('*')
.is('deleted_at', null) // Exclude soft-deleted
```

Apply to:
- `app/admin/staff/StaffDashboard.tsx`
- `app/admin/staff/crm/CRMDashboard.tsx`
- `app/api/appointments/route.ts`
- `app/api/crm/repair-orders/[id]/route.ts`

---

## 🎯 Implementation Steps

### **Step 1: Run Database Migration** ✅
```sql
-- Run migrations/add_admin_role_and_dashboard_layout.sql in Supabase
```

### **Step 2: Install Packages**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### **Step 3: Create API Endpoints**
- Delete appointment endpoint
- Delete RO endpoint
- Dashboard layout save/load

### **Step 4: Add Admin Controls to UI**
- Delete buttons (conditional on isAdmin)
- Arrange dashboard button
- Drag handles on widgets

### **Step 5: Implement Drag-and-Drop**
- Wrap dashboard in DndContext
- Make widgets sortable
- Save layout on drop

### **Step 6: Update Queries**
- Add `.is('deleted_at', null)` to all queries
- Exclude deleted records from views

### **Step 7: Test**
- Test as admin (see all controls)
- Test as staff (no admin controls)
- Test drag-and-drop
- Test soft delete
- Verify deleted records in database

---

## 📦 Required Dependencies

Add to `package.json`:
```json
{
  "dependencies": {
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.2"
  }
}
```

---

## 🔐 Security Checklist

- [ ] Admin role verified in database
- [ ] API endpoints check admin status
- [ ] Delete buttons only visible to admins
- [ ] Arrange button only visible to admins
- [ ] Soft delete preserves data
- [ ] deleted_by field tracks who deleted
- [ ] Regular staff cannot access admin functions

---

## 🧪 Testing Matrix

| Feature | Admin | Staff |
|---------|-------|-------|
| View Dashboard | ✅ | ✅ |
| View Appointments | ✅ | ✅ |
| View ROs | ✅ | ✅ |
| Edit ROs | ✅ | ✅ |
| **Delete Appointments** | ✅ | ❌ |
| **Delete ROs** | ✅ | ❌ |
| **Arrange Dashboard** | ✅ | ❌ |
| See Deleted Records | ✅ | ❌ |

---

## 📝 Implementation Priority

1. **High Priority** (Core functionality)
   - Run database migration
   - Add soft delete to queries (exclude deleted)
   - Admin role checking (useAuth hook)

2. **Medium Priority** (Admin controls)
   - Delete buttons for admins
   - Delete API endpoints
   - Confirmation dialogs

3. **Low Priority** (Nice to have)
   - Drag-and-drop dashboard
   - Save/load layout
   - Visual customization

---

## 💾 Quick Start (Minimum Implementation)

If you want just the admin delete functionality without drag-and-drop:

### **1. Run Migration**
```sql
-- Just add role and soft delete columns
ALTER TABLE staff_users ADD COLUMN role TEXT DEFAULT 'staff';
ALTER TABLE appointments ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE crm_repair_orders ADD COLUMN deleted_at TIMESTAMPTZ;
```

### **2. Use useAuth Hook**
```typescript
const { isAdmin } = useAuth()
```

### **3. Add Delete Button**
```tsx
{isAdmin && (
  <button onClick={handleDelete}>Delete</button>
)}
```

### **4. Update Queries**
```typescript
.is('deleted_at', null)
```

That's it! Drag-and-drop can be added later.

---

## 📚 Resources

- **@dnd-kit Documentation**: https://docs.dndkit.com/
- **Supabase RLS**: https://supabase.com/docs/guides/auth/row-level-security
- **React DnD Tutorial**: https://react-dnd.github.io/react-dnd/

---

## ✅ Summary

**What's Ready:**
- ✅ Database schema
- ✅ Migration file
- ✅ useAuth hook
- ✅ Complete documentation

**What Needs Implementation:**
- 🔨 Install @dnd-kit packages
- 🔨 Create draggable components
- 🔨 Add delete API endpoints
- 🔨 Add admin controls to UI
- 🔨 Update queries to exclude deleted
- 🔨 Test everything

**Estimated Time:**
- Core admin delete: 2-3 hours
- Drag-and-drop: 4-5 hours
- **Total**: 6-8 hours development + testing

---

**Next Action**: Run database migration and decide:
1. Implement just admin deletes (quick)
2. Implement full drag-and-drop (complete)

Both options are documented and ready to build.
