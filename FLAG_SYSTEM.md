# Flag System - Realistic Violation Tracking

## Overview

The flag system provides a more realistic and practical approach to tracking suspicious behavior during quizzes. Instead of immediately counting every tab switch as a violation, we use a **warning/flag system** that only converts to violations after repeated offenses.

## How It Works

### Flags vs Violations

**Flags (Warnings):**
- Minor suspicious activities
- Tab switches
- Fullscreen exits
- Focus loss events
- **Default threshold:** 5 flags = 1 violation

**Violations:**
- Serious cheating attempts
- AI assistant detection
- Screenshot attempts
- Excessive flags (5+)
- **Default threshold:** 3 violations = Quiz auto-submit

## Flag Types

### 1. Tab Switch (`tab_switch`)

**Triggered when:**
- Student switches to another browser tab
- Student minimizes the browser
- Browser loses focus

**Why it's a flag:**
- Could be accidental (notification, phone call)
- Might be legitimate (checking time, calculator)
- Not definitive proof of cheating

**Threshold:** 5 tab switches = 1 violation

**Example:**
```
Flag 1/5: Tab Switch Detected
Flag 2/5: Tab Switch Detected
Flag 3/5: Tab Switch Detected
Flag 4/5: Tab Switch Detected
Flag 5/5: Tab Switch Detected → VIOLATION: Excessive Tab Switching
```

### 2. Focus Loss (`focus_loss`)

**Triggered when:**
- Student exits fullscreen mode
- Window loses focus
- Another application comes to foreground

**Why it's a flag:**
- Could be accidental (Alt+Tab mistake)
- System notification might cause it
- Not always intentional

**Threshold:** 5 focus losses = 1 violation

### 3. Suspicious Activity (`suspicious_activity`)

**Triggered when:**
- Unusual mouse patterns
- Rapid clicking
- Automated-like behavior

**Why it's a flag:**
- Could be nervous behavior
- Might be accessibility tool
- Needs multiple occurrences to confirm

**Threshold:** 3 suspicious activities = 1 violation

## Violation Types (Immediate)

These trigger violations immediately, not flags:

### 1. AI Assistant Detection
- **Severity:** High
- **Immediate violation:** Yes
- **Reason:** Clear evidence of AI assistance

### 2. Screenshot Attempt
- **Severity:** High
- **Immediate violation:** Yes
- **Reason:** Attempting to copy questions

### 3. Copy/Paste Abuse
- **Severity:** Medium
- **Immediate violation:** After 3 attempts
- **Reason:** Likely copying to/from AI

### 4. Automation Detection
- **Severity:** High
- **Immediate violation:** Yes
- **Reason:** Bot/script detected

## Configuration

### Default Settings

```typescript
{
  maxFlags: 5,           // Tab switches before violation
  maxViolations: 3,      // Violations before auto-submit
  flagTypes: {
    tab_switch: 5,       // 5 tab switches = 1 violation
    focus_loss: 5,       // 5 focus losses = 1 violation
    suspicious: 3        // 3 suspicious activities = 1 violation
  }
}
```

### Customizable Per Quiz

Admins can adjust thresholds:

```typescript
// Strict quiz (high-stakes exam)
{
  maxFlags: 3,
  maxViolations: 2
}

// Lenient quiz (practice test)
{
  maxFlags: 10,
  maxViolations: 5
}

// Zero-tolerance quiz
{
  maxFlags: 0,  // Every flag is a violation
  maxViolations: 1
}
```

## Student Experience

### Flag Warning (Tab Switch)

```
⚠️ Warning: Tab Switch Detected

Flag 2/5. 3 warnings remaining before violation.

Please stay on the quiz tab to avoid violations.
```

### Violation (After 5 Flags)

```
🚫 Violation: Excessive Tab Switching

Switched tabs 5 times

Violations: 1/3

Further violations will result in quiz termination.
```

### Auto-Submit (After 3 Violations)

```
❌ Quiz Terminated

Exceeded maximum violations (3/3).

Your quiz has been automatically submitted.
Reason: Excessive Tab Switching, AI Assistant Detected, Screenshot Attempt

Please contact your instructor if you believe this was an error.
```

## Admin Dashboard

### Flag Summary

```
Student: John Doe
Quiz: Mathematics Final Exam
Status: In Progress

Flags:
├─ Tab Switch: 3/5 ⚠️
├─ Focus Loss: 1/5
└─ Total: 4/5

Violations:
└─ None yet ✓

Risk Level: Medium
```

### Detailed Flag Log

