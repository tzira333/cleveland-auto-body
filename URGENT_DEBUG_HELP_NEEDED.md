# 🚨 CRITICAL DEBUGGING - Need Your Help

## The error "column customer_visible does not exist" keeps happening.

This is happening BEFORE the table is even created, which means Postgres is checking something during the parsing phase.

---

## ❓ **Critical Questions:**

### 1. **WHERE exactly does the error occur?**

When you run ANY of these files, Supabase shows **line numbers** in the error.

**Example:**
```
Error at line 45: column "customer_visible" does not exist
```

**Please tell me the LINE NUMBER.**

---

### 2. **Does this table already exist?**

Run this query:

```sql
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'appointment_notes'
);
```

**Tell me: TRUE or FALSE?**

---

### 3. **Do any policies already exist on this table?**

Run this query:

```sql
SELECT * FROM pg_policies 
WHERE tablename = 'appointment_notes';
```

**Tell me: How many rows? Copy the output if any.**

---

### 4. **Is there an old view referencing this column?**

Run this query:

```sql
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name LIKE '%appointment%';
```

**Tell me: What views exist?**

---

## 🧪 **NEW TEST: Run This Single Query**

**File:** `migrations/MINIMAL_TABLE_ONLY.sql`

This is 9 lines total - just creates the table.

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS appointment_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID,
  note_text TEXT NOT NULL,
  customer_visible BOOLEAN DEFAULT FALSE,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

SELECT 'SUCCESS: Table created' as result;
```

**Copy these 9 lines, paste in Supabase SQL Editor, run.**

**DOES THIS FAIL?**

- If **YES**: The problem is even more fundamental
- If **NO**: The problem is in views/policies/triggers

---

## 🔍 **Most Likely Cause:**

I suspect **one of these** is true:

### A) **Old policy exists referencing the column**
Previous migration attempts created a policy that's still there.

**Solution:**
```sql
DROP POLICY IF EXISTS "Customers can view their customer-visible notes" ON appointment_notes;
DROP POLICY IF EXISTS "Staff can view all appointment notes" ON appointment_notes;
DROP POLICY IF EXISTS "Staff can insert appointment notes" ON appointment_notes;
```

Then try again.

---

### B) **Old view exists trying to use the column**
Previous attempts created views that reference the table.

**Solution:**
```sql
DROP VIEW IF EXISTS customer_appointment_view CASCADE;
DROP VIEW IF EXISTS staff_appointment_view CASCADE;
```

Then try again.

---

### C) **Table exists but column is missing**
Table was created in a previous attempt but without the column.

**Solution:**
```sql
ALTER TABLE appointment_notes ADD COLUMN IF NOT EXISTS customer_visible BOOLEAN DEFAULT FALSE;
```

Or fully drop and recreate:
```sql
DROP TABLE IF EXISTS appointment_notes CASCADE;
```

Then try creating it fresh.

---

## 🎯 **Action Items for You:**

1. **Answer the 4 questions above** (especially the line number)
2. **Run MINIMAL_TABLE_ONLY.sql** (just 9 lines)
3. **Try the cleanup scripts** (A, B, C above)
4. **Check if table/views/policies already exist**

---

## 💡 **My Best Guess:**

You probably have **old policies or views from previous migration attempts** that are referencing `appointment_notes.customer_visible`, but the table doesn't have that column yet (or the table doesn't exist).

When you try to create the table, Postgres is checking the existing policies/views and finding the reference to a column that doesn't exist in the old table.

**Quick fix to test this theory:**

```sql
-- Drop EVERYTHING related
DROP VIEW IF EXISTS customer_appointment_view CASCADE;
DROP VIEW IF EXISTS staff_appointment_view CASCADE;
DROP TABLE IF EXISTS appointment_notes CASCADE;
DROP TABLE IF EXISTS appointment_edit_history CASCADE;
DROP TABLE IF EXISTS repair_order_notes CASCADE;

-- Now run MINIMAL_TABLE_ONLY.sql
```

---

**Please share:**
1. The LINE NUMBER from the error
2. Results of the 4 diagnostic queries
3. Does MINIMAL_TABLE_ONLY.sql work?

This will help me give you the exact fix! 🎯
