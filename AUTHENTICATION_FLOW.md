# Customer Portal Authentication Flow

## Visual Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLEVELANDBODY.COM                            │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┴────────────────┐
                │                                │
                ▼                                ▼
    ┌───────────────────────┐        ┌──────────────────────┐
    │   CUSTOMER PORTAL     │        │    STAFF PORTAL      │
    │   /portal             │        │   /admin/staff       │
    └───────────────────────┘        └──────────────────────┘
                │                                │
                │                                │
    ┌───────────┴────────────┐                  │
    │                        │                  │
    ▼                        ▼                  ▼
┌────────────────┐    ┌──────────────┐   ┌─────────────────┐
│  Quick Lookup  │    │ Authenticated│   │  Staff Login    │
│  (No Account)  │    │   Dashboard  │   │ (Unchanged)     │
│                │    │              │   │                 │
│ - Enter phone  │    │ - Full view  │   │ - View all      │
│ - View appts   │    │ - All appts  │   │ - Manage all    │
│ - No login     │    │ - Secure     │   │ - Full access   │
└────────────────┘    └──────────────┘   └─────────────────┘
```

## Customer Registration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: Visit /portal/auth/register                            │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 2: Fill Registration Form                                 │
│  • Full Name                                                    │
│  • Email Address                                                │
│  • Phone Number (auto-formatted)                                │
│  • Password (min 8 characters)                                  │
│  • Confirm Password                                             │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 3: Backend Processing                                     │
│  • Create Supabase Auth user                                    │
│  • Hash password                                                │
│  • Create customer_users record (via API)                       │
│  • Link auth_user_id                                            │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 4: Success & Redirect                                     │
│  • Show success message                                         │
│  • Redirect to login page                                       │
└─────────────────────────────────────────────────────────────────┘
```

## Customer Login Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: Visit /portal/auth/login                               │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 2: Enter Credentials                                      │
│  • Email                                                        │
│  • Password                                                     │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 3: Authentication                                          │
│  • Supabase Auth validates                                      │
│  • Check customer_users record exists                           │
│  • Verify account is active                                     │
│  • Create session (JWT)                                         │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 4: Redirect to Dashboard                                  │
│  • Load customer profile                                        │
│  • Fetch customer's appointments                                │
│  • Display dashboard                                            │
└─────────────────────────────────────────────────────────────────┘
```

## Data Access Patterns

### Customer View (Authenticated)

```
Customer Login
      │
      ▼
┌─────────────────────────────────────────┐
│ Check auth.uid() = auth_user_id         │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│ Get customer_users record               │
│ WHERE auth_user_id = auth.uid()         │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│ Get appointments                        │
│ WHERE customer_user_id =               │
│   (customer_users.id)                   │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│ RLS Policy: customers_can_view_own      │
│ ✅ Returns only this customer's appts   │
│ ❌ Blocks other customers' data         │
└─────────────────────────────────────────┘
```

### Staff View (Authenticated)

```
Staff Login
      │
      ▼
┌─────────────────────────────────────────┐
│ Check auth.uid() exists in staff_users  │
│ AND is_active = true                    │
│ AND can_access_appointments = true      │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│ Get ALL appointments                    │
│ No WHERE clause restrictions            │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│ RLS Policy: staff_can_view_all          │
│ ✅ Returns ALL appointments             │
│ ✅ Can update/delete any appointment    │
└─────────────────────────────────────────┘
```

### Quick Lookup (Unauthenticated)

```
Phone Number Entry
      │
      ▼
┌─────────────────────────────────────────┐
│ Normalize phone (remove formatting)     │
│ 216-481-8696 → 2164818696               │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│ Query appointments                      │
│ WHERE customer_phone = '2164818696'     │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│ Note: This query works via client-side │
│ filtering, not direct DB query          │
│ (RLS would block unauthenticated)       │
└─────────────────────────────────────────┘
```

## Database Architecture

```
┌────────────────────────────────────────────────────────────┐
│                       auth.users                           │
│  (Managed by Supabase Auth)                                │
│                                                             │
│  • id (UUID)                                                │
│  • email                                                    │
│  • encrypted_password                                       │
│  • created_at                                               │
└────────────────────────────────────────────────────────────┘
                            │
                            │ (One-to-One)
                            │
        ┌───────────────────┴─────────────────────┐
        │                                         │
        ▼                                         ▼
┌──────────────────────┐            ┌──────────────────────┐
│ customer_users       │            │  staff_users         │
│                      │            │                      │
│ • id (UUID)          │            │ • id (UUID)          │
│ • auth_user_id  ─────┤            │ • auth_user_id  ─────┤
│ • email              │            │ • email              │
│ • full_name          │            │ • full_name          │
│ • phone              │            │ • role               │
│ • is_active          │            │ • is_active          │
│ • email_verified     │            │ • can_access_appts   │
└──────────────────────┘            │ • can_access_crm     │
        │                            └──────────────────────┘
        │ (One-to-Many)
        │
        ▼
