# 🔴 URGENT: Fix Appointment File Upload Issue

## 🎯 THE PROBLEM

Users cannot upload files to appointments because the `appointment_files` table doesn't exist in your new Supabase Pro database.

**Error symptoms:**
- Upload button not working
- Files not being saved
- No error messages shown to users
- Console errors about missing table

---

## ✅ THE FIX (5 Minutes)

### **Step 1: Create the appointment_files Table** (3 min)

1. Open Supabase SQL Editor:  
   https://supabase.com/dashboard/project/ysjvgwsgmplnxchsbmtz/sql/new

2. Copy and paste this SQL:

```sql
-- Create appointment_files table
CREATE TABLE IF NOT EXISTS appointment_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  uploaded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_appointment_files_appointment_id 
ON appointment_files(appointment_id);

CREATE INDEX IF NOT EXISTS idx_appointment_files_created_at 
ON appointment_files(created_at);

-- Enable Row Level Security
ALTER TABLE appointment_files ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view files
CREATE POLICY "Allow authenticated users to view appointment files"
ON appointment_files FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload appointment files"
ON appointment_files FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to delete files
CREATE POLICY "Allow authenticated users to delete appointment files"
ON appointment_files FOR DELETE
TO authenticated
USING (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access to appointment files"
ON appointment_files FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Verify success
SELECT '✅ appointment_files table created successfully!' as status;
```

3. Click **"Run"**
4. Wait for "Success" message

---

### **Step 2: Create Storage Bucket** (2 min)

1. Go to Supabase Storage:  
   https://supabase.com/dashboard/project/ysjvgwsgmplnxchsbmtz/storage/buckets

2. Click **"New bucket"**

3. Enter bucket details:
   ```
   Name: appointment-files
   Public: ✅ Make public (checked)
   File size limit: 10 MB
   Allowed MIME types: (leave empty for all types)
   ```

4. Click **"Create bucket"**

5. **Set up bucket policies:**
   - Click on `appointment-files` bucket
   - Go to **"Policies"** tab
   - Click **"Add policy"**
   
   **Policy 1: Allow public read access**
   ```
   Policy name: Public read access
   Allowed operations: SELECT
   Target roles: public
   USING expression: true
   ```
   
   **Policy 2: Allow authenticated uploads**
   ```
   Policy name: Authenticated uploads
   Allowed operations: INSERT
   Target roles: authenticated
   WITH CHECK expression: true
   ```
   
   **Policy 3: Allow authenticated delete**
   ```
   Policy name: Authenticated delete
   Allowed operations: DELETE
   Target roles: authenticated
   USING expression: true
   ```

---

### **Step 3: Test File Upload** (1 min)

1. Go to your appointments page:  
   https://clevelandbody.com/admin/staff/appointments

2. Open any appointment

3. Try uploading a file

4. Verify:
   - ✅ File uploads successfully
   - ✅ File appears in the list
   - ✅ No console errors
   - ✅ Can download the file

---

## 🚨 ALTERNATIVE: Use Pre-Made SQL Script

If you want to run the complete fix including all checks:

1. Open: https://supabase.com/dashboard/project/ysjvgwsgmplnxchsbmtz/sql/new

2. Copy the contents of `FIX_FILE_UPLOAD.sql` from your repository

3. Click **"Run"**

---

## 🔍 VERIFICATION QUERIES

After creating the table, verify it works:

### **Check table exists:**
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'appointment_files'
ORDER BY ordinal_position;
```

Expected result: 9 columns listed

### **Check RLS is enabled:**
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'appointment_files';
```

Expected result: `rowsecurity = true`

### **Check policies exist:**
```sql
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'appointment_files';
```

Expected result: 4 policies listed

### **Check storage bucket exists:**
```sql
SELECT * FROM storage.buckets WHERE name = 'appointment-files';
```

Expected result: 1 row with bucket details

---

## 🧪 TEST FILE UPLOAD

### **Manual Test:**
1. Log in to your staff dashboard
2. Go to appointments
3. Select an appointment
4. Click "Upload Files"
5. Choose a file (PDF, image, etc.)
6. Click "Upload"
7. File should appear in the list with a download link

### **Console Test:**
1. Open browser console (F12)
2. Upload a file
3. Check for errors
4. Should see: "File uploaded successfully"

