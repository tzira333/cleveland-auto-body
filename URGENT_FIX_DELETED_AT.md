# 🔴 URGENT FIX: Column deleted_at Does Not Exist

## Error Message
```
column crm_repair_orders.deleted_at does not exist
```

## 🎯 THE PROBLEM
Your new Supabase database is missing the columns that were added in migrations. You need to run the migration SQL to add them.

---

## ✅ THE FIX (5 Minutes)

### **Step 1: Open Supabase SQL Editor** (1 min)

Go to: https://supabase.com/dashboard/project/ysjvgwsgmplnxchsbmtz/sql/new

---

### **Step 2: Copy the Migration SQL** (1 min)

The complete migration SQL is in your repository:
- File: `COMPLETE_MIGRATION.sql`
- Location: https://github.com/tzira333/cleveland-auto-body/blob/main/COMPLETE_MIGRATION.sql

**OR** copy this simplified version:

```sql
-- Quick Fix: Add missing columns
-- Run this in Supabase SQL Editor

-- 1. Add soft delete columns to repair orders
ALTER TABLE crm_repair_orders 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by TEXT;

-- 2. Add soft delete columns to appointments
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by TEXT;

-- 3. Add archive columns to repair orders
ALTER TABLE crm_repair_orders 
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS archived_by TEXT;

-- 4. Add archive columns to appointments
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS archived_by TEXT;

-- 5. Add absolute end date to repair orders
ALTER TABLE crm_repair_orders 
ADD COLUMN IF NOT EXISTS absolute_end_date DATE;

-- 6. Add admin role to staff_users
ALTER TABLE staff_users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'staff';

-- 7. Update admin user
UPDATE staff_users 
SET role = 'admin' 
WHERE email = 'domesticandforeignab@gmail.com';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_crm_repair_orders_deleted_at 
ON crm_repair_orders(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_deleted_at 
ON appointments(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_crm_repair_orders_archived 
ON crm_repair_orders(archived) WHERE archived = true;

CREATE INDEX IF NOT EXISTS idx_appointments_archived 
ON appointments(archived) WHERE archived = true;

-- Verify success
SELECT 'Migration completed successfully!' as status;
```

---

### **Step 3: Run the Migration** (2 min)

1. Paste the SQL into the Supabase SQL Editor
2. Click **"Run"** button (bottom right)
3. Wait for "Success" message
4. You should see: `Migration completed successfully!`

---

### **Step 4: Verify the Fix** (1 min)

Run this verification query:

```sql
-- Verify columns exist
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'crm_repair_orders'
  AND column_name IN ('deleted_at', 'deleted_by', 'archived', 'archived_at', 'absolute_end_date')
ORDER BY column_name;
```

You should see 5 rows returned with the column names.

---

### **Step 5: Test Your Website** (1 min)

1. Go to: https://clevelandbody.com/admin/staff/crm
2. Refresh the page (Ctrl+R or Cmd+R)
3. Your repair orders should now display!
4. Check browser console (F12) - the error should be gone

---

## 🎯 EXPECTED RESULT

After running the migration:
- ✅ Error "column deleted_at does not exist" is gone
- ✅ Repair orders display correctly
- ✅ Appointments display correctly
- ✅ Archive functionality works
- ✅ Admin delete buttons appear (for admin user)

---

## 🗄️ OPTIONAL: Run Full Migration with SMS Tables

If you also want SMS functionality, run the **complete** migration:

1. Open: https://github.com/tzira333/cleveland-auto-body/blob/main/COMPLETE_MIGRATION.sql
2. Copy the entire file
3. Paste into Supabase SQL Editor
4. Click **Run**

This adds:
- All missing columns (deleted_at, archived, etc.)
- SMS templates table
- SMS logs table
- Customer SMS preferences table
- Appointment notes table
- Dashboard layout table

---

## 🚨 TROUBLESHOOTING

### **Error: "relation already exists"**
This is OK! It means some tables/columns already exist. The `IF NOT EXISTS` clauses will skip them.

### **Error: "permission denied"**
Make sure you're logged into the correct Supabase project (ysjvgwsgmplnxchsbmtz)

### **Data still doesn't show**
1. Clear browser cache (Ctrl+Shift+R)
2. Check browser console for new errors
3. Verify environment variables are updated in Vercel (from previous steps)

---

## 📋 QUICK CHECKLIST

Complete migration in this order:

1. ✅ Updated Vercel environment variables (previous step)
2. ✅ Redeployed on Vercel (previous step)
3. ✅ **Run migration SQL in Supabase** (this step)
4. ✅ Refresh website and verify data displays

---

## 💡 WHY THIS HAPPENED

When you upgraded to Supabase Pro and got a new project (ysjvgwsgmplnxchsbmtz), it created a **new empty database**. The old database had these columns from previous migrations, but the new one doesn't.

**Solution**: Run migrations again on the new database.

---

## 🎯 FILES IN REPOSITORY

For complete migrations:
- `COMPLETE_MIGRATION.sql` - Full migration with all tables
- `migrations/add_admin_role_and_dashboard_layout.sql` - Admin role system
- `migrations/add_absolute_end_date.sql` - Absolute end date column
- `migrations/add_archive_functionality.sql` - Archive columns
- `migrations/add_customer_sms_only.sql` - SMS tables

---

## ✅ SUMMARY

**Problem**: New Supabase database missing columns  
**Solution**: Run migration SQL in Supabase SQL Editor  
**Time**: 5 minutes  
**SQL to Run**: Quick fix version (15 lines) or Complete migration (200+ lines)  
**Result**: Data displays correctly

---

**Next Step**: After running the migration SQL, refresh https://clevelandbody.com and verify your data displays!
