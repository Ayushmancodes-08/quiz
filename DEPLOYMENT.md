# Vercel Deployment Guide

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/quizmasterai)

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- Supabase account
- Google AI API key

## Step-by-Step Deployment

### 1. Prepare Your Repository

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/quizmasterai.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### 3. Configure Environment Variables

In Vercel project settings, add these environment variables:

#### Required Variables

```env
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_API_KEY=your_google_ai_key
```

#### How to Add Variables

1. Go to Project Settings → Environment Variables
2. Add each variable for Production, Preview, and Development
3. Click "Save"

### 4. Deploy

Click "Deploy" - Vercel will:
- Install dependencies
- Run build
- Deploy to production

### 5. Configure Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain

### 6. Post-Deployment Setup

#### Update Supabase Redirect URLs

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel URL to:
   - Site URL: `https://your-project.vercel.app`
   - Redirect URLs: `https://your-project.vercel.app/auth/callback`

#### Update robots.txt

Edit `public/robots.txt` with your actual domain:
```txt
Sitemap: https://your-project.vercel.app/sitemap.xml
```

## Vercel Configuration

### Build Settings

The project includes `vercel.json` with optimal settings:

```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

### Performance Optimizations

- ✅ Image optimization (AVIF/WebP)
- ✅ Automatic code splitting
- ✅ Edge caching
- ✅ Compression enabled
- ✅ Security headers

### Environment-Specific Builds

**Production:**
```bash
vercel --prod
```

**Preview:**
```bash
vercel
```

## Monitoring & Analytics

### Vercel Analytics

1. Go to Project → Analytics
2. Enable Web Analytics (free)
3. View real-time performance metrics

### Speed Insights

1. Go to Project → Speed Insights
2. Enable (free)
3. Monitor Core Web Vitals

## Troubleshooting

### Build Fails

**Check:**
- All environment variables are set
- TypeScript has no errors: `npm run typecheck`
- ESLint passes: `npm run lint`

**Common Issues:**
```bash
# Clear cache and rebuild
npm run clean
npm install
npm run build
```

### Runtime Errors

**Check Vercel Logs:**
1. Go to Deployments
2. Click on deployment
3. View Function Logs

**Common Issues:**
- Missing environment variables
- Supabase connection issues
- API rate limits

### Database Connection

**Verify Supabase:**
```bash
npm run db:check
```

**Check:**
- Supabase URL is correct
- Anon key is valid
- Tables exist
- RLS policies are enabled

## Performance Tips

### 1. Enable Edge Functions

For API routes, use Edge Runtime:
```typescript
export const runtime = 'edge';
```

### 2. Optimize Images

Use Next.js Image component:
```tsx
import Image from 'next/image';
<Image src="/icon.svg" alt="Logo" width={100} height={100} />
```

### 3. Enable ISR

For static pages with dynamic data:
```typescript
export const revalidate = 3600; // 1 hour
```

### 4. Use Vercel KV (Optional)

For caching and rate limiting:
```bash
npm install @vercel/kv
```

## Security

### Environment Variables

- ✅ Never commit `.env.local`
- ✅ Use Vercel's encrypted storage
- ✅ Rotate keys regularly

### Headers

Security headers are configured in `next.config.ts`:
- HSTS
- CSP
- X-Frame-Options
- X-Content-Type-Options

### Rate Limiting

Consider adding rate limiting for API routes:
```typescript
import { Ratelimit } from '@upstash/ratelimit';
```

## Scaling

### Free Tier Limits

- 100 GB bandwidth/month
- Unlimited deployments
- 100 GB-hours serverless function execution

### Pro Tier Benefits

- 1 TB bandwidth/month
- Advanced analytics
- Team collaboration
- Priority support

## Continuous Deployment

### Automatic Deployments

Vercel automatically deploys:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

### Branch Deployments

Each branch gets a unique URL:
```
https://quizmasterai-git-feature-branch.vercel.app
```

## Rollback

If deployment fails:

1. Go to Deployments
2. Find previous working deployment
3. Click "Promote to Production"

## Custom Build Command

If needed, customize in `vercel.json`:
```json
{
  "buildCommand": "npm run build && npm run postbuild"
}
```

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)

## Checklist

Before deploying:

- [ ] All environment variables configured
- [ ] Supabase database set up
- [ ] Google AI API key obtained
- [ ] Repository pushed to GitHub
- [ ] Build passes locally (`npm run build`)
- [ ] TypeScript checks pass (`npm run typecheck`)
- [ ] ESLint passes (`npm run lint`)

After deploying:

- [ ] Site loads correctly
- [ ] Authentication works
- [ ] Quiz creation works
- [ ] Database operations work
- [ ] Custom domain configured (if applicable)
- [ ] Supabase redirect URLs updated
- [ ] Analytics enabled

---

**Your QuizMasterAI is now live on Vercel! 🎉**
