# BodyShop Workflow Enhancement - Implementation Plan

## Status: In Progress (Partial Complete)

### Completed Tasks
- ✅ Renamed "BodyShop CRM" to "BodyShop Workflow" in CRMDashboard.tsx
- ✅ Updated page metadata from "CRM" to "Workflow"

### Pending Tasks

This document outlines the remaining implementation needed for the complete BodyShop Workflow enhancement.

---

## 1. Complete Renaming: CRM → Workflow

### Files That Need Updates

#### app/admin/staff/StaffNavigation.tsx
```typescript
// Line 205: Change title
<h3 className="text-2xl font-bold text-center">
  BodyShop Workflow  // Changed from "BodyShop CRM"
</h3>

// Line 234: Change button text
<div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-center font-medium group-hover:bg-green-100 transition-colors">
  Enter BodyShop Workflow →  // Changed from "Enter BodyShop CRM →"
</div>
```

#### app/admin/staff/page.tsx
```typescript
// Update description
description: 'Choose between Appointments or BodyShop Workflow',
```

#### app/admin/staff/appointments/ConvertToROButton.tsx
```typescript
// Update dialog text
This will create a new Repair Order in the BodyShop Workflow with all customer information, 
// Changed from "BodyShop CRM"
```

---

## 2. Add RO Editing Functionality

### Database Schema Updates

#### Add Edit History Table
```sql
-- Track all edits made to repair orders
CREATE TABLE IF NOT EXISTS crm_repair_order_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_order_id UUID NOT NULL REFERENCES crm_repair_orders(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  edited_by TEXT NOT NULL,
  edited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ro_edits_repair_order_id ON crm_repair_order_edits(repair_order_id);
CREATE INDEX idx_ro_edits_edited_at ON crm_repair_order_edits(edited_at DESC);
```

