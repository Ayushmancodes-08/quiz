"use client";

import { useEffect, useCallback, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export type ViolationType = 'screenshot' | 'circle_to_search' | 'browser_change' | 'ai_agent';

export interface ViolationRecord {
  type: ViolationType;
  reason: string;
  timestamp: number;
  details?: string;
}

type UseAntiCheatProps = {
  enabled: boolean;
  onViolation: (reason: string, violationRecords?: ViolationRecord[]) => void;
  maxViolations?: number;
};

export function useAntiCheat({ enabled, onViolation, maxViolations = 3 }: UseAntiCheatProps) {
  const { toast } = useToast();
  const [violationCount, setViolationCount] = useState(0);
  const [violationRecords, setViolationRecords] = useState<ViolationRecord[]>([]);
  const isDisabledRef = useRef(false);
  const automationCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const triggerViolation = useCallback((type: ViolationType, reason: string, details?: string) => {
    if (isDisabledRef.current) return;

    const timestamp = Date.now();
    const record: ViolationRecord = { type, reason, timestamp, details };

    setViolationRecords(prev => {
      const updated = [...prev, record];
      
      if (updated.length >= maxViolations) {
        isDisabledRef.current = true;
        setTimeout(() => {
          onViolation(`Exceeded maximum violations (${maxViolations}).`, updated);
        }, 0);
      }
      
      return updated;
    });
    
    setViolationCount(prev => {
      const newCount = prev + 1;
      
      setTimeout(() => {
        toast({
          variant: 'destructive',
          title: `Violation Detected: ${reason}`,
          description: `${details || reason} (${newCount}/${maxViolations} violations).`,
        });
      }, 0);
      
      return newCount;
    });
  }, [onViolation, maxViolations, toast]);

  // 1. Detect browser/tab changes
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'hidden' && !isDisabledRef.current) {
      triggerViolation('browser_change', 'Browser/Tab Changed', 'You must stay on the quiz tab.');
    }
  }, [triggerViolation]);

  // 2. Detect screenshots
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isDisabledRef.current) return;

    // Block print screen and screenshot combinations
    if (e.key === 'PrintScreen') {
      e.preventDefault();
      triggerViolation('screenshot', 'Screenshot Attempt', 'Screenshots are disabled.');
      return;
    }

    // Windows screenshot shortcuts: Win+Shift+S, Win+PrintScreen
    const isWindowsKey = navigator.platform.includes('Win') && 
      (e.getModifierState('Meta') || (e.key === 's' && e.shiftKey));
    
    if (isWindowsKey && e.shiftKey && e.key === 's') {
      e.preventDefault();
      triggerViolation('screenshot', 'Screenshot Attempt', 'Windows screenshot shortcut (Win+Shift+S) is disabled.');
      return;
    }
    
    // Windows key + PrintScreen
    if (navigator.platform.includes('Win') && e.key === 'PrintScreen' && 
        (e.getModifierState('Meta') || e.getModifierState('OS'))) {
      e.preventDefault();
      triggerViolation('screenshot', 'Screenshot Attempt', 'Windows screenshot shortcut (Win+PrintScreen) is disabled.');
      return;
    }

    // macOS screenshot shortcuts (Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5)
    if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
      e.preventDefault();
      triggerViolation('screenshot', 'Screenshot Attempt', 'Screenshots are disabled.');
    }
  }, [triggerViolation]);

  // 3. Detect Circle to Search (Google Lens) - typically triggered by right-click on images
  // We'll detect it through image search APIs and context menu on images
  const handleContextMenu = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // Check if right-click is on an image or element that might trigger Circle to Search
    if (target.tagName === 'IMG' || target.closest('img')) {
      e.preventDefault();
      triggerViolation('circle_to_search', 'Circle to Search Detected', 'Circle to Search (Google Lens) is disabled during the quiz.');
      return;
    }
    
    // Also check for other image-related elements
    if (target.tagName === 'SVG' || target.closest('svg') || 
        target.tagName === 'CANVAS' || target.closest('canvas')) {
      e.preventDefault();
      triggerViolation('circle_to_search', 'Circle to Search Detected', 'Circle to Search (Google Lens) is disabled during the quiz.');
    }
  }, [triggerViolation]);

  // 4. Detect AI agents and automation tools
  const detectAutomation = useCallback(() => {
    if (isDisabledRef.current) return;

    const checks: string[] = [];

    // Check for WebDriver property (Selenium, Puppeteer, Playwright)
    if ((window as any).navigator?.webdriver === true) {
      checks.push('WebDriver detected');
    }

    // Check for Chrome DevTools Protocol
    if ((window as any).chrome?.runtime?.onConnect) {
      // Check if DevTools is being controlled
      if ((window as any).__selenium_unwrapped || (window as any).__webdriver_evaluate || (window as any).__driver_evaluate) {
        checks.push('Chrome DevTools Protocol detected');
      }
    }

    // Check for headless browser indicators
    if (navigator.plugins.length === 0) {
      checks.push('No plugins detected (headless indicator)');
    }

    // Check for automation frameworks
    if ((window as any).callPhantom || (window as any)._phantom || (window as any).__nightmare) {
      checks.push('PhantomJS/Nightmare detected');
    }

    if ((window as any).domAutomation || (window as any).domAutomationController) {
      checks.push('DOM automation detected');
    }

    // Check user agent for automation indicators
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('headless') || userAgent.includes('phantom') || userAgent.includes('selenium')) {
      checks.push('Automation user agent detected');
    }

    // Check for missing properties that real browsers have
    if (!navigator.languages || navigator.languages.length === 0) {
      checks.push('Missing language properties');
    }

    // Check for automation-specific properties
    if ((window as any).navigator?.webdriver || (document as any).$cdc_asdjflasutopfhvcZLmcfl_ || (document as any).$chrome_asyncScriptInfo) {
      checks.push('Automation properties detected');
    }

    // Check screen properties (headless browsers often have unusual resolutions)
    if (screen.width === 0 || screen.height === 0 || window.innerWidth === 0 || window.innerHeight === 0) {
      checks.push('Invalid screen dimensions');
    }

    // Check for automation-related permissions
    if (navigator.permissions) {
      try {
        const permissions = (navigator as any).permissions;
        if (permissions.query && typeof permissions.query !== 'function') {
          checks.push('Modified permissions API');
        }
      } catch (e) {
        // Ignore errors
      }
    }

    // Check for automation browser extensions
    if ((window as any).chrome?.runtime) {
      try {
        const runtime = (window as any).chrome.runtime;
        if (runtime.onConnect && typeof runtime.onConnect.addListener === 'undefined') {
          checks.push('Modified Chrome runtime API');
        }
      } catch (e) {
        // Ignore errors
      }
    }

    // Check for missing or modified browser APIs that automation tools often break
    if (typeof window.getComputedStyle === 'undefined' || typeof document.createElement === 'undefined') {
      checks.push('Missing core browser APIs');
    }

    // Check for automation-specific window properties
    const automationProps = [
      '__webdriver_script_fn',
      '__driver_evaluate',
      '__webdriver_evaluate',
      '__selenium_evaluate',
      '__fxdriver_evaluate',
      '__driver_unwrapped',
      '__webdriver_unwrapped',
      '__selenium_unwrapped',
      '__fxdriver_unwrapped',
      '__webdriver_script_func',
      '__webdriver_script_function',
      '__selenium_IDE_recorder',
      '__selenium',
      '__webdriver',
      '__driver',
      '__fxdriver',
      '__automation',
      '__testingbot',
      '__saucelabs',
    ];

    for (const prop of automationProps) {
      if ((window as any)[prop] !== undefined) {
        checks.push(`Automation property detected: ${prop}`);
        break; // Only report once
      }
    }

    if (checks.length > 0) {
      triggerViolation('ai_agent', 'AI Agent/Automation Detected', `Detected: ${checks.join(', ')}`);
    }
  }, [triggerViolation]);

  // Monitor for screenshot tools that might use canvas or other methods
  useEffect(() => {
    if (enabled && !isDisabledRef.current) {
      // Override canvas methods to detect screenshot attempts
      const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
      const originalToBlob = HTMLCanvasElement.prototype.toBlob;
      const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
      
      HTMLCanvasElement.prototype.toDataURL = function(...args: any[]) {
        triggerViolation('screenshot', 'Screenshot Attempt', 'Canvas export is disabled (possible screenshot tool).');
        return '';
      };
      
      HTMLCanvasElement.prototype.toBlob = function(...args: any[]) {
        triggerViolation('screenshot', 'Screenshot Attempt', 'Canvas export is disabled (possible screenshot tool).');
        if (args[0]) args[0](null);
      };
      
      CanvasRenderingContext2D.prototype.getImageData = function(...args: any[]) {
        triggerViolation('screenshot', 'Screenshot Attempt', 'Canvas image data access is disabled (possible screenshot tool).');
        return new ImageData(1, 1);
      };

      // Detect Circle to Search through image search APIs
      // Override fetch to detect image search requests
      const originalFetch = window.fetch;
      window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
        const url = input.toString();
        if (url.includes('lens.google.com') || 
            url.includes('google.com/searchbyimage') ||
            url.includes('reverse-image-search') ||
            (url.includes('google.com') && url.includes('image'))) {
          triggerViolation('circle_to_search', 'Circle to Search Detected', 'Image search detected (Circle to Search).');
        }
        return originalFetch.call(this, input, init);
      };

      return () => {
        HTMLCanvasElement.prototype.toDataURL = originalToDataURL;
        HTMLCanvasElement.prototype.toBlob = originalToBlob;
        CanvasRenderingContext2D.prototype.getImageData = originalGetImageData;
        window.fetch = originalFetch;
      };
    }
  }, [enabled, triggerViolation]);

  useEffect(() => {
    if (enabled) {
      // Reset state when enabled
      isDisabledRef.current = false;
      setViolationCount(0);
      setViolationRecords([]);

      // Run automation detection immediately and periodically
      detectAutomation();
      automationCheckIntervalRef.current = setInterval(() => {
        detectAutomation();
      }, 5000); // Check every 5 seconds

      let wakeLock: any = null;

      // 1. Enter fullscreen mode
      const enterFullscreen = async () => {
        try {
          await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
          console.log('Fullscreen mode activated');
        } catch (err: any) {
          console.warn(`Fullscreen error: ${err.message}`);
        }
      };

      // 2. Request keyboard lock (prevents Alt+Tab, Windows key, etc.)
      const lockKeyboard = async () => {
        try {
          if ('keyboard' in navigator && 'lock' in (navigator as any).keyboard) {
            await (navigator as any).keyboard.lock([
              'Escape',
              'MetaLeft', 'MetaRight', // Windows/Command key
              'AltLeft', 'AltRight',
              'Tab',
              'ContextMenu',
            ]);
            console.log('Keyboard locked');
          }
        } catch (err: any) {
          console.warn(`Keyboard lock error: ${err.message}`);
        }
      };

      // 3. Request wake lock (prevents screen from sleeping)
      const requestWakeLock = async () => {
        try {
          if ('wakeLock' in navigator) {
            wakeLock = await (navigator as any).wakeLock.request('screen');
            console.log('Wake lock activated');
            
            wakeLock.addEventListener('release', () => {
              console.log('Wake lock released');
            });
          }
        } catch (err: any) {
          console.warn(`Wake lock error: ${err.message}`);
        }
      };

      // 4. Monitor fullscreen exit attempts
      const handleFullscreenChange = () => {
        if (!document.fullscreenElement && !isDisabledRef.current) {
          // User exited fullscreen - try to re-enter
          setTimeout(() => {
            if (!isDisabledRef.current) {
              enterFullscreen();
              triggerViolation('browser_change', 'Fullscreen Exit Attempt', 'You must stay in fullscreen mode.');
            }
          }, 100);
        }
      };

      // Initialize all locks
      enterFullscreen();
      lockKeyboard();
      requestWakeLock();

      // Add event listeners
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('contextmenu', handleContextMenu);
      window.addEventListener('keydown', handleKeyDown);
      
      // Disable text selection
      document.body.style.userSelect = 'none';
      
      // Disable drag and drop
      document.body.addEventListener('dragstart', (e) => e.preventDefault());
      document.body.addEventListener('drop', (e) => e.preventDefault());

      // Block common exit shortcuts
      const blockExitShortcuts = (e: KeyboardEvent) => {
        // Block Alt+F4 (Windows close)
        if (e.altKey && e.key === 'F4') {
          e.preventDefault();
          triggerViolation('browser_change', 'Exit Attempt', 'Alt+F4 is disabled.');
        }
        // Block Ctrl+W (close tab)
        if (e.ctrlKey && e.key === 'w') {
          e.preventDefault();
          triggerViolation('browser_change', 'Exit Attempt', 'Ctrl+W is disabled.');
        }
        // Block Ctrl+Q (quit browser)
        if (e.ctrlKey && e.key === 'q') {
          e.preventDefault();
          triggerViolation('browser_change', 'Exit Attempt', 'Ctrl+Q is disabled.');
        }
        // Block F11 (fullscreen toggle)
        if (e.key === 'F11') {
          e.preventDefault();
        }
      };
      window.addEventListener('keydown', blockExitShortcuts);

      // Warn before leaving page
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your quiz progress may be lost.';
        return e.returnValue;
      };
      window.addEventListener('beforeunload', handleBeforeUnload);

      // Cleanup
      return () => {
        if (automationCheckIntervalRef.current) {
          clearInterval(automationCheckIntervalRef.current);
          automationCheckIntervalRef.current = null;
        }
        
        // Release all locks
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        if ('keyboard' in navigator && 'unlock' in (navigator as any).keyboard) {
          (navigator as any).keyboard.unlock();
        }
        if (wakeLock) {
          wakeLock.release().catch(() => {});
        }

        // Remove event listeners
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('contextmenu', handleContextMenu);
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keydown', blockExitShortcuts);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        
        document.body.style.userSelect = 'auto';
        isDisabledRef.current = false;
      };
    }
  }, [enabled, handleVisibilityChange, handleContextMenu, handleKeyDown, detectAutomation, triggerViolation]);

  return { violationCount, violationRecords };
}
