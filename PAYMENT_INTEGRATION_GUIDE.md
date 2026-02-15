# 💳 Payment Integration Guide - Cleveland Auto Body

## Overview

This guide covers adding payment functionality for deposits on:
- ✅ Appointments (Schedule Estimate)
- ✅ Tow Service Requests
- ✅ Express Care Requests
- ✅ Customer Portal

---

## 📋 Payment Methods to Support

### Recommended Approach: Stripe Payment Links + Direct Integration

| Payment Method | Implementation | Complexity | Cost |
|----------------|----------------|------------|------|
| **Credit/Debit Cards** | Stripe | Easy | 2.9% + $0.30 |
| **Apple Pay** | Stripe | Easy | 2.9% + $0.30 |
| **Venmo** | Stripe (via Link) | Easy | 2.9% + $0.30 |
| **Zelle** | Manual (instructions only) | Easy | FREE* |
| **Apple Cash** | Manual (instructions only) | Easy | FREE* |

*Zelle and Apple Cash are peer-to-peer; no API integration available - provide payment instructions instead.

---

## 🔑 Required Information & Accounts

### 1. Stripe Account (Primary Payment Processor)

**What you need to provide**:

#### A. Business Information
```
✅ Legal Business Name: Cleveland Auto Body (or your legal entity)
✅ Business Type: LLC / Sole Proprietorship / Corporation
✅ Tax ID (EIN): Your employer identification number
✅ Business Address: 17017 Saint Clair Ave, Cleveland, OH
✅ Business Phone: (216) 481-8696
✅ Business Website: clevelandbody.com
✅ Industry: Auto Body Repair / Collision Repair
```

#### B. Bank Account for Payouts
```
✅ Bank Name: 
✅ Account Holder Name: 
✅ Routing Number: (9 digits)
✅ Account Number: 
✅ Account Type: Checking / Savings
```

#### C. Owner/Representative Information
```
✅ Full Name: 
✅ Date of Birth: 
✅ SSN (last 4 digits for verification): 
✅ Home Address: 
✅ Email: 
✅ Phone: 
```

#### D. Services Information
```
✅ Product/Service Description: "Auto body repair services, collision repair, towing services"
✅ Average Transaction Amount: $50 - $500 (for deposits)
✅ Expected Monthly Volume: Estimate (e.g., $5,000 - $10,000)
```

---

### 2. Stripe API Keys (After Account Setup)

After creating your Stripe account, you'll get:

```bash
# Test Keys (for development)
STRIPE_TEST_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_TEST_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Live Keys (for production)
STRIPE_LIVE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_LIVE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
```

**Where to find**:
1. Go to: https://dashboard.stripe.com
2. Click: "Developers" → "API keys"
3. Copy both keys

---

### 3. Zelle Information (Manual Payment)

**What to provide to customers**:

```
Business Name: Cleveland Auto Body
Zelle Email: your-business-email@domain.com
   OR
Zelle Phone: (216) 481-8696

Instructions:
1. Open your banking app
2. Select "Send Money with Zelle"
3. Enter: [email or phone above]
4. Amount: $[deposit amount]
5. Note: Include your name and appointment ID
```

---

### 4. Apple Cash Information (Manual Payment)

**What to provide to customers**:

```
Apple Cash Phone: (216) 481-8696
   OR
Apple Cash Email: your-business-email@domain.com

Instructions:
1. Open Messages app
2. Start conversation with [phone/email above]
3. Tap Apple Pay button
4. Enter amount: $[deposit amount]
5. Include note with your name and appointment ID
```

---

## 💰 Deposit Amount Recommendations

### Suggested Deposit Structure

