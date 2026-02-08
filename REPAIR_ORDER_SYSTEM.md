# Repair Order System - Complete Documentation

## Overview

This system provides comprehensive Repair Order management for Cleveland Auto Body, integrating the customer-facing appointment system with the internal BodyShop CRM.

## Key Features

### ✅ Automatic Conversion
- Convert completed appointments to Repair Orders with one click
- All customer data, vehicle info, insurance details automatically transferred
- Documents and photos migrated to CRM
- No data re-entry required

### ✅ Manual Creation
- Create Repair Orders directly in CRM
- Comprehensive form with all required fields
- Real-time validation
- Parts list management

### ✅ Complete Data Capture
Each Repair Order includes:
- **Customer Info**: First/last name, phone, address, email
- **Vehicle Info**: Year, make, model, VIN, color, license plate, mileage
- **Insurance Info**: Carrier, claim number, policy number, adjuster name/phone/email
- **Repair Details**: Damage description, priority, estimates
- **Financial**: Estimated total cost, final total cost
- **Timeline**: Planned start date, planned completion date, estimated duration
- **Parts List**: Required parts with quantities and estimated costs

### ✅ Data Management
- Customer information auto-saved to `crm_customers` table
- Vehicle information auto-saved to `crm_vehicles` table
- Insurance details stored with customer record
- Lookup by phone number prevents duplicates
- Updates existing records when data changes

## Database Schema

### New/Modified Tables

#### `crm_customers` (Enhanced)
```sql
- first_name, last_name, email, phone, address
- insurance_company, policy_number
- insurance_claim_number
- insurance_adjuster_name
- insurance_adjuster_phone
- insurance_adjuster_email
```

#### `crm_vehicles`
```sql
- customer_id (FK)
- year, make, model, vin (unique)
- color, license_plate, mileage
```

#### `crm_repair_orders` (Enhanced)
```sql
-- Link to source
- source_appointment_id (FK)
- source_repair_case_id (FK)

-- Customer info (denormalized for quick access)
- customer_first_name, customer_last_name
- customer_phone, customer_email, customer_address

-- Vehicle info (denormalized)
- vehicle_year, vehicle_make, vehicle_model, vehicle_vin

-- Insurance info
- insurance_carrier, insurance_claim_number
- insurance_contact_name, insurance_contact_phone, insurance_contact_email

-- Financial & Timeline
- estimated_total_cost, final_total_cost
- estimated_duration_days
- planned_start_date, planned_completion_date
```

#### `crm_repair_order_parts_list` (New)
```sql
- repair_order_id (FK)
- part_name, part_number
- quantity, estimated_cost
- notes, status (required/ordered/received/installed)
```

### RO Number Generation

Auto-generated using format: `RO-00001`, `RO-00002`, etc.

Function `generate_ro_number()` ensures unique sequential numbering.

## API Endpoints

### Convert Appointment to Repair Order
**POST** `/api/crm/convert-appointment-to-ro`

Request:
```json
{
  "appointment_id": "uuid"
}
```

Response:
```json
{
  "success": true,
  "repair_order": { ... },
  "customer": { ... },
  "vehicle": { ... },
  "message": "Successfully created Repair Order RO-00123"
}
```

**Process:**
1. Fetches appointment with related repair case
2. Creates or updates customer record
3. Creates or updates vehicle record
4. Generates RO number
5. Creates repair order with all data
6. Migrates documents/photos
7. Updates appointment with conversion note

### Create Repair Order Manually
**POST** `/api/crm/repair-orders`

