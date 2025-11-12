# Security System Implementation Guide

## 🔒 Overview
A comprehensive security system to prevent screenshots, tab switching, and AI agent usage on both desktop and mobile devices.

## ✅ What Has Been Implemented

### 1. Core Security Components
- **AntiScreenshot Component** (`src/components/security/anti-screenshot.tsx`)
  - Blocks keyboard screenshot shortcuts (PrtScn, Win+Shift+S, Cmd+Shift+3/4/5)
  - Prevents developer tools (F12, Ctrl+Shift+I/J/C)
  - Disables right-click context menu
  - Detects tab switching and window blur
  - Identifies automation tools (Selenium, Puppeteer, Playwright)
  - Adds invisible watermarks
  - Monitors screen recording attempts

- **MobileSecurity Component** (`src/components/security/mobile-security.tsx`)
  - Detects Android/iOS screenshot attempts
  - Prevents long-press screenshot triggers
  - Blocks screen recording on mobile
  - Detects mobile automation (Appium, UIAutomator, XCUITest)
  - Monitors background/blur events

- **SecurityProvider** (`src/components/security/security-provider.tsx`)
  - Unified wrapper for all security features
  - Automatic violation logging
  - Session tracking
  - User identification for watermarking

### 2. Backend & Database
- **API Endpoint** (`src/app/api/security/log/route.ts`)
  - Logs all security violations
  - Tracks user, IP, timestamp, user agent
  - Implements rate limiting (10 violations/hour)
  - Triggers account review on excessive violations

- **Database Migration** (`supabase/migrations/20241113000000_create_security_logs.sql`)
  - Creates `security_logs` table
  - Implements Row Level Security (RLS)
  - Adds indexes for performance
  - 90-day automatic log cleanup

### 3. UI Components
- **Security Violation Page** (`src/app/security-violation/page.tsx`)
  - User-friendly violation notice
  - Lists detected activities
  - Provides support contact options

- **Admin Dashboard** (`src/app/admin/security-logs/page.tsx`)
  - View all security violations
  - Statistics and analytics
  - Violation type breakdown
  - Recent logs table

### 4. Styling & CSS
- **Security CSS** (`src/app/globals-security.css`)
  - Prevents text selection
  - Disables drag and drop
  - Blocks image context menu
  - Prevents printing
  - Mobile-specific protections

## 🚀 Setup Instructions

### Step 1: Apply Database Migration
```bash
# If using Supabase CLI
supabase migration up

# Or apply manually in Supabase dashboard
# Copy contents of supabase/migrations/20241113000000_create_security_logs.sql
```

### Step 2: Import Security CSS
Add to your `src/app/layout.tsx`:
```tsx
import './globals-security.css';
```

### Step 3: Wrap Protected Routes
The security is already applied to the quiz layout. To add to other routes:

```tsx
import { SecurityProvider } from '@/components/security';

export default function ProtectedLayout({ children }) {
  return (
    <SecurityProvider redirectOnViolation="/security-violation">
      {children}
    </SecurityProvider>
  );
}
```

### Step 4: Add Security Class (Optional)
For additional CSS protection, add the class to protected content:
```tsx
<div className="security-protected">
  {/* Your protected content */}
</div>
```

## 📱 How It Works

### Desktop Protection
1. **Keyboard Monitoring**: Intercepts screenshot shortcuts before they execute
2. **DevTools Prevention**: Blocks F12 and developer tool shortcuts
3. **Visibility Tracking**: Detects when user switches tabs or windows
4. **Automation Detection**: Checks for webdriver and automation frameworks
5. **Watermarking**: Adds invisible user ID and timestamp overlays

### Mobile Protection
1. **Event Monitoring**: Tracks visibility changes that indicate screenshots
2. **Long Press Prevention**: Blocks long-press gestures that trigger screenshots
3. **Meta Tags**: Adds Android WebView screenshot prevention
4. **Background Detection**: Monitors when app goes to background
5. **Automation Detection**: Identifies mobile testing frameworks

### Logging System
1. Client detects violation → 2. Sends to API → 3. Logs to database → 4. Checks violation count → 5. Takes action if needed

## ⚠️ Important Limitations

### What CAN Be Prevented:
✅ Keyboard screenshot shortcuts
✅ Developer tools access
✅ Right-click context menu
✅ Tab switching (detection)
✅ Automation tool detection
✅ Screen recording API usage

### What CANNOT Be Fully Prevented:
❌ Physical camera screenshots
❌ External screen capture devices
❌ OS-level screenshot tools (can only detect)
❌ Virtual machine screenshots
❌ Hardware-based screen recording

## 🔧 Configuration Options

### SecurityProvider Props
```tsx
<SecurityProvider
  enableLogging={true}              // Enable server-side logging
  redirectOnViolation="/blocked"    // Redirect URL after violations
>
```

### AntiScreenshot Props
```tsx
<AntiScreenshot
  onViolation={(type) => {}}        // Custom violation handler
  enableWarnings={true}             // Show alert warnings
  redirectOnViolation="/blocked"    // Redirect after threshold
/>
```

## 📊 Monitoring & Analytics

### View Security Logs
Navigate to `/admin/security-logs` to see:
- Total violations
- Unique users affected
- Violations in last 24 hours
- Breakdown by violation type
- Recent violation details

### Violation Types
- `screenshot_attempt`: Keyboard shortcut detected
- `devtools_attempt`: Developer tools access
- `tab_switch`: User switched tabs
- `automation_detected`: Bot/automation detected
- `mobile_screenshot_suspected`: Mobile screenshot
- And more...

## 🛡️ Best Practices

1. **Combine with Server Validation**: Always validate on the backend
2. **Time-Limited Access**: Implement session timeouts for sensitive content
3. **User Education**: Inform users about security policies upfront
4. **Legal Protection**: Include terms of service about content protection
5. **Regular Monitoring**: Review security logs weekly
6. **Gradual Enforcement**: Start with warnings before blocking

## 🧪 Testing

### Test Desktop Protection
1. Open a protected page (e.g., `/quiz/[id]`)
2. Try pressing PrtScn → Should be blocked
3. Try F12 → Should be blocked
4. Try switching tabs → Should be detected
5. Right-click → Should be disabled

### Test Mobile Protection
1. Open on mobile device
2. Try taking screenshot → Should be detected
3. Try long-press → Should be prevented
4. Switch to another app → Should be logged

### Test Logging
1. Trigger a violation
2. Check `/admin/security-logs`
3. Verify violation appears in table

## 📝 Next Steps

1. **Apply database migration** to create security_logs table
2. **Test on staging** environment first
3. **Monitor logs** for false positives
4. **Adjust thresholds** based on user behavior
5. **Add user notifications** for violations
6. **Implement account suspension** logic if needed

## 🆘 Support

If you encounter issues:
1. Check browser console for errors
2. Verify database migration was applied
3. Check Supabase logs for API errors
4. Review security logs for patterns
5. Test in incognito mode to rule out extensions

## 📚 Additional Resources

- See `src/components/security/README.md` for detailed API documentation
- Check violation types in security logs
- Review RLS policies in Supabase dashboard