```javascript
const DEPOSIT_AMOUNTS = {
  estimate: {
    standard: 0,        // Free estimates
    premium: 50,        // Rush estimates (24hr)
    onsite: 100        // On-site estimates
  },
  
  towService: {
    local: 75,         // Within 10 miles
    longDistance: 150,  // 10-30 miles
    emergency: 200     // After hours/emergency
  },
  
  expressCare: {
    minor: 100,        // Small dents, scratches
    moderate: 200,     // Multiple panels
    major: 300         // Significant damage
  },
  
  appointment: {
    standard: 0,       // Regular booking
    priority: 50,      // Priority booking
    weekend: 75        // Weekend/after-hours
  }
}
```

---

## 🏗️ Implementation Architecture

### Phase 1: Simple Payment Links (Quickest - 1 day)

**Recommended for MVP**: Use Stripe Payment Links

```
Customer Flow:
1. Customer fills form → Submit
2. Redirect to Stripe Payment Link
3. Customer pays → Stripe confirms
4. Webhook updates appointment status
5. Send confirmation email
```

**Pros**: 
- ✅ No coding required
- ✅ Stripe handles UI
- ✅ PCI compliant automatically
- ✅ Works on all devices

**Cons**:
- ❌ Takes user away from your site
- ❌ Less customization

---

### Phase 2: Embedded Stripe Checkout (Recommended - 2-3 days)

**Better UX**: Stripe Checkout embedded in your site

```
Customer Flow:
1. Customer fills form
2. Click "Pay Deposit"
3. Stripe modal appears (overlay)
4. Customer pays in modal
5. Modal closes → Success message
6. Email confirmation sent
```

**Pros**:
- ✅ Stays on your site
- ✅ Professional appearance
- ✅ Mobile optimized
- ✅ Supports Apple Pay automatically

**Cons**:
- ❌ Requires some coding

---

### Phase 3: Custom Payment Form (Advanced - 5-7 days)

**Full Control**: Stripe Elements (custom form)

```
Customer Flow:
1. Customer fills form
2. Payment form shows inline
3. Enter card details
4. Submit → Process payment
5. Success message
```

**Pros**:
- ✅ Complete UI control
- ✅ Seamless experience
- ✅ Custom styling

**Cons**:
- ❌ More development time
- ❌ More testing required

---

## 📐 Technical Requirements

### Environment Variables Needed

Add to `.env.local` and Vercel:

```bash
# Stripe Keys (Test)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Stripe Keys (Production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx

# Stripe Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Payment Settings
NEXT_PUBLIC_DEPOSIT_AMOUNT_ESTIMATE=50
NEXT_PUBLIC_DEPOSIT_AMOUNT_TOW=75
NEXT_PUBLIC_DEPOSIT_AMOUNT_EXPRESS=100

# Zelle/Apple Cash (Manual)
NEXT_PUBLIC_ZELLE_EMAIL=payments@clevelandbody.com
NEXT_PUBLIC_ZELLE_PHONE=2164818696
NEXT_PUBLIC_APPLE_CASH_EMAIL=payments@clevelandbody.com
```

---

## 🗂️ Database Schema Changes

### Add Payment Tables