Request:
```json
{
  "customer_first_name": "John",
  "customer_last_name": "Doe",
  "customer_phone": "2164818696",
  "customer_address": "123 Main St, Cleveland, OH 44110",
  "customer_email": "john@example.com",
  
  "vehicle_year": "2020",
  "vehicle_make": "Toyota",
  "vehicle_model": "Camry",
  "vehicle_vin": "1HGBH41JXMN109186",
  "vehicle_color": "White",
  "vehicle_license_plate": "ABC1234",
  "vehicle_mileage": 50000,
  
  "insurance_carrier": "State Farm",
  "insurance_claim_number": "CLM-123456",
  "insurance_policy_number": "POL-789012",
  "insurance_contact_name": "Jane Adjuster",
  "insurance_contact_phone": "2165551234",
  "insurance_contact_email": "jane@statefarm.com",
  
  "damage_description": "Front bumper damage from collision",
  "estimated_total_cost": 5000.00,
  "estimated_duration_days": 7,
  "planned_start_date": "2024-02-01",
  "priority": "medium",
  
  "parts_list": [
    {
      "part_name": "Front Bumper",
      "part_number": "BUM-2020-TC-F",
      "quantity": 1,
      "estimated_cost": 450.00,
      "notes": "OEM part required"
    }
  ]
}
```

### Get Repair Orders
**GET** `/api/crm/repair-orders`

Query params:
- `status` - Filter by status
- `ro_number` - Search by RO number

Returns all repair orders with customer, vehicle, and parts data.

## UI Components

### CreateRepairOrderForm
**Location:** `/app/admin/staff/crm/CreateRepairOrderForm.tsx`

**Features:**
- Multi-section form (Customer, Vehicle, Insurance, Repair Details, Parts)
- Real-time validation
- Parts list management (add/remove)
- Auto-calculated completion date
- VIN formatting (uppercase)
- Phone formatting
- Success/error messaging
- Loading states

**Usage:**
```tsx
<CreateRepairOrderForm
  onSuccess={(repairOrder) => {
    // Handle success
  }}
  onCancel={() => {
    // Handle cancel
  }}
/>
```

### ConvertToROButton
**Location:** `/app/admin/staff/appointments/ConvertToROButton.tsx`

**Features:**
- Only shows for completed appointments
- Confirmation dialog
- Loading states
- Error handling
- Success notification

**Usage:**
```tsx
<ConvertToROButton
  appointmentId={appointment.id}
  appointmentStatus={appointment.status}
  onSuccess={() => {
    // Refresh data
  }}
/>
```

### CRM Dashboard Integration
**Location:** `/app/admin/staff/crm/CRMDashboard.tsx`

**Features:**
- "Create New Repair Order" button in Repair Orders view
- Modal form for creation
- List of all repair orders
- Status/priority indicators

## Setup Instructions

### 1. Run Database Migration

```sql
-- Run this in Supabase SQL Editor
-- File: schema-repair-order-enhanced.sql

-- This will:
-- - Add missing fields to crm_customers
-- - Add missing fields to crm_repair_orders
-- - Create crm_repair_order_parts_list table
-- - Create generate_ro_number() function
-- - Add necessary indexes
-- - Set up RLS policies
```

### 2. Verify Tables Exist

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'crm_customers',
  'crm_vehicles',
  'crm_repair_orders',
  'crm_repair_order_parts_list'
);
```

### 3. Test RO Number Generation

```sql
SELECT generate_ro_number();
-- Should return: RO-00001
```

### 4. Add Convert Button to Appointments

In your appointments management interface, import and use:

```tsx
import ConvertToROButton from './appointments/ConvertToROButton'

// In your appointment list rendering:
{appointment.status === 'completed' && (
  <ConvertToROButton
    appointmentId={appointment.id}
    appointmentStatus={appointment.status}
    onSuccess={() => fetchAppointments()}
  />
)}
```

## Workflow

### Scenario 1: Customer Appointment → Repair Order

1. **Customer submits appointment** via website
2. **Staff marks appointment as completed**
3. **Staff clicks "Convert to RO"** button
4. **System automatically:**
   - Creates/updates customer record
   - Creates/updates vehicle record
   - Generates RO number
   - Creates repair order
   - Migrates all documents
   - Links appointment to RO
5. **Repair Order appears in CRM** ready for work

### Scenario 2: Walk-in Customer

1. **Staff opens CRM** → Repair Orders
2. **Click "Create New Repair Order"**
3. **Fill in form:**
   - Customer information
   - Vehicle details
   - Insurance (if applicable)
   - Damage description
   - Cost estimates
   - Timeline
   - Required parts
4. **Submit**
5. **Repair Order created** with RO number

### Scenario 3: Returning Customer

When creating a new RO for existing customer:
- System finds customer by phone number
- Auto-updates customer info with latest data
- Links vehicle to customer
- All history preserved

## Data Flow

```
APPOINTMENT (completed)
    ↓
    [Convert Button Clicked]
    ↓
