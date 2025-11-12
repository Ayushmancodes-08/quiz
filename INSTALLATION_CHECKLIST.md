# ✅ Security System Installation Checklist

## Pre-Installation
- [ ] Backup your database
- [ ] Review current security policies
- [ ] Test on staging environment first

---

## Step 1: Database Setup

### Apply Migration
```bash
# Option A: Using Supabase CLI
supabase migration up

# Option B: Manual (Supabase Dashboard)
# 1. Go to SQL Editor in Supabase Dashboard
# 2. Copy contents from: supabase/migrations/20241113000000_create_security_logs.sql
# 3. Click "Run"
```

### Verify Migration
- [ ] Check that `security_logs` table exists
- [ ] Verify RLS policies are enabled
- [ ] Test insert permission

```sql
-- Test query (run in SQL Editor)
SELECT * FROM security_logs LIMIT 1;
```

---

## Step 2: Code Integration

### Already Protected Routes
✅ `/quiz/[id]` - Already has SecurityProvider

### Add to Other Routes (Optional)
```tsx
// Example: src/app/exam/layout.tsx
import { SecurityProvider } from '@/components/security';

export default function Layout({ children }) {
  return (
    <SecurityProvider>
      {children}
    </SecurityProvider>
  );
}
```

### Import Security CSS (Optional)
Add to `src/app/layout.tsx`:
```tsx
import './globals-security.css';
```

---

## Step 3: Testing

### Desktop Tests
- [ ] Open `/quiz/[id]` page
- [ ] Press `PrtScn` → Should show alert
- [ ] Press `F12` → Should be blocked
- [ ] Right-click → Should be disabled
- [ ] Switch to another tab → Should be logged
- [ ] Return to tab → Check console for logs

### Mobile Tests (Use Real Device)
- [ ] Open protected page on mobile
- [ ] Try taking screenshot → Should be detected
- [ ] Try long-press → Should be prevented
- [ ] Switch to another app → Should be logged
- [ ] Return to app → Verify still works

### Logging Tests
- [ ] Trigger a violation
- [ ] Navigate to `/admin/security-logs`
- [ ] Verify violation appears in table
- [ ] Check violation count increases
- [ ] Verify timestamp is correct

---

## Step 4: Configuration

### Adjust Settings (Optional)
Edit `src/app/quiz/[id]/layout.tsx`:

```tsx
<SecurityProvider
  enableLogging={true}              // Enable/disable logging
  redirectOnViolation="/blocked"    // Change redirect URL
>
```

### Customize Violation Threshold
Edit `src/components/security/anti-screenshot.tsx`:
```tsx
const violationThreshold = 3; // Change from 3 to your preferred number
```

---

## Step 5: Monitoring Setup

### Access Admin Dashboard
- [ ] Navigate to `/admin/security-logs`
- [ ] Verify statistics display correctly
- [ ] Check violation types breakdown
- [ ] Review recent logs table

### Set Up Alerts (Optional)
Create a cron job or scheduled function to check for excessive violations:

```typescript
// Example: Check every hour
async function checkSecurityAlerts() {
  const stats = await getSecurityStats();
  if (stats.last24Hours > 100) {
    // Send alert to admin
    sendEmailAlert('High security violations detected');
  }
}
```

---

## Step 6: User Communication

### Inform Users
- [ ] Add security policy to Terms of Service
- [ ] Display notice on protected pages
- [ ] Explain consequences of violations

### Example Notice
```tsx
<div className="bg-blue-50 border border-blue-200 p-4 rounded mb-4">
  <p className="text-sm text-blue-900">
    🔒 This content is protected. Screenshots, tab switching, and 
    automation tools are monitored for security purposes.
  </p>
</div>
```

---

## Step 7: Production Deployment

### Pre-Deployment Checklist
- [ ] All tests passing
- [ ] Database migration applied
- [ ] Staging environment tested
- [ ] User communication prepared
- [ ] Monitoring dashboard accessible

### Deploy
```bash
# Build and deploy
npm run build
# Deploy to your hosting platform
```

### Post-Deployment
- [ ] Test on production URL
- [ ] Verify logging works
- [ ] Check admin dashboard
- [ ] Monitor for issues

---

## Troubleshooting

### Issue: Violations Not Logging
**Solution:**
1. Check database migration applied: `SELECT * FROM security_logs;`
2. Verify Supabase connection in `.env.local`
3. Check browser console for API errors
4. Test API endpoint: `POST /api/security/log`

### Issue: False Positives
**Solution:**
1. Review violation types in logs
2. Adjust detection sensitivity
3. Disable specific checks if needed
4. Increase violation threshold

### Issue: Not Working on Mobile
**Solution:**
1. Test on actual device (not emulator)
2. Check mobile browser compatibility
3. Verify mobile-specific code is running
4. Review mobile logs separately

### Issue: Performance Impact
**Solution:**
1. Reduce polling frequency
2. Disable watermarking if not needed
3. Optimize database queries
4. Add indexes to security_logs table

---

## Verification Commands

### Check Files Exist
```bash
# Windows PowerShell
Get-ChildItem -Path "src\components\security" -Recurse
Get-ChildItem -Path "supabase\migrations" -Filter "*security*"
```

### Check Database
```sql
-- Verify table exists
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'security_logs';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'security_logs';

-- View recent logs
SELECT * FROM security_logs ORDER BY timestamp DESC LIMIT 10;
```

### Check API Endpoint
```bash
# Test logging endpoint
curl -X POST http://localhost:9002/api/security/log \
  -H "Content-Type: application/json" \
  -d '{"type":"test","timestamp":"2024-11-13T10:00:00Z"}'
```

---

## Rollback Plan

### If Issues Occur
1. **Disable Security Provider**
   ```tsx
   // Comment out in layout.tsx
   // <SecurityProvider>
   {children}
   // </SecurityProvider>
   ```

2. **Revert Database Migration**
   ```sql
   DROP TABLE IF EXISTS security_logs;
   ```

3. **Remove Imports**
   ```tsx
   // Remove from files
   // import { SecurityProvider } from '@/components/security';
   ```

---

## Success Criteria

✅ **Installation Successful When:**
- [ ] Database migration applied without errors
- [ ] Protected pages load correctly
- [ ] Screenshot attempts are blocked/logged
- [ ] Admin dashboard displays data
- [ ] No console errors
- [ ] Mobile protection works
- [ ] Logging to database works
- [ ] Performance is acceptable

---

## Next Steps After Installation

1. **Monitor for 1 Week**
   - Check logs daily
   - Look for patterns
   - Adjust thresholds

2. **Gather Feedback**
   - Ask users about experience
   - Check for false positives
   - Adjust as needed

3. **Optimize**
   - Review performance
   - Fine-tune detection
   - Update documentation

4. **Scale**
   - Add to more routes
   - Implement account suspension
   - Add email notifications

---

## Support Resources

- **Quick Start**: `SECURITY_QUICKSTART.md`
- **Full Guide**: `SECURITY_IMPLEMENTATION.md`
- **API Docs**: `src/components/security/README.md`
- **Examples**: `src/components/security/example-usage.tsx`
- **Summary**: `SECURITY_SYSTEM_SUMMARY.md`

---

**Installation Date:** _____________
**Installed By:** _____________
**Environment:** [ ] Staging [ ] Production
**Status:** [ ] Complete [ ] In Progress [ ] Issues

---

## Notes

_Add any installation notes, issues encountered, or customizations made:_

