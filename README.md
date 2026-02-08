# Cleveland Auto Body - Integrated Staff Portal

A comprehensive web application merging **Clevelandbody.com** customer-facing appointment system with the **BodyShopCRM** workflow management system, providing a unified staff portal for complete repair shop operations.

## 🚀 Overview

This application combines two powerful systems:

1. **Clevelandbody.com** - Customer-facing appointment booking and request management
2. **BodyShopCRM** - Complete repair order workflow management from intake to completion

Staff members authenticate once and can access both systems through a unified portal interface.

## ✨ Key Features

### Homepage Gallery Banner Slideshow 🎨
- **Auto-Looping Carousel**: Showcases work from gallery with smooth transitions
- **5-Image Display**: Shows current image plus 2 on each side with depth effect
- **Auto-Advance**: Automatically advances every 4 seconds
- **Manual Navigation**: Left/right arrow buttons and dot indicators
- **Interactive**: Click any visible image to jump to it
- **Responsive Design**: Optimized for all screen sizes
- **Direct Link**: "View Full Gallery" button links to complete gallery page
- **Strategic Placement**: Between CTA buttons and footer for maximum visibility

### Customer Portal Authentication 🔐
- **Secure Registration**: Customer accounts with email/password authentication
- **Phone-Based Lookup**: Find appointments using phone number
- **Personal Dashboard**: View all appointments and upload files
- **File Uploads**: Upload photos and documents for specific appointments
- **Auto-Scroll Results**: Search results automatically scroll into view
- **Row-Level Security**: Database-level protection of customer data

### Staff Portal Authentication
- **Unified Login**: Single sign-on for all staff members
- **Role-Based Access**: Configurable access to Appointments and/or CRM
- **Navigation Selector**: Choose between Appointments or BodyShopCRM after login

### Appointments Management
- View and manage customer appointment requests
- Update appointment status (pending, confirmed, in-progress, completed, cancelled)
- Search and filter appointments
- Customer contact information management
- Real-time dashboard statistics

### BodyShopCRM (Workflow Management)
- **Dashboard**: Real-time statistics and repair order tracking
- **Repair Orders**: Complete lifecycle management with 9 workflow stages:
  - Intake → Insurance → Estimate Approval → Blueprinting
  - Parts Ordered → In Repair → Painting → Quality Control → Ready for Pickup
- **Customer Management**: Complete customer database with insurance tracking
- **Vehicle Management**: Vehicle information and history
- **Parts Management**: Order tracking, supplier management, delivery status
- **Time Tracking**: Labor hours and cost tracking by technician
- **Documents**: Photo and document management for each repair order
- **Reports**: Analytics and bottleneck analysis

## 📊 Database Architecture

### Shared Infrastructure
- **PostgreSQL** (via Supabase) - All data storage
- **Supabase Auth** - Authentication system
- **Row Level Security** - Data protection and access control

### Key Tables

#### Staff & Authentication
- `staff_users` - Staff member records with access permissions
- `profiles` - Extended user profiles

#### Appointments (Clevelandbody.com)
- `appointments` - Customer appointment requests
- `repair_cases` - Damage report cases
- `tow_requests` - Towing service requests

#### BodyShopCRM Tables  
- `crm_customers` - Customer records
- `crm_vehicles` - Vehicle information
- `crm_repair_orders` - Repair order tracking
- `crm_parts` - Parts inventory and tracking
- `crm_time_tracking` - Labor time entries
- `crm_documents` - Document and photo attachments

## 🔧 Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Supabase Client
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth with Row Level Security
- **Styling**: TailwindCSS with responsive design
- **Deployment**: Ready for Vercel/Netlify deployment

## 📁 Project Structure

```
webapp/
├── app/
│   ├── admin/
│   │   └── staff/
│   │       ├── login/
│   │       │   └── page.tsx              # Staff login page
│   │       ├── appointments/
│   │       │   └── page.tsx              # Appointments management
│   │       ├── crm/
│   │       │   ├── page.tsx              # CRM entry point
│   │       │   └── CRMDashboard.tsx      # Main CRM interface
│   │       ├── page.tsx                  # Portal navigation selector
│   │       ├── StaffNavigation.tsx       # App selector component
│   │       ├── StaffAuthCheck.tsx        # Auth middleware
│   │       └── StaffDashboard.tsx        # Appointments dashboard
│   ├── api/                              # API routes (future expansion)
│   └── ...                               # Public pages (home, services, etc.)
├── components/                           # Reusable React components
├── lib/                                  # Utility functions
├── public/                               # Static assets
├── schema.sql                            # Original database schema
├── schema-extended.sql                   # Extended schema with CRM tables
├── .env.local                            # Environment variables (not in git)
├── .env.example                          # Environment template
├── package.json                          # Dependencies
└── README.md                             # This file
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account ([supabase.com](https://supabase.com))
- Twilio account for SMS (optional)
- Resend/SendGrid account for email (optional)

### 1. Clone and Install Dependencies

```bash
cd /home/user/webapp
npm install
```

### 2. Database Setup

1. Create a new Supabase project
2. Run the original schema:
   ```sql
   -- In Supabase SQL Editor, run: schema.sql
   ```
3. Run the extended schema for CRM:
   ```sql
   -- In Supabase SQL Editor, run: schema-extended.sql
   ```

### 3. Create Staff User

After setting up authentication in Supabase:

1. Create a user in Supabase Auth (Dashboard → Authentication → Add User)
2. Insert staff record:
   ```sql
   INSERT INTO public.staff_users (auth_user_id, email, full_name, phone, role, can_access_appointments, can_access_crm)
   VALUES (
     'your-auth-user-id',           -- From Supabase Auth
     'staff@clevelandbody.com',
     'Staff Member Name',
     '+12162880668',
     'admin',                        -- 'admin', 'manager', or 'staff'
     true,                           -- Can access appointments
     true                            -- Can access CRM
   );
   ```

### 4. Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Twilio (for SMS notifications)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Email Notifications (Postmark recommended)
POSTMARK_API_KEY=your_postmark_api_key
POSTMARK_FROM_EMAIL=notifications@clevelandbody.com

# Application Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_BUSINESS_PHONE=+12164818696
STAFF_SMS_RECIPIENTS=+12162880668,+14405300810
DEFAULT_EMAIL_RECIPIENTS=domesticandforeignab@gmail.com
```