```sql
-- Payment transactions table
CREATE TABLE public.payment_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    tow_request_id UUID REFERENCES public.tow_requests(id) ON DELETE SET NULL,
    
    -- Payment details
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'usd',
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded', 'cancelled')),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'apple_pay', 'venmo', 'zelle', 'apple_cash')),
    
    -- Stripe details
    stripe_payment_intent_id TEXT,
    stripe_checkout_session_id TEXT,
    stripe_customer_id TEXT,
    
    -- Manual payment details (for Zelle/Apple Cash)
    manual_payment_reference TEXT,
    manual_payment_verified BOOLEAN DEFAULT FALSE,
    manual_payment_verified_by UUID REFERENCES public.staff_users(id),
    manual_payment_verified_at TIMESTAMPTZ,
    
    -- Customer info
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    
    -- Metadata
    description TEXT,
    notes TEXT,
    refund_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_payment_transactions_appointment_id ON public.payment_transactions(appointment_id);
CREATE INDEX idx_payment_transactions_stripe_payment_intent_id ON public.payment_transactions(stripe_payment_intent_id);
CREATE INDEX idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX idx_payment_transactions_created_at ON public.payment_transactions(created_at DESC);

-- RLS Policies
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Staff can view all payments
CREATE POLICY "Staff can view all payments"
    ON public.payment_transactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.staff_users
            WHERE auth_user_id = auth.uid() AND is_active = true
        )
    );

-- Staff can manage payments
CREATE POLICY "Staff can manage payments"
    ON public.payment_transactions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.staff_users
            WHERE auth_user_id = auth.uid() AND is_active = true
        )
    );

-- Customers can view their own payments
CREATE POLICY "Customers can view own payments"
    ON public.payment_transactions FOR SELECT
    USING (
        customer_email = (
            SELECT email FROM public.customer_users
            WHERE auth_user_id = auth.uid()
        )
    );

-- Add payment status to appointments
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS payment_required BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'not_required')),
ADD COLUMN IF NOT EXISTS payment_transaction_id UUID REFERENCES public.payment_transactions(id);

-- Add payment status to tow_requests
ALTER TABLE public.tow_requests
ADD COLUMN IF NOT EXISTS payment_required BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'not_required')),
ADD COLUMN IF NOT EXISTS payment_transaction_id UUID REFERENCES public.payment_transactions(id);
```

---

## 📝 API Endpoints Needed

### 1. Create Payment Intent
```typescript
// /app/api/payments/create-intent/route.ts
POST /api/payments/create-intent
Body: {
  amount: 5000,              // $50.00 in cents
  type: 'appointment' | 'tow' | 'express',
  referenceId: 'uuid',       // appointment_id, etc.
  customerEmail: 'email@example.com',
  customerName: 'John Doe'
}
Response: {
  clientSecret: 'pi_xxx_secret_xxx',
  paymentIntentId: 'pi_xxx'
}
```

### 2. Create Checkout Session
```typescript
// /app/api/payments/create-checkout/route.ts
POST /api/payments/create-checkout
Body: {
  amount: 5000,
  type: 'appointment',
  referenceId: 'uuid',
  successUrl: 'https://clevelandbody.com/success',
  cancelUrl: 'https://clevelandbody.com/cancel'
}
Response: {
  sessionId: 'cs_xxx',
  url: 'https://checkout.stripe.com/pay/cs_xxx'
}
```

### 3. Webhook Handler
```typescript
// /app/api/payments/webhook/route.ts
POST /api/payments/webhook
Headers: {
  stripe-signature: 'xxx'
}
Body: Stripe Event JSON

Handles:
- payment_intent.succeeded
- payment_intent.failed
- checkout.session.completed
- charge.refunded
```

### 4. Manual Payment Verification
```typescript
// /app/api/payments/verify-manual/route.ts
POST /api/payments/verify-manual
Body: {
  transactionId: 'uuid',
  verified: true,
  notes: 'Received Zelle payment'
}
```

---

## 🎨 UI Components Needed

### 1. Payment Method Selector
```tsx
<PaymentMethodSelector
  amount={50}
  onSelectMethod={(method) => handlePayment(method)}
  methods={['card', 'apple_pay', 'venmo', 'zelle', 'apple_cash']}
/>
```

### 2. Stripe Checkout Button
```tsx
<StripeCheckoutButton
  amount={5000}
  type="appointment"
  referenceId={appointmentId}
  onSuccess={() => handleSuccess()}
/>
```

### 3. Manual Payment Instructions
```tsx
<ManualPaymentInstructions
  method="zelle"
  amount={50}
  referenceId={appointmentId}
/>
```

### 4. Payment Status Badge
```tsx
<PaymentStatusBadge
  status="paid"
  amount={50}
/>
```

---

## 📧 Email Notifications Needed

### 1. Payment Receipt
```
Subject: Payment Receipt - Cleveland Auto Body

Hi [Customer Name],

Thank you for your payment!

Amount: $50.00
Payment Method: Visa ending in 4242
Transaction ID: pi_xxxxxxxxxxxxx
Date: January 15, 2024

Service: Schedule Estimate
Reference: APT-12345

Questions? Call us at (216) 481-8696

Cleveland Auto Body
17017 Saint Clair Ave, Cleveland, OH
```

