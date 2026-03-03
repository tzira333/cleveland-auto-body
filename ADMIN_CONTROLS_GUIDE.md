# Admin Controls & Drag-and-Drop Dashboard

## 🎯 Overview

This implementation adds admin-only controls and drag-and-drop dashboard customization.

---

## ✅ Features Added

### 1. **Admin Role System**
- Role-based access control (RBAC)
- Two roles: `admin` and `staff`
- Admin user: `domesticandforeignab@gmail.com`
- Admins can designate other admins

### 2. **Admin-Only Controls**
- ✅ Delete appointments (soft delete)
- ✅ Delete repair orders (soft delete)
- ✅ Rearrange dashboard widgets (drag-and-drop)
- ✅ Visible only to admin users

### 3. **Drag-and-Drop Dashboard**
- Customize dashboard layout
- Reorder stat cards and widgets
- Save layout per user
- Persist across sessions
- Admin-only feature

### 4. **Soft Delete System**
- Records not permanently deleted
- Marked with `deleted_at` timestamp
- Track who deleted (`deleted_by`)
- Can be restored if needed
- Hidden from normal views

---

## 🗄️ Database Changes

### Run This SQL in Supabase

```sql
-- Add role to staff_users
ALTER TABLE staff_users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'staff';

UPDATE staff_users 
SET role = 'admin' 
WHERE email = 'domesticandforeignab@gmail.com';

-- Dashboard layout table
CREATE TABLE dashboard_layout (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  widget_id TEXT NOT NULL,
  widget_type TEXT NOT NULL,
  position INTEGER NOT NULL,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_email, widget_id)
);

-- Soft delete columns
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by TEXT;

ALTER TABLE crm_repair_orders 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by TEXT;
```

---

## 🔐 Admin Access

### **Who is an Admin?**
- User: `domesticandforeignab@gmail.com` (always admin)
- Any user with `role = 'admin'` in `staff_users` table

### **Make Someone Admin**
```sql
UPDATE staff_users 
SET role = 'admin' 
WHERE email = 'newadmin@clevelandbody.com';
```

### **Check Admin Users**
```sql
SELECT email, role FROM staff_users WHERE role = 'admin';
```

---

## 🎨 UI Changes

### **Admin-Only Buttons**

**Appointments:**
- 🗑️ Red "Delete" button (appears only for admins)
- Confirmation dialog before delete
- Soft delete (can be restored)

**Repair Orders:**
- 🗑️ Red "Delete" button in Actions column
- Admin-only visibility
- Confirmation required

**Dashboard:**
- 📐 "Arrange Dashboard" button (top right, admin only)
- Drag handles on widgets
- "Save Layout" button when arranging

---

## 🎯 How to Use

### **For Admins**

#### **Rearrange Dashboard**
```
1. Click "Arrange Dashboard" button (top right)
2. Drag widgets by their handles (⋮⋮)
3. Drop in new position
4. Click "Save Layout" when done
5. Layout persists across sessions
```

#### **Delete Appointment**
```
1. Open appointment details
2. Click red "Delete" button (admin only)
3. Confirm deletion
4. Appointment hidden from views
5. Record marked with deleted_at timestamp
```

#### **Delete Repair Order**
```
1. View repair order in table
2. Click red trash icon in Actions column
3. Confirm deletion
4. RO hidden from active views
5. Can be restored from database if needed
```

### **For Regular Staff**
- No delete buttons visible
- No "Arrange Dashboard" button
- Read-only access
- Can view, edit, but not delete

---

## 🔧 Technical Implementation

### **useAuth Hook**
```typescript
const { user, isAdmin, isLoading } = useAuth()

// Check if admin
if (isAdmin) {
  // Show admin controls
}
```

### **Conditional Rendering**
```tsx
{isAdmin && (
  <button onClick={handleDelete}>
    Delete
  </button>
)}
```

### **Soft Delete Function**
```typescript
const deleteAppointment = async (id: string) => {
  await supabase
    .from('appointments')
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: user.email
    })
    .eq('id', id)
}
```

### **Drag-and-Drop Library**
Using `@dnd-kit/core` and `@dnd-kit/sortable`:
```bash
npm install @dnd-kit/core @dnd-kit/sortable
```

---

## 📊 Dashboard Widgets

### **Default Layout**
1. Active Repairs (stat card)
2. Overdue (stat card)
3. Ready for Pickup (stat card)
4. Total Orders (stat card)
5. Recent Orders Table

### **Customizable Order**
Admins can rearrange any widget position

### **Saved Per User**
Each admin can have their own layout

---

## 🛡️ Security

### **Role Enforcement**
- Backend API checks role
- Frontend hides controls
- Database RLS (Row Level Security) recommended

### **Soft Delete Benefits**
- Audit trail maintained
- Can restore if needed
- Compliance with data retention
- No permanent data loss

### **Admin Actions Logged**
- `deleted_by` field tracks who deleted
- `deleted_at` tracks when
- Can generate audit reports