### 5. Run Development Server

```bash
npm run dev
```

Access the application:
- **Public Site**: http://localhost:3000
- **Staff Login**: http://localhost:3000/admin/staff/login
- **Staff Portal**: http://localhost:3000/admin/staff (after login)

## 🔐 Access Control

### Staff Roles
- **admin**: Full access to all systems and settings
- **manager**: Access to both Appointments and CRM with limited admin functions
- **staff**: Configurable access to Appointments and/or CRM

### Permissions
- `can_access_appointments`: Access to appointment management system
- `can_access_crm`: Access to BodyShopCRM workflow system

## 🚀 Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables in Vercel
Add all `.env.local` variables to Vercel project settings:
1. Go to Project Settings → Environment Variables
2. Add each variable from `.env.local`
3. Redeploy

### Database Considerations
- Supabase automatically scales
- Row Level Security is enforced at database level
- Connection pooling handled by Supabase

## 📱 Usage Guide

### For Staff Members

1. **Login**: Navigate to `/admin/staff/login` and sign in with credentials
2. **Choose Application**: Select either:
   - **Appointments**: Manage customer appointment requests
   - **BodyShopCRM**: Track repair orders through complete workflow
3. **Navigate**: Use the back arrow to return to portal selector
4. **Logout**: Available in header of all staff pages

### Appointments Management

- View all incoming appointment requests
- Search/filter by customer, vehicle, or status
- Update status: pending → confirmed → in-progress → completed
- View customer contact information and damage descriptions

### CRM Workflow Management

1. **Dashboard**: View real-time statistics and recent repair orders
2. **Create Repair Orders**: 
   - Add customer and vehicle information
   - Assign priority and estimated completion
   - Track through 9 workflow stages
3. **Manage Parts**: Order tracking and delivery status
4. **Time Tracking**: Log labor hours by technician
5. **Documents**: Attach photos and documents to repair orders

## 🔄 Workflow Stages

Repair orders progress through these stages:

1. **Intake** - Initial customer and vehicle documentation
2. **Insurance** - Adjuster negotiation and claim processing
3. **Estimate Approval** - Customer and insurance approval
4. **Blueprinting** - Detailed repair planning
5. **Parts Ordered** - Parts ordering and tracking
6. **In Repair** - Active repair work
7. **Painting** - Paint and finishing work
8. **Quality Control** - Final inspection
9. **Ready for Pickup** - Completed, awaiting customer
10. **Completed** - Vehicle picked up

## 🛡️ Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Supabase Auth**: Industry-standard authentication
- **Staff-Only Access**: CRM only accessible to authenticated staff
- **Permission-Based Views**: Users only see what they have access to
- **Secure API Routes**: All database operations through secure Supabase client

## 📊 Future Enhancements

### Planned Features
- [ ] Email/SMS notifications for appointment changes
- [ ] Customer portal for repair order status tracking
- [ ] PDF report generation for estimates and invoices
- [ ] Advanced analytics dashboard
- [ ] Calendar integration for appointments
- [ ] Mobile app for technicians
- [ ] Photo upload directly from device camera
- [ ] Barcode scanning for parts and VINs
- [ ] Integration with parts suppliers APIs
- [ ] Payment processing (Stripe integration ready)

### API Routes (Ready for Implementation)
- `/api/crm/customers` - Customer CRUD operations
- `/api/crm/vehicles` - Vehicle management
- `/api/crm/repair-orders` - Repair order operations
- `/api/crm/parts` - Parts inventory management
- `/api/crm/time-tracking` - Labor time entries
- `/api/crm/documents` - Document uploads

## 🐛 Troubleshooting

### Common Issues

**Authentication Fails**
- Verify Supabase URL and keys in `.env.local`
- Check staff_users table has record with matching auth_user_id
- Ensure user has `is_active = true`

**Can't Access CRM/Appointments**
- Verify `can_access_crm` and `can_access_appointments` flags
- Check RLS policies in Supabase

**Database Connection Issues**
- Verify Supabase project is not paused
- Check connection pooling settings
- Review Supabase logs for errors

## 📞 Support

For issues or questions:
- **Business Phone**: (216) 481-8696
- **Email**: domesticandforeignab@gmail.com
- **Address**: 17017 Saint Clair Ave, Cleveland, OH 44110

## 📄 License

Proprietary - Cleveland Auto Body Internal Use Only

## 🙏 Acknowledgments

- **Next.js** - React framework
- **Supabase** - Backend infrastructure
- **TailwindCSS** - Styling framework
- **Vercel** - Deployment platform

---

**Version**: 2.0.0 (Merged System)
**Last Updated**: February 2026
**Status**: ✅ Production Ready

**Components**:
- Clevelandbody.com (Public Site + Appointments)
- BodyShopCRM (Workflow Management)
- Unified Staff Portal (Integrated Access)