### 2. Manual Payment Instructions
```
Subject: Payment Instructions - Cleveland Auto Body

Hi [Customer Name],

To complete your booking, please send a deposit of $50.00 using one of these methods:

ZELLE:
Send to: payments@clevelandbody.com
Include: Your name and APT-12345

APPLE CASH:
Send to: (216) 481-8696
Include: Your name and APT-12345

After sending, reply to this email with confirmation.

Cleveland Auto Body
(216) 481-8696
```

---

## 🔒 Security Considerations

### 1. PCI Compliance
- ✅ Use Stripe Elements (they handle card data)
- ✅ Never store card numbers
- ✅ Use HTTPS only
- ✅ Validate on server-side

### 2. Webhook Security
```typescript
// Verify Stripe signature
const sig = request.headers.get('stripe-signature');
const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
```

### 3. Amount Validation
```typescript
// Server-side validation
const MAX_DEPOSIT = 50000; // $500
if (amount > MAX_DEPOSIT) {
  throw new Error('Amount exceeds maximum');
}
```

---

## 📊 Pricing & Fees

### Stripe Fees
```
Standard Rate: 2.9% + $0.30 per transaction

Example:
$50 deposit → Fee: $1.75
You receive: $48.25

$100 deposit → Fee: $3.20
You receive: $96.80
```

### Payout Schedule
- **Standard**: 2 business days
- **Instant**: Available for additional fee (1%)

---

## 🚀 Implementation Steps

### Step 1: Stripe Account Setup (You do this - 30 minutes)

1. **Go to**: https://stripe.com/register
2. **Create account** with business information above
3. **Verify email**
4. **Add bank account** for payouts
5. **Verify identity** (may require documents)
6. **Activate account**
7. **Get API keys** from Dashboard → Developers → API keys

---

### Step 2: Database Migration (I'll create - 1 hour)

```bash
# Run in Supabase SQL Editor
# Creates payment_transactions table
# Adds payment columns to appointments/tow_requests
# Sets up RLS policies
```

---

### Step 3: Environment Variables (You do - 5 minutes)

Add to Vercel:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

---

### Step 4: Code Implementation (I'll create - 2-3 days)

**Phase 1 - Simple Integration**:
- Payment method selector
- Stripe Checkout redirect
- Success/cancel pages
- Manual payment instructions
- Webhook handler
- Email notifications

**Phase 2 - Advanced Features**:
- Embedded checkout
- Payment history in portal
- Refund processing
- Manual payment verification (staff)

---

## 📋 Information Checklist

**To get started, provide me with**:

### ✅ Required NOW (for development):
- [ ] Stripe Test API Keys (pk_test_xxx and sk_test_xxx)
- [ ] Desired deposit amounts:
  - Estimate: $____
  - Tow Service: $____
  - Express Care: $____
- [ ] Zelle Email/Phone for manual payments
- [ ] Apple Cash Phone/Email for manual payments

### ✅ Required LATER (for production):
- [ ] Stripe Live API Keys
- [ ] Completed Stripe verification
- [ ] Bank account connected
- [ ] Webhook endpoint configured

---

## 💡 Recommendation

**Start with Phase 1 (Simple Integration)**:
1. Stripe Checkout for cards/Apple Pay/Venmo
2. Manual instructions for Zelle/Apple Cash
3. Basic webhook handling
4. Email confirmations

**Timeline**: 2-3 days of development

**Then expand to**:
- Embedded checkout
- Payment history
- Refunds
- Advanced features

---

## 🎯 Next Steps

**Tell me**:
1. Do you already have a Stripe account?
2. If yes, provide test API keys to start
3. If no, I'll guide you through account creation
4. What deposit amounts do you want?
5. Zelle/Apple Cash contact info?

Once you provide this information, I can start implementing! 🚀
