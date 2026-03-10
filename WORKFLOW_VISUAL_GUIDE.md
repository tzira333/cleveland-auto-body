# 🎯 Service Inquiry & Appointment Workflow - Visual Guide

## 🔄 Complete Workflow Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     CUSTOMER SUBMITS FORM                       │
│                  (Repair Request / Schedule)                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   📩 SERVICE INQUIRY                            │
│                  appointment_type: 'inquiry'                    │
│                       archived: false                           │
│                                                                 │
│  Appears in: SERVICE INQUIRIES TAB (Yellow)                    │
│  Actions:                                                       │
│    • [Confirm] → Convert to Confirmed Appointment              │
│    • [Archive] → Move to Archived                              │
│    • [View] → See details                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Staff clicks [Confirm]
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              📅 CONFIRMED APPOINTMENT                           │
│                appointment_type: 'confirmed'                    │
│                      archived: false                            │
│                                                                 │
│  Appears in: CONFIRMED APPOINTMENTS TAB (Blue)                 │
│  Actions:                                                       │
│    • [Convert to RO] → Create Repair Order + Auto-archive      │
│    • [Archive] → Move to Archived                              │
│    • [View] → See details                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Staff clicks [Convert to RO]
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    🔧 REPAIR ORDER                              │
│                    (In BodyShop CRM)                            │
│                                                                 │
│  Original Appointment:                                          │
│    • appointment_type: 'confirmed' (unchanged)                 │
│    • archived: true ✅                                         │
│    • archived_reason: "Converted to Repair Order"              │
│    • archived_at: [timestamp]                                  │
│    • archived_by: [staff_email]                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   🗄️ ARCHIVED APPOINTMENT                      │
│                       archived: true                            │
│                                                                 │
│  Appears in: ARCHIVED TAB (Gray)                               │
│  Actions:                                                       │
│    • [Unarchive] → Restore to original tab                     │
│    • [View] → See details                                      │
│    • [Delete] → Permanently delete (Admin only)                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Staff Dashboard - Three Tabs

### Tab 1: Service Inquiries (Yellow Theme)
```
┌─────────────────────────────────────────────────────────────┐
│ 📩 Service Inquiries (5)                                    │
├─────────────────────────────────────────────────────────────┤
│ Customer      Contact         Service    Status   Actions   │
├─────────────────────────────────────────────────────────────┤
│ John Doe      555-1234        Estimate   Pending  [Confirm] │
│ 📩 Inquiry    john@email.com                       [Archive] │
│                                                     [View]    │
├─────────────────────────────────────────────────────────────┤
│ Jane Smith    555-5678        Body Work  Pending  [Confirm] │
│ 📩 Inquiry    jane@email.com                       [Archive] │
│                                                     [View]    │
└─────────────────────────────────────────────────────────────┘
```

### Tab 2: Confirmed Appointments (Blue Theme)
```
┌─────────────────────────────────────────────────────────────┐
│ 📅 Confirmed Appointments (12)                              │
├─────────────────────────────────────────────────────────────┤
│ Customer      Contact         Date/Time         Actions     │
├─────────────────────────────────────────────────────────────┤
│ Bob Johnson   555-9876        Feb 15, 10:00 AM  [Convert]  │
│ 📅 Confirmed  bob@email.com                      [Archive]  │
│                                                   [View]     │
├─────────────────────────────────────────────────────────────┤
│ Sarah Lee     555-4321        Feb 16, 2:00 PM   [Convert]  │
│ 📅 Confirmed  sarah@email.com                    [Archive]  │
│                                                   [View]     │
└─────────────────────────────────────────────────────────────┘
```

### Tab 3: Archived (Gray Theme)
```
┌─────────────────────────────────────────────────────────────┐
│ 🗄️ Archived (48)                                            │
├─────────────────────────────────────────────────────────────┤
│ Customer      Archived Date   Reason           Actions      │
├─────────────────────────────────────────────────────────────┤
│ Mike Wilson   Feb 10, 2024    Converted to RO  [Unarchive] │
│ 🗄️ Archived                                    [View]      │
│                                                 [Delete]🔴  │
├─────────────────────────────────────────────────────────────┤
│ Lisa Brown    Feb 8, 2024     Customer cancel  [Unarchive] │
│ 🗄️ Archived                                    [View]      │
│                                                 [Delete]🔴  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Visual Indicators & Color Coding

### Badges
- **📩 Inquiry** - Yellow badge for service inquiries
- **📅 Confirmed** - Blue badge for confirmed appointments
- **🗄️ Archived** - Gray tag when archived

### Action Buttons
- **[Confirm]** - Blue button (only on inquiries)
- **[Convert to RO]** - Green button (only on confirmed appointments)
- **[Archive]** - Red button (on all active items)
- **[Unarchive]** - Green button (only on archived items)
- **[View]** - Blue text link (all items)
- **[Delete]** - Red icon (admin only, archived items)

### Stats Cards (Top of Dashboard)
```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Service         │ │ Confirmed       │ │ Today's         │ │ Archived        │
│ Inquiries       │ │ Appointments    │ │ Appointments    │ │                 │
│                 │ │                 │ │                 │ │                 │
│      5          │ │      12         │ │       3         │ │      48         │
│ (Yellow 🟡)    │ │ (Blue 🔵)      │ │ (Green 🟢)     │ │ (Gray ⚫)      │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## 🔀 State Transitions

