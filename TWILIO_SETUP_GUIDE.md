# Twilio SMS Functionality - Setup Guide

## 🎯 Overview

This guide walks you through setting up Twilio SMS notifications for the Cleveland Auto Body BodyShop Workflow system.

## 📋 Features Implemented

### 1. **Staff Notifications**
- ✅ New estimate appointment created
- ✅ New tow request submitted
- ✅ Configurable per staff member

### 2. **Customer Notifications**
- ✅ RO status changes (automatic)
- ✅ Manual SMS from RO details page
- ✅ Status-specific templates

### 3. **SMS Tracking**
- ✅ All messages logged in database
- ✅ Delivery status tracking
- ✅ Cost monitoring
- ✅ Message history per RO/appointment

---

## 🔧 Twilio Account Setup

### Step 1: Get Your Twilio Credentials

1. **Login to Twilio Console**: https://console.twilio.com
2. **Navigate to Account Info** (top right of dashboard)
3. **Copy these three values**:
   - Account SID (starts with `AC...`)
   - Auth Token (click to reveal)
   - Phone Number (from Phone Numbers section)

### Step 2: Get a Twilio Phone Number

If you don't have a phone number yet:

1. Go to **Phone Numbers** → **Manage** → **Buy a number**
2. Select **United States** (+1)
3. Check **SMS** capability
4. Search and purchase a number
5. Copy the phone number (format: `+1XXXXXXXXXX`)

---

## 🚀 Vercel Deployment Configuration

### Add Environment Variables

1. **Go to Vercel Dashboard**: https://vercel.com/andres-projects-1b1915bc/clevelandbody-site
2. **Navigate to**: Settings → Environment Variables
3. **Add these variables** (one at a time):

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_32_character_auth_token
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX

# Existing variables (verify these are set)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=https://clevelandbody.com
```

4. **Select environments**: Production, Preview, Development (check all three)
5. **Click "Save"** for each variable
6. **Redeploy** the application:
   - Go to Deployments tab
   - Click "..." menu on latest deployment
   - Click "Redeploy"

---

## 🗄️ Database Setup

### Run the Migration

The SMS functionality requires new database tables. Run this SQL in your Supabase SQL Editor:

```sql
-- Staff SMS Notification Settings
CREATE TABLE IF NOT EXISTS staff_sms_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_email TEXT UNIQUE NOT NULL,
  staff_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  notify_new_appointments BOOLEAN DEFAULT true,
  notify_new_tow_requests BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SMS Message Logs
