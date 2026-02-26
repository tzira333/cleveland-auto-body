# Customer SMS Notifications - Implementation Guide

## 🎯 Overview

This system sends SMS notifications to **customers only** when repair order statuses change and allows staff to send manual SMS from the RO details page.

**NO staff notifications** - Staff will not receive any SMS alerts.

---

## ✅ Features

### 1. **Automatic Customer Notifications (Status Updates)**

Customers automatically receive SMS when their RO status changes to:

| Status | Message Example |
|--------|----------------|
| `insurance` | "Your vehicle is being reviewed by insurance. We will contact you soon." |
| `estimate_approval` | "Your estimate is ready. Amount: $XXX. Call (216) 288-0668." |
| `parts_ordered` | "Parts ordered for your vehicle. We will notify you when work begins." |
| `in_repair` | "Work started on your vehicle. Est. completion: MM/DD/YYYY." |
| `painting` | "Your vehicle is in the paint booth. Great progress!" |
| `quality_control` | "Your vehicle is in final inspection. Almost ready!" |
| `ready_pickup` | "Your vehicle is ready for pickup! Call (216) 288-0668." |
| `completed` | "Thank you! Your repair is complete. We appreciate your business!" |

### 2. **Manual SMS from RO Details**

Staff can send custom messages to customers:
- Click **"Send SMS to Customer"** button in RO details modal
- Type custom message (max 160 characters for single SMS)
- Quick message templates available
- Instant delivery confirmation

---

## 🗄️ Database Setup

### Run This SQL in Supabase

Copy and paste the entire contents of **`CUSTOMER_SMS_SETUP.sql`** into Supabase SQL Editor:

```sql
-- Creates 3 tables:
-- 1. sms_templates (9 customer notification templates)
-- 2. sms_logs (tracks all sent messages)
-- 3. customer_sms_preferences (opt-out management)
```

**What it does:**
- ✅ Drops old `staff_sms_settings` table (not needed)
- ✅ Creates customer SMS templates
- ✅ Creates SMS logging tables
- ✅ No staff phone numbers needed

---

## ⚙️ Twilio Configuration

### 1. Get Twilio Credentials

1. Login: https://console.twilio.com
2. Copy these 3 values:
   - **Account SID** (starts with `AC...`)
   - **Auth Token** (click to reveal)
   - **Phone Number** (e.g., `+12165551234`)

### 2. Add to Vercel Environment Variables

Go to: https://vercel.com/andres-projects-1b1915bc/clevelandbody-site/settings/environment-variables

Add these 3 variables (check all environments):

```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_32_character_auth_token
TWILIO_PHONE_NUMBER=+12165551234
```

### 3. Redeploy

1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**

---

## 🧪 Testing

### Test 1: Automatic Status Update SMS

```
1. Login: https://clevelandbody.com/admin/staff/crm
2. Open any repair order with a customer phone number
3. Change status to "ready_pickup"
4. Click "Save"
5. Expected: Customer receives "ready for pickup" SMS within 10 seconds
```

### Test 2: Manual SMS

```
1. Open repair order in dashboard
2. Click "Send SMS to Customer" button (top right of modal)
3. Type message or select quick message
4. Click "Send SMS"
5. Expected: Instant delivery, success confirmation
```

### Test 3: Verify Logs

**Check Supabase:**
```sql
SELECT 
  to_phone,
  message_type,
  LEFT(message_body, 60) AS message,
  status,
  created_at
FROM sms_logs
ORDER BY created_at DESC
LIMIT 10;
```

**Check Twilio Console:**
- Go to: https://console.twilio.com/us1/monitor/logs/sms
- View delivery status
- Monitor costs

---

## 📊 SMS Templates

### Customer Status Update Templates

All templates include:
- Cleveland Auto Body branding
- Vehicle info (year/make/model)
- RO number reference
- Contact phone: (216) 288-0668

**Editable in Supabase:**
```sql
-- View all templates
SELECT * FROM sms_templates;

-- Update a template
UPDATE sms_templates 
SET message_template = 'New message text here'
WHERE template_name = 'ro_status_ready_pickup';
```

---

## 💰 Cost Estimate

### Twilio Pricing (US)
- SMS: **$0.0079 per message**
- Phone number: **$1.15/month**

### Expected Monthly Cost

**Typical shop with 50 repairs/month:**
- 50 status updates × 1 SMS each = 50 messages
- 10 manual messages = 10 messages
- **Total**: ~60 messages/month = **$1.62/month**

**High volume shop with 200 repairs/month:**
- 200 status updates × 1 SMS each = 200 messages
- 50 manual messages = 50 messages
- **Total**: ~250 messages/month = **$3.13/month**

