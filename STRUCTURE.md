# Project Structure
## Domestic and Foreign Auto Body Inc.

Complete file and folder organization overview.

```
domestic-foreign-auto-body/
│
├── 📁 app/                              # Next.js App Router
│   ├── layout.tsx                       # Root layout with header/footer
│   ├── page.tsx                         # Home page
│   ├── globals.css                      # Global styles
│   │
│   ├── 📁 api/                          # API Routes
│   │   ├── 📁 notifications/
│   │   │   └── route.ts                 # Notification sender
│   │   ├── 📁 webhooks/
│   │   │   └── 📁 stripe/
│   │   │       └── route.ts             # Stripe webhook handler (future)
│   │   └── 📁 health/
│   │       └── route.ts                 # Health check endpoint
│   │
│   ├── 📁 services/
│   │   └── page.tsx                     # Services page
│   │
│   ├── 📁 insurance/
│   │   └── page.tsx                     # Insurance & claims info
│   │
│   ├── 📁 gallery/
│   │   └── page.tsx                     # Photo gallery
│   │
│   ├── 📁 reviews/
│   │   └── page.tsx                     # Customer reviews
│   │
│   ├── 📁 contact/
│   │   └── page.tsx                     # Contact page with form
│   │
│   ├── 📁 schedule/
│   │   └── page.tsx                     # Appointment scheduling
│   │
│   ├── 📁 tow-request/
│   │   └── page.tsx                     # Tow service request
│   │
│   ├── 📁 repair-request/
│   │   └── page.tsx                     # Start repair case
│   │
│   ├── 📁 payments/
│   │   └── page.tsx                     # Payment options (call-only)
│   │
│   ├── 📁 portal/                       # Customer Portal
│   │   ├── layout.tsx                   # Portal layout
│   │   ├── page.tsx                     # Portal dashboard
│   │   ├── 📁 auth/
│   │   │   ├── login/
│   │   │   │   └── page.tsx            # Login page
│   │   │   ├── signup/
│   │   │   │   └── page.tsx            # Sign up page
│   │   │   ├── reset-password/
│   │   │   │   └── page.tsx            # Password reset
│   │   │   └── callback/
│   │   │       └── route.ts            # Auth callback handler
│   │   ├── 📁 cases/
│   │   │   ├── page.tsx                # Cases list
│   │   │   ├── new/
│   │   │   │   └── page.tsx            # Create new case
│   │   │   └── [id]/
│   │   │       ├── page.tsx            # Case details
│   │   │       └── edit/
│   │   │           └── page.tsx        # Edit case
│   │   ├── 📁 appointments/
│   │   │   └── page.tsx                # Appointments list
│   │   └── 📁 settings/
│   │       └── page.tsx                # User settings
│   │
│   └── 📁 admin/                        # Admin Dashboard
│       ├── layout.tsx                   # Admin layout
│       ├── page.tsx                     # Admin dashboard home
│       ├── 📁 cases/
│       │   ├── page.tsx                # All cases
│       │   └── [id]/
│       │       └── page.tsx            # Case management
│       ├── 📁 appointments/
│       │   ├── page.tsx                # Appointment calendar
│       │   └── [id]/
│       │       └── page.tsx            # Appointment details
│       ├── 📁 tow-requests/
│       │   ├── page.tsx                # Tow requests queue
│       │   └── [id]/
│       │       └── page.tsx            # Tow request details
│       ├── 📁 settings/
│       │   ├── page.tsx                # Settings home
│       │   ├── notifications/
│       │   │   └── page.tsx            # Notification settings
│       │   └── users/
│       │       └── page.tsx            # User management
│       └── 📁 reports/
│           └── page.tsx                # Reports & analytics
│
├── 📁 components/                       # React Components
│   ├── 📁 layout/
│   │   ├── Header.tsx                  # Site header with nav
│   │   └── Footer.tsx                  # Site footer
│   │
│   ├── 📁 home/                        # Home page components
│   │   ├── Hero.tsx                    # Hero section
│   │   ├── Services.tsx                # Services overview
│   │   ├── WhyChooseUs.tsx            # Benefits section
│   │   └── CTASection.tsx             # Call-to-action
│   │
│   ├── 📁 forms/                       # Form components
│   │   ├── AppointmentForm.tsx        # Appointment booking
│   │   ├── TowRequestForm.tsx         # Tow request
│   │   ├── RepairCaseForm.tsx         # Repair case creation
│   │   ├── ContactForm.tsx            # Contact form
│   │   └── FileUpload.tsx             # File upload widget
│   │
│   ├── 📁 portal/                      # Portal components
│   │   ├── CaseCard.tsx               # Case display card
│   │   ├── CaseList.tsx               # Cases list view
│   │   ├── AppointmentCard.tsx        # Appointment card
│   │   └── UploadManager.tsx          # File upload manager
│   │
│   ├── 📁 admin/                       # Admin components
│   │   ├── CaseQueue.tsx              # Cases queue
│   │   ├── AppointmentCalendar.tsx    # Calendar view
│   │   ├── TowRequestQueue.tsx        # Tow requests
│   │   ├── NotificationSettings.tsx   # Settings form
│   │   └── StatsCard.tsx              # Statistics card
│   │
│   └── 📁 ui/                          # Reusable UI components
│       ├── Button.tsx                  # Button component
│       ├── Input.tsx                   # Input field
│       ├── Select.tsx                  # Select dropdown
│       ├── Modal.tsx                   # Modal dialog
│       ├── Alert.tsx                   # Alert message
│       ├── Badge.tsx                   # Status badge
│       ├── Card.tsx                    # Card container
│       ├── Loading.tsx                 # Loading spinner
│       └── Table.tsx                   # Data table
│
├── 📁 lib/                              # Utility Libraries
│   ├── 📁 supabase/
│   │   ├── server.ts                   # Server-side client
│   │   └── client.ts                   # Browser client
│   │
│   ├── 📁 notifications/
│   │   ├── sms.ts                      # Twilio SMS service
│   │   └── email.ts                    # Email service
│   │
│   ├── 📁 utils/
│   │   ├── formatters.ts               # Data formatters
│   │   ├── validators.ts               # Input validation
│   │   ├── dates.ts                    # Date utilities
│   │   └── constants.ts                # App constants
│   │
│   └── 📁 hooks/                       # Custom React hooks
│       ├── useAuth.ts                  # Authentication hook
│       ├── useUser.ts                  # User data hook
│       └── useSupabase.ts              # Supabase hook
│
├── 📁 types/                            # TypeScript Types
│   ├── index.ts                        # Main type exports
│   └── database.types.ts               # Supabase generated types
│
├── 📁 supabase/                         # Supabase Configuration
│   └── schema.sql                      # Database schema
│
├── 📁 public/                           # Static Assets
│   ├── favicon.ico                     # Site favicon
│   ├── logo.png                        # Company logo
│   └── 📁 images/
│       ├── hero-bg.jpg                 # Hero background
│       └── placeholder.png             # Placeholder images
│
├── 📄 Configuration Files
├── .env.example                         # Environment template
├── .env.local                           # Local environment (not committed)
├── .gitignore                           # Git ignore rules
├── next.config.js                       # Next.js configuration
├── tailwind.config.js                   # Tailwind CSS config
├── tsconfig.json                        # TypeScript config
├── package.json                         # Dependencies
├── postcss.config.js                    # PostCSS config
├── vercel.json                          # Vercel deployment config
├── middleware.ts                        # Next.js middleware
│
└── 📄 Documentation
    ├── README.md                        # Main documentation
    ├── QUICKSTART.md                    # Quick start guide
    ├── DEPLOYMENT.md                    # Deployment instructions
    ├── PROJECT_STATUS.md                # Current status
    └── STRUCTURE.md                     # This file
```

