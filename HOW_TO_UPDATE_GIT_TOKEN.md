# How to Update Git Remote with New Token

## Step 1: Generate New GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens

2. Click **"Generate new token"** → **"Generate new token (classic)"**

3. Configure token:
   - **Note**: `webapp-deployment` (or any name you want)
   - **Expiration**: 90 days (or your preference)
   - **Select scopes**: Check `repo` (Full control of private repositories)

4. Click **"Generate token"** at bottom

5. **COPY THE TOKEN IMMEDIATELY** (starts with `ghp_...`)
   - ⚠️ You can only see it once!
   - Save it somewhere safe

---

## Step 2: Update Git Remote URL

Once you have your new token, run these commands:

### **Method 1: Using Token in URL** (Recommended)

```bash
cd /home/user/webapp

# Replace YOUR_TOKEN_HERE with your actual token
git remote set-url origin https://YOUR_TOKEN_HERE@github.com/tzira333/cleveland-auto-body.git

# Verify it was set correctly
git remote -v

# Now push
git push origin main
```

### **Example with actual token:**
```bash
# If your token is: ghp_1234567890abcdefghijklmnopqrstuvwxyz
git remote set-url origin https://ghp_1234567890abcdefghijklmnopqrstuvwxyz@github.com/tzira333/cleveland-auto-body.git
```

---

### **Method 2: Using x-access-token Format** (Alternative)

```bash
cd /home/user/webapp

# Replace YOUR_TOKEN_HERE with your actual token
git remote set-url origin https://x-access-token:YOUR_TOKEN_HERE@github.com/tzira333/cleveland-auto-body.git

# Push
git push origin main
```

---

## Step 3: Push Your Code

After updating the remote, push all your commits:

```bash
cd /home/user/webapp
git push origin main
```

You should see:
```
Enumerating objects: 42, done.
Counting objects: 100% (42/42), done.
...
To https://github.com/tzira333/cleveland-auto-body.git
   d5857d4..03a993d  main -> main
```

---

## Step 4: Verify Push Succeeded

Check GitHub:
1. Go to: https://github.com/tzira333/cleveland-auto-body/commits/main
2. You should see your recent commits (7f395a7, fb925c5, 03a993d, etc.)

Check Vercel:
1. Go to: https://vercel.com/andres-projects-1b1915bc/clevelandbody-site/deployments
2. Should see new deployment starting within 1-2 minutes

---

## 🔒 Security Notes

### **Keep Your Token Safe:**
- ✅ Never share your token
- ✅ Never commit it to a repository
- ✅ Store it in a password manager
- ❌ Don't post it in chat/email

### **Token Format:**
- Starts with `ghp_` (Personal Access Token)
- OR starts with `ghs_` (GitHub App token)
- 40+ characters long

### **If Token is Compromised:**
1. Go to: https://github.com/settings/tokens
2. Find the token
3. Click **"Delete"**
4. Generate a new one

---

## 🐛 Troubleshooting

### **Error: "Invalid username or token"**
- Token is wrong or expired
- Generate a new token
- Make sure you copied it completely

### **Error: "Permission denied"**
- Token doesn't have `repo` scope
- Generate new token with correct permissions

### **Error: "Repository not found"**
- Token doesn't have access to the repository
- Check repository name is correct
- Verify token has access to private repos

### **Push works but Vercel doesn't deploy**
- Check Vercel dashboard for errors
- Verify repository is connected to Vercel project
- Check build logs for errors

---

## 📋 Quick Command Reference

```bash
# Update remote URL with token
git remote set-url origin https://YOUR_TOKEN@github.com/tzira333/cleveland-auto-body.git

# Verify remote
git remote -v

# Check what will be pushed
git status

# Push to GitHub
git push origin main

# Force push (if needed - use with caution)
git push -f origin main
```

---

## ✅ Complete Workflow

1. **Generate token** on GitHub (https://github.com/settings/tokens)
2. **Copy token** (ghp_...)
3. **Update remote**: `git remote set-url origin https://TOKEN@github.com/USER/REPO.git`
4. **Push code**: `git push origin main`
5. **Verify** on GitHub and Vercel
6. **Wait 5-10 min** for deployment
7. **Test** on production website

---

## 🎯 Your Specific Commands

For your situation:

```bash
cd /home/user/webapp

# Replace TOKEN_HERE with your actual token from GitHub
git remote set-url origin https://TOKEN_HERE@github.com/tzira333/cleveland-auto-body.git

# Push all 6 commits
git push origin main

# Check status
git log --oneline -6
```

Expected result:
```
03a993d Explanation of deployment pipeline
fb925c5 Deployment guide for appointment edit feature
7f395a7 Add full appointment edit functionality ← THE IMPORTANT ONE
30a2fa6 File upload fix
894b1ed Success documentation
67953a2 Migration guide
```

All 6 commits will be pushed to GitHub, then Vercel will auto-deploy.

---

**Time needed**: 5 minutes  
**Difficulty**: Easy  
**Result**: Code deployed to production