┌──────────────────────────────────────────────┐
│           appointments                       │
│                                               │
│ • id (UUID)                                   │
│ • customer_user_id ─────┐ (New column)       │
│ • customer_name          │                    │
│ • customer_email         │                    │
│ • customer_phone         │                    │
│ • service_type           │                    │
│ • appointment_date       │                    │
│ • appointment_time       │                    │
│ • status                 │                    │
│ • vehicle_*              │                    │
│ • damage_description     │                    │
│ • created_at             │                    │
└──────────────────────────────────────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Application Authentication                         │
│  • Supabase Auth validates credentials                      │
│  • JWT tokens for session management                        │
│  • Password hashing (bcrypt)                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Role Verification                                  │
│  • Check customer_users OR staff_users table                │
│  • Verify account is active                                 │
│  • Confirm appropriate permissions                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Row-Level Security (RLS)                           │
│  • Database enforces access rules                           │
│  • Customers: WHERE auth.uid() = auth_user_id               │
│  • Staff: EXISTS check in staff_users                       │
│  • Cannot be bypassed (enforced at DB level)                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: Input Validation                                   │
│  • Client-side validation (immediate feedback)              │
│  • Server-side validation (security)                        │
│  • SQL injection prevention (Supabase client)               │
│  • XSS prevention (Next.js escaping)                        │
└─────────────────────────────────────────────────────────────┘
```

## URL Structure

```
clevelandbody.com
│
├── / (Public homepage)
│
├── /portal (Customer Portal)
│   ├── / (Quick lookup - no auth)
│   ├── /auth
│   │   ├── /login (Customer login)
│   │   ├── /register (Customer registration)
│   │   └── /reset-password (Password reset)
│   └── /dashboard (Customer dashboard - auth required)
│
├── /admin (Staff Portal)
│   └── /staff
│       ├── /login (Staff login)
│       ├── / (Staff dashboard)
│       ├── /appointments (Appointment management)
│       └── /crm (CRM dashboard)
│
└── /api (Backend endpoints)
    ├── /customer
    │   └── /register (POST - Create customer account)
    └── /appointments (GET/POST/PATCH/DELETE - Staff only)
```

## Access Control Matrix

```
┌───────────────────┬──────────────┬──────────────┬──────────────┐
│ Action            │ Customer     │ Staff        │ Unauthenticated│
│                   │ (Auth)       │ (Auth)       │              │
├───────────────────┼──────────────┼──────────────┼──────────────┤
│ View own appts    │ ✅           │ ✅           │ ⚠️  (Phone)  │
│ View all appts    │ ❌           │ ✅           │ ❌           │
│ Create appts      │ ✅           │ ✅           │ ✅           │
│ Update own appts  │ ✅           │ ✅           │ ❌           │
│ Update all appts  │ ❌           │ ✅           │ ❌           │
│ Delete appts      │ ❌           │ ✅           │ ❌           │
│ View own profile  │ ✅           │ ✅           │ ❌           │
│ View all profiles │ ❌           │ ✅           │ ❌           │
│ Update own profile│ ✅           │ ✅           │ ❌           │
│ Access CRM        │ ❌           │ ✅ (perm)    │ ❌           │
└───────────────────┴──────────────┴──────────────┴──────────────┘

Legend:
✅ = Allowed
❌ = Denied
⚠️  = Limited (phone-based lookup only)
```

## Key Files Reference

```
webapp/
│
├── app/
│   ├── portal/
│   │   ├── page.tsx                       (Quick lookup)
│   │   ├── auth/
│   │   │   ├── login/page.tsx             (Customer login)
│   │   │   ├── register/page.tsx          (Registration)
│   │   │   └── reset-password/page.tsx    (Password reset)
│   │   └── dashboard/page.tsx             (Customer dashboard)
│   │
│   ├── admin/staff/
│   │   ├── login/page.tsx                 (Staff login)
│   │   ├── StaffDashboard.tsx             (Staff main page)
│   │   └── ...                            (Other staff pages)
│   │
│   └── api/
│       └── customer/
│           └── register/route.ts          (Registration API)
│
├── schema-customer-auth.sql               (Database migration)
├── CUSTOMER_AUTH_DOCUMENTATION.md         (Full documentation)
├── SETUP_GUIDE.md                         (Setup instructions)
└── IMPLEMENTATION_SUMMARY.md              (This overview)
```

---

**For detailed information, see:**
- **SETUP_GUIDE.md** - Step-by-step setup instructions
- **CUSTOMER_AUTH_DOCUMENTATION.md** - Complete technical documentation
- **IMPLEMENTATION_SUMMARY.md** - Features and overview