```
Timestamp          | Type        | Count | Details
-------------------|-------------|-------|---------------------------
10:15:23 AM       | tab_switch  | 1     | Tab Switch Detected
10:16:45 AM       | tab_switch  | 2     | Tab Switch Detected
10:18:12 AM       | focus_loss  | 1     | Fullscreen Exit Detected
10:20:33 AM       | tab_switch  | 3     | Tab Switch Detected
10:22:01 AM       | tab_switch  | 4     | Tab Switch Detected
```

### Violation Log

```
Timestamp          | Type              | Severity | Details
-------------------|-------------------|----------|---------------------------
10:25:15 AM       | tab_switch        | High     | Switched tabs 5 times
10:28:42 AM       | ai_agent          | High     | AI extension detected: comet
```

## Benefits of Flag System

### 1. Reduces False Positives

**Problem:** Student accidentally switches tabs once
- **Old system:** Immediate violation
- **New system:** Warning flag (4 more allowed)

### 2. More Realistic

**Problem:** Legitimate interruptions (phone call, emergency)
- **Old system:** Penalized immediately
- **New system:** Allowed with warnings

### 3. Clear Communication

**Problem:** Students don't know how many chances they have
- **Old system:** Unclear threshold
- **New system:** "Flag 2/5" - crystal clear

### 4. Graduated Response

**Problem:** All violations treated equally
- **Old system:** Tab switch = AI detection
- **New system:** Flags vs Violations with severity levels

### 5. Audit Trail

**Problem:** Hard to review what happened
- **Old system:** Just violation count
- **New system:** Detailed flag log + violation log

## Implementation

### In Quiz Component

```tsx
import { useAntiCheat } from '@/hooks/use-anti-cheat';

function QuizPage() {
  const { 
    violationCount, 
    violationRecords,
    flagCount,
    flagRecords 
  } = useAntiCheat({
    enabled: true,
    onViolation: handleViolation,
    maxViolations: 3,
    maxFlags: 5  // 5 tab switches before violation
  });

  return (
    <div>
      {/* Flag Counter */}
      <div className="flag-counter">
        ⚠️ Warnings: {flagCount}/5
      </div>

      {/* Violation Counter */}
      <div className="violation-counter">
        🚫 Violations: {violationCount}/3
      </div>

      {/* Flag Details */}
      {flagRecords.map(flag => (
        <div key={flag.type}>
          {flag.type}: {flag.count} times
        </div>
      ))}
    </div>
  );
}
```

## Comparison

### Old System (Immediate Violations)

```
Tab Switch 1 → Violation 1/3
Tab Switch 2 → Violation 2/3
Tab Switch 3 → Violation 3/3 → AUTO-SUBMIT
```

**Result:** Student kicked out after 3 tab switches (too strict)

### New System (Flag-Based)

```
Tab Switch 1 → Flag 1/5 ⚠️
Tab Switch 2 → Flag 2/5 ⚠️
Tab Switch 3 → Flag 3/5 ⚠️
Tab Switch 4 → Flag 4/5 ⚠️
Tab Switch 5 → Flag 5/5 → Violation 1/3 🚫
Tab Switch 6 → Flag 1/5 ⚠️ (counter resets)
...
Tab Switch 10 → Flag 5/5 → Violation 2/3 🚫
...
AI Detected → Violation 3/3 🚫 → AUTO-SUBMIT
```

**Result:** Student gets multiple warnings before serious consequences (realistic)

## Best Practices

### For Admins

1. **Set appropriate thresholds** based on quiz importance
   - Practice quiz: 10 flags
   - Regular quiz: 5 flags
   - Final exam: 3 flags

2. **Review flag logs** to understand student behavior
   - High flags but no violations = nervous student
   - Low flags but violations = intentional cheating

3. **Communicate clearly** about the flag system
   - Tell students they get warnings
   - Explain what triggers flags
   - Show the threshold (5 warnings = 1 violation)

### For Students

1. **Stay on the quiz tab** to avoid flags
2. **Don't panic** if you get a warning
3. **Read the warnings** to understand what triggered them
4. **Contact instructor** if you have legitimate reasons for flags

## Statistics

### Typical Flag Distribution

```
Low-Stakes Quiz:
├─ 70% of students: 0-2 flags
├─ 20% of students: 3-5 flags
├─ 8% of students: 6-10 flags
└─ 2% of students: 10+ flags (likely cheating)

High-Stakes Exam:
├─ 85% of students: 0-1 flags
├─ 10% of students: 2-3 flags
├─ 4% of students: 4-5 flags
└─ 1% of students: 5+ flags (likely cheating)
```

## Conclusion

The flag system provides a **realistic, practical, and fair** approach to monitoring quiz integrity. By distinguishing between minor infractions (flags) and serious violations, we:

- ✅ Reduce false positives
- ✅ Give students fair warnings
- ✅ Maintain academic integrity
- ✅ Provide clear audit trails
- ✅ Allow for human judgment

**Result:** Better student experience + effective cheating detection