CREATE TABLE IF NOT EXISTS sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_phone TEXT NOT NULL,
  from_phone TEXT NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  twilio_sid TEXT,
  error_message TEXT,
  cost NUMERIC(10, 4),
  related_appointment_id UUID REFERENCES appointments(id),
  related_ro_id UUID REFERENCES crm_repair_orders(id),
  sent_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sms_logs_appointment ON sms_logs(related_appointment_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_ro ON sms_logs(related_ro_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_created_at ON sms_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_staff_sms_settings_email ON staff_sms_settings(staff_email);

-- Sample staff SMS settings (update with your actual staff)
INSERT INTO staff_sms_settings (staff_email, staff_name, phone_number, notify_new_appointments, notify_new_tow_requests)
VALUES 
  ('manager@clevelandbody.com', 'Shop Manager', '2165551001', true, true),
  ('service@clevelandbody.com', 'Service Advisor', '2165551002', true, true),
  ('scheduler@clevelandbody.com', 'Scheduler', '2165551003', true, false)
ON CONFLICT (staff_email) DO NOTHING;
```

---

## 📱 SMS Message Templates

### Staff Notifications

**New Appointment:**
```
🚗 New Appointment
Customer: {name}
Service: {service_type}
Date: {appointment_date}
Phone: {phone}
View: {app_url}/admin/staff
```

**New Tow Request:**
```
🚨 TOW REQUEST
Customer: {name}
Location: {location}
Vehicle: {vehicle_info}
Phone: {phone}
URGENT - View: {app_url}/admin/staff
```

### Customer Notifications

**Status Updates (automatic):**
- `insurance`: "Your vehicle is being reviewed by insurance. We'll contact you soon."
- `estimate_approval`: "Your repair estimate is ready for review. Please contact us."
- `parts_ordered`: "Parts have been ordered for your repair."
- `in_repair`: "Your vehicle repair is in progress."
- `painting`: "Your vehicle is in the paint booth."
- `quality_control`: "Your vehicle is in final quality inspection."
- `ready_pickup`: "🎉 Your vehicle is ready for pickup! Please call to schedule."
- `completed`: "✅ Your repair is complete. Thank you for choosing Cleveland Auto Body!"

---

## 🧪 Testing Guide

### 1. Test Staff Notifications

**A. New Appointment:**
```bash
1. Go to: https://clevelandbody.com/estimate-appointment
2. Fill out the form with:
   - Name: Test Customer
   - Phone: Your test number
   - Service: Collision Repair
   - Date/Time: Tomorrow
3. Submit the form
4. Staff members should receive SMS within 30 seconds
```

**B. New Tow Request:**
```bash
1. Go to: https://clevelandbody.com/tow-request
2. Fill out:
   - Name: Test Tow
   - Phone: Your test number
   - Location: 123 Test St
   - Vehicle: 2020 Honda Accord
3. Submit
4. Staff should receive URGENT tow notification
```

### 2. Test Customer Notifications

**A. Automatic Status Updates:**
```bash
1. Login to staff dashboard: https://clevelandbody.com/admin/staff/crm
2. Open any repair order
3. Change status to "ready_pickup"
4. Save changes
5. Customer should receive "ready for pickup" SMS
```

**B. Manual SMS:**
```bash
1. Open a repair order in the dashboard
2. Look for the "Send SMS to Customer" button (top right of modal)
3. Type a custom message
4. Click "Send SMS"
5. Message should be delivered instantly
6. SMS log entry created in database
```

### 3. Verify SMS Logs

**Check Supabase:**
```sql
-- View recent SMS logs
SELECT 
  to_phone,
  message,
  message_type,
  status,
  created_at,
  delivered_at
FROM sms_logs
ORDER BY created_at DESC
LIMIT 20;

-- Check delivery rate
SELECT 
  status,
  COUNT(*) as count
FROM sms_logs
GROUP BY status;
```

**Check Twilio Console:**
1. Go to: https://console.twilio.com/us1/monitor/logs/sms
2. View message logs, delivery status, and errors
3. Monitor costs

---

## 🔍 Troubleshooting

### Issue: SMS Not Sending

**Check 1: Environment Variables**
```bash
# Verify in Vercel dashboard that all 3 Twilio variables are set:
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN  
- TWILIO_PHONE_NUMBER
```

**Check 2: Twilio Account**
```bash
# Verify at https://console.twilio.com:
- Account is active (not trial)
- Phone number is SMS-enabled
- Sufficient balance
```

**Check 3: Phone Number Format**
```bash
# All phone numbers must be:
- 10 digits for US numbers
- Will be auto-formatted to +1XXXXXXXXXX
- Example: "2165551234" → "+12165551234"
```

**Check 4: API Logs**
```bash
# Check Vercel function logs:
1. Go to Vercel dashboard
2. Click on latest deployment
3. View "Functions" tab
4. Look for /api/sms/send logs
```

### Issue: Staff Not Receiving Notifications

**Check staff_sms_settings table:**
```sql
SELECT * FROM staff_sms_settings WHERE is_active = true;

-- Update staff notification preferences:
UPDATE staff_sms_settings 
SET 
  notify_new_appointments = true,
  notify_new_tow_requests = true
WHERE staff_email = 'yourstaff@clevelandbody.com';
```

### Issue: Customer Not Receiving Status Updates

**Verify customer phone number:**
```sql
-- Check RO phone number
SELECT 
  ro_number,
  customer_first_name,
  customer_phone
FROM crm_repair_orders
WHERE ro_number = 'RO-00670';

-- Update if needed
UPDATE crm_repair_orders
SET customer_phone = '2165551234'
WHERE ro_number = 'RO-00670';
```

---

## 💰 Cost Considerations

### Twilio Pricing (US)
- **SMS (outbound)**: $0.0079 per message
- **SMS (inbound)**: $0.0079 per message
- **Phone number**: $1.15/month

### Estimated Monthly Cost
Based on typical usage:
- 100 appointments/month × 2 staff = 200 staff notifications
- 50 status updates × 1 customer = 50 customer notifications
- 10 manual messages = 10 messages
- **Total**: ~260 messages/month = ~$2.05/month + $1.15 = **$3.20/month**

### Cost Monitoring
```sql
-- View monthly SMS costs
SELECT 
  DATE_TRUNC('month', created_at) as month,
  message_type,
  COUNT(*) as message_count,
  SUM(cost) as total_cost
FROM sms_logs
WHERE created_at >= NOW() - INTERVAL '6 months'
GROUP BY month, message_type
ORDER BY month DESC;
```

---

## 🔐 Security Best Practices

1. **Never commit Twilio credentials** to Git
2. **Use environment variables** for all sensitive data
3. **Rotate Auth Token** every 90 days
4. **Monitor usage** in Twilio console
5. **Set up alerts** for unusual activity
6. **Restrict IP access** (optional) in Twilio settings

---

## 📊 SMS Analytics Dashboard (Future Enhancement)

Potential features to add:
- [ ] SMS delivery rate chart
- [ ] Cost breakdown by message type
- [ ] Most common customer questions
- [ ] Response time metrics
- [ ] Staff notification preferences UI
- [ ] Customer SMS opt-out management

---

## 🎉 Success Checklist

- [ ] Twilio account created and phone number purchased
- [ ] Environment variables added to Vercel
- [ ] Database migration executed in Supabase
- [ ] Staff phone numbers added to `staff_sms_settings`
- [ ] Application redeployed
- [ ] Test appointment submitted (staff notified)
- [ ] Test tow request submitted (staff notified)
- [ ] Test RO status change (customer notified)
- [ ] Test manual SMS from RO details (customer received)
- [ ] SMS logs verified in Supabase
- [ ] Twilio console shows successful deliveries

---

## 📞 Support

For issues or questions:
1. Check Twilio Console logs: https://console.twilio.com/us1/monitor/logs
2. Check Vercel function logs: https://vercel.com/andres-projects-1b1915bc/clevelandbody-site
3. Review `sms_logs` table in Supabase
4. Verify all environment variables are set correctly

---

## 🚀 Go Live!

Once all tests pass:
1. Update `staff_sms_settings` with real staff phone numbers
2. Test with a real appointment
3. Monitor Twilio console for delivery confirmation
4. Announce new SMS feature to staff
5. Update customer communications about text notifications

**Your SMS notification system is now live! 🎊**