---

## 📊 SUPPORTED FILE TYPES

The system supports:
- **Documents**: PDF, DOC, DOCX, TXT
- **Images**: JPG, JPEG, PNG, GIF, WEBP
- **Spreadsheets**: XLS, XLSX, CSV
- **Other**: ZIP, MP4 (up to 10MB)

File naming:
- Special characters are automatically sanitized
- Spaces converted to hyphens
- Files stored as: `{appointment_id}/{timestamp}_{filename}`

---

## 🔒 SECURITY FEATURES

### **Row Level Security (RLS):**
- ✅ Only authenticated users can upload
- ✅ Public read access for sharing
- ✅ Users can delete files
- ✅ Service role has full access

### **Storage Security:**
- ✅ 10MB file size limit
- ✅ Files stored in isolated bucket
- ✅ Public URLs for easy sharing
- ✅ Automatic filename sanitization

### **Database Security:**
- ✅ Foreign key constraint to appointments
- ✅ CASCADE delete (files deleted with appointment)
- ✅ Metadata tracking (size, type, uploader)
- ✅ Timestamps for audit trail

---

## 🚨 TROUBLESHOOTING

### **Issue 1: "Table does not exist"**
**Solution**: Run the SQL to create `appointment_files` table

### **Issue 2: "Bucket does not exist"**
**Solution**: 
- Create bucket in Supabase Dashboard
- OR: Upload API will auto-create it

### **Issue 3: "Upload failed"**
**Solution**: 
- Check bucket policies (need authenticated INSERT)
- Verify file size < 10MB
- Check filename for special characters

### **Issue 4: "Cannot view uploaded files"**
**Solution**:
- Check RLS policies on `appointment_files` table
- Verify bucket is public
- Check public URL is generated

### **Issue 5: Files upload but don't show in list**
**Solution**:
- Check if `appointment_files` table has INSERT policy
- Verify foreign key relationship with appointments
- Check appointment_id is correct

---

## 📋 QUICK CHECKLIST

Complete these steps in order:

1. ✅ Create `appointment_files` table in Supabase
2. ✅ Enable Row Level Security (RLS)
3. ✅ Create RLS policies (SELECT, INSERT, DELETE)
4. ✅ Create `appointment-files` storage bucket
5. ✅ Make bucket public
6. ✅ Set bucket policies
7. ✅ Test file upload
8. ✅ Verify file appears in list
9. ✅ Test file download

---

## 🎯 EXPECTED RESULT

After completing the fix:
- ✅ Users can upload files to appointments
- ✅ Files are stored in Supabase Storage
- ✅ File metadata saved in database
- ✅ Files appear in appointment details
- ✅ Public URLs work for viewing/downloading
- ✅ No console errors

---

## 💾 DATABASE SCHEMA

The `appointment_files` table structure:

```
Column          Type        Description
-----------     --------    -----------
id              UUID        Primary key
appointment_id  UUID        Foreign key to appointments
file_name       TEXT        Original filename
file_type       TEXT        MIME type (e.g., 'image/jpeg')
file_size       INTEGER     Size in bytes
storage_path    TEXT        Path in storage bucket
public_url      TEXT        Public download URL
uploaded_by     TEXT        Email of uploader (optional)
created_at      TIMESTAMPTZ Upload timestamp
updated_at      TIMESTAMPTZ Last update timestamp
```

---

## 📁 FILES IN REPOSITORY

- `FIX_FILE_UPLOAD.sql` - Complete SQL script with verification
- `FILE_UPLOAD_FIX_GUIDE.md` - This guide

---

## 🔄 WHY THIS HAPPENED

When you migrated to the new Supabase Pro project (`ysjvgwsgmplnxchsbmtz`), the database was empty. The `appointment_files` table and `appointment-files` storage bucket weren't created because they were in your old project.

**Solution**: Recreate them in the new project.

---

## ✅ SUMMARY

**Problem**: appointment_files table missing  
**Solution**: Run SQL to create table + Create storage bucket  
**Time**: 5 minutes  
**Result**: File uploads work again  

---

**Next Step**: Run the SQL script now to fix the upload issue!

After running the script, users will be able to upload files immediately.
