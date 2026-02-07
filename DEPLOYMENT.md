# Vercel Deployment Guide
## Domestic and Foreign Auto Body Inc.

This guide provides step-by-step instructions for deploying your application to Vercel and configuring your domain.

---

## Prerequisites

- ✅ GitHub/GitLab/Bitbucket account with repository access
- ✅ Vercel account (free tier works)
- ✅ Supabase project set up and schema deployed
- ✅ Twilio account with A2P 10DLC registration approved
- ✅ Email service configured (Postmark or SendGrid)
- ✅ Access to clevelandbody.com DNS settings (Cloudflare or other provider)

---

## Step 1: Connect Repository to Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard

2. **Click "Add New..." → "Project"**

3. **Import Git Repository**:
   - Select your Git provider (GitHub/GitLab/Bitbucket)
   - Authorize Vercel if first time
   - Select your repository

4. **Configure Project**:
   - **Project Name**: domestic-foreign-auto-body (or your preference)
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

5. **Do NOT deploy yet** - we need to add environment variables first

---

## Step 2: Configure Environment Variables

1. **In Vercel project settings**, go to **Settings** → **Environment Variables**

2. **Add each variable below**:

### Required Variables

| Variable Name | Value | Environments |
|--------------|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | Production only (sensitive) |
| `TWILIO_ACCOUNT_SID` | Your Twilio Account SID | Production only |
| `TWILIO_AUTH_TOKEN` | Your Twilio Auth Token | Production only |
| `TWILIO_PHONE_NUMBER` | Your Twilio phone number (+1XXXXXXXXXX) | Production only |
| `POSTMARK_API_KEY` | Your Postmark API key | Production only |
| `POSTMARK_FROM_EMAIL` | notifications@clevelandbody.com | Production, Preview |
| `NEXT_PUBLIC_SITE_URL` | https://clevelandbody.com | Production |
| `NEXT_PUBLIC_SITE_URL` | https://www.clevelandbody.com | Preview |
| `NEXT_PUBLIC_BUSINESS_PHONE` | +12164818696 | Production, Preview |
| `NEXT_PUBLIC_BUSINESS_ADDRESS` | 17017 Saint Clair Ave, Cleveland, OH 44110 | Production, Preview |
| `STAFF_SMS_RECIPIENTS` | +12162880668,+14405300810,+14407491081 | Production only |
| `DEFAULT_EMAIL_RECIPIENTS` | domesticandforeignab@gmail.com | Production only |
| `INTERNAL_API_KEY` | Generate random string (e.g., `openssl rand -hex 32`) | Production only |

### Optional Variables (for future use)

| Variable Name | Value | Environments |
|--------------|-------|--------------|
| `SENDGRID_API_KEY` | Your SendGrid API key (alternative to Postmark) | Production only |
| `SENDGRID_FROM_EMAIL` | notifications@clevelandbody.com | Production |
| `STRIPE_SECRET_KEY` | sk_live_... (when ready for payments) | Production only |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | pk_live_... | Production, Preview |
| `STRIPE_WEBHOOK_SECRET` | whsec_... | Production only |

### How to Add Variables:

1. Click **"Add New"** for each variable
2. Enter **Key** (variable name)
3. Enter **Value**
4. Select **Environments** (Production, Preview, Development)
5. Click **"Save"**

**Security Best Practice**: Only add `NEXT_PUBLIC_*` variables to Preview/Development. Keep all secrets (API keys, tokens) in Production only.

---

## Step 3: Deploy to Vercel

1. **Click "Deploy"** button

2. **Wait for build to complete** (usually 2-5 minutes)

3. **Check deployment logs** for any errors

4. **Visit your deployment URL**: `https://your-project.vercel.app`

5. **Test basic functionality**:
   - Homepage loads
   - Navigation works
   - Forms display correctly

---

## Step 4: Configure Custom Domain

### A. Add Domain in Vercel

1. Go to **Settings** → **Domains**

2. **Add domain**: `clevelandbody.com`
   - Click "Add"
   - Vercel will show DNS configuration instructions

3. **Add domain**: `www.clevelandbody.com`
   - Click "Add"
   - Vercel will show DNS configuration instructions

4. Vercel will provide:
   - **A Record** for root domain
   - **CNAME Record** for www subdomain

### B. Configure DNS (Cloudflare Instructions)

#### If Using Cloudflare:

1. **Log in to Cloudflare Dashboard**: https://dash.cloudflare.com

2. **Select your domain**: clevelandbody.com

3. **Go to DNS** → **Records**

4. **Add/Update A Record** (Root Domain):
   ```
   Type: A
   Name: @ (or clevelandbody.com)
   IPv4 address: 76.76.21.21
   Proxy status: DNS only (gray cloud icon ☁️)
   TTL: Auto
   ```
   
   **Important**: Click the cloud icon to set to "DNS only" (gray), not "Proxied" (orange)

