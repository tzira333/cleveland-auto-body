# 🚀 Complete Vercel Deployment Guide

## Cleveland Auto Body - Next.js Application

This guide will walk you through deploying your Next.js application to Vercel in just a few minutes.

---

## 📋 Prerequisites Checklist

Before starting, make sure you have:
- ✅ Supabase project with database tables created
- ✅ Environment variables ready (`.env.local` values)
- ✅ GitHub account
- ✅ Vercel account (free tier is fine)

---

## 🔧 Step 1: Setup GitHub (REQUIRED)

### Option A: Using Existing Repository (If You Have One)

If you already have a GitHub repository for this project, skip to Step 2.

### Option B: Create New Repository

1. **Authorize GitHub in the Code Sandbox**:
   - Look for the **#github tab** in your interface
   - Click "Authorize GitHub" or "Connect GitHub"
   - Complete the OAuth flow

2. **Verify Git Status**:
   ```bash
   cd /home/user/webapp
   git status
   git log --oneline | head -5
   ```

3. **Push to GitHub**:
   ```bash
   # After GitHub authorization, push your code
   git remote add origin https://github.com/YOUR_USERNAME/cleveland-auto-body.git
   git push -u origin main
   ```

---

## 🌐 Step 2: Deploy to Vercel

### 2.1: Create Vercel Account

1. Go to: https://vercel.com/signup
2. Click **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub account

### 2.2: Import Your Repository

1. Click **"Add New..."** → **"Project"**
2. Find **"cleveland-auto-body"** (or your repo name)
3. Click **"Import"**

### 2.3: Configure Project

Vercel will auto-detect Next.js. Verify these settings:

**Framework Preset**: Next.js  
**Root Directory**: `./` (leave default)  
**Build Command**: `npm run build` (auto-detected)  
**Output Directory**: `.next` (auto-detected)  
**Install Command**: `npm install` (auto-detected)

✅ Leave all default settings - Vercel optimizes for Next.js automatically!

---

## 🔐 Step 3: Configure Environment Variables

### 3.1: Required Environment Variables

Click **"Environment Variables"** and add these:

| Name | Value | Notes |
|------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | From Supabase Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon/public key | From Supabase Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | ⚠️ SECRET - From Supabase Settings → API |

### 3.2: Where to Find These Values

```bash
# 1. Go to Supabase Dashboard
https://app.supabase.com

# 2. Select your project (Cleveland Body Shop)

# 3. Navigate to: Settings → API

# 4. Copy:
   - Project URL → NEXT_PUBLIC_SUPABASE_URL
   - anon public → NEXT_PUBLIC_SUPABASE_ANON_KEY
   - service_role → SUPABASE_SERVICE_ROLE_KEY
```

### 3.3: Environment Selection

For each variable:
- ✅ **Production**: Checked
- ✅ **Preview**: Checked  
- ✅ **Development**: Checked

This ensures all environments work correctly.

---

## 🚀 Step 4: Deploy!

1. Click **"Deploy"** button
2. ⏱️ Wait 2-5 minutes for build
3. ✅ Success! You'll see:
   - **Production URL**: `https://your-project.vercel.app`
   - **Build logs**: Green checkmarks

---

## ✅ Step 5: Verify Deployment

### 5.1: Test Homepage
1. Click your production URL
2. Should see: Cleveland Auto Body homepage
3. Gallery banner should load
4. Navigation should work

### 5.2: Test Customer Portal
1. Go to: `https://your-project.vercel.app/portal`
2. Enter a phone number with appointments
3. Verify appointments display
4. Check file uploads/display work

### 5.3: Test Staff Portal
1. Go to: `https://your-project.vercel.app/admin/staff/login`
2. Login with staff credentials
3. Verify appointments load
4. Test "Convert to RO" button
5. Check file display in modals

### 5.4: Test CRM
1. From staff dashboard, click "CRM"
2. Verify repair orders display
3. Check "Create New Repair Order" works
4. Verify customer/vehicle data saves

---

## 🔧 Post-Deployment Configuration

### Update Supabase Auth Settings

Your app is now on a new domain. Update Supabase:

```bash
# 1. Go to Supabase Dashboard
https://app.supabase.com → Your Project

# 2. Navigate to: Authentication → URL Configuration

# 3. Add your Vercel URL to:
   - Site URL: https://your-project.vercel.app
   - Redirect URLs: 
     https://your-project.vercel.app/portal/auth/login
     https://your-project.vercel.app/portal/auth/register
     https://your-project.vercel.app/admin/staff/login
```

### Update CORS (if needed)

If you get CORS errors:

```bash
# Supabase Dashboard → Settings → API
# Add Vercel domain to allowed origins
```

---

## 📱 Custom Domain (Optional)

### Add Your Own Domain

1. In Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter: `clevelandbody.com` (or your domain)
4. Follow DNS configuration steps:
   - Add A record: `76.76.21.21`
   - Or CNAME: `cname.vercel-dns.com`
5. Wait for propagation (5-30 minutes)

---

## 🔄 Continuous Deployment

### Automatic Deployments

Every time you push to GitHub:
- ✅ Vercel automatically deploys
- ✅ Preview URL for testing
- ✅ Auto-merge to production after checks

### Manual Deployment

From your local machine:
```bash
# Install Vercel CLI (optional)
npm i -g vercel

# Deploy from command line
vercel --prod
```

