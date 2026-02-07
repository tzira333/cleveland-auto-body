# Quick Start Guide
## Get Your Website Running in 30 Minutes

This guide will get you from zero to a working local development environment in about 30 minutes.

---

## ⚡ Prerequisites (5 minutes)

Make sure you have these installed:

```bash
# Check Node.js version (need 18+)
node --version

# Check npm
npm --version

# If you don't have Node.js, download from: https://nodejs.org
```

---

## 📦 Step 1: Install Dependencies (2 minutes)

```bash
# Navigate to project directory
cd domestic-foreign-auto-body

# Install all dependencies
npm install
```

---

## 🗄️ Step 2: Set Up Supabase (10 minutes)

### Create Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Name: "domestic-foreign-auto-body"
4. Database Password: (save this!)
5. Region: Choose closest to Cleveland (us-east-1)
6. Click "Create new project"
7. Wait ~2 minutes for project creation

### Deploy Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Open `supabase/schema.sql` in your code editor
4. Copy ALL the SQL
5. Paste into Supabase SQL Editor
6. Click "Run"
7. You should see "Success. No rows returned"

### Create Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Click "Create bucket"
3. Name: `case-uploads`
4. Public: **OFF** (keep it private)
5. Click "Create bucket"

### Get API Keys

1. Go to **Settings** → **API**
2. Copy these three values:
   - Project URL
   - anon/public key
   - service_role key (keep secret!)

---

## 📧 Step 3: Set Up Twilio (7 minutes)

### Sign Up

1. Go to https://www.twilio.com/try-twilio
2. Sign up for free account
3. Verify your email and phone

### Get a Phone Number

1. In Console, go to **Phone Numbers** → **Manage** → **Buy a number**
2. Select your country (United States)
3. Check "SMS" capability
4. Click "Search"
5. Choose a number and buy it (free trial credit covers this)

### Get Credentials

1. Go to Console **Dashboard**
2. Copy:
   - Account SID
   - Auth Token
   - Your Twilio Phone Number

**Important**: You'll need to complete A2P 10DLC registration later for production use. For now, you can test with your verified phone number.

---

## 📨 Step 4: Set Up Email Service (5 minutes)

### Option A: Postmark (Recommended)

1. Go to https://account.postmarkapp.com/sign_up
2. Sign up for free trial (100 emails/month free)
3. Create a server
4. Go to **Servers** → **API Tokens**
5. Copy your Server API token

### Option B: SendGrid (Alternative)

1. Go to https://signup.sendgrid.com
2. Sign up for free tier
3. Go to **Settings** → **API Keys**
4. Create new API key with "Mail Send" permission
5. Copy the API key

---

## ⚙️ Step 5: Configure Environment (3 minutes)

### Create Environment File

```bash
# Copy the example file
cp .env.example .env.local
```

### Edit `.env.local`

Open `.env.local` in your text editor and fill in:

```env
# From Supabase (Step 2)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# From Twilio (Step 3)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# From Postmark or SendGrid (Step 4)
POSTMARK_API_KEY=your_postmark_api_key_here
POSTMARK_FROM_EMAIL=notifications@yourdomain.com
# OR if using SendGrid:
# SENDGRID_API_KEY=SG.xxxxxxxxxxxx
# SENDGRID_FROM_EMAIL=notifications@yourdomain.com

# Application Settings
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_BUSINESS_PHONE=+12164818696

# Staff Notifications (Your phone numbers)
STAFF_SMS_RECIPIENTS=+12162880668,+14405300810,+14407491081
DEFAULT_EMAIL_RECIPIENTS=domesticandforeignab@gmail.com

# Generate a random key for API protection
INTERNAL_API_KEY=generate_random_string_here
```

**To generate INTERNAL_API_KEY** (Mac/Linux):
```bash
openssl rand -hex 32
```

Or just use any random string for local dev.

---

## 🚀 Step 6: Start Development Server (1 minute)

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

You should see the home page! 🎉

---

## ✅ Step 7: Verify Everything Works (2 minutes)

### Check Home Page

- [ ] Page loads without errors
- [ ] Navigation menu works
- [ ] Phone number links work
- [ ] Buttons are clickable

### Check Console

Open browser developer tools (F12) and check for errors:
- Should see no red errors
- Green success messages are good

### Test Database Connection

1. Open browser console (F12)
2. Type: `fetch('/api/health')`
3. Should not see errors

---

## 🎯 What You Have Now

- ✅ Local development server running
- ✅ Database connected
- ✅ Notifications configured (but need testing)
- ✅ Authentication ready
- ✅ File uploads ready

---

## 🧪 Testing Notifications (Optional)

### Test SMS (From Console)

For now, SMS will only work to your verified Twilio phone number until you complete A2P 10DLC registration.

### Test Email

Emails should work immediately in development mode.

---

## 🐛 Common Issues

### "Module not found" error
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### "Connection refused" to Supabase
- Check your Supabase project is running
- Verify URL and keys are correct
- Try visiting the Supabase project URL in browser

### Port 3000 already in use
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

---

## 📚 Next Steps

### Create Admin Account

1. Go to http://localhost:3000/portal
2. Click "Sign Up"
3. Enter your email and password
4. Go to Supabase dashboard → **Table Editor** → **profiles**
5. Find your user and change `role` to `admin`
6. Log out and log back in

### Start Development

1. Review the project structure in `README.md`
2. Check `PROJECT_STATUS.md` to see what needs building
3. Start with completing page content
4. Build forms next
5. Then dashboards

### Learn the Stack

- **Next.js**: https://nextjs.org/docs
- **Supabase**: https://supabase.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs

---

## 🎓 Development Tips

### Hot Reload

Changes to files automatically reload the page. If something breaks:
```bash
# Restart the dev server
# Press Ctrl+C to stop
npm run dev
```

### Database Changes

When you change `supabase/schema.sql`:
1. Run the new SQL in Supabase SQL Editor
2. Update TypeScript types if needed
3. Restart dev server

### Environment Variables

After changing `.env.local`:
1. Restart dev server (Ctrl+C, then `npm run dev`)
2. Changes take effect immediately

### Error Checking

```bash
# Check for TypeScript errors
npm run type-check

# Check for lint errors
npm run lint
```

---

## 📞 Getting Help

### Documentation

- `README.md` - Complete feature list and setup
- `DEPLOYMENT.md` - Production deployment guide
- `PROJECT_STATUS.md` - What's done and what's next

### Common Errors

Check the Troubleshooting section in `README.md`

### Stack-Specific Help

- Supabase: https://supabase.com/docs
- Twilio: https://www.twilio.com/docs
- Vercel: https://vercel.com/docs

---

## ✨ You're Ready!

You now have:
- ✅ Working local development environment
- ✅ Database set up
- ✅ Notifications configured
- ✅ All dependencies installed

**Start building!** The foundation is solid, and you're ready to complete the remaining features.

Happy coding! 🚀
