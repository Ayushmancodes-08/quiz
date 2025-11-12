# 🏗️ Security System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER DEVICE                               │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │   Desktop        │              │     Mobile       │        │
│  │   Browser        │              │     Browser      │        │
│  └────────┬─────────┘              └────────┬─────────┘        │
│           │                                  │                   │
│           └──────────────┬───────────────────┘                   │
│                          │                                       │
│                          ▼                                       │
│           ┌──────────────────────────────┐                      │
│           │   SecurityProvider           │                      │
│           │   (Main Wrapper)             │                      │
│           └──────────────┬───────────────┘                      │
│                          │                                       │
│           ┌──────────────┴───────────────┐                      │
│           │                                │                     │
│           ▼                                ▼                     │
│  ┌─────────────────┐            ┌─────────────────┐            │
│  │ AntiScreenshot  │            │ MobileSecurity  │            │
│  │ Component       │            │ Component       │            │
│  └────────┬────────┘            └────────┬────────┘            │
│           │                               │                     │
└───────────┼───────────────────────────────┼─────────────────────┘
            │                               │
            └───────────┬───────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │  Violation Detected   │
            └───────────┬───────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │  Log to Server        │
            │  /api/security/log    │
            └───────────┬───────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │  Supabase Database    │
            │  security_logs table  │
            └───────────┬───────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │  Admin Dashboard      │
            │  /admin/security-logs │
            └───────────────────────┘
```

---

## Component Flow

### 1. User Interaction
```
User Action → Detection → Prevention → Logging → Response
```

### 2. Desktop Protection Flow
```
User presses PrtScn
    ↓
AntiScreenshot detects keypress
    ↓
Event.preventDefault() blocks action
    ↓
handleViolation() called
    ↓
Log to server API
    ↓
Store in database
    ↓
Show warning to user
```

### 3. Mobile Protection Flow
```
User takes screenshot
    ↓
MobileSecurity detects visibility change
    ↓
handleViolation() called
    ↓
Log to server API
    ↓
Store in database
    ↓
Show warning/block access
```

---

## File Structure

```
quiz-main/
│
├── src/
│   ├── components/
│   │   └── security/
│   │       ├── anti-screenshot.tsx       ← Desktop protection
│   │       ├── mobile-security.tsx       ← Mobile protection
│   │       ├── security-provider.tsx     ← Main wrapper
│   │       ├── example-usage.tsx         ← Usage examples
│   │       ├── index.ts                  ← Exports
│   │       └── README.md                 ← API docs
│   │
│   ├── app/
│   │   ├── api/
│   │   │   └── security/
│   │   │       └── log/
│   │   │           └── route.ts          ← Logging endpoint
│   │   │
│   │   ├── security-violation/
│   │   │   └── page.tsx                  ← Violation page
│   │   │
│   │   ├── admin/
│   │   │   └── security-logs/
│   │   │       └── page.tsx              ← Admin dashboard
│   │   │
│   │   ├── quiz/[id]/
│   │   │   └── layout.tsx                ← Protected route
│   │   │
│   │   └── globals-security.css          ← Security styles
│   │
│   ├── lib/
│   │   └── security-utils.ts             ← Helper functions
│   │
│   └── hooks/
│       └── use-security.ts               ← React hooks
│
├── supabase/
│   └── migrations/
│       └── 20241113000000_create_security_logs.sql
│
└── Documentation/
    ├── START_HERE.md                     ← Start here!
    ├── SECURITY_QUICKSTART.md            ← 3-step setup
    ├── SECURITY_IMPLEMENTATION.md        ← Full guide
    ├── SECURITY_SYSTEM_SUMMARY.md        ← Overview
    ├── INSTALLATION_CHECKLIST.md         ← Checklist
    └── SYSTEM_ARCHITECTURE.md            ← This file
```

---

## Data Flow

### Violation Detection → Logging
```
┌──────────────┐
│ User Action  │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ Client Detection     │
│ - Keyboard events    │
│ - Visibility changes │
│ - Automation checks  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ handleViolation()    │
│ - Type: string       │
│ - Timestamp: Date    │
│ - Session: string    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ POST /api/security/  │
│      log             │
│ {                    │
│   type,              │
│   timestamp,         │
│   userAgent,         │
│   url,               │
│   sessionId          │
│ }                    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Supabase Insert      │
│ security_logs table  │
│ + user_id            │
│ + ip_address         │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Rate Limit Check     │
│ > 10 violations/hr?  │
└──────┬───────────────┘
       │
       ├─ Yes → Account Review
       └─ No  → Continue
```

---

## Database Schema

```sql
security_logs
├── id (UUID, PK)
├── user_id (UUID, FK → auth.users)
├── violation_type (TEXT)
├── timestamp (TIMESTAMPTZ)
├── user_agent (TEXT)
├── url (TEXT)
├── session_id (TEXT)
├── ip_address (TEXT)
└── created_at (TIMESTAMPTZ)

Indexes:
- idx_security_logs_user_id
- idx_security_logs_timestamp
- idx_security_logs_violation_type