5. **Add/Update CNAME Record** (WWW Subdomain):
   ```
   Type: CNAME
   Name: www
   Target: cname.vercel-dns.com
   Proxy status: DNS only (gray cloud icon ☁️)
   TTL: Auto
   ```
   
   **Important**: Click the cloud icon to set to "DNS only" (gray), not "Proxied" (orange)

6. **Remove conflicting records**:
   - Delete any existing A records for `@` or root
   - Delete any existing CNAME records for `www`
   - Delete any AAAA (IPv6) records if present

7. **Save changes**

#### If Using Another DNS Provider (GoDaddy, Namecheap, etc.):

1. **Log in to your DNS provider**

2. **Go to DNS Management / DNS Settings**

3. **Add A Record**:
   ```
   Type: A
   Host: @ (or blank, or clevelandbody.com)
   Points to: 76.76.21.21
   TTL: Default or 600
   ```

4. **Add CNAME Record**:
   ```
   Type: CNAME
   Host: www
   Points to: cname.vercel-dns.com
   TTL: Default or 600
   ```

5. **Remove conflicting records** (old A or CNAME for @ and www)

6. **Save changes**

### C. Verify DNS Configuration

1. **Wait for DNS propagation** (can take 5 minutes to 48 hours, usually ~15 minutes)

2. **Check DNS with online tools**:
   - https://dnschecker.org
   - Search for `clevelandbody.com` (A record should show 76.76.21.21)
   - Search for `www.clevelandbody.com` (CNAME should show cname.vercel-dns.com)

3. **In Vercel Dashboard**:
   - Go to **Settings** → **Domains**
   - Status should change from "Invalid Configuration" to "Valid Configuration"
   - SSL certificate will be automatically provisioned (takes a few minutes)

4. **Test your domain**:
   - Visit https://clevelandbody.com
   - Visit https://www.clevelandbody.com
   - Both should work and show HTTPS (secure)

---

## Step 5: Configure Email Domain Authentication

To send emails from `@clevelandbody.com`, you need to authenticate your domain with your email service.

### For Postmark:

1. **Log in to Postmark**: https://account.postmarkapp.com

2. **Go to Servers** → **Sender Signatures**

3. **Click "Add Domain"**

4. **Enter domain**: `clevelandbody.com`

5. **Postmark provides 3 DNS records**:

   **DKIM Record (TXT)**:
   ```
   Type: TXT
   Name: pm._domainkey (or similar, Postmark will provide)
   Value: (long string provided by Postmark)
   ```

   **Return-Path Record (CNAME)**:
   ```
   Type: CNAME
   Name: pm-bounces (or similar)
   Value: (provided by Postmark)
   ```

   **SPF Record (TXT)** - Update existing or create new:
   ```
   Type: TXT
   Name: @
   Value: v=spf1 include:spf.mtasv.net ~all
   ```
   
   **Note**: If you already have an SPF record, add `include:spf.mtasv.net` to it

6. **Add these records to your DNS** (Cloudflare or other provider)

7. **Wait 24-48 hours for verification**

8. **Check status in Postmark** - should show "Verified"

### For SendGrid (Alternative):

1. **Log in to SendGrid**: https://app.sendgrid.com

2. **Go to Settings** → **Sender Authentication**

3. **Click "Authenticate Your Domain"**

4. **Select DNS provider**: Choose your provider or "Other Host"

5. **Enter domain**: `clevelandbody.com`

6. **SendGrid provides 3 CNAME records**:
   ```
   Type: CNAME
   Name: em1234.clevelandbody.com (example)
   Value: u1234567.wl123.sendgrid.net (example)
   ```

7. **Add all 3 records to your DNS**

8. **Click "Verify"** in SendGrid

9. **Wait for verification** (can take up to 48 hours)

---

## Step 6: Test Everything

### Public Website Tests

- [ ] Homepage loads correctly
- [ ] All navigation links work
- [ ] Contact form submissions work
- [ ] Appointment scheduling works
- [ ] Tow request form works
- [ ] Repair request form works
- [ ] Mobile responsive on different devices

### Customer Portal Tests

- [ ] Sign up creates new account
- [ ] Email verification works
- [ ] Login works
- [ ] Password reset works
- [ ] Create repair case
- [ ] Upload photos/documents
- [ ] View case history

### Admin Dashboard Tests

- [ ] Admin login works
- [ ] View all cases
- [ ] View appointments
- [ ] Update case status
- [ ] View tow requests
- [ ] Notification settings page

### Notification Tests