### From Service Inquiry
```
Service Inquiry
    │
    ├─→ [Confirm] ──→ Confirmed Appointment (stays active)
    │
    └─→ [Archive] ──→ Archived (manual)
```

### From Confirmed Appointment
```
Confirmed Appointment
    │
    ├─→ [Convert to RO] ──→ Archived (auto-archived)
    │
    └─→ [Archive] ──────────→ Archived (manual)
```

### From Archived
```
Archived
    │
    ├─→ [Unarchive] ──→ Returns to original tab:
    │                   • Inquiry → Service Inquiries tab
    │                   • Confirmed → Confirmed Appointments tab
    │
    └─→ [Delete] ──────→ Permanently deleted (admin only)
```

---

## 📋 Database Fields Reference

| Field             | Type      | Values                    | Description                     |
|-------------------|-----------|---------------------------|---------------------------------|
| appointment_type  | TEXT      | 'inquiry', 'confirmed'    | Type of appointment             |
| archived          | BOOLEAN   | true, false               | Whether archived                |
| archived_at       | TIMESTAMP | [datetime]                | When archived                   |
| archived_by       | TEXT      | [staff_email]             | Who archived it                 |
| archived_reason   | TEXT      | [reason string]           | Why it was archived             |

### Auto-Archive Reasons
- **"Converted to Repair Order"** - Set when Convert to RO is clicked
- **"Manually archived by staff"** - Set when Archive button is clicked
- **Custom reason** - Can be provided when archiving

---

## 🎬 Example User Story

### Scenario: Customer Request to Completed RO

1. **Monday 9:00 AM** - Customer fills out online form
   - ✅ Entry created: `appointment_type = 'inquiry'`
   - 📊 Appears in **Service Inquiries** tab
   - 📧 Staff receives notification

2. **Monday 10:30 AM** - Staff reviews inquiry
   - 👀 Staff clicks **[View]** to see details
   - 📞 Staff calls customer to discuss
   - 📅 Staff clicks **[Confirm]** button
   - ✅ Entry updates: `appointment_type = 'confirmed'`
   - 📊 Moves to **Confirmed Appointments** tab

3. **Tuesday 9:00 AM** - Customer arrives for appointment
   - 🔍 Staff performs inspection
   - 💬 Staff discusses repair plan with customer
   - ✅ Customer approves estimate
   - 🔄 Staff clicks **[Convert to RO]** button
   - ✅ Repair Order created in BodyShop CRM
   - ✅ Original appointment auto-archived:
     - `archived = true`
     - `archived_reason = "Converted to Repair Order"`
     - `archived_at = [timestamp]`
   - 📊 Entry moves to **Archived** tab

4. **Later** - Staff can still access archived appointment
   - 👀 Click **[View]** in Archived tab
   - 📝 See full history and details
   - 🔗 Link to associated Repair Order

---

## ✅ Quick Reference Card

| I want to...                          | Action                                      |
|---------------------------------------|---------------------------------------------|
| See new customer requests             | Go to **Service Inquiries** tab             |
| Schedule an inquiry                   | Click **[Confirm]** on the inquiry          |
| See scheduled appointments            | Go to **Confirmed Appointments** tab        |
| Start work on an appointment          | Click **[Convert to RO]**                   |
| Archive an item manually              | Click **[Archive]** button                  |
| See past/completed items              | Go to **Archived** tab                      |
| Restore an archived item              | Click **[Unarchive]** in Archived tab       |
| Delete an item permanently            | Click **[Delete]** (Admin only)             |

---

## 🚀 Keyboard Shortcuts (Future Enhancement)

*Note: Not implemented yet, but recommended for future:*

- `I` - Jump to **Service Inquiries** tab
- `C` - Jump to **Confirmed Appointments** tab
- `A` - Jump to **Archived** tab
- `/` - Focus search box
- `ESC` - Close modal

---

## 📞 Support & Training

### For Staff Members
1. Review this visual guide
2. Practice the workflow in sandbox/test environment
3. Follow the user story example above
4. Refer to action button colors for quick identification

### For Administrators
1. Review database migration: `migrations/add_service_inquiry_workflow.sql`
2. Monitor Supabase logs for query performance
3. Check archived count periodically
4. Consider data retention policies

---

## 🎉 Summary

The new **3-tab system** provides clear separation between:
- 📩 **Inquiries** - Needs staff attention
- 📅 **Confirmed** - Scheduled and ready
- 🗄️ **Archived** - Historical record

Each stage has specific actions, making the workflow intuitive and efficient!