---

## 📝 API Endpoints

### **Delete Appointment** (Admin Only)
```typescript
DELETE /api/appointments/[id]
Body: { deleted_by: 'admin@email.com' }
```

### **Delete Repair Order** (Admin Only)
```typescript
DELETE /api/crm/repair-orders/[id]
Body: { deleted_by: 'admin@email.com' }
```

### **Save Dashboard Layout** (Admin Only)
```typescript
POST /api/dashboard/layout
Body: {
  user_email: 'admin@email.com',
  widgets: [
    { id: 'active_repairs', position: 1 },
    { id: 'overdue', position: 2 },
    ...
  ]
}
```

---

## 🧪 Testing

### **Test Admin Access**
```
1. Login as domesticandforeignab@gmail.com
2. Verify "Arrange Dashboard" button appears
3. Verify delete buttons appear on appointments
4. Verify delete buttons appear on ROs
```

### **Test Regular Staff**
```
1. Login as regular staff
2. Verify NO "Arrange Dashboard" button
3. Verify NO delete buttons on appointments
4. Verify NO delete buttons on ROs
```

### **Test Drag-and-Drop**
```
1. Login as admin
2. Click "Arrange Dashboard"
3. Drag a stat card to new position
4. Verify visual feedback during drag
5. Drop in new location
6. Click "Save Layout"
7. Refresh page
8. Verify layout persists
```

### **Test Soft Delete**
```
1. Delete an appointment as admin
2. Verify it disappears from list
3. Check database: deleted_at should be set
4. Verify deleted_by = admin email
5. Run query to see deleted records:
   SELECT * FROM appointments WHERE deleted_at IS NOT NULL
```

---

## 🔍 View Deleted Records

### **Appointments**
```sql
SELECT 
  id,
  customer_name,
  customer_phone,
  deleted_at,
  deleted_by
FROM appointments 
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC;
```

### **Repair Orders**
```sql
SELECT 
  ro_number,
  customer_first_name,
  customer_last_name,
  deleted_at,
  deleted_by
FROM crm_repair_orders 
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC;
```

---

## 🔄 Restore Deleted Records

### **Restore Appointment**
```sql
UPDATE appointments 
SET deleted_at = NULL, deleted_by = NULL
WHERE id = 'appointment-uuid';
```

### **Restore Repair Order**
```sql
UPDATE crm_repair_orders 
SET deleted_at = NULL, deleted_by = NULL
WHERE id = 'ro-uuid';
```

---

## 📋 Admin Checklist

- [ ] Run database migration
- [ ] Verify domesticandforeignab@gmail.com is admin
- [ ] Install drag-and-drop libraries
- [ ] Test admin login
- [ ] Test "Arrange Dashboard" button appears
- [ ] Test drag-and-drop functionality
- [ ] Test save layout
- [ ] Test delete appointment (admin)
- [ ] Test delete RO (admin)
- [ ] Test regular staff cannot see admin controls
- [ ] Verify soft deletes work
- [ ] Check deleted records in database
- [ ] Test layout persists after refresh

---

## 💡 Future Enhancements

### **Admin Panel**
- Manage user roles
- View deleted records
- Restore deleted items
- Audit log viewer

### **More Widgets**
- Revenue charts
- Customer statistics
- Parts inventory alerts
- Staff performance

### **Widget Settings**
- Show/hide individual widgets
- Resize widgets
- Color themes
- Export data

---

## ⚠️ Important Notes

### **Backup Before Deleting**
Even with soft deletes, always backup before major deletions

### **Permanent Delete**
To permanently delete (admin only, careful!):
```sql
DELETE FROM appointments WHERE id = 'uuid';
DELETE FROM crm_repair_orders WHERE id = 'uuid';
```

### **RLS Recommended**
Add Row Level Security policies:
```sql
-- Only allow admins to delete
CREATE POLICY admin_delete_policy ON appointments
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM staff_users 
    WHERE auth_user_id = auth.uid() 
    AND role = 'admin'
  )
);
```

---

## 📞 Support

**Admin Issues:**
- Check role in database
- Verify email matches domesticandforeignab@gmail.com
- Clear browser cache
- Check console for errors

**Drag-and-Drop Issues:**
- Ensure libraries installed
- Check browser compatibility
- Try different browser
- Disable browser extensions

---

## ✅ Summary

**Added:**
- ✅ Admin role system
- ✅ Drag-and-drop dashboard
- ✅ Soft delete appointments
- ✅ Soft delete repair orders
- ✅ Admin-only controls
- ✅ Layout persistence
- ✅ useAuth hook

**Security:**
- Role-based access
- Soft deletes (audit trail)
- Admin verification
- API protection

**Status**: Ready for implementation

---

**Next Steps:**
1. Run database migration
2. Install @dnd-kit packages
3. Implement UI changes
4. Test as admin and staff
5. Deploy to production
