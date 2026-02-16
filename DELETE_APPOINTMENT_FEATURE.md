# 🗑️ Delete Appointment Feature - Staff Portal

## Overview

Staff members can now delete appointments that are no longer needed directly from the Staff Portal.

---

## ✅ What Was Added

### 1. Delete Function
**File**: `/app/admin/staff/StaffDashboard.tsx`

**Functionality**:
- Confirmation dialog before deletion
- Deletes associated files (appointment_files table)
- Removes appointment from database
- Refreshes appointment list automatically
- Shows success/error messages

```typescript
const deleteAppointment = async (id: string) => {
  // Confirmation prompt
  const confirmed = window.confirm(
    'Are you sure you want to delete this appointment? This action cannot be undone.'
  )
  
  if (!confirmed) return
  
  // Delete files
  await supabase.from('appointment_files').delete().eq('appointment_id', id)
  
  // Delete appointment
  await supabase.from('appointments').delete().eq('id', id)
  
  // Refresh list
  fetchAppointments()
}
```

---

## 🎨 UI Changes

### 1. Delete Button in Table View
**Location**: Actions column (rightmost column)

**Appearance**:
- Red trash icon
- Appears for ALL appointments
- Hover effect (red background)
- Tooltip: "Delete appointment"

### 2. Delete Button in Detail Modal
**Location**: Bottom-left of modal (next to Convert to RO)

**Appearance**:
- Red button with trash icon
- Text: "Delete"
- Prominent placement for easy access

---

## 🔒 Security & Permissions

### Current Implementation
- ✅ Only staff members can access Staff Portal
- ✅ Authentication required (via Supabase Auth)
- ✅ Row-Level Security on appointments table

### Row-Level Security (RLS)
The `appointments` table already has RLS policies that allow staff to delete:

```sql
-- Staff can manage all appointments
CREATE POLICY "Staff can manage appointments"
    ON public.appointments FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.staff_users
            WHERE auth_user_id = auth.uid() 
            AND is_active = true
        )
    );
```

---

## 🎬 How to Use

### Method 1: Delete from Table View

1. **Login** to Staff Portal:
   ```
   https://clevelandbody.com/admin/staff/login
   ```

2. **Find** the appointment you want to delete

3. **Click** the red trash icon in the Actions column

4. **Confirm** deletion in popup:
   ```
   "Are you sure you want to delete this appointment? 
   This action cannot be undone."
   ```

5. **Done!** Appointment is deleted and list refreshes

---

### Method 2: Delete from Detail Modal

1. **Click** "View Details" on any appointment

2. **Review** the appointment details

3. **Click** the red "Delete" button (bottom-left)

4. **Confirm** deletion

5. **Done!** Modal closes and list refreshes

---

## 📊 What Gets Deleted

When you delete an appointment:

### ✅ Deleted
- Appointment record from `appointments` table
- Associated files from `appointment_files` table
- File references (if any)

### ❌ NOT Deleted (if exists)
- Customer user account (`customer_users`)
- Repair order (if converted - `crm_repair_orders`)
- Customer/vehicle records in CRM

**Why**: Other records may be referenced elsewhere and should be managed separately.

---

## ⚠️ Important Warnings

### 1. Permanent Deletion
**There is NO undo!** Once deleted:
- Appointment is permanently removed
- Cannot be recovered
- Files are deleted from database

### 2. Converted Appointments
If an appointment was converted to a Repair Order:
- Deleting the appointment does NOT delete the RO
- The RO remains in CRM system
- Only the original appointment is deleted

### 3. Customer Data
- Customer account (`customer_users`) is NOT deleted
- Customer can still login to portal
- Customer won't see this appointment anymore

---

## 🔄 Alternative: Cancel Instead of Delete

### When to Cancel vs Delete

**Use Cancel (Change Status)** if:
- ✅ Customer cancelled but may reschedule
- ✅ Need to keep record for history
- ✅ Might need to reference later
- ✅ For reporting/analytics

**Use Delete** if:
- ❌ Duplicate entry
- ❌ Test data
- ❌ Spam submission
- ❌ No longer relevant at all

### How to Cancel Instead
1. Open appointment details
2. Click status button: "Cancelled"
3. Appointment marked as cancelled but retained

---

## 🎯 Use Cases

### When to Use Delete

**Scenario 1: Duplicate Appointments**
```
Customer accidentally submitted same appointment twice
→ Delete the duplicate
```

**Scenario 2: Test Data**
```
Staff testing the system created fake appointments
→ Delete all test appointments
```

**Scenario 3: Spam/Invalid Submissions**
```
Random spam submission with fake data
→ Delete immediately
```

**Scenario 4: Wrong Contact Info**
```
Appointment submitted with completely wrong customer
→ Delete and ask customer to resubmit
```

---

## 🛡️ Safety Features

### 1. Confirmation Dialog
- ✅ Prevents accidental deletion
- ✅ Clear warning message
- ✅ Two-step process (click + confirm)