---

## 🔐 Security & Privacy

### Customer Opt-Out

Customers can opt out by replying "STOP" to any SMS (Twilio handles automatically).

**Check opt-out status:**
```sql
SELECT * FROM customer_sms_preferences WHERE opted_in = false;
```

### Phone Number Formatting

All phone numbers are automatically formatted to E.164:
- Input: `2165551234` or `(216) 555-1234`
- Formatted: `+12165551234`
- Works for all US/Canada numbers

---

## 🔍 Monitoring

### View Recent SMS Activity

```sql
-- Last 20 messages
SELECT 
  to_phone,
  message_type,
  status,
  created_at,
  CASE 
    WHEN related_ro_id IS NOT NULL THEN 'RO Update'
    ELSE 'Manual'
  END AS source
FROM sms_logs
ORDER BY created_at DESC
LIMIT 20;

-- Delivery success rate
SELECT 
  status,
  COUNT(*) AS count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS percentage
FROM sms_logs
GROUP BY status;

-- Monthly costs
SELECT 
  DATE_TRUNC('month', created_at) AS month,
  COUNT(*) AS messages,
  SUM(cost) AS total_cost
FROM sms_logs
GROUP BY month
ORDER BY month DESC;
```

---

## 🆘 Troubleshooting

### SMS Not Sending

**Check 1: Twilio Credentials**
```bash
# Verify in Vercel that all 3 variables are set
TWILIO_ACCOUNT_SID ✓
TWILIO_AUTH_TOKEN ✓
TWILIO_PHONE_NUMBER ✓
```

**Check 2: Customer Phone Number**
```sql
-- Verify RO has customer phone
SELECT ro_number, customer_phone 
FROM crm_repair_orders 
WHERE ro_number = 'RO-00670';

-- Update if missing
UPDATE crm_repair_orders 
SET customer_phone = '2165551234'
WHERE ro_number = 'RO-00670';
```

**Check 3: SMS Logs**
```sql
-- Check for errors
SELECT 
  to_phone,
  error_message,
  created_at
FROM sms_logs
WHERE status = 'failed'
ORDER BY created_at DESC;
```

**Check 4: Twilio Console**
- View message logs: https://console.twilio.com/us1/monitor/logs/sms
- Check account balance
- Verify phone number is active

### Status Not Triggering SMS

**Verify status is in trigger list:**
```typescript
// Only these statuses send automatic SMS:
['insurance', 'estimate_approval', 'parts_ordered', 'in_repair', 
 'painting', 'quality_control', 'ready_pickup', 'completed']
```

**Check template exists:**
```sql
SELECT * FROM sms_templates 
WHERE template_name = 'ro_status_ready_pickup';
```

---

## 📋 Quick Reference

### Customer SMS Triggers

✅ Status changes to specific statuses (8 total)  
✅ Manual send from RO details page  
❌ New appointments (NO staff notifications)  
❌ New tow requests (NO staff notifications)  

### Setup Checklist

- [ ] Run `CUSTOMER_SMS_SETUP.sql` in Supabase
- [ ] Add Twilio credentials to Vercel
- [ ] Redeploy application
- [ ] Test status update SMS
- [ ] Test manual SMS
- [ ] Verify logs in Supabase
- [ ] Check Twilio console

### Files Reference

- `CUSTOMER_SMS_SETUP.sql` - Database setup (run in Supabase)
- `migrations/add_customer_sms_only.sql` - Full migration file
- `lib/smsNotifications.ts` - Customer notification logic
- `app/admin/staff/crm/SendSMSButton.tsx` - Manual SMS component
- `app/api/sms/send/route.ts` - SMS sending API

---

## 🎊 Summary

**What's Included:**
- ✅ Automatic customer SMS on RO status changes
- ✅ Manual SMS from RO details page
- ✅ SMS logging and tracking
- ✅ Cost monitoring
- ✅ Customer opt-out support

**What's NOT Included:**
- ❌ Staff notifications (removed)
- ❌ Appointment alerts to staff (removed)
- ❌ Tow request alerts to staff (removed)

**Cost:** ~$2-3/month for typical usage  
**Setup Time:** ~10 minutes

---

## 📞 Support

- **Twilio Console**: https://console.twilio.com
- **Vercel Dashboard**: https://vercel.com/andres-projects-1b1915bc/clevelandbody-site
- **SMS Logs Query**: `SELECT * FROM sms_logs ORDER BY created_at DESC LIMIT 20;`

**Ready to go! 🚀**
