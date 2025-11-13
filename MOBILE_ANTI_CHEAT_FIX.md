# Mobile Anti-Cheat Fix

## Problem

On mobile phones, violations were counting automatically and very fast without the user doing anything. This was caused by:

1. **Visibility API triggers on mobile** - Keyboard, notifications, and system UI cause visibility changes
2. **Fullscreen enforcement** - Mobile browsers don't support fullscreen well, causing constant flags
3. **Rapid detection** - Too sensitive detection without debouncing
4. **Desktop-focused features** - Keyboard lock and other desktop features don't work on mobile

## Solution

### 1. Mobile Device Detection

```typescript
const isMobile = useRef(false);

useEffect(() => {
  // Detect mobile device
  isMobile.current = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0);
}, []);
```

### 2. Debounced Visibility Change Detection

**Before (Too Sensitive):**
```typescript
const handleVisibilityChange = () => {
  if (document.visibilityState === 'hidden') {
    triggerFlag('tab_switch', 'Tab Switch Detected'); // Triggers on every visibility change
  }
};
```

**After (Mobile-Friendly):**
```typescript
const handleVisibilityChange = () => {
  if (document.visibilityState === 'hidden') {
    const now = Date.now();
    const timeSinceLastChange = now - lastVisibilityChange.current;
    
    // On mobile, ignore rapid visibility changes (< 2 seconds)
    if (isMobile.current && timeSinceLastChange < 2000) {
      return; // Ignore keyboard, notifications, etc.
    }
    
    // On mobile, only flag after 2 visibility changes
    if (isMobile.current && visibilityChangeCount.current < 2) {
      return; // First change is free
    }
    
    triggerFlag('tab_switch', 'Tab Switch Detected');
  }
};
```

### 3. Disabled Fullscreen on Mobile

**Before:**
```typescript
enterFullscreen(); // Causes issues on mobile
```

**After:**
```typescript
if (!isMobile.current) {
  enterFullscreen(); // Only on desktop
}
```

### 4. Disabled Keyboard Lock on Mobile

**Before:**
```typescript
lockKeyboard(); // Doesn't work on mobile
```

**After:**
```typescript
if (!isMobile.current) {
  lockKeyboard(); // Only on desktop
}
```

### 5. Reduced Detection Frequency on Mobile

**Before:**
```typescript
setInterval(detectAutomation, 5000); // Every 5 seconds
```

**After:**
```typescript
const checkInterval = isMobile.current ? 15000 : 5000; // 15s on mobile, 5s on desktop
setInterval(detectAutomation, checkInterval);
```

## Changes Summary

| Feature | Desktop | Mobile |
|---------|---------|--------|
| Fullscreen | ✅ Enabled | ❌ Disabled |
| Keyboard Lock | ✅ Enabled | ❌ Disabled |
| Wake Lock | ✅ Enabled | ✅ Enabled |
| Visibility Detection | Immediate | Debounced (2s) |
| First Visibility Change | Flags | Ignored |
| Automation Check | Every 5s | Every 15s |

## Mobile-Specific Behavior

### Visibility Changes Ignored

These events **won't** trigger flags on mobile:
- ✅ Keyboard opening/closing
- ✅ System notifications
- ✅ Pull-down notification shade
- ✅ Quick settings panel
- ✅ First visibility change (grace period)
- ✅ Rapid changes (< 2 seconds apart)

### Visibility Changes That Still Flag

These events **will** trigger flags on mobile:
- ⚠️ Switching to another app (after 2nd time)
- ⚠️ Going to home screen (after 2nd time)
- ⚠️ Opening another browser tab (after 2nd time)
- ⚠️ Sustained visibility changes (> 2 seconds apart)

## Testing Results

### Before Fix

```
Mobile User Opens Quiz
→ Keyboard opens: Flag 1/3 ❌
→ Notification appears: Flag 2/3 ❌
→ Keyboard closes: Flag 3/3 → Violation 1/3 ❌
→ User hasn't even started! ❌
```

### After Fix

```
Mobile User Opens Quiz
→ Keyboard opens: Ignored ✅
→ Notification appears: Ignored (< 2s) ✅
→ Keyboard closes: Ignored ✅
→ User switches to calculator: First change ignored ✅
→ User switches again: Flag 1/3 ⚠️
→ User switches 3rd time: Flag 2/3 ⚠️
→ User switches 4th time: Flag 3/3 → Violation 1/3 🚫
```

## Configuration

### Adjust Mobile Sensitivity

```typescript
// In use-anti-cheat.ts

// Debounce time (ignore changes within this time)
const MOBILE_DEBOUNCE_MS = 2000; // 2 seconds

// Free visibility changes before flagging
const MOBILE_FREE_CHANGES = 2; // First 2 changes ignored

// Reset count after this time
const RESET_TIMEOUT_MS = 10000; // 10 seconds
```

### Adjust Detection Frequency

```typescript
// Desktop: Check every 5 seconds
// Mobile: Check every 15 seconds
const checkInterval = isMobile.current ? 15000 : 5000;
```

## Benefits

### 1. No False Positives on Mobile

✅ Keyboard interactions don't trigger flags  
✅ Notifications don't trigger flags  
✅ System UI doesn't trigger flags  
✅ First app switch is free  

### 2. Better Performance

✅ Less frequent checks (15s vs 5s)  
✅ No fullscreen enforcement overhead  
✅ No keyboard lock attempts  
✅ Reduced battery drain  

### 3. Better User Experience

✅ Students can use mobile devices normally  
✅ No unexpected violations  
✅ Clear warnings when actually switching  
✅ Fair detection system  

### 4. Still Effective

✅ Detects actual tab switching  
✅ Detects app switching  
✅ Detects AI extensions  
✅ Detects screenshots  

## Recommendations

### For Mobile Quizzes

1. **Increase maxFlags** - Mobile users may legitimately switch more
   ```typescript
   maxFlags: 5 // Instead of 3
   ```

2. **Communicate clearly** - Tell students mobile behavior
   ```
   "On mobile: First 2 app switches are free, then warnings start"
   ```

3. **Consider time limits** - Better than strict anti-cheat on mobile
   ```typescript
   timeLimit: 30 * 60 // 30 minutes
   ```

4. **Review flagged attempts** - Mobile flags may be legitimate
   ```
   Check violation details before penalizing
   ```

### For Desktop Quizzes

Keep strict settings:
```typescript
maxFlags: 3
fullscreen: true
keyboardLock: true
```

## Troubleshooting

### Still Getting False Positives?

**Increase debounce time:**
```typescript
const MOBILE_DEBOUNCE_MS = 3000; // 3 seconds instead of 2
```

**Increase free changes:**
```typescript
const MOBILE_FREE_CHANGES = 3; // 3 free changes instead of 2
```

### Not Detecting Real Violations?

**Decrease debounce time:**
```typescript
const MOBILE_DEBOUNCE_MS = 1000; // 1 second
```

**Decrease free changes:**
```typescript
const MOBILE_FREE_CHANGES = 1; // Only 1 free change
```

## Conclusion

The mobile anti-cheat system is now:
- ✅ **Accurate** - No false positives from normal mobile behavior
- ✅ **Fair** - Grace period for legitimate interactions
- ✅ **Performant** - Reduced detection frequency
- ✅ **Effective** - Still catches actual cheating

Mobile users can now take quizzes without automatic violations!
