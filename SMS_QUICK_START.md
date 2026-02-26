# 🚀 QUICK START: SMS Functionality Setup

**Issue Fixed**: The database schema has been corrected to use `staff_email` instead of `staff_user_id`.

---

## ✅ SOLUTION: Run This One SQL Script

### **Step 1: Open Supabase SQL Editor**

1. Go to your Supabase project: https://supabase.com/dashboard/project/_
2. Click **SQL Editor** in the left sidebar
3. Click **"+ New query"**

### **Step 2: Copy and Run the Complete Setup Script**

Copy the entire contents of **`SUPABASE_SMS_SETUP.sql`** and paste it into the SQL Editor, then click **"Run"**.

**Or copy this:**

```sql
-- QUICK SETUP: Creates all tables and inserts your staff
CREATE TABLE IF NOT EXISTS staff_sms_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_email TEXT NOT NULL UNIQUE,
  staff_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  notify_new_appointments BOOLEAN DEFAULT TRUE,
  notify_new_tow_requests BOOLEAN DEFAULT TRUE,
  notify_urgent_ros BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sms_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL UNIQUE,
  template_type TEXT NOT NULL,
  message_template TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_phone TEXT NOT NULL,
  from_phone TEXT NOT NULL,
  message_body TEXT NOT NULL,
  message_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  twilio_sid TEXT,
  error_message TEXT,
  cost NUMERIC(10, 4),
  related_appointment_id UUID,
  related_ro_id UUID,
  sent_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS customer_sms_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL UNIQUE,
  opted_in BOOLEAN DEFAULT TRUE,
  opt_out_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_sms_settings_email ON staff_sms_settings(staff_email);
CREATE INDEX IF NOT EXISTS idx_staff_sms_settings_active ON staff_sms_settings(is_active);
CREATE INDEX IF NOT EXISTS idx_sms_logs_to_phone ON sms_logs(to_phone);
CREATE INDEX IF NOT EXISTS idx_sms_logs_created_at ON sms_logs(created_at DESC);

INSERT INTO sms_templates (template_name, template_type, message_template, description) VALUES
('new_appointment_staff', 'staff_notification', 'New Appointment!\nCustomer: {customer_name}\nPhone: {customer_phone}\nService: {service_type}\nDate: {appointment_date}', 'Staff notification'),
('new_tow_request_staff', 'staff_notification', 'TOW REQUEST!\nCustomer: {customer_name}\nLocation: {location}\nPhone: {customer_phone}', 'Tow notification'),
('ro_status_ready_pickup', 'customer_status_update', 'Cleveland Auto Body: Your {vehicle_info} is ready for pickup! Call (216) 288-0668. RO#{ro_number}', 'Ready pickup notification'),
('manual_customer_message', 'manual', '{custom_message}', 'Manual message')
ON CONFLICT (template_name) DO NOTHING;

INSERT INTO staff_sms_settings (staff_email, staff_name, phone_number, notify_new_appointments, notify_new_tow_requests) 
VALUES 
  ('domesticandforeignab@gmail.com', 'Shop Manager', '2162880668', true, true),
  ('domesticbody@gmail.com', 'Service Advisor', '4407491081', true, true)
ON CONFLICT (staff_email) DO UPDATE 
SET phone_number = EXCLUDED.phone_number, updated_at = NOW();

-- Verification
SELECT 'Tables Created' AS status, 
  (SELECT COUNT(*) FROM staff_sms_settings) AS staff_count,
  (SELECT COUNT(*) FROM sms_templates) AS template_count;
```

### **Step 3: Verify Success**

You should see output like:
```
status          | staff_count | template_count
Tables Created  | 2           | 4
```

---

## ⚙️ Next: Add Twilio Credentials to Vercel

### **1. Get Twilio Credentials**
- Login: https://console.twilio.com
- Copy your **Account SID** (starts with AC...)
- Copy your **Auth Token** (click to reveal)
- Copy your **Phone Number** (e.g., +12165551234)

### **2. Add to Vercel**
1. Go to: https://vercel.com/andres-projects-1b1915bc/clevelandbody-site/settings/environment-variables
2. Add these 3 variables:

```
Name: TWILIO_ACCOUNT_SID
Value: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Environments: Production, Preview, Development ✓✓✓
```

```
Name: TWILIO_AUTH_TOKEN  
Value: your_32_character_auth_token
Environments: Production, Preview, Development ✓✓✓
```

```
Name: TWILIO_PHONE_NUMBER
Value: +12165551234
Environments: Production, Preview, Development ✓✓✓
```

3. **Click "Save"** for each variable

### **3. Redeploy**
1. Go to **Deployments** tab
2. Click **"..."** menu on latest deployment
3. Click **"Redeploy"**
4. Wait 2-3 minutes

---

## 🧪 Test It!

### **Test 1: New Appointment (Staff SMS)**
1. Go to: https://clevelandbody.com/estimate-appointment
2. Fill form with your test phone number
3. Submit
4. **Expected**: Both staff members receive SMS within 30 seconds

### **Test 2: RO Status Update (Customer SMS)**
1. Login: https://clevelandbody.com/admin/staff/crm
2. Open any repair order
3. Change status to **"ready_pickup"**
4. Save
5. **Expected**: Customer receives "ready for pickup" SMS

### **Test 3: Manual SMS**
1. Open repair order
2. Click **"Send SMS to Customer"** button (top right)
3. Type message
4. Click **"Send SMS"**
5. **Expected**: SMS delivered instantly

---

## ✅ You're Done!

Your SMS system is now:
- ✅ Database tables created
- ✅ Staff phone numbers configured
- ✅ SMS templates loaded
- ⏳ Ready for Twilio credentials (add to Vercel)
- ⏳ Ready for testing (after redeploy)

---

## 📊 View SMS Logs

Check what's being sent:
```sql
SELECT 
  to_phone,
  message_type,
  LEFT(message_body, 50) AS message_preview,
  status,
  created_at
FROM sms_logs
ORDER BY created_at DESC
LIMIT 20;
```

---

## 🆘 Troubleshooting

**No SMS received?**
1. Check Twilio console logs: https://console.twilio.com/us1/monitor/logs/sms
2. Verify environment variables are set in Vercel
3. Check `sms_logs` table for error messages
4. Ensure phone numbers are formatted correctly (10 digits)

**Staff not receiving notifications?**
```sql
-- Check staff settings
SELECT * FROM staff_sms_settings WHERE is_active = true;

-- Enable notifications
UPDATE staff_sms_settings 
SET notify_new_appointments = true, notify_new_tow_requests = true 
WHERE staff_email = 'your@email.com';
```

---

## 📞 Support

- **Twilio Console**: https://console.twilio.com
- **Vercel Dashboard**: https://vercel.com/andres-projects-1b1915bc/clevelandbody-site
- **Documentation**: See `TWILIO_SETUP_GUIDE.md` for complete details

**Setup Time**: ~10 minutes  
**Cost**: ~$3-4/month for typical usage
