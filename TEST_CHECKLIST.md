# ✅ Screenshot Detection - Test Checklist

## Quick Test (2 minutes)

Open any quiz page and try these:

### Desktop Tests
- [ ] Press `PrtScn` → Should show alert "screenshot_attempt detected"
- [ ] Press `F12` → Should be blocked
- [ ] Right-click anywhere → Should be disabled
- [ ] Press `Ctrl + Shift + I` → Should be blocked
- [ ] Switch to another tab → Check console for "tab_switch" log

### Visual Verification
- [ ] After violations, see yellow badge: "🔒 Security Active • Violations: X"
- [ ] Watermarks visible (very subtle, look closely)
- [ ] No console errors

---

## Full Desktop Test (5 minutes)

### Screenshot Shortcuts
- [ ] `PrtScn` → Blocked ✅
- [ ] `Win + Shift + S` (Windows Snipping Tool) → Blocked ✅
- [ ] `Cmd + Shift + 3` (Mac full screen) → Blocked ✅
- [ ] `Cmd + Shift + 4` (Mac selection) → Blocked ✅
- [ ] `Cmd + Shift + 5` (Mac screenshot menu) → Blocked ✅

### Developer Tools
- [ ] `F12` → Blocked ✅
- [ ] `Ctrl + Shift + I` → Blocked ✅
- [ ] `Ctrl + Shift + J` → Blocked ✅
- [ ] `Ctrl + Shift + C` → Blocked ✅
- [ ] `Cmd + Alt + I` (Mac) → Blocked ✅

### Other Protections
- [ ] `Ctrl + U` (View Source) → Blocked ✅
- [ ] `Ctrl + S` (Save Page) → Blocked ✅
- [ ] Right-click → Disabled ✅
- [ ] Text selection → Disabled ✅
- [ ] Image drag → Disabled ✅

### Detection Tests
- [ ] Switch tabs → Logged to console ✅
- [ ] Minimize window → Logged to console ✅
- [ ] Click outside window → Logged to console ✅

---

## Mobile Test (5 minutes)

### On Real Device
- [ ] Open quiz page on phone
- [ ] Take screenshot (Power + Volume Down) → Alert shown ✅
- [ ] Try long-press on content → Prevented ✅
- [ ] Switch to another app → Logged ✅
- [ ] Return to app → Still works ✅
- [ ] Try screen recording → Detected ✅

### Mobile Browser
- [ ] Right-click/long-press → Disabled ✅
- [ ] Text selection → Disabled ✅
- [ ] Image save → Disabled ✅

---

## Console Logging Test

### Open Browser Console (before F12 is blocked)
1. Open quiz page
2. Open console (quickly before F12 blocked)
3. Trigger violations
4. Check for logs:

Expected format:
```
🔒 Security Violation: {
  type: "screenshot_attempt",
  timestamp: "2024-11-13T10:30:00Z",
  url: "/quiz/123",
  sessionId: "abc12345",
  userAgent: "Mozilla/5.0..."
}
```

### Violation Types to Test
- [ ] `screenshot_attempt` - Press PrtScn
- [ ] `devtools_attempt` - Press F12
- [ ] `view_source_attempt` - Press Ctrl+U
- [ ] `save_page_attempt` - Press Ctrl+S
- [ ] `context_menu` - Right-click
- [ ] `tab_switch` - Switch tabs
- [ ] `window_blur` - Click outside
- [ ] `canvas_capture_attempt` - (Automatic if canvas used)
- [ ] `browser_extension_detected` - (Automatic if extensions present)

---

## Visual Indicator Test

### After Each Violation
- [ ] Badge appears in bottom-right
- [ ] Shows: "🔒 Security Active • Violations: X"
- [ ] Counter increments correctly
- [ ] Badge is non-intrusive
- [ ] Badge doesn't block content

---

## Watermark Test

### Visual Check
1. Look closely at the page
2. Should see very subtle text overlays
3. Format: "USER-XXXXX • SESSION • timestamp"
4. Should be rotated at various angles
5. Should be distributed across page

### Watermark Coverage
- [ ] Top-left area has watermarks
- [ ] Top-right area has watermarks
- [ ] Center area has watermarks
- [ ] Bottom-left area has watermarks
- [ ] Bottom-right area has watermarks

---

## Admin Dashboard Test

### Navigate to `/admin/security-logs`