### 2. Success/Error Messages
```javascript
// Success
alert('Appointment deleted successfully')

// Error
alert('Failed to delete appointment. Please try again.')
```

### 3. Error Handling
- ✅ Catches database errors
- ✅ Shows user-friendly messages
- ✅ Logs errors to console for debugging

---

## 📱 Visual Guide

### Table View
```
┌──────────────────────────────────────────────────────────┐
│ Customer | Contact | Vehicle | Status | Actions          │
├──────────────────────────────────────────────────────────┤
│ John Doe | ...     | ...     | Pending│ [View] [🗑️]     │
│ Jane Smith| ...    | ...     | Completed│[View][Convert][🗑️]│
└──────────────────────────────────────────────────────────┘
                                              ↑
                                         Delete button
```

### Detail Modal
```
┌─────────────────────────────────────────────────┐
│ Appointment Details                    [×]      │
├─────────────────────────────────────────────────┤
│ Customer: John Doe                              │
│ Phone: (216) 481-8696                           │
│ ...                                             │
├─────────────────────────────────────────────────┤
│ [🗑️ Delete]              [Close]               │
└─────────────────────────────────────────────────┘
   ↑
Delete button (red)
```

---

## 🧪 Testing Checklist

### Before Deploying to Production

- [ ] Test delete from table view
- [ ] Test delete from detail modal
- [ ] Verify confirmation dialog appears
- [ ] Confirm appointment is removed from list
- [ ] Check that files are deleted
- [ ] Test with appointment that has files
- [ ] Test with appointment that has no files
- [ ] Test with completed appointment (with Convert to RO)
- [ ] Verify RO is NOT deleted when appointment is deleted
- [ ] Test error handling (disconnect internet, try delete)
- [ ] Verify success/error messages display
- [ ] Test with different user roles (if applicable)

---

## 🐛 Troubleshooting

### Issue: Delete button doesn't appear

**Check**:
1. ✅ Logged in as staff member
2. ✅ Staff account is active (`is_active = true`)
3. ✅ Page refreshed after code deployment

### Issue: "Failed to delete appointment"

**Common Causes**:
1. ❌ Database connection issue
2. ❌ RLS policy blocking deletion
3. ❌ Foreign key constraint (shouldn't happen with CASCADE)

**Solution**:
- Check browser console for detailed error
- Verify staff user exists in `staff_users` table
- Check Supabase logs

### Issue: Appointment deleted but files remain

**Check**:
1. Database has CASCADE on foreign key
2. Files table foreign key: `REFERENCES appointments(id) ON DELETE CASCADE`

**Fix** (if needed):
```sql
ALTER TABLE appointment_files
DROP CONSTRAINT IF EXISTS appointment_files_appointment_id_fkey;

ALTER TABLE appointment_files
ADD CONSTRAINT appointment_files_appointment_id_fkey
FOREIGN KEY (appointment_id) 
REFERENCES appointments(id) 
ON DELETE CASCADE;
```

---

## 📊 Database Impact

### Query Executed
```sql
-- Delete files first (or CASCADE handles this)
DELETE FROM appointment_files 
WHERE appointment_id = '<uuid>';

-- Delete appointment
DELETE FROM appointments 
WHERE id = '<uuid>';
```

### Performance
- ⚡ Fast (indexed on id)
- ⚡ Minimal load (single record)
- ⚡ Cascade handled by database

---

## 🔜 Future Enhancements (Optional)

### Potential Additions

1. **Soft Delete**
   - Mark as deleted instead of removing
   - Allow undelete within 30 days
   - Auto-purge after 30 days

2. **Bulk Delete**
   - Select multiple appointments
   - Delete all at once
   - For cleaning up test data

3. **Delete Reasons**
   - Require reason for deletion
   - Track who deleted and why
   - Audit trail

4. **Permission Levels**
   - Only managers can delete
   - Regular staff can only cancel
   - Admin has full control

5. **Archive Instead**
   - Move to archived table
   - Keep for records
   - Exclude from main view

---

## 📚 Related Features

### Existing Features
- **View Details**: See full appointment info
- **Update Status**: Change appointment status
- **Convert to RO**: Create repair order from appointment
- **File Upload**: Attach photos/documents

### Related Tables
- `appointments` - Main table
- `appointment_files` - Attached files
- `crm_repair_orders` - Converted ROs
- `staff_users` - Staff permissions

---

## ✅ Summary

### What Staff Can Now Do
- ✅ Delete appointments from table view (trash icon)
- ✅ Delete appointments from detail modal (Delete button)
- ✅ Confirmation before deletion
- ✅ Automatic file cleanup
- ✅ Instant list refresh

### Safety Features
- ✅ Confirmation dialog
- ✅ Clear warning message
- ✅ Success/error notifications
- ✅ RLS security

### When to Use
- ✅ Duplicate entries
- ✅ Test data
- ✅ Spam submissions
- ✅ Invalid data

---

**Status**: ✅ Implemented and Ready to Use

**Last Updated**: 2026-02-08

**Commit**: ec691ff

**Testing**: Build passes, ready for deployment