- [ ] SMS alerts sent for new case
- [ ] Email alerts sent for new appointment
- [ ] SMS alerts sent for tow request
- [ ] All staff recipients receive notifications

### Integration Tests

- [ ] Supabase connection works
- [ ] File uploads to Supabase Storage work
- [ ] Twilio SMS delivery confirmed
- [ ] Email delivery confirmed
- [ ] DNS resolves correctly
- [ ] SSL certificate active

---

## Step 7: Production Checklist

Before announcing site to customers:

- [ ] All environment variables configured
- [ ] Domain pointing correctly (clevelandbody.com and www)
- [ ] SSL certificate active (HTTPS)
- [ ] Email domain authenticated
- [ ] Twilio A2P 10DLC approved
- [ ] Admin account created
- [ ] Staff SMS recipients configured
- [ ] Email recipients configured
- [ ] Test all forms (appointment, tow, repair)
- [ ] Test notifications (SMS + email)
- [ ] Test file uploads
- [ ] Mobile testing on iOS and Android
- [ ] Browser testing (Chrome, Safari, Firefox, Edge)
- [ ] Update Google Business Profile with new website
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Google Analytics (optional)
- [ ] Create privacy policy page (if collecting personal data)
- [ ] Test contact phone number links
- [ ] Test business hours display
- [ ] Verify all branding and colors correct

---

## Troubleshooting

### Domain Not Working

**Problem**: Domain shows "This site can't be reached"

**Solutions**:
- Wait longer for DNS propagation (up to 48 hours)
- Verify DNS records are correct
- Check that DNS is not "Proxied" in Cloudflare (must be "DNS only")
- Clear browser cache or try incognito mode
- Use https://dnschecker.org to verify DNS propagation globally

### SSL Certificate Not Working

**Problem**: Browser shows "Not Secure" warning

**Solutions**:
- Wait for Vercel to provision certificate (takes 5-10 minutes after DNS verifies)
- Verify domain status in Vercel shows "Valid Configuration"
- Try visiting https://clevelandbody.com (with https://)
- Check Vercel dashboard for certificate status

### Notifications Not Sending

**Problem**: SMS or email notifications not received

**SMS Solutions**:
- Verify Twilio credentials in environment variables
- Check A2P 10DLC registration status in Twilio dashboard
- Verify phone numbers in E.164 format: +1XXXXXXXXXX
- Check Twilio logs for errors

**Email Solutions**:
- Verify email service API key
- Check domain authentication status (SPF, DKIM)
- Verify sender email matches authenticated domain
- Check spam/junk folder
- Review email service logs

### Database Errors

**Problem**: "Failed to connect to database"

**Solutions**:
- Verify Supabase URL and keys in environment variables
- Check Supabase project status
- Verify RLS policies allow access
- Check Vercel deployment logs for specific errors
- Test Supabase connection in Supabase SQL Editor

### Build Failures

**Problem**: Vercel deployment fails

**Solutions**:
- Check deployment logs in Vercel dashboard
- Verify all dependencies in package.json
- Ensure environment variables are set
- Try rebuilding: **Deployments** → **Redeploy**
- Check for TypeScript errors locally: `npm run type-check`

---

## Support Resources

### Vercel
- Documentation: https://vercel.com/docs
- Support: https://vercel.com/support
- Status: https://www.vercel-status.com

### Supabase
- Documentation: https://supabase.com/docs
- Support: https://supabase.com/support
- Status: https://status.supabase.com

### Twilio
- Documentation: https://www.twilio.com/docs
- Support: https://support.twilio.com
- Console: https://console.twilio.com

### Cloudflare
- Documentation: https://developers.cloudflare.com
- Support: https://support.cloudflare.com
- Dashboard: https://dash.cloudflare.com

---

## Post-Deployment Monitoring

### Daily Checks

- [ ] Website is accessible
- [ ] Forms are submitting
- [ ] Notifications are sending

### Weekly Checks

- [ ] Review Vercel analytics
- [ ] Check Supabase usage/limits
- [ ] Review Twilio SMS delivery rates
- [ ] Check email deliverability
- [ ] Monitor error logs

### Monthly Maintenance

- [ ] Update npm dependencies
- [ ] Review and rotate API keys if needed
- [ ] Backup database (Supabase auto-backups daily)
- [ ] Review user feedback
- [ ] Update content as needed

---

## Next Steps

After successful deployment:

1. **Update Google Business Profile** with new website URL
2. **Set up Google Search Console** for SEO
3. **Configure Google Analytics** (optional)
4. **Create social media posts** announcing new website
5. **Train staff** on admin dashboard usage
6. **Create customer onboarding materials**
7. **Plan future enhancements** (see README.md)

---

**Congratulations! Your website is now live at https://clevelandbody.com**

For technical support, refer to this guide or contact your development team.