### API Endpoint: `/api/crm/repair-orders/[id]/route.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Fetch single RO by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('crm_repair_orders')
      .select(`
        *,
        customer:crm_customers(*),
        vehicle:crm_vehicles(*)
      `)
      .eq('id', params.id)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: 'Repair order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ repair_order: data });
  } catch (error: any) {
    console.error('Error fetching repair order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repair order', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update RO
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();
    const { edited_by, ...roUpdates } = updates;

    // Get current RO data for history
    const { data: currentRO } = await supabase
      .from('crm_repair_orders')
      .select('*')
      .eq('id', params.id)
      .single();

    // Update the RO
    const { data, error } = await supabase
      .from('crm_repair_orders')
      .update({
        ...roUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    // Log changes to edit history
    if (currentRO) {
      const edits = [];
      for (const [key, newValue] of Object.entries(roUpdates)) {
        const oldValue = currentRO[key];
        if (oldValue !== newValue) {
          edits.push({
            repair_order_id: params.id,
            field_name: key,
            old_value: String(oldValue),
            new_value: String(newValue),
            edited_by: edited_by || 'Staff'
          });
        }
      }

      if (edits.length > 0) {
        await supabase
          .from('crm_repair_order_edits')
          .insert(edits);
      }
    }

    return NextResponse.json({
      success: true,
      repair_order: data
    });
  } catch (error: any) {
    console.error('Error updating repair order:', error);
    return NextResponse.json(
      { error: 'Failed to update repair order', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Archive RO (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('crm_repair_orders')
      .update({
        archived: true,
        archived_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Repair order archived successfully'
    });
  } catch (error: any) {
    console.error('Error archiving repair order:', error);
    return NextResponse.json(
      { error: 'Failed to archive repair order', details: error.message },
      { status: 500 }
    );
  }
}
```

### Component: Edit RO Modal

Create `/app/admin/staff/crm/EditRepairOrderModal.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'

interface EditRepairOrderModalProps {
  repairOrder: any
  onClose: () => void
  onSave: (updates: any) => Promise<void>
}

export default function EditRepairOrderModal({ 
  repairOrder, 
  onClose, 
  onSave 
}: EditRepairOrderModalProps) {
  const [formData, setFormData] = useState({
    ro_number: repairOrder.ro_number,
    status: repairOrder.status,
    priority: repairOrder.priority,
    estimated_completion: repairOrder.estimated_completion,
    damage_description: repairOrder.damage_description,
    estimate_amount: repairOrder.estimate_amount
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h3 className="text-xl font-semibold">Edit Repair Order</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* RO Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RO Number
            </label>
            <input
              type="text"
              value={formData.ro_number}
              onChange={(e) => setFormData({ ...formData, ro_number: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="intake">Intake</option>
              <option value="insurance">Insurance</option>
              <option value="estimate_approval">Estimate Approval</option>
              <option value="blueprinting">Blueprinting</option>
              <option value="parts_ordered">Parts Ordered</option>
              <option value="in_repair">In Repair</option>
              <option value="painting">Painting</option>
              <option value="quality_control">Quality Control</option>
              <option value="ready_pickup">Ready for Pickup</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Estimated Completion */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Completion
            </label>
            <input
              type="date"
              value={formData.estimated_completion?.split('T')[0] || ''}
              onChange={(e) => setFormData({ ...formData, estimated_completion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Damage Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Damage Description
            </label>
            <textarea
              value={formData.damage_description}
              onChange={(e) => setFormData({ ...formData, damage_description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              rows={4}
            />
          </div>

          {/* Estimate Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimate Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.estimate_amount || ''}
              onChange={(e) => setFormData({ ...formData, estimate_amount: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

## 3. Copy Appointment Details to RO

### Update: `/api/crm/convert-appointment-to-ro/route.ts`

Add logic to copy ALL appointment details including:
- Customer name, phone, email
- Vehicle info
- Damage description
- Service type
- Appointment date/time
- Files (if any)
- Notes (if any)

```typescript
// Add to the RO creation
const roData = {
  // ... existing fields
  appointment_id: appointmentId,
  original_service_type: appointment.service_type,
  original_appointment_date: appointment.appointment_date,
  original_appointment_time: appointment.appointment_time,
  damage_description: appointment.damage_description,
  initial_notes: appointment.notes // If you have notes
};
```

---

## 4. Archive Functionality

### Database Schema Updates

```sql
-- Add archived columns to appointments
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS archived_by TEXT;

-- Add archived columns to repair orders
ALTER TABLE crm_repair_orders 
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS archived_by TEXT;

-- Create indexes for archived queries
CREATE INDEX IF NOT EXISTS idx_appointments_archived ON appointments(archived);
CREATE INDEX IF NOT EXISTS idx_ro_archived ON crm_repair_orders(archived);
```

### API Endpoints

#### `/api/appointments/archive/route.ts`
```typescript
export async function POST(request: NextRequest) {
  const { appointment_id, archived_by } = await request.json();

  const { data, error } = await supabase
    .from('appointments')
    .update({
      archived: true,
      archived_at: new Date().toISOString(),
      archived_by
    })
    .eq('id', appointment_id)
    .select()
    .single();

  if (error) throw error;

  return NextResponse.json({ success: true, appointment: data });
}
```

#### `/api/crm/repair-orders/archive/route.ts`
```typescript
export async function POST(request: NextRequest) {
  const { ro_id, archived_by } = await request.json();

  const { data, error } = await supabase
    .from('crm_repair_orders')
    .update({
      archived: true,
      archived_at: new Date().toISOString(),
      archived_by
    })
    .eq('id', ro_id)
    .select()
    .single();

  if (error) throw error;

  return NextResponse.json({ success: true, repair_order: data });
}
```

---

## 5. Archive Tabs UI

### Update CRMDashboard.tsx

Add new view types:
```typescript
type ViewType = 
  | 'dashboard' 
  | 'repair-orders' 
  | 'archive-ro'  // New
  | 'customers' 
  | 'parts' 
  | 'reports'
```

Add new tabs:
```typescript
{ id: 'archive-ro' as ViewType, label: 'Archive RO', icon: '📦' },
```

Add view for archived ROs:
```typescript
{currentView === 'archive-ro' && (
  <div>
    <h2 className="text-2xl font-bold mb-6">Archived Repair Orders</h2>
    {/* List archived ROs */}
    {/* Add unarchive button */}
  </div>
)}
```

### Update StaffDashboard.tsx (Appointments)

Add new state:
```typescript
const [showArchived, setShowArchived] = useState(false);
```

Add tab toggle:
```typescript
<div className="flex gap-4 mb-6">
  <button
    onClick={() => setShowArchived(false)}
    className={showArchived ? 'text-gray-600' : 'text-blue-600 font-semibold'}
  >
    Active Appointments
  </button>
  <button
    onClick={() => setShowArchived(true)}
    className={showArchived ? 'text-blue-600 font-semibold' : 'text-gray-600'}
  >
    Archived Appointments
  </button>
</div>
```

Filter appointments:
```typescript
const displayedAppointments = showArchived
  ? appointments.filter(a => a.archived === true)
  : appointments.filter(a => !a.archived);
```

---

## Implementation Order

1. ✅ Rename CRM → Workflow (partially complete)
2. 📝 Complete renaming in all files
3. 📝 Add database columns for archived
4. 📝 Create edit RO API endpoint
5. 📝 Create EditRepairOrderModal component
6. 📝 Update convert-appointment-to-ro to copy all details
7. 📝 Add archive API endpoints
8. 📝 Add archive tabs to UI
9. 📝 Test all functionality
10. 📝 Deploy to production

---

## Estimated Time

- Complete renaming: 30 minutes
- Database updates: 30 minutes
- RO editing: 2-3 hours
- Archive functionality: 2-3 hours
- UI updates: 2-3 hours
- Testing: 1-2 hours
- **Total: 8-12 hours**

---

## Next Steps

1. Run database migrations for archived columns
2. Complete file renaming (StaffNavigation.tsx, etc.)
3. Implement edit RO functionality
4. Implement archive functionality
5. Test thoroughly
6. Deploy

---

**Status**: This document created as implementation guide. Partial work committed (renaming started).

**Last Updated**: February 20, 2026
