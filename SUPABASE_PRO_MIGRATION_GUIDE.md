# Supabase Pro Migration - Fix Data Display Issue

## 🔴 ISSUE IDENTIFIED

After upgrading to Supabase Pro, your application is still pointing to the **old Supabase project URLs**. You need to update the environment variables in Vercel to point to the new project.

---

## ✅ SOLUTION - Update Vercel Environment Variables

### **New Supabase Project Reference**
```
Project Ref: ysjvgwsgmplnxchsbmtz
```

### **New URLs (Based on Project Ref)**
```bash
# Public Supabase URL
NEXT_PUBLIC_SUPABASE_URL=https://ysjvgwsgmplnxchsbmtz.supabase.co

# Supabase Anon Key (You'll need to get this from Supabase dashboard)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role Key (You'll need to get this from Supabase dashboard)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📋 STEP-BY-STEP FIX

### **Step 1: Get Your New Supabase Keys**

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project: **ysjvgwsgmplnxchsbmtz**
3. Go to **Settings** (gear icon) → **API**
4. Copy the following values:

```
Project URL: https://ysjvgwsgmplnxchsbmtz.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (starts with eyJ)
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (starts with eyJ, different from anon)
```

---

### **Step 2: Update Vercel Environment Variables**

1. Go to **Vercel Dashboard**: https://vercel.com/andres-projects-1b1915bc/clevelandbody-site/settings/environment-variables

2. **Update these 3 variables** (or delete old and create new):

   **Variable 1: NEXT_PUBLIC_SUPABASE_URL**
   ```
   Value: https://ysjvgwsgmplnxchsbmtz.supabase.co
   Environments: Production, Preview, Development (select all)
   ```

   **Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY**
   ```
   Value: [Your anon public key from Step 1]
   Environments: Production, Preview, Development (select all)
   ```

   **Variable 3: SUPABASE_SERVICE_ROLE_KEY**
   ```
   Value: [Your service_role key from Step 1]
   Environments: Production, Preview, Development (select all)
   ```

3. **Save all changes**

---

### **Step 3: Redeploy Your Application**

1. Go to **Vercel Deployments**: https://vercel.com/andres-projects-1b1915bc/clevelandbody-site/deployments

2. Click the **three dots (...)** on the latest deployment

3. Click **"Redeploy"**

4. Wait 5-10 minutes for deployment to complete

5. Test your site: https://clevelandbody.com

---

## 🔧 ALTERNATIVE: Using Vercel CLI

If you have Vercel CLI installed, you can update env vars from command line:

```bash
# Login to Vercel
vercel login

# Link to your project
vercel link --project clevelandbody-site

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Enter: https://ysjvgwsgmplnxchsbmtz.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Enter: [Your anon key]

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Enter: [Your service role key]

# Redeploy
vercel --prod
```

---

## 🗄️ DATABASE MIGRATION (If You Have a New Database)

If your Pro upgrade created a **new database** (not just a project upgrade), you'll need to migrate your data:

### **Option 1: Export from Old, Import to New**

1. **Export from old database**:
   ```bash
   # Get old project connection string
   # From old Supabase project → Settings → Database → Connection string
   
   pg_dump "postgresql://postgres:[OLD_PASSWORD]@[OLD_HOST]:5432/postgres" > backup.sql
   ```

2. **Import to new database**:
   ```bash
   # Get new project connection string
   # From new Supabase project → Settings → Database → Connection string
   
   psql "postgresql://postgres:[NEW_PASSWORD]@db.ysjvgwsgmplnxchsbmtz.supabase.co:5432/postgres" < backup.sql
   ```

### **Option 2: Use Supabase CLI**

```bash
# Link to new project
supabase link --project-ref ysjvgwsgmplnxchsbmtz

# Pull existing schema (if any)
supabase db pull

# Run migrations if you have them
supabase db push
```

---

## ✅ VERIFICATION CHECKLIST

After updating environment variables and redeploying:

- [ ] Vercel environment variables updated with new Supabase URL
- [ ] All three env vars set for Production, Preview, Development
- [ ] Application redeployed on Vercel
- [ ] Can log in to https://clevelandbody.com/admin/staff/login
- [ ] Appointments display on dashboard
- [ ] Repair orders display on CRM dashboard
- [ ] Can create new appointments
- [ ] Can create new repair orders
- [ ] Archive/restore functionality works
- [ ] SMS functionality works (if Twilio configured)

---

## 🔍 DEBUGGING STEPS

If data still doesn't display after the above steps:

### **1. Check Browser Console**
1. Open https://clevelandbody.com
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Look for errors like:
   - "Failed to fetch"
   - "Invalid API key"
   - "Project not found"
   - Network errors

### **2. Check Vercel Logs**
1. Go to: https://vercel.com/andres-projects-1b1915bc/clevelandbody-site/logs
2. Look for errors in runtime logs
3. Check for Supabase connection errors

### **3. Test Supabase Connection**
1. Open browser console on your site
2. Run this test:
```javascript
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
```
3. Verify it shows: `https://ysjvgwsgmplnxchsbmtz.supabase.co`

### **4. Check Supabase RLS Policies**
Your new Supabase project might have different Row Level Security (RLS) policies:

1. Go to: https://supabase.com/dashboard/project/ysjvgwsgmplnxchsbmtz/auth/policies
2. Check if policies exist for:
   - `appointments` table
   - `crm_repair_orders` table
   - `crm_customers` table
   - `crm_vehicles` table
   - `staff_users` table
3. If policies are missing, you may need to recreate them

---

## 🚨 COMMON ISSUES

### **Issue 1: "Invalid API key" or "Project not found"**
**Solution**: Double-check you copied the correct anon key from the new project

### **Issue 2: "Table does not exist"**
**Solution**: Your database schema wasn't migrated. Run migrations or import from backup

### **Issue 3: Data shows in Supabase but not in app**
**Solution**: Check RLS policies - they might be blocking access

### **Issue 4: Can't log in**
**Solution**: User authentication is separate. Check if staff_users exist in new database

---

## 📞 QUICK REFERENCE

**New Supabase Project**:
- Project Ref: `ysjvgwsgmplnxchsbmtz`
- URL: `https://ysjvgwsgmplnxchsbmtz.supabase.co`
- Dashboard: https://supabase.com/dashboard/project/ysjvgwsgmplnxchsbmtz

**Vercel Project**:
- Production: https://clevelandbody.com
- Dashboard: https://vercel.com/andres-projects-1b1915bc/clevelandbody-site

**Environment Variables to Update**:
1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. `SUPABASE_SERVICE_ROLE_KEY`

---

## 🎯 EXPECTED RESULT

After completing all steps:
- ✅ Your app connects to the new Supabase Pro project
- ✅ All data displays correctly
- ✅ Authentication works
- ✅ All CRUD operations functional
- ✅ No console errors

---

## 💡 PREVENTION FOR FUTURE

To avoid this issue in future upgrades:
1. Always check if project reference changes
2. Update environment variables immediately after upgrade
3. Keep a backup of your database
4. Document your Supabase connection details

---

**Last Updated**: 2026-03-03  
**Issue**: Data not displaying after Supabase Pro upgrade  
**Root Cause**: Environment variables pointing to old project  
**Solution Time**: ~15 minutes (after getting new keys)