---

## 📁 Key Directories Explained

### `/app` - Application Pages

Next.js 14 App Router structure. Each folder with `page.tsx` becomes a route:
- `app/page.tsx` → `/`
- `app/services/page.tsx` → `/services`
- `app/portal/cases/page.tsx` → `/portal/cases`

**Special Files:**
- `layout.tsx` - Shared layout wrapper
- `route.ts` - API route handler
- `loading.tsx` - Loading UI (optional)
- `error.tsx` - Error UI (optional)

### `/components` - React Components

Organized by feature/section:
- `layout/` - Site-wide components (header, footer)
- `home/` - Home page specific
- `forms/` - Form components
- `portal/` - Customer portal components
- `admin/` - Admin dashboard components
- `ui/` - Reusable UI primitives

### `/lib` - Utilities & Services

Business logic and external service integrations:
- `supabase/` - Database client setup
- `notifications/` - SMS & email services
- `utils/` - Helper functions
- `hooks/` - Custom React hooks

### `/types` - TypeScript Definitions

Type safety across the application:
- `index.ts` - Main type definitions
- `database.types.ts` - Supabase generated (auto-generated)

---

## 🎯 File Naming Conventions

### Pages
- `page.tsx` - Route page component
- `layout.tsx` - Layout wrapper
- `route.ts` - API route

