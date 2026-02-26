# SMS Functionality Setup Guide

## Overview
Complete SMS notification system for Cleveland Auto Body using Twilio.

## Features Implemented

### 1. Staff Notifications (Automatic)
- ✅ New appointment created → SMS to staff
- ✅ New tow request created → SMS to staff
- ✅ Staff can configure which notifications to receive

### 2. Customer Notifications (Automatic)
- ✅ RO status: estimate_approval → SMS to customer
- ✅ RO status: parts_ordered → SMS to customer
- ✅ RO status: in_repair → SMS to customer
- ✅ RO status: ready_pickup → SMS to customer
- ✅ RO status: completed → SMS to customer

### 3. Manual SMS (From RO Details)
- ✅ "Send SMS" button in Edit RO modal
- ✅ Quick message templates
- ✅ Custom message capability
- ✅ 1600 character limit

### 4. SMS Tracking
- ✅ All SMS logged to database
- ✅ Track sent/failed status
- ✅ Link to appointments/ROs
- ✅ View SMS history per RO

---

## Required Environment Variables

Add these to your Vercel/deployment environment:

```bash
# Twilio Account Credentials
TWILIO_ACCOUNT_SID=AC...your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+15551234567
```

### How to Get Twilio Credentials:

1. **Log in to Twilio.com**
   - Go to: https://www.twilio.com/console
   - Sign in with your account

2. **Get Account SID and Auth Token**
   - On the dashboard, you'll see:
     - **Account SID** (starts with "AC")
     - **Auth Token** (click "show" to reveal)
   - Copy both values

3. **Get/Buy a Phone Number**
   - Go to: Phone Numbers → Manage → Active numbers
   - If you don't have one:
     - Click "Buy a number"
     - Choose a number with SMS capability
     - Purchase it (~$1/month)
   - Copy the phone number in E.164 format: `+15551234567`

4. **Add to Vercel Environment Variables**
   ```
   https://vercel.com/your-project/settings/environment-variables
   
   Add three variables:
   - TWILIO_ACCOUNT_SID
   - TWILIO_AUTH_TOKEN  
   - TWILIO_PHONE_NUMBER
   ```

---

## Database Setup

### Run Migration

**CRITICAL:** Run this SQL in Supabase before using SMS features:

```bash
# Location: /migrations/add_sms_functionality.sql
```

**Steps:**
1. Open Supabase Dashboard: https://app.supabase.com
2. Select Cleveland Auto Body project
3. Go to SQL Editor
4. Copy contents of `migrations/add_sms_functionality.sql`
5. Paste and click "Run"
6. Verify tables created:
   - `staff_sms_settings`
   - `sms_templates`
   - `sms_logs`
   - `customer_sms_preferences`

---

## Staff SMS Setup

### 1. Add Staff Phone Numbers

Run this SQL for each staff member who should receive notifications:

```sql
-- Add staff SMS settings
INSERT INTO staff_sms_settings (
  staff_user_id,
  phone_number,
  notify_new_appointments,
  notify_new_tow_requests,
  notify_urgent_ros,
  is_active
) VALUES (
  '[staff_user_id_from_staff_users_table]',
  '+15551234567',  -- Staff phone in E.164 format
  TRUE,            -- Notify about new appointments
  TRUE,            -- Notify about new tow requests
  TRUE,            -- Notify about urgent ROs
  TRUE             -- Active
);

-- Example: Get staff_user_id first
SELECT id, email, full_name FROM staff_users WHERE email = 'manager@clevelandbody.com';

-- Then use that ID in the INSERT above
```

### 2. Multiple Staff Members

```sql
-- Add multiple staff members
INSERT INTO staff_sms_settings (staff_user_id, phone_number, notify_new_appointments, notify_new_tow_requests) VALUES
  ('[manager_id]', '+15551234567', TRUE, TRUE),
  ('[tech_id]', '+15559876543', TRUE, FALSE),
  ('[admin_id]', '+15555555555', FALSE, TRUE);
```

### 3. Update Staff Settings

```sql
-- Enable/disable notifications for a staff member
UPDATE staff_sms_settings 
SET 
  notify_new_appointments = TRUE,
  notify_new_tow_requests = FALSE,
  is_active = TRUE
WHERE staff_user_id = '[staff_id]';

-- Deactivate staff member (stop all SMS)
UPDATE staff_sms_settings 
SET is_active = FALSE
WHERE phone_number = '+15551234567';
```

---

## SMS Templates

Default templates are created automatically. You can customize them:

```sql
-- View all templates
SELECT template_name, template_type, message_template 
FROM sms_templates 
ORDER BY template_type, template_name;

-- Update a template
UPDATE sms_templates 
SET message_template = 'Your custom message here with {variables}'
WHERE template_name = 'ro_status_ready_pickup';

-- Variables available in templates:
-- {customer_name}, {customer_phone}, {service_type}
-- {appointment_date}, {appointment_time}, {vehicle_info}
-- {ro_number}, {estimate_amount}, {estimated_completion}
-- {location}, {is_urgent}
```

---

## Testing

### Test 1: Send Manual SMS from RO
1. Navigate to: https://clevelandbody.com/admin/staff/crm
2. Click any RO → Click "Edit"
3. Click "Send SMS" button (green, top right)
4. Select a quick message or type custom
5. Click "Send SMS"
6. ✅ Verify customer receives SMS

### Test 2: Auto-SMS on New Appointment
1. Go to: https://clevelandbody.com/schedule
2. Fill out appointment form
3. Submit
4. ✅ Verify staff receive SMS notification

