# Audatex Falcon/Novo Integration Plan for Cleveland Auto Body

## Executive Summary

This document outlines the integration plan between Cleveland Auto Body's web application (clevelandbody.com) and Audatex Falcon/Novo Estimating System. This integration will streamline the workflow from customer appointment booking to professional estimate creation.

---

## ⚠️ IMPORTANT: Prerequisites & Considerations

### 1. **Audatex Account & Licensing Required**
Before integration can begin, Cleveland Auto Body must:
- ✅ Have an active Audatex subscription
- ✅ Have login credentials for Audatex Falcon/Novo system
- ✅ Obtain API credentials from Audatex (client_id, client_secret, username, password)
- ✅ Contact Audatex Integration team: (866) 420-2048 or AXUS.AASupportContact@audatex.com

### 2. **CIECA Membership**
- Audatex uses CIECA BMS 5.7 standard for data exchange
- Your business may need CIECA membership: https://www.cieca.com/
- Contact CIECA to determine membership requirements

### 3. **Integration Costs**
- Audatex API access may have additional fees
- Development and testing time: 4-8 weeks
- Ongoing maintenance and support costs

### 4. **Technical Requirements**
- SSL certificate for secure communication
- Ability to consume REST APIs (JSON format)
- Ability to expose webhook endpoints
- VPN or IP whitelisting (optional for enhanced security)

---

## What This Integration Would Do

### Current Workflow (Without Integration):
1. Customer submits appointment/estimate request on clevelandbody.com
2. Staff views request in Staff Portal
3. **Manual Step:** Staff logs into Audatex separately
4. **Manual Step:** Staff re-enters all customer/vehicle data into Audatex
5. **Manual Step:** Staff creates estimate in Audatex
6. **Manual Step:** Staff downloads/exports estimate
7. **Manual Step:** Staff uploads estimate back to CRM or emails customer

### Proposed Workflow (With Integration):
1. Customer submits appointment/estimate request on clevelandbody.com ✅
2. Staff views request in Staff Portal ✅
3. **Automated:** Click "Create Estimate in Audatex" button
4. **Automated:** Data syncs to Audatex (customer, vehicle, damage info)
5. **Automated:** Estimate created in Audatex system
6. Staff completes estimate details in Audatex (parts, labor, etc.)
7. **Automated:** Completed estimate syncs back to CRM
8. **Automated:** Estimate document stored in repair order
9. **Automated:** Customer notified via email with estimate PDF

---

## Integration Architecture

### API Endpoints Provided by Audatex

#### 1. **Authentication**
```
POST https://api-prod.audatex.com/connect/token
```
- Returns OAuth2 bearer token
- Token expires after 12 hours (43,200 seconds)

#### 2. **Create Assignment (Start Estimate)**
```
POST https://api-prod.audatex.com/assignments
```
- Sends customer, vehicle, and damage information
- Creates new estimate in Audatex system

#### 3. **Get Document (Retrieve Estimate)**
```
GET https://api-prod.audatex.com/GetDocuments/api/v1/claims/{assignmentId}/document/{locator}
```
- Retrieves completed estimate (XML, PDF, images)

#### 4. **Webhook (Receive Completion Notification)**
```
POST https://clevelandbody.com/api/webhooks/audatex/estimate-complete
```
- Audatex sends notification when estimate is complete
- Your system retrieves completed estimate automatically

---

## Implementation Plan

### Phase 1: Setup & Configuration (Week 1-2)

**Tasks:**
1. **Contact Audatex Integration Team**
   - Email: AXUS.AASupportContact@audatex.com
   - Phone: (866) 420-2048
   - Request API credentials and integration guide

2. **CIECA Membership**
   - Contact CIECA: https://www.cieca.com/
   - Determine if membership is required
   - Obtain CIECA BMS 5.7 schema if needed

3. **Technical Setup**
   - Obtain API credentials (client_id, client_secret, username, password)
   - Set up test environment credentials
   - Configure IP whitelisting (if required)

4. **Environment Variables**
   - Add to Vercel/production:
     ```
     AUDATEX_CLIENT_ID=your-client-id
     AUDATEX_CLIENT_SECRET=your-client-secret
     AUDATEX_USERNAME=your-username
     AUDATEX_PASSWORD=your-password
     AUDATEX_API_BASE_URL=https://api-demo.audatex.com (test)
     AUDATEX_API_BASE_URL=https://api-prod.audatex.com (production)
     ```

