# Google Authentication Setup Guide

## Problem: Google Sign-In redirects to localhost

This happens because you need to configure Supabase redirect URLs.

## Solution (Choose your scenario)

---

## Scenario 1: Testing Locally (on your computer)

### Step 1: Keep your .env.local as is
```env
NEXT_PUBLIC_APP_URL=http://localhost:9002
```
✅ This is CORRECT for local development

### Step 2: Configure Supabase for localhost

1. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard
   - Click on your project: `qrktjmaxlhutvmvrfxae`

2. **Go to Authentication Settings:**
   - Click **Authentication** in left sidebar
   - Click **URL Configuration**

3. **Add localhost redirect URL:**
   - Find the **Redirect URLs** section
   - Click **Add URL**
   - Enter: `http://localhost:9002/auth/callback`
   - Click **Save**

4. **Set Site URL (if not set):**
   - In the same page, find **Site URL**
   - Set to: `http://localhost:9002`
   - Click **Save**

### Step 3: Test Google Sign-In

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Go to: http://localhost:9002/auth

3. Click "Continue with Google"

4. Should now work! ✅

---

## Scenario 2: Deployed to Production

### Step 1: Set production environment variable

On your hosting platform (wherever you deployed), set:
```env
NEXT_PUBLIC_APP_URL=https://your-actual-domain.com
```

**Replace `your-actual-domain.com` with your real domain!**

### Step 2: Configure Supabase for production

1. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard
   - Click on your project

2. **Update Site URL:**
   - Go to: **Authentication** → **URL Configuration**
   - Set **Site URL** to: `https://your-actual-domain.com`
   - Click **Save**

3. **Add production redirect URL:**
   - In **Redirect URLs** section
   - Click **Add URL**
   - Enter: `https://your-actual-domain.com/auth/callback`
   - Click **Save**

### Step 3: Rebuild and deploy

```bash
npm run build
# Deploy to your hosting platform
```

---

## Quick Visual Guide

### Supabase Dashboard Location:

```
Supabase Dashboard
  └── Your Project (qrktjmaxlhutvmvrfxae)
      └── Authentication (left sidebar)
          └── URL Configuration
              ├── Site URL: [Your domain here]
              └── Redirect URLs:
                  ├── http://localhost:9002/auth/callback (for local)
                  └── https://your-domain.com/auth/callback (for production)
```

---

## Common Mistakes

❌ **Wrong:** Setting production domain in `.env.local`
```env
NEXT_PUBLIC_APP_URL=https://my-site.com  # Don't do this for local dev!
```

✅ **Correct:** Use localhost for local development
```env
NEXT_PUBLIC_APP_URL=http://localhost:9002  # Correct for local dev
```

❌ **Wrong:** Not adding redirect URL in Supabase
- Google Sign-In will fail or redirect incorrectly

✅ **Correct:** Add redirect URL in Supabase Dashboard
- Must match your `NEXT_PUBLIC_APP_URL` + `/auth/callback`

---

## Troubleshooting

### Issue: Still redirects to localhost after adding URL

**Solution:**
1. Clear browser cache
2. Restart dev server: `npm run dev`
3. Try in incognito/private window
4. Wait 1-2 minutes for Supabase to update

### Issue: "Invalid redirect URL" error

**Solution:**
1. Check Supabase redirect URLs
2. Make sure URL exactly matches (including http/https)
3. Include `/auth/callback` at the end

### Issue: Works locally but not in production

**Solution:**
1. Set `NEXT_PUBLIC_APP_URL` on hosting platform
2. Add production URL to Supabase
3. Rebuild and redeploy

---

## Summary

**For Local Development:**
- `.env.local`: `NEXT_PUBLIC_APP_URL=http://localhost:9002`
- Supabase: Add `http://localhost:9002/auth/callback`

**For Production:**
- Hosting platform: `NEXT_PUBLIC_APP_URL=https://your-domain.com`
- Supabase: Add `https://your-domain.com/auth/callback`

---

## Need Help?

1. Check you're using the correct Supabase project
2. Verify redirect URLs are saved in Supabase
3. Restart your dev server
4. Clear browser cache

**Your Supabase Project:** qrktjmaxlhutvmvrfxae
**Dashboard:** https://supabase.com/dashboard/project/qrktjmaxlhutvmvrfxae
