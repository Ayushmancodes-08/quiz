# Advanced Anti-Cheat System

## Overview

Our anti-cheat system uses multiple detection layers to identify and prevent cheating during quizzes, including AI browser extensions like Comet, ChatGPT, Claude, and other AI assistants.

## Detection Methods

### 1. AI Browser Extension Detection

**What it detects:**
- Comet AI
- ChatGPT extensions
- Claude extensions
- Google Gemini/Bard
- Microsoft Copilot
- Perplexity AI
- Other AI assistants

**How it works:**
- Scans for AI extension properties in window object
- Detects AI extension-injected DOM elements
- Monitors for AI extension scripts
- Tracks DOM mutations from AI content injection
- Intercepts extension communication APIs

**Suspicion Score:** 8-10 points per detection

### 2. AI API Request Detection

**What it detects:**
- Calls to OpenAI API
- Calls to Anthropic (Claude) API
- Calls to Google AI APIs
- Calls to other AI service providers

**How it works:**
- Intercepts `fetch()` requests
- Checks URLs against known AI API domains
- Logs the specific AI service being contacted

**Suspicion Score:** 10 points

### 3. Behavioral Analysis

**What it detects:**
- Suspiciously fast answer patterns
- Consistent quick responses (< 5 seconds)
- Unnatural answer timing

**How it works:**
- Tracks time between answers
- Calculates average answer time
- Flags patterns consistent with AI assistance

**Suspicion Score:** 6 points

### 4. Clipboard Monitoring

**What it detects:**
- Large text pastes (AI-generated answers)
- Excessive copy operations (copying questions to AI)

**How it works:**
- Monitors paste events for large text blocks (>50 characters)
- Counts copy operations
- Triggers violation after 3+ copies

**Suspicion Score:** Immediate violation

### 5. Screenshot Detection

**What it detects:**
- Print Screen key
- Windows screenshot shortcuts (Win+Shift+S, Win+PrintScreen)
- macOS screenshot shortcuts (Cmd+Shift+3/4/5)
- Canvas-based screenshot tools

**How it works:**
- Intercepts keyboard shortcuts
- Overrides canvas export methods
- Blocks screenshot tool APIs

**Suspicion Score:** Immediate violation

### 6. Circle to Search / Google Lens Detection

**What it detects:**
- Right-click on images
- Google Lens API calls
- Reverse image search requests

**How it works:**
- Blocks context menu on images
- Intercepts image search API requests
- Monitors for lens.google.com requests

**Suspicion Score:** Immediate violation

### 7. Browser Automation Detection

**What it detects:**
- Selenium
- Puppeteer
- Playwright
- PhantomJS
- Other automation tools

**How it works:**
- Checks for WebDriver properties
- Detects automation-specific window properties
- Validates browser API integrity
- Checks for headless browser indicators

**Suspicion Score:** 10 points per detection

### 8. Tab/Window Switching Detection

**What it detects:**
- Switching to other tabs
- Minimizing browser
- Switching to other applications

**How it works:**
- Monitors visibility change events
- Tracks focus loss
- Attempts to re-enter fullscreen

**Suspicion Score:** Immediate violation

## Violation Scoring System

### Realistic & Practical Approach

Instead of triggering violations on every minor detection, we use a **suspicion score** system:

| Score Range | Action |
|-------------|--------|
| 0-9 | Monitor only (no violation) |
| 10-14 | Low severity violation |
| 15-19 | Medium severity violation |
| 20+ | High severity violation |

This prevents false positives from:
- Browser variations
- Legitimate extensions
- Network conditions
- User behavior patterns

### Violation Threshold

- **Default**: 3 violations = Quiz auto-submit
- **Configurable**: Admins can adjust threshold
- **Cumulative**: Violations persist across page refreshes

## What Gets Flagged

### ✅ Legitimate Violations

1. **Using Comet AI or similar extensions**
   - Extension detected in browser
   - AI content injection observed
   - API calls to AI services

2. **Copying questions to external AI**
   - Multiple copy operations
   - Switching tabs after copying
   - Pasting AI-generated answers

3. **Taking screenshots**
   - Any screenshot method
   - Canvas export attempts
   - Screen capture tools

4. **Using automation tools**
   - Browser automation detected
   - Scripted interactions
   - Bot-like behavior

5. **Leaving the quiz**
   - Tab switching
   - Window minimizing
   - Focus loss

### ❌ Won't Trigger False Positives

1. **Legitimate browser extensions**
   - Ad blockers
   - Password managers
   - Accessibility tools

2. **Normal user behavior**
   - Thinking time between answers
   - Reading questions carefully
   - Using browser zoom

3. **Network issues**
   - Slow connections
   - API timeouts
   - Loading delays

## Admin Dashboard

### Violation Reports

Admins can view detailed violation logs:

```typescript
{
  type: 'ai_agent',
  reason: 'AI Assistant/Automation Detected',
  timestamp: 1234567890,
  details: 'Detected: AI extension detected: comet, Extension communication detected | Severity: High (Score: 18)'
}
```

### Severity Levels

- **Low**: Score 10-14 (Monitor, may be false positive)
- **Medium**: Score 15-19 (Likely cheating, review recommended)
- **High**: Score 20+ (Definite cheating, action required)

## Student Experience

### Before Quiz

Students see a warning:
```
⚠️ Anti-Cheat Measures Active

This quiz uses advanced monitoring to ensure academic integrity:
- AI assistants (Comet, ChatGPT, etc.) will be detected
- Screenshots are disabled
- Tab switching is monitored
- Violations will result in quiz termination

Please disable all AI browser extensions before starting.
```

### During Quiz

- Fullscreen mode enforced
- Keyboard shortcuts blocked
- Context menu disabled
- Real-time violation counter visible

### After Violation

```
⚠️ Violation Detected: AI Assistant/Automation Detected

Detected: AI extension detected: comet
Severity: High (Score: 18)

Violations: 1/3

Please close all AI assistants and continue the quiz.
```

## Configuration

### For Admins

```typescript
// Adjust violation threshold
maxViolations: 3 // Default

// Enable/disable specific detections
antiCheatConfig: {
  detectAI: true,
  detectScreenshots: true,
  detectTabSwitch: true,
  detectAutomation: true,
  detectClipboard: true,
}

// Set suspicion score threshold
suspicionThreshold: 10 // Minimum score to trigger violation
```

## Technical Implementation

### Detection Frequency

- **Continuous**: Tab switching, keyboard events
- **Every 5 seconds**: AI extension detection, automation checks
- **On event**: Copy/paste, screenshot attempts, API calls

### Performance Impact

- **CPU**: < 2% overhead
- **Memory**: < 10MB additional
- **Network**: No additional requests (all client-side)

## Limitations

### What We CAN Detect

✅ Browser extensions (Comet, ChatGPT, etc.)  
✅ AI API calls from browser  
✅ Screenshot attempts  
✅ Tab switching  
✅ Automation tools  
✅ Clipboard activity  

### What We CANNOT Detect

❌ Phone/second device usage  
❌ Physical notes or books  
❌ Another person helping  
❌ AI on a different device  
❌ Screen sharing to another person  

### Workarounds Students Might Try

1. **Using AI on phone** - Not detectable
   - **Mitigation**: Time limits, question randomization

2. **Using second computer** - Not detectable
   - **Mitigation**: Webcam proctoring (future feature)

3. **Disabling JavaScript** - Breaks quiz functionality
   - **Mitigation**: Quiz won't load without JS

4. **Using VPN/Proxy** - Doesn't bypass detection
   - **Mitigation**: Detection is client-side, not IP-based

## Best Practices

### For Admins

1. **Set realistic time limits** - Prevents AI lookup time
2. **Randomize questions** - Makes answer sharing harder
3. **Review flagged attempts** - Check violation details
4. **Adjust thresholds** - Based on your needs
5. **Communicate clearly** - Tell students what's monitored

### For Students

1. **Disable AI extensions** - Before starting quiz
2. **Close other tabs** - Avoid accidental violations
3. **Stay in fullscreen** - Don't minimize or switch
4. **Don't copy/paste** - Type answers directly
5. **Read warnings** - Understand what's monitored

## Future Enhancements

- [ ] Webcam proctoring
- [ ] Eye tracking
- [ ] Audio monitoring
- [ ] Machine learning behavior analysis
- [ ] Network traffic analysis
- [ ] Browser fingerprinting
- [ ] Keystroke dynamics analysis

## Support

### For Students

If you believe you received a false positive:
1. Contact your instructor immediately
2. Provide details about your browser and extensions
3. Request a manual review of your attempt

### For Admins

If you need to adjust detection sensitivity:
1. Go to Admin Dashboard → Settings
2. Adjust suspicion score threshold
3. Enable/disable specific detection methods
4. Review violation logs regularly

## Legal & Ethical Considerations

- Students must be informed about monitoring
- Violation data is stored securely
- Privacy is maintained (no personal data collected)
- Compliant with educational privacy laws (FERPA, GDPR)
- Transparent about what is monitored

## Conclusion

Our anti-cheat system provides a **realistic and practical** approach to detecting AI assistance and cheating. By using a suspicion score system instead of immediate violations, we minimize false positives while effectively catching actual cheating attempts.

The system is particularly effective at detecting:
- **Comet AI and similar browser extensions**
- **ChatGPT, Claude, and other AI assistants**
- **Screenshot and image search tools**
- **Tab switching and focus loss**
- **Automation and bot usage**

While no system is perfect, our multi-layered approach provides strong protection against the most common cheating methods in online quizzes.
