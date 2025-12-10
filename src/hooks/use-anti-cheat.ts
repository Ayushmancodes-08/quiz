"use client";

import { useEffect, useCallback, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export type ViolationType = 'screenshot' | 'circle_to_search' | 'browser_change' | 'ai_agent' | 'tab_switch';

export interface ViolationRecord {
  type: ViolationType;
  reason: string;
  timestamp: number;
  details?: string;
  severity?: 'low' | 'medium' | 'high';
}

type UseAntiCheatProps = {
  enabled: boolean;
  onViolation: (reason: string, violationRecords?: ViolationRecord[]) => void;
  maxViolations?: number; // Violation limit per category
};

export function useAntiCheat({ enabled, onViolation, maxViolations = 3 }: UseAntiCheatProps) {
  const { toast } = useToast();
  const [violationRecords, setViolationRecords] = useState<ViolationRecord[]>([]);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [securityViolationCount, setSecurityViolationCount] = useState(0);
  const isDisabledRef = useRef(false);
  const automationCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const onViolationRef = useRef(onViolation);
  const maxViolationsRef = useRef(maxViolations);

  useEffect(() => {
    onViolationRef.current = onViolation;
    maxViolationsRef.current = maxViolations;
  }, [onViolation, maxViolations]);

  // Combined trigger for all violations
  const triggerViolation = useCallback((type: ViolationType, reason: string, details?: string, severity: 'low' | 'medium' | 'high' = 'medium') => {
    if (isDisabledRef.current) return;

    const timestamp = Date.now();
    const record: ViolationRecord = { type, reason, timestamp, details, severity };

    setViolationRecords(prev => {
      const updated = [...prev, record];

      // Calculate counts from updated records
      const tabs = updated.filter(r => r.type === 'tab_switch' || r.type === 'browser_change').length;
      const security = updated.filter(r => r.type !== 'tab_switch' && r.type !== 'browser_change').length;

      setTabSwitchCount(tabs);
      setSecurityViolationCount(security);

      // Check if ANY category hit the limit
      if (tabs >= maxViolationsRef.current || security >= maxViolationsRef.current) {
        isDisabledRef.current = true;
        setTimeout(() => {
          onViolationRef.current(`Exceeded maximum violations (${maxViolationsRef.current}) in a category.`, updated);
        }, 0);
      }

      return updated;
    });

    // Toast notification
    setTimeout(() => {
      if (type === 'tab_switch' || type === 'browser_change') {
        toast({
          variant: 'destructive',
          title: `Violation: ${reason}`,
          description: `Tab Violations: ${tabSwitchCount + 1}/${maxViolationsRef.current}`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: `Security Violation: ${reason}`,
          description: `Security Violations: ${securityViolationCount + 1}/${maxViolationsRef.current}`,
        });
      }
    }, 0);

  }, [toast, tabSwitchCount, securityViolationCount]);

  // Detect if device is mobile
  const isMobile = useRef(false);
  const lastVisibilityChange = useRef<number>(0);
  const visibilityChangeCount = useRef<number>(0);
  const monitoringStartTime = useRef<number>(0);
  const isMonitoringActive = useRef(false);

  useEffect(() => {
    // Detect mobile device
    isMobile.current = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0);

    console.log('Device type:', isMobile.current ? 'Mobile' : 'Desktop');
  }, []);

  // 1. Detect browser/tab changes - COMPLETELY DISABLED ON MOBILE
  const handleVisibilityChange = useCallback(() => {
    // COMPLETELY DISABLE visibility monitoring on mobile
    if (isMobile.current) {
      console.log('Visibility monitoring disabled on mobile');
      return;
    }

    // Only monitor if enough time has passed since monitoring started (5 second grace period)
    if (!isMonitoringActive.current) {
      console.log('Monitoring not active yet - grace period');
      return;
    }

    const timeSinceStart = Date.now() - monitoringStartTime.current;
    if (timeSinceStart < 5000) {
      console.log('Within grace period - ignoring visibility change');
      return;
    }

    if (document.visibilityState === 'hidden' && !isDisabledRef.current) {
      const now = Date.now();
      const timeSinceLastChange = now - lastVisibilityChange.current;

      // Reset count if more than 10 seconds since last change
      if (timeSinceLastChange > 10000) {
        visibilityChangeCount.current = 0;
      }

      visibilityChangeCount.current++;
      lastVisibilityChange.current = now;


      // Direct violation for tab switching
      triggerViolation('tab_switch', 'Tab Switch Detected', 'Leaving the quiz tab is not allowed.');
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

  // 4. Detect AI agents, browser extensions, and automation tools
  const detectAutomation = useCallback(() => {
    if (isDisabledRef.current) return;

    const checks: string[] = [];
    let suspicionScore = 0; // Track suspicious behavior

    // === AI Browser Extension Detection ===

    // Check for common AI extension properties
    const aiExtensionIndicators = [
      'comet',
      'chatgpt',
      'claude',
      'gemini',
      'copilot',
      'perplexity',
      'bard',
      'openai',
      'anthropic',
      'ai_assistant',
      'ai_helper',
      'ai_copilot',
    ];

    // Check window properties for AI extensions
    for (const indicator of aiExtensionIndicators) {
      if ((window as any)[indicator] || (window as any)[`__${indicator}`] || (window as any)[`_${indicator}`]) {
        checks.push(`AI extension detected: ${indicator}`);
        suspicionScore += 10;
        break;
      }
    }

    // Check for extension-injected elements
    const suspiciousElements = document.querySelectorAll('[class*="ai-"], [id*="ai-"], [class*="comet"], [id*="comet"], [class*="chatgpt"], [id*="chatgpt"]');
    if (suspiciousElements.length > 0) {
      checks.push('AI extension UI elements detected');
      suspicionScore += 8;
    }

    // Check for extension-injected scripts
    const scripts = Array.from(document.querySelectorAll('script'));
    const suspiciousScripts = scripts.filter(script => {
      const src = script.src.toLowerCase();
      return aiExtensionIndicators.some(indicator => src.includes(indicator));
    });
    if (suspiciousScripts.length > 0) {
      checks.push('AI extension scripts detected');
      suspicionScore += 10;
    }

    // Monitor for unusual DOM mutations (AI extensions often inject content)
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              const className = element.className?.toString().toLowerCase() || '';
              const id = element.id?.toLowerCase() || '';

              if (aiExtensionIndicators.some(indicator =>
                className.includes(indicator) || id.includes(indicator)
              )) {
                checks.push('AI extension content injection detected');
                suspicionScore += 7;
              }
            }
          });
        }
      }
    });

    // Check for Chrome extension APIs being used
    if ((window as any).chrome?.runtime?.sendMessage) {
      // Try to detect if extensions are actively communicating
      try {
        const originalSendMessage = (window as any).chrome.runtime.sendMessage;
        (window as any).chrome.runtime.sendMessage = function (...args: any[]) {
          checks.push('Extension communication detected');
          suspicionScore += 5;
          return originalSendMessage.apply(this, args);
        };
      } catch (e) {
        // Extension API might be restricted
      }
    }

    // === Behavioral Analysis ===

    // Check for suspiciously fast answer times (AI assistance indicator)
    const answerTimes: number[] = [];
    let lastAnswerTime = Date.now();

    document.addEventListener('change', () => {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastAnswerTime;
      answerTimes.push(timeDiff);
      lastAnswerTime = currentTime;

      // If answering too quickly consistently (< 5 seconds), might be using AI
      if (answerTimes.length >= 3) {
        const avgTime = answerTimes.reduce((a, b) => a + b, 0) / answerTimes.length;
        if (avgTime < 5000) {
          checks.push('Suspiciously fast answer pattern detected');
          suspicionScore += 6;
        }
      }
    });

    // === Traditional Automation Detection ===

    // Check for WebDriver property (Selenium, Puppeteer, Playwright)
    if ((window as any).navigator?.webdriver === true) {
      checks.push('WebDriver detected');
      suspicionScore += 10;
    }

    // Check for Chrome DevTools Protocol
    if ((window as any).chrome?.runtime?.onConnect) {
      if ((window as any).__selenium_unwrapped || (window as any).__webdriver_evaluate || (window as any).__driver_evaluate) {
        checks.push('Chrome DevTools Protocol detected');
        suspicionScore += 10;
      }
    }

    // Check for headless browser indicators
    if (navigator.plugins.length === 0 && !navigator.userAgent.includes('Mobile')) {
      checks.push('No plugins detected (possible headless browser)');
      suspicionScore += 5;
    }

    // Check for automation frameworks
    if ((window as any).callPhantom || (window as any)._phantom || (window as any).__nightmare) {
      checks.push('PhantomJS/Nightmare detected');
      suspicionScore += 10;
    }

    if ((window as any).domAutomation || (window as any).domAutomationController) {
      checks.push('DOM automation detected');
      suspicionScore += 10;
    }

    // Check user agent for automation indicators
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('headless') || userAgent.includes('phantom') || userAgent.includes('selenium')) {
      checks.push('Automation user agent detected');
      suspicionScore += 10;
    }

    // Check for missing properties that real browsers have
    if (!navigator.languages || navigator.languages.length === 0) {
      checks.push('Missing language properties');
      suspicionScore += 4;
    }

    // Check for automation-specific properties
    if ((window as any).navigator?.webdriver || (document as any).$cdc_asdjflasutopfhvcZLmcfl_ || (document as any).$chrome_asyncScriptInfo) {
      checks.push('Automation properties detected');
      suspicionScore += 10;
    }

    // Check screen properties (headless browsers often have unusual resolutions)
    if (screen.width === 0 || screen.height === 0 || window.innerWidth === 0 || window.innerHeight === 0) {
      checks.push('Invalid screen dimensions');
      suspicionScore += 8;
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
        suspicionScore += 10;
        break;
      }
    }

    // === Realistic Violation Triggering ===
    // Only trigger violation if suspicion score is high enough
    // This prevents false positives from legitimate browser variations

    if (suspicionScore >= 10) {
      const severity = suspicionScore >= 20 ? 'High' : suspicionScore >= 15 ? 'Medium' : 'Low';
      triggerViolation(
        'ai_agent',
        'AI Assistant/Automation Detected',
        `Detected: ${checks.join(', ')} | Severity: ${severity} (Score: ${suspicionScore})`
      );
    }
  }, [triggerViolation]);

  // Monitor for screenshot tools, AI assistance, and clipboard activity
  useEffect(() => {
    if (!enabled || isDisabledRef.current) return;

    // Override canvas methods to detect screenshot attempts
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    const originalToBlob = HTMLCanvasElement.prototype.toBlob;
    const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;

    HTMLCanvasElement.prototype.toDataURL = function (...args: any[]) {
      triggerViolation('screenshot', 'Screenshot Attempt', 'Canvas export is disabled (possible screenshot tool).');
      return '';
    };

    HTMLCanvasElement.prototype.toBlob = function (...args: any[]) {
      triggerViolation('screenshot', 'Screenshot Attempt', 'Canvas export is disabled (possible screenshot tool).');
      if (args[0]) args[0](null);
    };

    CanvasRenderingContext2D.prototype.getImageData = function (...args: any[]) {
      triggerViolation('screenshot', 'Screenshot Attempt', 'Canvas image data access is disabled (possible screenshot tool).');
      return new ImageData(1, 1);
    };

    // Detect Circle to Search through image search APIs
    // Override fetch to detect image search and AI API requests
    const originalFetch = window.fetch;
    window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
      const url = input.toString().toLowerCase();

      // Detect image search
      if (url.includes('lens.google.com') ||
        url.includes('google.com/searchbyimage') ||
        url.includes('reverse-image-search') ||
        (url.includes('google.com') && url.includes('image'))) {
        triggerViolation('circle_to_search', 'Circle to Search Detected', 'Image search detected (Circle to Search).');
      }

      // Detect AI API calls
      const aiApiDomains = [
        'openai.com',
        'api.openai.com',
        'anthropic.com',
        'api.anthropic.com',
        'cohere.ai',
        'ai.google.dev',
        'generativelanguage.googleapis.com',
        'api.perplexity.ai',
        'api.together.xyz',
        'api.replicate.com',
      ];

      if (aiApiDomains.some(domain => url.includes(domain))) {
        triggerViolation('ai_agent', 'AI API Request Detected', `External AI service call detected: ${url.split('/')[2]}`);
      }

      return originalFetch.call(this, input, init);
    };

    // Monitor clipboard for suspicious paste activity
    const handlePaste = async (e: ClipboardEvent) => {
      const pastedText = e.clipboardData?.getData('text');

      if (pastedText && pastedText.length > 50) {
        // Long paste might indicate copying from AI
        triggerViolation('ai_agent', 'Suspicious Paste Detected', `Large text paste detected (${pastedText.length} characters). Possible AI-generated content.`);
      }
    };

    // Monitor for copy events (might be copying questions to AI)
    let copyCount = 0;
    const handleCopy = (e: ClipboardEvent) => {
      copyCount++;
      if (copyCount >= 3) {
        triggerViolation('ai_agent', 'Excessive Copy Activity', 'Multiple copy operations detected. Questions may be copied to external AI tools.');
        copyCount = 0; // Reset after violation
      }
    };

    document.addEventListener('paste', handlePaste);
    document.addEventListener('copy', handleCopy);

    return () => {
      HTMLCanvasElement.prototype.toDataURL = originalToDataURL;
      HTMLCanvasElement.prototype.toBlob = originalToBlob;
      CanvasRenderingContext2D.prototype.getImageData = originalGetImageData;
      window.fetch = originalFetch;
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('copy', handleCopy);
    };
  }, [enabled, triggerViolation]);

  useEffect(() => {
    if (!enabled) return;

    // Reset state when enabled
    isDisabledRef.current = false;
    setTabSwitchCount(0);
    setSecurityViolationCount(0);
    setViolationRecords([]);

    // Run automation detection immediately and periodically
    // On mobile, check less frequently to avoid performance issues
    detectAutomation();
    const checkInterval = isMobile.current ? 15000 : 5000; // 15s on mobile, 5s on desktop
    automationCheckIntervalRef.current = setInterval(() => {
      detectAutomation();
    }, checkInterval);

    let wakeLock: any = null;

    // 1. Enter fullscreen mode (DISABLED ON MOBILE)
    const enterFullscreen = async () => {
      // Skip fullscreen on mobile - it causes issues
      if (isMobile.current) {
        console.log('Skipping fullscreen on mobile device');
        return;
      }

      try {
        await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
        console.log('Fullscreen mode activated');
      } catch (err: any) {
        console.warn(`Fullscreen error: ${err.message}`);
      }
    };

    // 2. Request keyboard lock (DESKTOP ONLY)
    const lockKeyboard = async () => {
      // Skip keyboard lock on mobile
      if (isMobile.current) {
        console.log('Skipping keyboard lock on mobile device');
        return;
      }

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

    // 4. Monitor fullscreen exit attempts (DESKTOP ONLY)
    const handleFullscreenChange = () => {
      // Skip fullscreen monitoring on mobile
      if (isMobile.current) return;

      if (!document.fullscreenElement && !isDisabledRef.current) {
        // User exited fullscreen - count as flag
        setTimeout(() => {
          if (!isDisabledRef.current) {
            enterFullscreen();
            triggerViolation('tab_switch', 'Fullscreen Exit', 'Exiting fullscreen is treated as a tab violation.');
          }
        }, 100);
      }
    };

    // Initialize locks (mobile-aware)
    if (!isMobile.current) {
      enterFullscreen();
      lockKeyboard();
    }
    requestWakeLock(); // Wake lock works on mobile

    // Add event listeners with startup delay
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // IMPORTANT: Add visibility listener ONLY on desktop
    if (!isMobile.current) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      console.log('Visibility monitoring enabled (Desktop)');
    } else {
      console.log('Visibility monitoring DISABLED (Mobile)');
    }

    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    // Activate monitoring after 5 second grace period
    setTimeout(() => {
      monitoringStartTime.current = Date.now();
      isMonitoringActive.current = true;
      console.log('Anti-cheat monitoring now active');
    }, 5000);

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
        document.exitFullscreen().catch(() => { });
      }
      if ('keyboard' in navigator && 'unlock' in (navigator as any).keyboard) {
        (navigator as any).keyboard.unlock();
      }
      if (wakeLock) {
        wakeLock.release().catch(() => { });
      }

      // Remove event listeners
      document.removeEventListener('fullscreenchange', handleFullscreenChange);

      // Only remove visibility listener if it was added (desktop only)
      if (!isMobile.current) {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }

      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keydown', blockExitShortcuts);
      window.removeEventListener('beforeunload', handleBeforeUnload);

      document.body.style.userSelect = 'auto';
      isDisabledRef.current = false;
    };
  }, [enabled, handleVisibilityChange, handleContextMenu, handleKeyDown, detectAutomation]);

  return {
    violationRecords,
    tabSwitchCount,
    securityViolationCount
  };
}
