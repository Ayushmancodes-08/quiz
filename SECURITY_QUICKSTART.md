# 🚀 Security System Quick Start

## 3-Step Setup

### Step 1: Apply Database Migration
```bash
# Navigate to your project
cd your-project

# Apply the migration (if using Supabase CLI)
supabase migration up

# OR manually in Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Copy contents from: supabase/migrations/20241113000000_create_security_logs.sql
# 3. Run the SQL
```

### Step 2: Add to Your Layout
The security is already applied to `/quiz/[id]` routes. To protect other routes:

```tsx
// src/app/your-protected-route/layout.tsx
import { SecurityProvider } from '@/components/security';

export default function Layout({ children }) {
  return (
    <SecurityProvider>
      {children}
    </SecurityProvider>
  );
}
```

### Step 3: Test It
1. Open a protected page
2. Try pressing `PrtScn` or `F12` → Should be blocked
3. Try right-clicking → Should be disabled
4. Check `/admin/security-logs` to see violations

## 📱 What's Protected

### Desktop
✅ Screenshot shortcuts (PrtScn, Win+Shift+S, Cmd+Shift+3/4/5)
✅ Developer tools (F12, Ctrl+Shift+I)
✅ Right-click context menu
✅ Tab switching detection
✅ Automation tools (Selenium, Puppeteer)

### Mobile
✅ Screenshot detection (Android/iOS)
✅ Long-press prevention
✅ Screen recording detection
✅ Mobile automation (Appium)

## 🔍 Monitor Violations

Visit `/admin/security-logs` to see:
- Total violations
- Violation types
- User activity
- Recent logs

## ⚙️ Configuration

```tsx
<SecurityProvider
  enableLogging={true}              // Log to database
  redirectOnViolation="/blocked"    // Where to redirect violators
>
```

## 📝 Files Created

```
src/
├── components/security/
│   ├── anti-screenshot.tsx       # Desktop protection
│   ├── mobile-security.tsx       # Mobile protection
│   ├── security-provider.tsx     # Main wrapper
│   ├── index.ts                  # Exports
│   └── README.md                 # Detailed docs
├── app/
│   ├── api/security/log/route.ts # Logging API
│   ├── security-violation/page.tsx # Violation page
│   └── admin/security-logs/page.tsx # Admin dashboard
├── lib/
│   └── security-utils.ts         # Helper functions
└── app/
    └── globals-security.css      # Security styles

supabase/migrations/
└── 20241113000000_create_security_logs.sql

Documentation:
├── SECURITY_IMPLEMENTATION.md    # Full guide
└── SECURITY_QUICKSTART.md        # This file
```

## 🆘 Troubleshooting

**Issue**: Violations not logging
- Check database migration was applied
- Verify Supabase connection
- Check browser console for errors

**Issue**: False positives
- Adjust violation threshold in code
- Review violation types in logs
- Consider disabling specific checks

**Issue**: Not working on mobile
- Test on actual device (not emulator)
- Check mobile browser compatibility
- Review mobile-specific logs

## 📚 Next Steps

1. ✅ Apply database migration
2. ✅ Test on staging environment
3. ✅ Monitor logs for patterns
4. ✅ Adjust settings as needed
5. ✅ Add to production

For detailed documentation, see `SECURITY_IMPLEMENTATION.md`
