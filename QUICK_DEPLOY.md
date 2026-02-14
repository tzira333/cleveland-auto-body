# 🚀 Quick Deploy to Vercel (5 Minutes)

## Step-by-Step Instructions

### 1️⃣ Authorize GitHub (Required First)

**You need to do this in the UI**:
1. Look for **#github tab** or **GitHub icon** in your code sandbox interface
2. Click "Authorize GitHub" or "Connect to GitHub"
3. Complete the OAuth authorization flow
4. Grant access to create/push to repositories

**⚠️ Without this, you cannot push code to GitHub!**

---

### 2️⃣ Once GitHub is Authorized, Run These Commands:

```bash
# Navigate to project
cd /home/user/webapp

# Check current status
git status
git log --oneline | head -5

# Create GitHub repository (after authorization)
# You'll do this through GitHub UI or the sandbox will help you

# Push code to GitHub
git push -u origin main
```

---

### 3️⃣ Deploy to Vercel

1. **Go to**: https://vercel.com/signup
2. **Sign up** with GitHub (Continue with GitHub)
3. **Click**: "Add New..." → "Project"
4. **Import** your repository
5. **Add Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=<your-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-secret>
   ```
6. **Click**: Deploy
7. **Wait**: 2-3 minutes
8. **Done**: Your app is live! 🎉

---

## 🔐 Get Supabase Credentials

```bash
# Go to: https://app.supabase.com
# Select: Cleveland Body Shop project
# Navigate: Settings → API
# Copy:
#   - Project URL → NEXT_PUBLIC_SUPABASE_URL
#   - anon public → NEXT_PUBLIC_SUPABASE_ANON_KEY
#   - service_role → SUPABASE_SERVICE_ROLE_KEY
```

---

## ✅ Verification

After deployment, test these URLs:

```
https://your-project.vercel.app
https://your-project.vercel.app/portal
https://your-project.vercel.app/admin/staff/login
https://your-project.vercel.app/gallery
```

---

## 🆘 Need Help?

**Full Guide**: Read `VERCEL_DEPLOYMENT_GUIDE.md` for complete instructions

**Common Issues**:
- GitHub not authorized → Check #github tab
- Build fails → Check environment variables
- 500 errors → Check Vercel Function Logs

---

**Total Time**: 5-10 minutes
**Difficulty**: Easy
**Cost**: FREE (Vercel + Supabase free tiers)
