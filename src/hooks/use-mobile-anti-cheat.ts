"use client";

import { useEffect, useCallback, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface MobileViolationRecord {
  type: 'screenshot' | 'ai_detected' | 'tab_switch';
  reason: string;
  timestamp: number;
}

export interface MobileFlagRecord {
  type: 'tab_switch';
  count: number;
  timestamp: number;
}

type UseMobileAntiCheatProps = {
  enabled: boolean;
  onViolation: (reason: string, violations?: MobileViolationRecord[], flags?: MobileFlagRecord[]) => void;
  maxViolations?: number;
  maxFlags?: number;
};

export function useMobileAntiCheat({
  enabled,
  onViolation,
  maxViolations = 3,
  maxFlags = 3
}: UseMobileAntiCheatProps) {
  const { toast } = useToast();
  const [violationCount, setViolationCount] = useState(0);
  const [violations, setViolations] = useState<MobileViolationRecord[]>([]);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [securityViolationCount, setSecurityViolationCount] = useState(0);
  const [isIncognito, setIsIncognito] = useState<boolean | null>(null);
  const isDisabledRef = useRef(false);
  const lastVisibilityChange = useRef<number>(0);
  const visibilityChangeCount = useRef<number>(0);
  const monitoringStartTime = useRef<number>(0);

  // Detect incognito mode
  useEffect(() => {
    const detectIncognito = async () => {
      // Method 1: FileSystem API (works on Chrome/Edge)
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          const isLikelyIncognito = estimate.quota && estimate.quota < 120000000 ? true : false;
          setIsIncognito(isLikelyIncognito);
          return;
        } catch (e) {
          // Continue to next method
        }
      }

      // Method 2: IndexedDB (works on Firefox)
      try {
        const db = indexedDB.open('test');
        db.onerror = () => setIsIncognito(true);
        db.onsuccess = () => {
          setIsIncognito(false);
          indexedDB.deleteDatabase('test');
        };
      } catch (e) {
        setIsIncognito(null); // Can't detect
      }
    };

    detectIncognito();
  }, []);

  // Flag logic removed - redirect to violation
  const triggerFlag = useCallback((reason: string) => {
    triggerViolation('tab_switch', reason);
  }, []);

  const triggerViolation = useCallback((
    type: MobileViolationRecord['type'],
    reason: string
  ) => {
    if (isDisabledRef.current) return;

    const violation: MobileViolationRecord = {
      type,
      reason,
      timestamp: Date.now()
    };

    setViolations(prev => {
      const updated = [...prev, violation];

      const tabs = updated.filter(r => r.type === 'tab_switch').length;
      const security = updated.filter(r => r.type !== 'tab_switch').length;

      setTabSwitchCount(tabs);
      setSecurityViolationCount(security);

      if (tabs >= maxViolations || security >= maxViolations) {
        isDisabledRef.current = true;
        setTimeout(() => {
          onViolation(`Exceeded maximum violations (${maxViolations}).`, updated);
        }, 0);
      }

      return updated;
    });

    // Toast notification
    setTimeout(() => {
      if (type === 'tab_switch') {
        toast({
          variant: 'destructive',
          title: `Violation: ${reason}`,
          description: `Tab Violations: ${tabSwitchCount + 1}/${maxViolations}`
        });
      } else {
        toast({
          variant: 'destructive',
          title: `Security Violation: ${reason}`,
          description: `Security Violations: ${securityViolationCount + 1}/${maxViolations}`
        });
      }
    }, 0);

  }, [toast, maxViolations, onViolation, tabSwitchCount, securityViolationCount]);

  // Screenshot detection for mobile
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isDisabledRef.current) return;

    // Android screenshot: Power + Volume Down (can't detect directly)
    // iOS screenshot: Power + Home or Power + Volume Up (can't detect directly)
    // But we can detect some keyboard shortcuts if external keyboard is used

    if (e.key === 'PrintScreen') {
      e.preventDefault();
      triggerViolation('screenshot', 'Screenshot Attempt Detected');
    }

    // Some Android devices with keyboard
    if (e.ctrlKey && e.shiftKey && e.key === 's') {
      e.preventDefault();
      triggerViolation('screenshot', 'Screenshot Shortcut Detected');
    }
  }, [triggerViolation]);

  // Circle to Search detection ONLY for mobile
  const detectCircleToSearch = useCallback(() => {
    if (isDisabledRef.current) return;

    // MOBILE ONLY: Detect Circle to Search (Google Lens)
    // Check for Google Lens API indicators
    const lensIndicators = [
      'lens',
      'google-lens',
      'circle-to-search',
    ];

    // Check window properties for Lens
    for (const indicator of lensIndicators) {
      if ((window as any)[indicator] || (window as any)[`__${indicator}`]) {
        triggerViolation('ai_detected', `Circle to Search Detected: ${indicator}`);
        return;
      }
    }

    // Check for Lens-injected elements
    const lensElements = document.querySelectorAll(
      '[class*="lens"], [id*="lens"], [class*="circle-to-search"]'
    );
    if (lensElements.length > 0) {
      triggerViolation('ai_detected', 'Circle to Search UI Detected');
    }

    // MOBILE ANTI-CHEAT: DO NOT CHECK FOR:
    // - navigator.webdriver (false positive on mobile browsers)
    // - navigator.plugins (mobile browsers often have 0 plugins)
    // - screen dimensions (varies on mobile)
    // - automation properties (not relevant on mobile)
    // - AI extensions (ChatGPT, Claude, etc. - not common on mobile)
    // - headless browser indicators (causes false positives)
  }, [triggerViolation]);

  // Tab switch detection with heavy debouncing for mobile
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'hidden' && !isDisabledRef.current) {
      const now = Date.now();
      const timeSinceStart = now - monitoringStartTime.current;
      const timeSinceLastChange = now - lastVisibilityChange.current;

      // Grace period: Don't monitor for first 10 seconds
      if (timeSinceStart < 10000) {
        console.log('Mobile: Within grace period, ignoring visibility change');
        return;
      }

      // Debounce: Ignore rapid changes (< 3 seconds)
      if (timeSinceLastChange < 3000) {
        console.log('Mobile: Rapid change detected, ignoring');
        return;
      }

      // Reset count if more than 15 seconds since last change
      if (timeSinceLastChange > 15000) {
        visibilityChangeCount.current = 0;
      }

      visibilityChangeCount.current++;
      lastVisibilityChange.current = now;

      // First 2 changes are free (keyboard, notifications, etc.)
      if (visibilityChangeCount.current <= 2) {
        console.log(`Mobile: Free visibility change ${visibilityChangeCount.current}/2`);
        return;
      }

      // After 2 free changes, start flagging
      triggerFlag('Tab Switch Detected');
    }
  }, [triggerFlag]);

  useEffect(() => {
    if (!enabled) return;

    console.log('Mobile Anti-Cheat: Enabled');
    console.log('Monitoring: Tab switches (debounced), Screenshots, AI Detection');

    // Set monitoring start time
    monitoringStartTime.current = Date.now();

    // Add visibility change listener with debouncing
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Add keyboard listener for screenshot detection
    window.addEventListener('keydown', handleKeyDown);

    // Check for Circle to Search every 15 seconds (less frequent on mobile)
    const circleToSearchInterval = setInterval(detectCircleToSearch, 15000);
    detectCircleToSearch(); // Check immediately

    // Disable context menu (prevents some screenshot methods)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);

    // Disable text selection
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(circleToSearchInterval);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.body.style.userSelect = 'auto';
      document.body.style.webkitUserSelect = 'auto';
      isDisabledRef.current = false;
    };
  }, [enabled, handleKeyDown, detectCircleToSearch, handleVisibilityChange]);

  return {
    violationCount,
    violations,
    tabSwitchCount,
    securityViolationCount,
    isIncognito,
  };
}
