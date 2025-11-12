'use client';

import { useEffect, useState, useCallback } from 'react';
import { logSecurityViolation, detectAutomation, isMobileDevice } from '@/lib/security-utils';

interface UseSecurityOptions {
  enableScreenshotPrevention?: boolean;
  enableTabSwitchDetection?: boolean;
  enableAutomationDetection?: boolean;
  onViolation?: (type: string) => void;
}

interface SecurityState {
  violations: number;
  isSecure: boolean;
  lastViolation: string | null;
}

/**
 * Hook for adding security features to any component
 * 
 * @example
 * ```tsx
 * function ProtectedComponent() {
 *   const { violations, isSecure } = useSecurity({
 *     onViolation: (type) => console.log('Violation:', type)
 *   });
 *   
 *   if (!isSecure) return <div>Access Denied</div>;
 *   return <div>Protected Content</div>;
 * }
 * ```
 */
export function useSecurity(options: UseSecurityOptions = {}) {
  const {
    enableScreenshotPrevention = true,
    enableTabSwitchDetection = true,
    enableAutomationDetection = true,
    onViolation,
  } = options;

  const [state, setState] = useState<SecurityState>({
    violations: 0,
    isSecure: true,
    lastViolation: null,
  });

  const handleViolation = useCallback((type: string) => {
    setState(prev => ({
      violations: prev.violations + 1,
      isSecure: prev.violations < 5, // Block after 5 violations
      lastViolation: type,
    }));

    // Log to server
    logSecurityViolation({ type });

    // Call custom handler
    onViolation?.(type);
  }, [onViolation]);

  useEffect(() => {
    const cleanup: Array<() => void> = [];

    // Screenshot prevention
    if (enableScreenshotPrevention) {
      const preventScreenshot = (e: KeyboardEvent) => {
        if (
          e.key === 'PrintScreen' ||
          (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) ||
          (e.key === 's' && e.metaKey && e.shiftKey)
        ) {
          e.preventDefault();
          handleViolation('screenshot_attempt');
        }
      };

      document.addEventListener('keydown', preventScreenshot, true);
      cleanup.push(() => document.removeEventListener('keydown', preventScreenshot, true));
    }

    // Tab switch detection
    if (enableTabSwitchDetection) {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          handleViolation('tab_switch');
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      cleanup.push(() => document.removeEventListener('visibilitychange', handleVisibilityChange));
    }

    // Automation detection
    if (enableAutomationDetection) {
      if (detectAutomation()) {
        handleViolation('automation_detected');
      }

      const interval = setInterval(() => {
        if (detectAutomation()) {
          handleViolation('automation_detected');
        }
      }, 5000);

      cleanup.push(() => clearInterval(interval));
    }

    return () => {
      cleanup.forEach(fn => fn());
    };
  }, [enableScreenshotPrevention, enableTabSwitchDetection, enableAutomationDetection, handleViolation]);

  return {
    ...state,
    isMobile: isMobileDevice(),
    reset: () => setState({ violations: 0, isSecure: true, lastViolation: null }),
  };
}

/**
 * Hook for preventing text selection
 */
export function usePreventSelection(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.style.userSelect = 'none';
    element.style.webkitUserSelect = 'none';

    return () => {
      element.style.userSelect = '';
      element.style.webkitUserSelect = '';
    };
  }, [ref]);
}

/**
 * Hook for detecting if developer tools are open
 */
export function useDevToolsDetection(onDetect?: () => void) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      const detected = widthThreshold || heightThreshold;

      if (detected && !isOpen) {
        setIsOpen(true);
        onDetect?.();
      } else if (!detected && isOpen) {
        setIsOpen(false);
      }
    };

    const interval = setInterval(detectDevTools, 1000);
    return () => clearInterval(interval);
  }, [isOpen, onDetect]);

  return isOpen;
}
