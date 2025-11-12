# Google Auth Callback Fix

## Problem
After clicking Google account, it redirects back to `/auth` page instead of `/dashboard`.

## Solution Applied

I've updated two files to fix the OAuth callback:

### 1. Updated Auth Callback Route ✅
**File:** `src/app/auth/callback/route.ts`

**Changes:**
- Now uses `@supabase/ssr` (newer package)
- Properly handles cookie setting
- Better error handling
- Redirects to dashboard on success

### 2. Updated Middleware ✅
**File:** `src/middleware.ts`

**Changes:**
- Added Supabase auth middleware
- Properly manages auth cookies
- Ensures session is maintained

## What You Need to Do Now

### Step 1: Restart Your Dev Server

```bash
# Stop the server (Ctrl+C)
npm run dev
```

### Step 2: Clear Browser Data

**Important!** Clear your browser:
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

OR

Open in **Incognito/Private Window**

### Step 3: Test Google Sign-In

1. Go to: http://localhost:9002/auth
2. Click "Continue with Google"
3. Select your Google account
4. Should redirect to `/dashboard` ✅

## Still Having Issues?

### Check 1: Supabase Redirect URLs

Make sure you added this in Supabase Dashboard:
```
http://localhost:9002/auth/callback
```

Go to: https://supabase.com/dashboard/project/qrktjmaxlhutvmvrfxae/auth/url-configuration

### Check 2: Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Look for any errors
4. Share the error message if you see one

### Check 3: Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Click "Continue with Google"
4. Look for the `/auth/callback` request
5. Check if it returns 200 or an error

### Check 4: Cookies

1. Open DevTools (F12)
2. Go to Application tab
3. Click Cookies → http://localhost:9002
4. Look for Supabase cookies (sb-*)
5. If missing, auth isn't working

## Expected Flow

```
1. Click "Continue with Google"
   ↓
2. Redirect to Google Sign-In
   ↓
3. Select Google Account
   ↓
4. Redirect to: http://localhost:9002/auth/callback?code=...
   ↓
5. Exchange code for session
   ↓
6. Redirect to: http://localhost:9002/dashboard ✅
```

## Common Issues

### Issue: Still redirects to /auth

**Cause:** Browser cache or old cookies

**Fix:**
1. Clear browser cache completely
2. Try incognito window
3. Restart dev server

### Issue: "Invalid code" error

**Cause:** Code expired or already used

**Fix:**
1. Try signing in again
2. Don't refresh during the process

### Issue: Cookies not being set

**Cause:** Browser blocking third-party cookies

**Fix:**
1. Check browser cookie settings
2. Allow cookies for localhost
3. Try different browser

## Debug Mode

If still not working, check the callback URL:

1. After clicking Google Sign-In
2. You should see URL like:
   ```
   http://localhost:9002/auth/callback?code=abc123...
   ```

3. If you see this URL, the callback route is being hit
4. Check browser console for errors

## Need More Help?

Share these details:
1. What URL do you see after clicking Google?
2. Any errors in browser console?
3. What happens after the redirect?

---

**The fix is applied. Just restart your dev server and clear browser cache!** 🎉
