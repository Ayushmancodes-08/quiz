# Security System Documentation

## Overview
This security system prevents screenshots, tab switching, automation tools, and AI agents from accessing protected content on both desktop and mobile devices.

## Features

### Desktop Protection
- **Screenshot Prevention**: Blocks PrtScn, Win+Shift+S, Cmd+Shift+3/4/5
- **Developer Tools**: Prevents F12, Ctrl+Shift+I/J/C
- **Context Menu**: Disables right-click
- **Tab Switching Detection**: Monitors visibility changes
- **Automation Detection**: Detects Selenium, Puppeteer, Playwright, etc.
- **Watermarking**: Adds invisible watermarks to content
- **Screen Recording Detection**: Monitors for recording attempts

### Mobile Protection
- **Screenshot Detection**: Monitors for Android/iOS screenshot events
- **Long Press Prevention**: Blocks long-press screenshot triggers
- **Screen Recording Prevention**: Adds meta tags and detection
- **Automation Detection**: Detects Appium, UIAutomator, XCUITest
- **Background Detection**: Monitors when app goes to background

### Logging & Monitoring
- All violations are logged to Supabase
- Tracks user, timestamp, IP, user agent, and session
- Automatic account review after 10 violations per hour
- 90-day log retention

## Usage

### Basic Implementation
\`\`\`tsx
import { SecurityProvider } from '@/components/security';

export default function Layout({ children }) {
  return (
    <SecurityProvider>
      {children}
    </SecurityProvider>
  );
}
\`\`\`

### With Custom Redirect
\`\`\`tsx
<SecurityProvider redirectOnViolation="/blocked">
  {children}
</SecurityProvider>
\`\`\`

### Individual Components
\`\`\`tsx
import { AntiScreenshot, MobileSecurity } from '@/components/security';

<AntiScreenshot onViolation={(type) => console.log(type)} />
<MobileSecurity onViolation={(type) => console.log(type)} />
\`\`\`

## Database Setup

Run the migration:
\`\`\`bash
supabase migration up
\`\`\`

Or apply manually:
\`\`\`sql
-- See supabase/migrations/20241113000000_create_security_logs.sql
\`\`\`

## Limitations

### What CAN be prevented:
✅ Keyboard screenshot shortcuts
✅ Developer tools access
✅ Right-click context menu
✅ Tab switching detection
✅ Automation tool detection
✅ Screen recording API detection

### What CANNOT be fully prevented:
❌ Physical camera screenshots
❌ External screen capture devices
❌ OS-level screenshot tools (can only detect)
❌ Virtual machine screenshots
❌ Hardware-based screen recording

## Best Practices

1. **Combine with Server-Side Validation**: Always validate on the server
2. **Time-Limited Access**: Implement session timeouts
3. **Watermarking**: Use visible or invisible watermarks
4. **User Education**: Inform users about security policies
5. **Legal Protection**: Include terms of service
6. **Monitoring**: Regularly review security logs

## API Endpoints

### POST /api/security/log
Logs security violations
\`\`\`json
{
  "type": "screenshot_attempt",
  "timestamp": "2024-11-13T10:00:00Z",
  "userAgent": "...",
  "url": "/quiz/123",
  "sessionId": "..."
}
\`\`\`

## Configuration

Customize behavior in SecurityProvider:
- \`enableLogging\`: Enable/disable server logging (default: true)
- \`redirectOnViolation\`: Redirect URL after violations (default: '/security-violation')
- \`enableWarnings\`: Show alert warnings (default: true)

## Violation Types

- \`screenshot_attempt\`: Keyboard screenshot shortcut detected
- \`devtools_attempt\`: Developer tools access attempt
- \`context_menu\`: Right-click context menu
- \`tab_switch\`: User switched tabs
- \`window_blur\`: Window lost focus
- \`automation_detected\`: Webdriver detected
- \`bot_detected\`: Bot/automation framework detected
- \`headless_browser\`: Headless browser detected
- \`screen_recording_attempt\`: Screen recording API used
- \`mobile_screenshot_suspected\`: Mobile screenshot suspected
- \`long_press_detected\`: Long press (screenshot trigger) detected
- \`appium_detected\`: Appium automation detected

## Support

For issues or questions, contact your development team.
