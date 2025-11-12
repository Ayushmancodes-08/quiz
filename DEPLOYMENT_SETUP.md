# Deployment Setup Guide

## Environment Variables

When deploying to production, you MUST set these environment variables:

### Required Variables

```env
# Your production domain (IMPORTANT!)
NEXT_PUBLIC_APP_URL=https://your-actual-domain.com

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google AI
GOOGLE_API_KEY=your_google_ai_key
```

## Critical: NEXT_PUBLIC_APP_URL

**This variable MUST be set to your production domain!**

❌ **Wrong:**
```env
NEXT_PUBLIC_APP_URL=http://localhost:9002
```

✅ **Correct:**
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Why This Matters

The `NEXT_PUBLIC_APP_URL` is used for:
- OAuth redirect URLs (Google Sign-In)
- Email verification links
- Password reset links
- Sitemap generation
- Metadata URLs

If not set correctly, authentication will redirect to localhost instead of your production domain.

## Supabase Configuration

After deploying, update your Supabase project settings:

### 1. Update Site URL

Go to: **Supabase Dashboard → Authentication → URL Configuration**

Set **Site URL** to:
```
https://your-actual-domain.com
```

### 2. Add Redirect URLs

Add these to **Redirect URLs**:
```
https://your-actual-domain.com/auth/callback
https://your-actual-domain.com/dashboard
```

### 3. Configure Google OAuth (if using)

Go to: **Supabase Dashboard → Authentication → Providers → Google**

Make sure the **Authorized redirect URIs** includes:
```
https://your-project.supabase.co/auth/v1/callback
```

## Deployment Checklist

Before deploying:

- [ ] Set `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Set all other environment variables
- [ ] Update Supabase Site URL
- [ ] Add redirect URLs in Supabase
- [ ] Test Google Sign-In (if enabled)
- [ ] Verify email/password login works
- [ ] Check that redirects go to production domain

## Testing After Deployment

### 1. Test Email/Password Login

1. Go to your production site
2. Click "Sign In"
3. Enter credentials
4. Should redirect to `/dashboard` on your domain

### 2. Test Google Sign-In

1. Click "Continue with Google"
2. Authorize with Google
3. Should redirect back to your domain (not localhost)
4. Should land on `/dashboard`

### 3. Test Sign Up

1. Create new account
2. Should redirect to `/dashboard`
3. Profile should be created

## Common Issues

### Issue: Redirects to localhost after Google Sign-In

**Cause:** `NEXT_PUBLIC_APP_URL` not set or set to localhost

**Fix:**
1. Set `NEXT_PUBLIC_APP_URL=https://your-domain.com`
2. Rebuild and redeploy
3. Clear browser cache

### Issue: "Invalid redirect URL" error

**Cause:** Redirect URL not added in Supabase

**Fix:**
1. Go to Supabase Dashboard
2. Authentication → URL Configuration
3. Add your domain to Redirect URLs
4. Save changes

### Issue: Google Sign-In doesn't work

**Cause:** OAuth not configured properly

**Fix:**
1. Check Supabase Google provider is enabled
2. Verify redirect URIs in Google Console
3. Ensure Supabase callback URL is authorized

## Platform-Specific Instructions

### Any Cloud Platform

1. Set environment variables in platform dashboard
2. Ensure `NEXT_PUBLIC_APP_URL` is set to your domain
3. Deploy
4. Update Supabase URLs

### Self-Hosted (Docker/VPS)

1. Create `.env.production` file:
```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
GOOGLE_API_KEY=your_key
```

2. Build:
```bash
npm run build
```

3. Start:
```bash
npm start
```

4. Configure reverse proxy (nginx/Apache) to point to port 3000

## Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Verification

After deployment, verify:

```bash
# Check environment variable is set
curl https://your-domain.com/api/health

# Test authentication flow
# 1. Sign in with email/password
# 2. Sign in with Google
# 3. Create new account

# All should redirect to your domain, not localhost
```

## Support

If you still have issues:

1. Check browser console for errors
2. Check Supabase logs
3. Verify all environment variables are set
4. Clear browser cache and cookies
5. Test in incognito mode

---

**Remember:** Always set `NEXT_PUBLIC_APP_URL` to your production domain!