### Phase 2: Development (Week 3-5)

**Files to Create:**

#### 1. **Audatex Service Module**
```
app/lib/audatex/audatexService.ts
```
- Authentication (OAuth2)
- Create assignment (start estimate)
- Get documents (retrieve estimates)
- Error handling and retries

#### 2. **API Routes**
```
app/api/audatex/auth/route.ts          - Authenticate with Audatex
app/api/audatex/create-assignment/route.ts - Create estimate
app/api/audatex/get-document/route.ts - Retrieve estimate
app/api/webhooks/audatex/estimate-complete/route.ts - Receive notifications
```

#### 3. **Database Schema Updates**
```sql
-- Add Audatex tracking columns to repair_orders table
ALTER TABLE crm_repair_orders ADD COLUMN audatex_assignment_id VARCHAR(255);
ALTER TABLE crm_repair_orders ADD COLUMN audatex_claim_number VARCHAR(255);
ALTER TABLE crm_repair_orders ADD COLUMN audatex_estimate_status VARCHAR(50);
ALTER TABLE crm_repair_orders ADD COLUMN audatex_estimate_url TEXT;
ALTER TABLE crm_repair_orders ADD COLUMN audatex_estimate_pdf_url TEXT;
ALTER TABLE crm_repair_orders ADD COLUMN audatex_last_sync TIMESTAMP;

-- Create Audatex sync log table
CREATE TABLE audatex_sync_log (
  id SERIAL PRIMARY KEY,
  repair_order_id INTEGER REFERENCES crm_repair_orders(id),
  assignment_id VARCHAR(255),
  claim_number VARCHAR(255),
  sync_type VARCHAR(50), -- 'create_assignment', 'estimate_complete', 'get_document'
  request_payload JSONB,
  response_payload JSONB,
  status VARCHAR(50), -- 'success', 'error'
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. **UI Components**
```
app/admin/staff/components/AudatexSyncButton.tsx - Create estimate button
app/admin/staff/components/AudatexEstimateStatus.tsx - Show sync status
app/admin/staff/components/AudatexEstimateViewer.tsx - View estimate
```

### Phase 3: Testing (Week 6-7)

**System Integration Testing (SIT):**
1. Test authentication
2. Test create assignment
3. Test estimate completion webhook
4. Test document retrieval
5. Test error handling and retries

**User Acceptance Testing (UAT):**
1. Schedule with Audatex (5 days in advance)
2. Test complete workflow with real data
3. Verify data accuracy
4. Test edge cases (missing data, errors, timeouts)

### Phase 4: Go Live (Week 8)

**Production Deployment:**
1. Update environment variables to production API
2. Deploy code to Vercel
3. Configure production webhooks
4. Monitor first 10 estimates closely
5. Train staff on new workflow

---

## Technical Implementation Details

### 1. Authentication Flow

```typescript
// app/lib/audatex/audatexService.ts