---

## 🐛 Troubleshooting

### Build Fails: "Module not found"
**Solution**: Missing dependency
```bash
# Verify package.json is committed
git add package.json package-lock.json
git commit -m "Add dependencies"
git push
```

### Build Fails: "supabaseUrl is required"
**Solution**: Environment variables not set
1. Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add all three Supabase variables
3. Click **"Redeploy"** in Deployments tab

### Runtime Error: "fetch is not defined"
**Solution**: Already handled - Next.js uses native fetch

### 500 Error on API Routes
**Solution**: Check Vercel Function Logs
1. Vercel Dashboard → Your Project → **Deployments** → Click latest
2. Click **"Functions"** tab
3. View error logs for `/api/*` routes
4. Usually environment variable issues

### Files Not Uploading
**Solution**: Check Supabase Storage settings
1. Ensure `appointment-files` bucket exists
2. Set to **Public** for public URLs
3. Check CORS settings allow Vercel domain

---

## 📊 Monitoring & Analytics

### Vercel Analytics (Free)

1. Enable in: Vercel Dashboard → Your Project → **Analytics**
2. See:
   - Real-time visitors
   - Page performance
   - Core Web Vitals
   - Traffic sources

### Vercel Speed Insights

1. Enable in: **Speed Insights** tab
2. Monitors:
   - Page load times
   - Lighthouse scores
   - Performance metrics

---

## 💰 Cost Estimate

### Vercel Free Tier (Hobby Plan)
- ✅ **100 GB bandwidth/month**
- ✅ **Unlimited websites**
- ✅ **Automatic HTTPS**
- ✅ **Preview deployments**
- ✅ **Edge Network (CDN)**
- ✅ **Serverless Functions**: 100 GB-hours
- ✅ **Function Execution**: 100 hours/month

**For your app**: Should easily stay within free tier initially.

### Supabase Free Tier
- ✅ **500 MB database**
- ✅ **1 GB file storage**
- ✅ **50,000 monthly active users**
- ✅ **Unlimited API requests**

**Combined**: $0/month for typical usage! 🎉

---

## 🔐 Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env.local` to git
- ✅ Use Vercel's encrypted storage
- ✅ Rotate service_role key periodically

### 2. Supabase RLS
- ✅ All tables have Row-Level Security enabled
- ✅ Policies restrict access by user role
- ✅ Staff/customer data separated

### 3. API Routes
- ✅ Server-side validation
- ✅ Phone number normalization
- ✅ Service role key kept server-side only

---

## 📚 Additional Resources

### Vercel Documentation
- Next.js on Vercel: https://vercel.com/docs/frameworks/nextjs
- Environment Variables: https://vercel.com/docs/environment-variables
- Custom Domains: https://vercel.com/docs/custom-domains

### Your Application Docs
- **Main README**: `/home/user/webapp/README.md`
- **Repair Orders**: `/home/user/webapp/REPAIR_ORDER_SYSTEM.md`
- **File Display**: `/home/user/webapp/FIX_FILE_DISPLAY.md`
- **RO Number Fix**: `/home/user/webapp/FIX_RO_NUMBER_GENERATION.md`

---

## 🎯 Quick Deployment Checklist

- [ ] GitHub repository created and code pushed
- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Environment variables configured (3 required)
- [ ] Deployment successful (green checkmark)
- [ ] Homepage loads correctly
- [ ] Customer portal works (test with phone lookup)
- [ ] Staff portal works (test login)
- [ ] File uploads/display work
- [ ] Convert to RO button works
- [ ] Supabase auth URLs updated
- [ ] Custom domain configured (optional)

---

## 🚨 Common First-Time Issues

### Issue: "This Deployment has been disabled"
**Cause**: Free tier limits exceeded  
**Solution**: Upgrade to Pro plan or optimize bundle size

### Issue: Function timeout (10s limit on free tier)
**Cause**: Slow API calls or database queries  
**Solution**: 
- Add database indexes
- Optimize queries
- Consider caching

### Issue: Build size too large
**Cause**: Large dependencies  
**Solution**:
```bash
# Analyze bundle
npm install -g @next/bundle-analyzer
ANALYZE=true npm run build
```

---

## 📞 Support

### Need Help?
- **Vercel Support**: https://vercel.com/support
- **Next.js Discord**: https://nextjs.org/discord
- **Supabase Discord**: https://discord.supabase.com

### Your Project Documentation
All fixes and features documented in:
- `README.md`
- `FIX_*.md` files
- `REPAIR_ORDER_SYSTEM.md`

---

## ✅ Success Criteria

Your deployment is successful when:
- ✅ Homepage loads at your Vercel URL
- ✅ Customer portal phone lookup works
- ✅ Staff can login and view appointments
- ✅ File uploads appear in galleries
- ✅ Convert to RO creates repair orders
- ✅ No console errors in browser
- ✅ All API routes return 200 status

---

**Status**: Ready to Deploy! 🚀

**Estimated Time**: 15-30 minutes (first time)

**Difficulty**: Easy - Vercel handles everything!

---

## 🎉 After Successful Deployment

Share your new URL:
- ✅ `https://your-project.vercel.app`
- ✅ Test all features
- ✅ Share with team
- ✅ Start accepting appointments online!

**Last Updated**: 2026-02-08