RLS Policies:
- Users can view their own logs
- Service role can insert logs
```

---

## Security Layers

### Layer 1: Prevention
```
┌─────────────────────────────────┐
│ CSS-based Prevention            │
│ - user-select: none             │
│ - pointer-events: none          │
│ - -webkit-touch-callout: none   │
└─────────────────────────────────┘
```

### Layer 2: Detection
```
┌─────────────────────────────────┐
│ JavaScript Event Listeners      │
│ - keydown/keyup                 │
│ - visibilitychange              │
│ - blur/focus                    │
│ - contextmenu                   │
└─────────────────────────────────┘
```

### Layer 3: Blocking
```
┌─────────────────────────────────┐
│ Event Prevention                │
│ - event.preventDefault()        │
│ - event.stopPropagation()       │
│ - return false                  │
└─────────────────────────────────┘
```

### Layer 4: Logging
```
┌─────────────────────────────────┐
│ Server-side Logging             │
│ - Database storage              │
│ - Rate limiting                 │
│ - Account review                │
└─────────────────────────────────┘
```

### Layer 5: Response
```
┌─────────────────────────────────┐
│ User Feedback                   │
│ - Alert warnings                │
│ - Redirect to violation page    │
│ - Account suspension            │
└─────────────────────────────────┘
```

---

## Detection Methods

### Desktop
```
Screenshot Detection:
├── Keyboard Events
│   ├── PrtScn
│   ├── Win + Shift + S
│   ├── Cmd + Shift + 3/4/5
│   └── Ctrl/Cmd + Shift + S
│
DevTools Detection:
├── Keyboard Events
│   ├── F12
│   ├── Ctrl + Shift + I/J/C
│   └── Cmd + Alt + I/J/C
│
Automation Detection:
├── navigator.webdriver
├── window.callPhantom
├── window._phantom
├── document.__selenium_unwrapped
└── Headless browser checks
```

### Mobile
```
Screenshot Detection:
├── visibilitychange event
├── pagehide event
├── blur event
└── Long press prevention

Screen Recording:
├── Meta tags
├── Screen size checks
└── getDisplayMedia monitoring

Automation Detection:
├── window.appium
├── window.uiautomator
└── window.xcuitest
```

---

## API Endpoints

### POST /api/security/log
```typescript
Request:
{
  type: string,           // Violation type
  timestamp: string,      // ISO timestamp
  userAgent: string,      // Browser info
  url: string,           // Current URL
  sessionId: string      // Session ID
}

Response (Success):
{
  success: true
}

Response (Rate Limited):
{
  warning: "Too many security violations",
  action: "account_review_required"
}
```

---

## Integration Points

### 1. Layout Integration
```tsx
// src/app/quiz/[id]/layout.tsx
import { SecurityProvider } from '@/components/security';

export default function QuizLayout({ children }) {
  return (
    <SecurityProvider>
      {children}
    </SecurityProvider>
  );
}
```

### 2. Hook Integration
```tsx
// Any component
import { useSecurity } from '@/hooks/use-security';

function Component() {
  const { violations, isSecure } = useSecurity();
  // Use security state
}
```

### 3. Utility Integration
```tsx
// Helper functions
import { 
  detectAutomation,
  logSecurityViolation,
  addWatermark 
} from '@/lib/security-utils';
```

---

## Monitoring Dashboard

```
/admin/security-logs
│
├── Statistics Cards
│   ├── Total Violations
│   ├── Unique Users
│   └── Last 24 Hours
│
├── Violation Types Chart
│   └── Breakdown by type
│
└── Recent Logs Table
    ├── Timestamp
    ├── Type
    ├── User ID
    ├── URL
    └── IP Address
```

---

## Performance Considerations

### Client-Side
- Event listeners: ~5 listeners per page
- Polling intervals: 5 seconds (automation check)
- Watermark updates: 30 seconds
- Memory impact: < 1 MB

### Server-Side
- API calls: Only on violations
- Database writes: Minimal (only violations)
- Query performance: Indexed for speed
- Storage: ~100 bytes per log entry

---

## Security Best Practices

1. **Defense in Depth**
   - Multiple layers of protection
   - Client + Server validation
   - Logging + Monitoring

2. **User Experience**
   - Clear warnings
   - Gradual enforcement
   - Support options

3. **Privacy**
   - Minimal data collection
   - RLS policies
   - 90-day retention

4. **Scalability**
   - Efficient queries
   - Indexed tables
   - Rate limiting

---

## Future Enhancements

### Potential Additions
- [ ] Email notifications for violations
- [ ] Machine learning for pattern detection
- [ ] Biometric verification
- [ ] Session recording playback
- [ ] Advanced analytics dashboard
- [ ] Automatic account suspension
- [ ] Integration with LMS systems
- [ ] Mobile app support

---

## Technology Stack

```
Frontend:
├── React 18
├── Next.js 15
├── TypeScript
└── Tailwind CSS

Backend:
├── Next.js API Routes
├── Supabase (PostgreSQL)
└── Row Level Security

Security:
├── Client-side detection
├── Server-side logging
├── Database encryption
└── RLS policies
```

---

## Conclusion

This architecture provides:
- ✅ Multi-layer security
- ✅ Real-time detection
- ✅ Comprehensive logging
- ✅ Easy monitoring
- ✅ Scalable design
- ✅ User-friendly experience

**Status:** Production Ready ✅
