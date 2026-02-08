# Quick Start Guide - Gallery Banner Testing

## ⚡ Fast Setup (5 minutes)

### Step 1: Get Supabase Credentials
1. Go to https://app.supabase.com
2. Click on your Cleveland Body Shop project
3. Click **Settings** (⚙️ icon in sidebar)
4. Click **API** in the Settings menu
5. You'll see:
   - **Project URL** (starts with `https://...supabase.co`)
   - **Project API keys** section with:
     - `anon` `public` key (long string)
     - `service_role` key (long string, click "Reveal" to see)

### Step 2: Create Environment File
```bash
cd /home/user/webapp
cp .env.local.template .env.local
```

### Step 3: Edit .env.local
Open `.env.local` in your editor and replace the placeholder values:

```bash
# Replace "your_supabase_url_here" with your actual Project URL
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# Replace "your_anon_key_here" with your actual anon public key
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Replace "your_service_role_key_here" with your actual service_role key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 4: Build and Run
```bash
cd /home/user/webapp

# Install dependencies (if needed)
npm install

# Build the application
npm run build

# Start development server
npm run dev
```

### Step 5: View the Gallery Banner
1. Open your browser
2. Go to: http://localhost:3000
3. Scroll down past the red header and white CTA buttons
4. You'll see the **Gallery Banner Slideshow**!

## 🎯 What to Test

### Auto-Advance
- Wait 4 seconds - image should automatically advance
- Should loop continuously through all 84 images

### Manual Navigation
- Click **left arrow** (←) - should go to previous image
- Click **right arrow** (→) - should go to next image
- Click any **side image** - should jump to that image
- Click **dots** at bottom - should jump to that image position

### Visual Elements
- Should see 5 images: 2 left, 1 center (large), 2 right
- Center image should have white border
- Side images should be smaller and semi-transparent
- Smooth fade transitions between images

### Responsive Design
- Resize browser window
- Should work on mobile, tablet, and desktop
- Images should scale appropriately

### Gallery Link
- Click "View Full Gallery" button
- Should navigate to `/gallery` page
- Should see all 84 images in grid layout

## 🐛 Common Issues

### "Cannot find module" error
```bash
npm install
```

### "supabaseUrl is required" error
Your `.env.local` file is missing or has incorrect values. Double-check Step 3.

### Images not loading
Make sure your `/public/gallery/` directory has all the image files from `gallery-data.ts`.

### Port 3000 already in use
```bash
# Kill existing process
fuser -k 3000/tcp

# Or use different port
npm run dev -- -p 3001
```

## 📱 Testing Checklist

- [ ] Page loads without errors
- [ ] Gallery banner visible on homepage
- [ ] Shows 5 images at once
- [ ] Auto-advances every 4 seconds
- [ ] Left arrow navigates backward
- [ ] Right arrow navigates forward
- [ ] Clicking side image jumps to it
- [ ] Dot indicators work
- [ ] "View Full Gallery" button works
- [ ] Responsive on mobile (400px height)
- [ ] Responsive on desktop (500px height)
- [ ] Smooth transitions
- [ ] Images load properly

## 🚀 Ready to Deploy?

Once everything works locally:

1. **Commit any final changes:**
   ```bash
   git add -A
   git commit -m "Final adjustments to gallery banner"
   git push origin main
   ```

2. **Deploy to your hosting platform** (Vercel/Netlify)

3. **Add environment variables** to your hosting platform:
   - Go to project settings
   - Add the same 3 variables from `.env.local`
   - Redeploy

4. **Test on production:**
   - Visit clevelandbody.com
   - Verify gallery banner works
   - Test on mobile devices

## 💡 Tips

- **Performance**: Images are optimized by Next.js automatically
- **SEO**: All images have proper alt text
- **Accessibility**: Navigation buttons have aria-labels
- **Mobile**: Touch-friendly controls
- **Browser Support**: Works in all modern browsers

## 📞 Need Help?

If you encounter issues:

1. Check browser console for error messages (F12)
2. Verify `.env.local` values are correct
3. Make sure all npm dependencies are installed
4. Try clearing Next.js cache: `rm -rf .next`
5. Rebuild: `npm run build`

---

**Estimated Time:** 5 minutes from start to seeing the gallery banner live! 🎉