#### Without Database Setup
- [ ] Shows setup instructions
- [ ] Blue notice box appears
- [ ] Instructions for migration shown
- [ ] Console logging note present

#### With Database Setup
- [ ] Statistics cards show data
- [ ] Total violations count
- [ ] Unique users count
- [ ] Last 24 hours count
- [ ] Violation types chart
- [ ] Recent logs table
- [ ] Table shows all columns

---

## Error Handling Test

### Without Supabase
- [ ] Page loads without errors
- [ ] Violations still detected
- [ ] Console logging works
- [ ] No crashes
- [ ] Helpful error messages

### With Supabase
- [ ] Database logging works
- [ ] Admin dashboard shows data
- [ ] Rate limiting works (after 10 violations)
- [ ] No errors in console

---

## Performance Test

### Check Performance
1. Open quiz page
2. Open Performance tab (if you can)
3. Check metrics:
   - [ ] Page load < 3 seconds
   - [ ] Memory usage < 50MB
   - [ ] No memory leaks
   - [ ] Smooth scrolling
   - [ ] No lag

### Long Session Test
1. Keep page open for 5 minutes
2. Trigger violations periodically
3. Check:
   - [ ] No performance degradation
   - [ ] Memory stable
   - [ ] All features still work
   - [ ] No console errors

---

## Cross-Browser Test

### Chrome
- [ ] All features work
- [ ] No console errors
- [ ] Visual indicator shows
- [ ] Watermarks visible

### Firefox
- [ ] All features work
- [ ] No console errors
- [ ] Visual indicator shows
- [ ] Watermarks visible

### Safari (Mac)
- [ ] All features work
- [ ] Mac shortcuts blocked
- [ ] Visual indicator shows
- [ ] Watermarks visible

### Edge
- [ ] All features work
- [ ] No console errors
- [ ] Visual indicator shows
- [ ] Watermarks visible

---

## Automation Detection Test

### If You Have Selenium/Puppeteer
1. Try to automate the page
2. Should detect:
   - [ ] `navigator.webdriver` = true
   - [ ] Automation frameworks
   - [ ] Headless browser
   - [ ] Bot indicators

---

## Stress Test

### Rapid Violations
1. Rapidly press PrtScn 10 times
2. Check:
   - [ ] All violations logged
   - [ ] Counter increments correctly
   - [ ] No crashes
   - [ ] After 3 violations → Redirect to /security-violation

### Multiple Violation Types
1. Trigger different violations quickly
2. Check:
   - [ ] All types logged correctly
   - [ ] Counter accurate
   - [ ] System stable

---

## User Experience Test

### First-Time User
- [ ] Clear what's happening
- [ ] Warnings are helpful
- [ ] Not too intrusive
- [ ] Can still use the quiz

### After Violations
- [ ] Redirect page is clear
- [ ] Support options available
- [ ] Can return to dashboard
- [ ] Understands what happened

---

## Integration Test

### With Existing Quiz System
- [ ] Quiz loads normally
- [ ] Security doesn't break quiz
- [ ] Can answer questions
- [ ] Can submit quiz
- [ ] Timer works (if present)
- [ ] Navigation works

---

## Final Verification

### System Status
- [ ] ✅ No TypeScript errors
- [ ] ✅ No console errors
- [ ] ✅ All features working
- [ ] ✅ Performance acceptable
- [ ] ✅ User experience good
- [ ] ✅ Documentation complete

### Production Ready?
- [ ] All tests passed
- [ ] No critical issues
- [ ] Performance acceptable
- [ ] User feedback positive
- [ ] Documentation reviewed

---

## Test Results

**Date Tested:** _______________
**Tested By:** _______________
**Browser:** _______________
**Device:** _______________

**Overall Status:** [ ] Pass [ ] Fail [ ] Needs Work

**Notes:**
_______________________________________
_______________________________________
_______________________________________

---

## Quick Reference

### Expected Behavior
✅ Screenshot shortcuts → Blocked + Alert
✅ DevTools shortcuts → Blocked
✅ Right-click → Disabled
✅ Tab switch → Logged
✅ Visual indicator → Shows after violation
✅ Console logs → Always present
✅ Watermarks → Subtle but visible

### Not Expected (Can't Prevent)
❌ Physical camera screenshots
❌ External capture devices
❌ Virtual machine screenshots
❌ OS-level tools (can only detect)

---

**Remember:** The system makes screenshots significantly harder and logs all attempts. 100% prevention is impossible, but this is as close as it gets! 🎯