### Components
- PascalCase: `ComponentName.tsx`
- Example: `AppointmentForm.tsx`

### Utilities
- camelCase: `utilityName.ts`
- Example: `formatters.ts`

### Types
- PascalCase for types: `TypeName`
- camelCase for files: `fileName.types.ts`

---

## 📊 Code Organization Principles

### 1. Feature-Based
Components grouped by feature, not by type:
```
✅ Good:
components/
  ├── portal/
  │   ├── CaseCard.tsx
  │   └── CaseList.tsx

❌ Bad:
components/
  ├── cards/
  │   └── CaseCard.tsx
  ├── lists/
  │   └── CaseList.tsx
```

### 2. Colocation
Keep related files together:
```
portal/
  ├── page.tsx              # Page component
  ├── layout.tsx            # Portal layout
  └── components/           # Portal-specific components
      └── Dashboard.tsx
```

### 3. Separation of Concerns
- **Components**: Presentation logic
- **Lib**: Business logic and API calls
- **Types**: Type definitions
- **App**: Routing and page composition

---

## 🚀 Import Paths

Using TypeScript path aliases:

```typescript
// ✅ Use path alias
import { createClient } from '@/lib/supabase/client'
import { RepairCase } from '@/types'
import Header from '@/components/layout/Header'

// ❌ Avoid relative paths
import { createClient } from '../../../lib/supabase/client'
```

Configured in `tsconfig.json`:
```json
{
  "paths": {
    "@/*": ["./*"]
  }
}
```

---

## 📝 Where to Add New Code

### Adding a New Page
```bash
# Create page file
app/your-new-page/page.tsx

# Add to navigation
components/layout/Header.tsx
```

### Adding a New Component
```bash
# Reusable UI component
components/ui/YourComponent.tsx

# Feature-specific component
components/feature-name/YourComponent.tsx
```

### Adding a New API Route
```bash
# Create API handler
app/api/your-endpoint/route.ts
```

### Adding New Types
```typescript
// Add to types/index.ts
export interface YourType {
  // ...
}
```

### Adding Utility Functions
```typescript
// Add to appropriate file in lib/utils/
lib/utils/yourUtility.ts
```

---

## 🔍 Finding Specific Code

| What | Where |
|------|-------|
| Home page | `app/page.tsx` |
| Navigation | `components/layout/Header.tsx` |
| Database client | `lib/supabase/` |
| Notifications | `lib/notifications/` |
| Form components | `components/forms/` |
| Type definitions | `types/index.ts` |
| API routes | `app/api/` |
| Customer portal | `app/portal/` |
| Admin dashboard | `app/admin/` |
| Styling | `app/globals.css`, `tailwind.config.js` |

---

## 📦 Generated Files (Don't Edit)

These files are auto-generated and should not be edited manually:

- `.next/` - Build output
- `node_modules/` - Dependencies
- `types/database.types.ts` - Generated by Supabase CLI
- `.vercel/` - Vercel deployment cache

---

## 🎨 Style Organization

### Global Styles
`app/globals.css` - Global CSS and Tailwind directives

### Component Styles
Use Tailwind CSS classes directly in components:
```tsx
<div className="bg-primary text-white rounded-lg p-6">
  Content
</div>
```

### Custom Utilities
Add to `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#800000'
    }
  }
}
```

---

This structure is designed for:
- ✅ Easy navigation
- ✅ Clear separation of concerns
- ✅ Scalability
- ✅ Maintainability
- ✅ Team collaboration

**Happy coding!** 🚀