### Test 3: Auto-SMS on RO Status Change
1. Edit any RO
2. Change status to "Ready for Pickup"
3. Save
4. ✅ Verify customer receives SMS

### Test 4: Check SMS Logs
```sql
-- View recent SMS logs
SELECT 
  to_phone,
  message_type,
  status,
  SUBSTRING(message_body, 1, 50) as message_preview,
  created_at
FROM sms_logs 
ORDER BY created_at DESC 
LIMIT 20;

-- View SMS for specific RO
SELECT * FROM sms_logs 
WHERE related_ro_id = '[ro_id]'
ORDER BY created_at DESC;
```

---

## Cost Estimate

### Twilio SMS Pricing (US):
- **Outbound SMS:** ~$0.0079 per message
- **Phone Number:** ~$1.00/month
- **Example Monthly Cost:**
  - 100 customer notifications: $0.79
  - 50 staff notifications: $0.40
  - **Total:** ~$2.20/month + $1 number = **$3.20/month**

### Usage Scenarios:
- **50 appointments/month:**
  - 50 staff notifications
  - 200 customer updates (avg 4 per RO)
  - Total: 250 SMS × $0.0079 = **$1.98/month**

---

## Customer Opt-Out

### Handle Opt-Out Requests:

```sql
-- Mark customer as opted out
INSERT INTO customer_sms_preferences (phone_number, opted_in, opt_out_date)
VALUES ('+15551234567', FALSE, NOW())
ON CONFLICT (phone_number) 
DO UPDATE SET opted_in = FALSE, opt_out_date = NOW();

-- Re-enable customer SMS
UPDATE customer_sms_preferences 
SET opted_in = TRUE, opt_out_date = NULL
WHERE phone_number = '+15551234567';
```

Customers who opt out will not receive:
- ✅ Status update SMS
- ✅ Manual SMS from staff
- ❌ Staff will NOT be notified (staff SMS always work)

---

## Troubleshooting

### SMS Not Sending?

1. **Check Twilio Credentials:**
```bash
# Verify env variables are set in Vercel
https://vercel.com/your-project/settings/environment-variables
```

2. **Check Twilio Console:**
   - Go to: https://www.twilio.com/console/sms/logs
   - View error messages
   - Common issues:
     - Invalid phone number format
     - Insufficient account balance
     - Number not SMS-enabled

3. **Check SMS Logs:**
```sql
SELECT * FROM sms_logs 
WHERE status = 'failed' 
ORDER BY created_at DESC 
LIMIT 10;
```

4. **Phone Number Format:**
   - Must be E.164 format: `+1 (country code) + 10 digits`
   - Example: `+15551234567`
   - Not: `555-123-4567` or `(555) 123-4567`

### No Staff Receiving Notifications?

```sql
-- Check active staff settings
SELECT 
  s.email,
  sms.phone_number,
  sms.notify_new_appointments,
  sms.notify_new_tow_requests,
  sms.is_active
FROM staff_sms_settings sms
JOIN staff_users s ON s.id = sms.staff_user_id
WHERE sms.is_active = TRUE;

-- If empty, add staff members (see "Staff SMS Setup" above)
```

---

## API Endpoints

### Send SMS (POST)
```typescript
POST /api/sms/send
Body: {
  to: "+15551234567",
  message: "Your message here",
  messageType: "manual",
  relatedRoId: "[ro_id]",
  sentBy: "Staff Name"
}
```

### Get SMS Logs (GET)
```typescript
GET /api/sms/send?ro_id=[ro_id]
GET /api/sms/send?appointment_id=[appt_id]
GET /api/sms/send?limit=50
```

---

## Security Considerations

1. **Auth Token Protection:**
   - NEVER commit Twilio credentials to git
   - Use environment variables only
   - Rotate token if exposed

2. **Customer Privacy:**
   - Honor opt-out requests immediately
   - Don't share phone numbers
   - Log all SMS for compliance

3. **Rate Limiting:**
   - Twilio has built-in rate limits
   - Don't send bulk SMS without proper authorization
   - Monitor for unusual activity

---

## Files Created/Modified

### New Files:
1. `migrations/add_sms_functionality.sql` - Database schema
2. `app/api/sms/send/route.ts` - SMS API endpoint
3. `lib/smsNotifications.ts` - SMS helper functions
4. `app/admin/staff/crm/SendSMSButton.tsx` - Manual SMS component

### Modified Files:
1. `app/api/appointments/route.ts` - Added auto-SMS on appointment
2. `app/api/crm/repair-orders/[id]/route.ts` - Added auto-SMS on status change
3. `app/admin/staff/crm/EditRepairOrderModal.tsx` - Added Send SMS button

---

## Next Steps

1. ✅ Add Twilio credentials to Vercel
2. ✅ Run database migration in Supabase
3. ✅ Add staff phone numbers to `staff_sms_settings`
4. ✅ Test manual SMS from RO modal
5. ✅ Test auto-SMS on new appointment
6. ✅ Test auto-SMS on RO status change
7. ✅ Monitor SMS logs and costs

---

## Support

**Twilio Documentation:**
- SMS API: https://www.twilio.com/docs/sms
- Phone Numbers: https://www.twilio.com/docs/phone-numbers
- Pricing: https://www.twilio.com/sms/pricing/us

**For Issues:**
1. Check Twilio console logs
2. Check `sms_logs` table in Supabase
3. Verify environment variables in Vercel
4. Check browser console for errors

---

**Status:** ✅ **COMPLETE - Ready for Configuration**

All SMS functionality is implemented and ready to use once Twilio credentials are configured.