export async function authenticateAudatex() {
  const response = await fetch('https://api-prod.audatex.com/connect/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.AUDATEX_CLIENT_ID!,
      client_secret: process.env.AUDATEX_CLIENT_SECRET!,
      grant_type: 'client_credentials',
      scope: 'b2b.fnol.documents',
      username: process.env.AUDATEX_USERNAME!,
      password: process.env.AUDATEX_PASSWORD!,
    }),
  });

  const data = await response.json();
  return data.access_token; // Valid for 12 hours
}
```

### 2. Create Assignment (Start Estimate)

```typescript
export async function createAssignment(repairOrder: RepairOrder) {
  const token = await authenticateAudatex();
  
  const assignmentData = {
    claimNumber: repairOrder.ro_number,
    customerInfo: {
      firstName: repairOrder.customer_first_name,
      lastName: repairOrder.customer_last_name,
      phone: repairOrder.customer_phone,
      email: repairOrder.customer_email,
      address: repairOrder.customer_address,
    },
    vehicleInfo: {
      year: repairOrder.vehicle_year,
      make: repairOrder.vehicle_make,
      model: repairOrder.vehicle_model,
      vin: repairOrder.vehicle_vin,
    },
    damageDescription: repairOrder.damage_description,
    webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/audatex/estimate-complete`,
  };

  const response = await fetch('https://api-prod.audatex.com/assignments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(assignmentData),
  });

  const data = await response.json();
  
  // Save assignment ID to database
  await supabase
    .from('crm_repair_orders')
    .update({
      audatex_assignment_id: data.assignmentId,
      audatex_claim_number: data.claimNumber,
      audatex_estimate_status: 'in_progress',
    })
    .eq('id', repairOrder.id);

  return data;
}
```

### 3. Webhook Handler (Receive Estimate Completion)

```typescript
// app/api/webhooks/audatex/estimate-complete/route.ts

export async function POST(request: NextRequest) {
  const payload = await request.json();
  
  const {
    Header: { Rquid, MessageType },
    Body: { ClaimNumber, Links },
  } = payload;

  // Find repair order by claim number
  const { data: repairOrder } = await supabase
    .from('crm_repair_orders')
    .select('*')
    .eq('audatex_claim_number', ClaimNumber)
    .single();

  if (!repairOrder) {
    return NextResponse.json({ error: 'Repair order not found' }, { status: 404 });
  }

  // Download estimate documents
  const documents = [];
  for (const link of Links) {
    const doc = await getDocument(link.Href);
    documents.push(doc);
  }

  // Update repair order
  await supabase
    .from('crm_repair_orders')
    .update({
      audatex_estimate_status: 'completed',
      audatex_estimate_url: Links.find(l => l.Rel === 'claimXml')?.Href,
      audatex_estimate_pdf_url: Links.find(l => l.Rel === 'printImages')?.Href,
      audatex_last_sync: new Date().toISOString(),
    })
    .eq('id', repairOrder.id);

  // Send notification to customer (optional)
  // await sendEstimateEmail(repairOrder, documents);

  return NextResponse.json({ success: true });
}
```

### 4. UI Integration

```tsx
// app/admin/staff/components/AudatexSyncButton.tsx

export function AudatexSyncButton({ repairOrderId }: { repairOrderId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSync = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/audatex/create-assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repairOrderId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync with Audatex');
      }

      alert('Estimate created in Audatex successfully!');
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleSync}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creating Estimate...' : 'Create Estimate in Audatex'}
      </button>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
}
```

---

## Data Flow Diagram

```
Customer
   |
   v
[Cleveland Auto Body Website]
   |
   | 1. Submit appointment/estimate request
   v
[Supabase Database]
   |
   | 2. Staff views in Staff Portal
   v
[Staff Dashboard]
   |
   | 3. Click "Create Estimate in Audatex"
   v
[API: /api/audatex/create-assignment]
   |
   | 4. Authenticate with Audatex
   v
[Audatex OAuth API]
   |
   | 5. Get access token
   v
[API: Create Assignment]
   |
   | 6. Send customer/vehicle/damage data
   v
[Audatex Falcon/Novo System]
   |
   | 7. Estimate created, estimator completes details
   v
[Audatex Estimating Workflow]
   |
   | 8. Estimate completed by estimator
   v
[Audatex Webhook]
   |
   | 9. POST estimate-complete notification
   v
[Webhook: /api/webhooks/audatex/estimate-complete]
   |
   | 10. Retrieve estimate documents (XML, PDF)
   v
[API: Get Documents]
   |
   | 11. Save estimate to database
   v
[Supabase Database]
   |
   | 12. Update repair order status
   v
[Staff Dashboard - Updated]
   |
   | 13. Notify customer (optional)
   v
[Customer Email/Portal]
```

---

## Benefits of Integration

### 1. **Time Savings**
- **Before:** 10-15 minutes per estimate (manual data entry)
- **After:** 30 seconds (automated sync)
- **Savings:** 95% reduction in data entry time

### 2. **Accuracy**
- Eliminates manual data entry errors
- Ensures consistency between systems
- Reduces rework and corrections

### 3. **Customer Experience**
- Faster estimate turnaround
- Automated notifications
- Professional estimate documents

### 4. **Staff Efficiency**
- One-click estimate creation
- Automatic status updates
- Less context switching between systems

### 5. **Audit Trail**
- Complete sync history
- Error tracking and resolution
- Compliance documentation

---

## Costs & Timeline

### Development Costs
| Phase | Duration | Estimated Hours | Notes |
|-------|----------|----------------|-------|
| Setup & Configuration | 1-2 weeks | 20-30 hours | Audatex account setup, credentials |
| Development | 3-4 weeks | 60-80 hours | API integration, UI components |
| Testing | 2 weeks | 30-40 hours | SIT, UAT with Audatex |
| Deployment | 1 week | 10-15 hours | Production deployment, training |
| **Total** | **7-9 weeks** | **120-165 hours** | |

### Ongoing Costs
- Audatex subscription: Contact Audatex for pricing
- CIECA membership: ~$500-$2,000/year (if required)
- API usage fees: Contact Audatex for pricing
- Maintenance: 5-10 hours/month

---

## Risks & Mitigation

### Risk 1: Audatex API Access Denied
**Mitigation:** Contact Audatex sales/integration team early to confirm API access is included in your subscription

### Risk 2: CIECA Membership Required
**Mitigation:** Budget for CIECA membership fees and factor into timeline

### Risk 3: Data Mapping Complexity
**Mitigation:** Start with minimum viable data set, expand gradually

### Risk 4: Webhook Reliability
**Mitigation:** Implement retry logic, polling fallback, manual refresh option

### Risk 5: API Downtime
**Mitigation:** Cache tokens, implement exponential backoff, show clear error messages to staff

---

## Alternative: Manual Workflow (No Integration)

If API integration is not feasible due to cost or technical constraints:

### Option A: Single Sign-On (SSO)
- Add "Open in Audatex" button
- Pre-fill browser with customer/vehicle data
- Use browser automation or clipboard sharing
- Staff completes estimate in Audatex
- Manually upload PDF back to CRM

### Option B: Export/Import
- Export customer/vehicle data as CSV or JSON
- Provide import template for Audatex
- Manual import into Audatex system
- Manual download and upload of estimate

### Option C: Hybrid Approach
- Automate data export only
- Manual creation in Audatex
- Manual or automated retrieval of completed estimates

---

## Next Steps

### Immediate Actions (This Week):
1. ✅ **Confirm Audatex Account**
   - Do you have an active Audatex subscription?
   - Do you have login credentials?

2. ✅ **Contact Audatex Integration Team**
   - Email: AXUS.AASupportContact@audatex.com
   - Phone: (866) 420-2048
   - Request: API access, credentials, integration guide

3. ✅ **Review Integration Guide**
   - Download from Audatex
   - Review technical requirements
   - Estimate internal costs

4. ✅ **Budget Approval**
   - Development costs (120-165 hours)
   - Ongoing API/subscription fees
   - CIECA membership (if needed)

### Short Term (Next 2-4 Weeks):
1. Receive API credentials from Audatex
2. Set up test environment
3. Begin Phase 1: Setup & Configuration

### Long Term (2-3 Months):
1. Complete development and testing
2. Deploy to production
3. Train staff on new workflow
4. Monitor and optimize

---

## Questions to Answer Before Starting

1. **Do you have an active Audatex subscription?** (Yes/No)
2. **Do you have API access included?** (Yes/No/Unknown)
3. **Do you have login credentials?** (Yes/No)
4. **What is your estimated volume?** (estimates per month)
5. **What is your budget?** (for development and ongoing costs)
6. **What is your timeline?** (when do you need this live?)
7. **Who will maintain this integration?** (internal team or external developer)

---

## Recommendation

**I recommend starting with a discovery call with Audatex to:**
1. Confirm API access is available and included in your subscription
2. Understand the full costs (API fees, CIECA membership, etc.)
3. Get official integration guide and data mapping documentation
4. Discuss technical requirements and timeline

**Contact:**
- Email: AXUS.AASupportContact@audatex.com
- Phone: (866) 420-2048
- Support: MySupportGarage.com

**Once you have this information, I can:**
1. Build a detailed technical specification
2. Create the integration code
3. Set up testing environment
4. Deploy to production

---

## Summary

**What:** Integrate Cleveland Auto Body website with Audatex Falcon/Novo estimating system

**Why:** Eliminate manual data entry, improve accuracy, save time, enhance customer experience

**How:** REST API integration using OAuth2, webhooks, and CIECA BMS 5.7 standard

**Timeline:** 7-9 weeks (setup, development, testing, deployment)

**Cost:** 120-165 development hours + Audatex subscription + CIECA membership (if required)

**Next Step:** Contact Audatex Integration Team to confirm API access and obtain credentials

---

**Questions?** Let me know what information you need from Audatex, and I can help you prepare for the integration once you have access confirmed.
