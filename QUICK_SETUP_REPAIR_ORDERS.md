# Quick Setup Guide - Repair Order System

## Prerequisites
- Supabase project running
- Staff authentication working
- Appointments table exists

## Step-by-Step Setup (10 minutes)

### Step 1: Run Database Migration (2 minutes)

1. Open Supabase Dashboard: https://app.supabase.com
2. Select your Cleveland Auto Body project
3. Go to **SQL Editor**
4. Click **New Query**
5. Copy contents of `schema-repair-order-enhanced.sql`
6. Paste into editor
7. Click **Run**
8. Verify success (should see "Success. No rows returned")

### Step 2: Verify Schema (1 minute)

Run this query to verify:
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'crm_customers',
  'crm_vehicles',
  'crm_repair_orders',
  'crm_repair_order_parts_list'
);

-- Should return 4 rows

-- Test RO number generation
SELECT generate_ro_number();

-- Should return: RO-00001
```

### Step 3: Build Application (2 minutes)

```bash
cd /home/user/webapp

# Install dependencies (if needed)
npm install

# Build application
npm run build

# Should complete without errors
```

### Step 4: Start Development Server (1 minute)

```bash
# Kill any existing process on port 3000
fuser -k 3000/tcp 2>/dev/null || true

# Start server
npm run dev

# Or use PM2
pm2 start ecosystem.config.cjs
```

### Step 5: Test Functionality (4 minutes)

#### Test 1: Manual Repair Order Creation

1. Go to: http://localhost:3000/admin/staff/login
2. Login with staff credentials
3. Click "Enter BodyShopCRM"
4. Click "Repair Orders" tab
5. Click "Create New Repair Order"
6. Fill in form (all required fields marked with *)
7. Add a part to parts list (optional)
8. Click "Create Repair Order"
9. Should see success message with RO number

#### Test 2: Convert Appointment to RO

1. Go to Appointments Dashboard
2. Find a completed appointment
3. Click "Convert to RO" button
4. Confirm in dialog
5. Should see success message
6. RO should appear in CRM

#### Test 3: Verify Data Saved

In Supabase SQL Editor:
```sql
-- Check repair orders created
SELECT ro_number, customer_first_name, customer_last_name, vehicle_year, vehicle_make
FROM crm_repair_orders
ORDER BY created_at DESC
LIMIT 5;

-- Check customers saved
SELECT first_name, last_name, phone, insurance_company
FROM crm_customers
ORDER BY created_at DESC
LIMIT 5;

-- Check vehicles saved
SELECT year, make, model, vin
FROM crm_vehicles
ORDER BY created_at DESC
LIMIT 5;

-- Check parts lists
SELECT ro.ro_number, p.part_name, p.quantity, p.estimated_cost
FROM crm_repair_order_parts_list p
JOIN crm_repair_orders ro ON p.repair_order_id = ro.id
ORDER BY p.created_at DESC
LIMIT 5;
```

## Common Issues & Fixes

### Issue: "Failed to generate RO number"
**Fix:**
```sql
-- Recreate function
CREATE OR REPLACE FUNCTION generate_ro_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    ro_number TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(ro_number FROM 'RO-(\d+)') AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.crm_repair_orders
    WHERE ro_number ~ '^RO-\d+$';
    
    ro_number := 'RO-' || LPAD(next_number::TEXT, 5, '0');
    
    RETURN ro_number;
END;
$$ LANGUAGE plpgsql;
```

### Issue: "Cannot insert repair order"
**Fix:** Check RLS policies:
```sql
-- Verify staff user exists and has access
SELECT * FROM staff_users WHERE is_active = true AND can_access_crm = true;

-- If no staff users, create one
INSERT INTO staff_users (
  auth_user_id, 
  email, 
  full_name, 
  is_active, 
  can_access_crm, 
  can_access_appointments
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'your-email@example.com'),
  'your-email@example.com',
  'Your Name',
  true,
  true,
  true
);
```

### Issue: "Table does not exist"
**Fix:** Run the migration again:
```bash
# In Supabase SQL Editor, run:
# schema-repair-order-enhanced.sql
```

### Issue: npm build fails
**Fix:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Convert button doesn't appear
**Fix:** Make sure appointment status is "completed"
```sql
-- Update appointment status
UPDATE appointments 
SET status = 'completed' 
WHERE id = 'your-appointment-id';
```

## Verification Checklist

After setup, verify:

- [ ] Can login to Staff Portal
- [ ] Can access BodyShopCRM
- [ ] "Repair Orders" tab visible
- [ ] "Create New Repair Order" button works
- [ ] Form validates required fields
- [ ] Can add/remove parts from list
- [ ] Repair Order creates successfully
- [ ] RO number generates (RO-00001, RO-00002, etc.)
- [ ] Customer data saves to crm_customers
- [ ] Vehicle data saves to crm_vehicles
- [ ] Parts list saves to crm_repair_order_parts_list
- [ ] "Convert to RO" button shows on completed appointments
- [ ] Conversion process works
- [ ] Documents/photos transfer to RO

## What's Next?

After setup is complete:

1. **Test with real data** - Create a few repair orders manually
2. **Train staff** - Show them how to use the system
3. **Monitor logs** - Check browser console for any errors
4. **Backup database** - Take a snapshot before heavy use
5. **Deploy to production** - Once tested, push to live site

## File Locations

Key files in the system:

```
/home/user/webapp/
├── schema-repair-order-enhanced.sql          # Database migration
├── REPAIR_ORDER_SYSTEM.md                    # Full documentation
├── QUICK_SETUP_REPAIR_ORDERS.md             # This file
├── app/
│   ├── api/
│   │   └── crm/
│   │       ├── repair-orders/route.ts        # Create/Get ROs
│   │       └── convert-appointment-to-ro/    # Conversion endpoint
│   └── admin/
│       └── staff/
│           ├── appointments/
│           │   └── ConvertToROButton.tsx    # Convert button
│           └── crm/
│               ├── CRMDashboard.tsx          # Main CRM interface
│               └── CreateRepairOrderForm.tsx # Create RO form
```

## Support Resources

- **Full Documentation:** REPAIR_ORDER_SYSTEM.md
- **API Reference:** See REPAIR_ORDER_SYSTEM.md → API Endpoints
- **Database Schema:** schema-repair-order-enhanced.sql
- **Troubleshooting:** REPAIR_ORDER_SYSTEM.md → Troubleshooting

## Quick Reference

### Required Fields for Manual Creation
- Customer: First name, last name, phone
- Vehicle: Year, make, model, VIN
- Repair: Damage description

### RO Number Format
- Format: RO-00001, RO-00002, etc.
- Auto-generated and sequential
- Unique constraint enforced

### Phone Number Format
- Input: Any format (216-481-8696, (216) 481-8696, etc.)
- Stored: 2164818696 (digits only)
- Length: Exactly 10 digits

### VIN Format
- Auto-converts to uppercase
- Max 17 characters
- Must be unique

---

**Estimated Setup Time:** 10 minutes  
**Difficulty:** Easy ⭐  
**Status:** Ready to Deploy ✅
