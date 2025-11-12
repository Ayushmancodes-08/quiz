# Fix Google Authentication - Quick Checklist

## 🎯 Your Current Situation

You're testing locally and Google Sign-In redirects to localhost.

## ✅ Quick Fix (5 minutes)

### Step 1: Go to Supabase
Open this link: https://supabase.com/dashboard/project/qrktjmaxlhutvmvrfxae/auth/url-configuration

### Step 2: Add Redirect URL
In the **Redirect URLs** section, add:
```
http://localhost:9002/auth/callback
```
Click **Save**

### Step 3: Set Site URL
In the **Site URL** field, set:
```
http://localhost:9002
```
Click **Save**

### Step 4: Restart Your App
```bash
# Stop your dev server (Ctrl+C)
npm run dev
```

### Step 5: Test
1. Go to: http://localhost:9002/auth
2. Click "Continue with Google"
3. Should work now! ✅

---

## 📸 What You Should See in Supabase

```
Authentication > URL Configuration

Site URL:
┌─────────────────────────────────────┐
│ http://localhost:9002               │
└─────────────────────────────────────┘

Redirect URLs:
┌─────────────────────────────────────┐
│ http://localhost:9002/auth/callback │
│ [+ Add URL]                         │
└─────────────────────────────────────┘
```

---

## ❓ Still Not Working?

### Check 1: Is Google Provider Enabled?
1. Go to: Authentication > Providers
2. Find "Google"
3. Make sure it's **Enabled** (toggle should be ON)

### Check 2: Clear Browser Cache
1. Open browser in Incognito/Private mode
2. Try Google Sign-In again

### Check 3: Wait a Minute
Supabase takes 30-60 seconds to update settings.

---

## 🚀 When You Deploy to Production

**Remember to:**
1. Set `NEXT_PUBLIC_APP_URL` to your production domain on hosting platform
2. Add production URL to Supabase redirect URLs
3. Update Site URL in Supabase

---

**That's it!** Follow these 5 steps and Google Sign-In will work. 🎉