CONVERSION API (/api/crm/convert-appointment-to-ro)
    ↓
    ├──→ Find/Create CUSTOMER (by phone)
    ├──→ Find/Create VEHICLE (by VIN)
    ├──→ Generate RO NUMBER
    ├──→ Create REPAIR ORDER
    ├──→ Copy DOCUMENTS/PHOTOS
    └──→ Update APPOINTMENT (with RO link)
    ↓
REPAIR ORDER in CRM
    ↓
[Ready for workflow tracking]
```

## Benefits

### For Staff
- ✅ No double data entry
- ✅ All info in one place
- ✅ Quick customer lookup
- ✅ Automatic record keeping
- ✅ Document organization

### For Management
- ✅ Complete audit trail
- ✅ Customer history tracking
- ✅ Insurance claim tracking
- ✅ Cost estimation
- ✅ Timeline management

### For Customers
- ✅ Seamless transition from appointment to repair
- ✅ All their info saved for future visits
- ✅ Better communication (all contact info preserved)

## Field Requirements

### Required Fields
- Customer: First name, last name, phone
- Vehicle: Year, make, model, VIN
- Repair: Damage description

### Optional Fields
- Customer: Email, address
- Vehicle: Color, license plate, mileage
- Insurance: All fields (carrier, claim #, adjuster info)
- Estimates: Cost, duration, dates
- Parts: Entire parts list

## Validation

### Phone Numbers
- Automatically normalized (removes dashes, spaces, parentheses)
- Must be 10 digits
- Format: 2164818696

### VIN
- Automatically converted to uppercase
- Max 17 characters
- Must be unique

### Dates
- Planned start date optional
- Completion date auto-calculated if duration provided
- Format: YYYY-MM-DD

### Currency
- Estimated cost: decimal(10,2)
- Part costs: decimal(10,2)
- Supports up to $99,999,999.99

## Security

### RLS Policies
- Staff must be active and have CRM access
- Customers cannot access repair orders directly
- All operations require staff authentication

### Data Protection
- Customer data encrypted at rest
- Phone numbers used for lookup (not exposed)
- VIN numbers unique constraint prevents duplicates

## Troubleshooting

### "RO number already exists"
- System auto-generates unique numbers
- Check `generate_ro_number()` function exists
- Verify `crm_repair_orders` table has ro_number column

### "Customer not found"
- Phone numbers must match exactly
- System automatically normalizes phone
- Check phone is 10 digits

### "Vehicle VIN already exists"
- VIN must be unique
- System updates existing vehicle record
- Links to new customer if different

### "Failed to create repair order"
- Check all required fields present
- Verify customer_id and vehicle_id exist
- Check RLS policies allow staff access

## Future Enhancements

Possible additions:
- [ ] Bulk RO creation from multiple appointments
- [ ] RO templates for common repairs
- [ ] Email notifications to customers when RO created
- [ ] SMS updates for RO status changes
- [ ] Parts ordering integration
- [ ] Labor cost calculation
- [ ] Timeline Gantt chart view
- [ ] Customer approval workflow
- [ ] Photo comparison (before/after)
- [ ] Invoice generation

## Support

For questions or issues:
1. Check this documentation
2. Review API error messages
3. Check browser console for errors
4. Verify database schema is up to date
5. Confirm RLS policies are active

---

**Last Updated:** 2024-02-08  
**Version:** 1.0  
**Status:** Production Ready ✅
