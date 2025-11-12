'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';
import { securityLogger } from '@/lib/security-logger';

interface AntiScreenshotProps {
  onViolation?: (type: string) => void;
  enableWarnings?: boolean;
  redirectOnViolation?: string;
}

export function AntiScreenshot({ 
  onViolation, 
  enableWarnings = true,
  redirectOnViolation 
}: AntiScreenshotProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [violations, setViolations] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isActive = true;
    const violationThreshold = 3;

    // Enhanced screenshot prevention with better detection
    const preventScreenshot = (e: KeyboardEvent) => {
      // Detect platform
      const isMac = /Mac|iPhone|iPod|iPad/i.test(navigator.platform);
      const isWindows = /Win/i.test(navigator.platform);
      
      // Windows screenshot shortcuts
      if (isWindows) {
        if (
          e.key === 'PrintScreen' ||
          e.code === 'PrintScreen' ||
          (e.key === 's' && e.shiftKey && (e.ctrlKey || e.metaKey)) || // Ctrl+Shift+S (Snipping Tool)
          (e.key === 'S' && e.shiftKey && (e.ctrlKey || e.metaKey))
        ) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          handleViolation('screenshot_attempt');
          
          // Clear clipboard to prevent screenshot storage
          if (navigator.clipboard) {
            navigator.clipboard.writeText('').catch(() => {});
          }
          return false;
        }
      }
      
      // Mac screenshot shortcuts
      if (isMac) {
        if (
          (e.metaKey && e.shiftKey && ['3', '4', '5', '6'].includes(e.key)) ||
          (e.metaKey && e.shiftKey && e.code && ['Digit3', 'Digit4', 'Digit5', 'Digit6'].includes(e.code))
        ) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          handleViolation('screenshot_attempt');
          return false;
        }
      }

      // Prevent developer tools (all platforms)
      if (
        e.key === 'F12' ||
        e.code === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key)) ||
        (e.metaKey && e.altKey && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key)) ||
        (e.ctrlKey && e.shiftKey && ['KeyI', 'KeyJ', 'KeyC'].includes(e.code)) ||
        (e.metaKey && e.altKey && ['KeyI', 'KeyJ', 'KeyC'].includes(e.code))
      ) {
        e.preventDefault();
        e.stopPropagation();
        handleViolation('devtools_attempt');
        return false;
      }

      // Prevent Ctrl+U (view source)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U' || e.code === 'KeyU')) {
        e.preventDefault();
        handleViolation('view_source_attempt');
        return false;
      }

      // Prevent Ctrl+S (save page)
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 's' || e.key === 'S' || e.code === 'KeyS')) {
        e.preventDefault();
        handleViolation('save_page_attempt');
        return false;
      }
    };

    // Detect visibility change (tab switching)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation('tab_switch');
      }
    };

    // Detect blur (window switching)
    const handleBlur = () => {
      handleViolation('window_blur');
    };

    // Prevent right-click context menu
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      handleViolation('context_menu');
      return false;
    };

    // Detect AI agents and automation
    const detectAutomation = () => {
      // Check for webdriver
      if (navigator.webdriver) {
        handleViolation('automation_detected');
      }

      // Check for common automation properties
      if (
        (window as any).callPhantom ||
        (window as any)._phantom ||
        (window as any).phantom ||
        (window as any).__nightmare ||
        (window as any).Buffer ||
        (document as any).__selenium_unwrapped ||
        (document as any).__webdriver_evaluate ||
        (document as any).__driver_evaluate
      ) {
        handleViolation('bot_detected');
      }

      // Check for headless browser
      if (
        /HeadlessChrome/.test(navigator.userAgent) ||
        navigator.plugins.length === 0
      ) {
        handleViolation('headless_browser');
      }
    };

    // Handle violation
    const handleViolation = (type: string) => {
      if (!isActive) return;

      // Beautiful console logging
      securityLogger.violation(type, {
        data: {
          'Violation Type': type.replace(/_/g, ' '),
          'Total Violations': violations + 1,
          'Threshold': violationThreshold,
          'Session ID': sessionStorage.getItem('sessionId')?.substring(0, 8) || 'N/A',
          'User ID': sessionStorage.getItem('userId') || 'N/A',
          'URL': window.location.pathname,
        }
      });
      
      setViolations(prev => {
        const newCount = prev + 1;
        
        // Defer toast and redirect to avoid state update during render
        setTimeout(() => {
          // Show toast notification
          if (enableWarnings && newCount <= violationThreshold) {
            toast({
              variant: "destructive",
              title: "Security Warning",
              description: `${type.replace(/_/g, ' ')} detected. Violations: ${newCount}/${violationThreshold}`,
            });
          }

          // Schedule redirect
          if (newCount >= violationThreshold && redirectOnViolation) {
            if (redirectTimeoutRef.current) {
              clearTimeout(redirectTimeoutRef.current);
            }
            redirectTimeoutRef.current = setTimeout(() => {
              router.push(redirectOnViolation);
            }, 100);
          }
        }, 0);

        return newCount;
      });

      onViolation?.(type);
    };

    // Enhanced watermark with dynamic positioning and better visibility
    const createWatermark = () => {
      if (!overlayRef.current) return;
      
      const userId = sessionStorage.getItem('userId') || 'USER';
      const timestamp = new Date().toLocaleString();
      const sessionId = sessionStorage.getItem('sessionId')?.substring(0, 8) || 'SESSION';
      
      overlayRef.current.innerHTML = '';
      
      // Create grid-based watermarks for better coverage
      const rows = 5;
      const cols = 4;
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const watermark = document.createElement('div');
          watermark.textContent = `${userId} • ${sessionId} • ${timestamp}`;
          
          const topPercent = (row * (100 / rows)) + (Math.random() * 10);
          const leftPercent = (col * (100 / cols)) + (Math.random() * 10);
          
          watermark.style.cssText = `
            position: fixed;
            top: ${topPercent}%;
            left: ${leftPercent}%;
            transform: rotate(${-45 + Math.random() * 90}deg);
            opacity: ${0.03 + Math.random() * 0.02};
            font-size: ${10 + Math.random() * 4}px;
            pointer-events: none;
            user-select: none;
            z-index: 9999;
            color: ${Math.random() > 0.5 ? '#000' : '#666'};
            font-family: monospace;
            white-space: nowrap;
          `;
          overlayRef.current.appendChild(watermark);
        }
      }
      
      // Add invisible tracking pixels
      for (let i = 0; i < 10; i++) {
        const pixel = document.createElement('div');
        pixel.style.cssText = `
          position: fixed;
          top: ${Math.random() * 100}%;
          left: ${Math.random() * 100}%;
          width: 1px;
          height: 1px;
          opacity: 0.01;
          pointer-events: none;
          z-index: 9999;
          background: ${Math.random() > 0.5 ? '#000' : '#fff'};
        `;
        overlayRef.current.appendChild(pixel);
      }
    };

    // Enhanced screen recording and screenshot detection
    const detectScreenRecording = () => {
      // Monitor screen capture API
      if ('mediaDevices' in navigator && 'getDisplayMedia' in navigator.mediaDevices) {
        const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
        navigator.mediaDevices.getDisplayMedia = function(...args) {
          handleViolation('screen_recording_attempt');
          return originalGetDisplayMedia.apply(this, args);
        };
      }
      
      // Detect browser extensions that might capture screenshots
      const detectExtensions = () => {
        // Check for common screenshot extension indicators
        const extensionIndicators = [
          'chrome-extension://',
          'moz-extension://',
          '__firefox__',
          '__chrome__'
        ];
        
        const scripts = Array.from(document.scripts);
        const hasExtension = scripts.some(script => 
          extensionIndicators.some(indicator => script.src.includes(indicator))
        );
        
        if (hasExtension) {
          handleViolation('browser_extension_detected');
        }
      };
      
      detectExtensions();
      
      // Monitor for screenshot tools via performance API
      if ('performance' in window && 'getEntriesByType' in performance) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'resource') {
              const resourceEntry = entry as PerformanceResourceTiming;
              // Detect suspicious resource loads
              if (resourceEntry.name.includes('screenshot') || 
                  resourceEntry.name.includes('capture')) {
                handleViolation('screenshot_tool_detected');
              }
            }
          }
        });
        
        try {
          observer.observe({ entryTypes: ['resource'] });
        } catch (e) {
          // Observer not supported
        }
      }
      
      // Detect if page is being captured via canvas
      const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
      HTMLCanvasElement.prototype.toDataURL = function(...args) {
        handleViolation('canvas_capture_attempt');
        return originalToDataURL.apply(this, args);
      };
      
      const originalToBlob = HTMLCanvasElement.prototype.toBlob;
      HTMLCanvasElement.prototype.toBlob = function(...args) {
        handleViolation('canvas_capture_attempt');
        return originalToBlob.apply(this, args);
      };
    };

    // Initialize security measures
    securityLogger.init('Desktop Security', {
      'Platform': navigator.platform,
      'User Agent': navigator.userAgent.substring(0, 50) + '...',
      'Violation Threshold': violationThreshold,
      'Warnings Enabled': enableWarnings,
      'Redirect URL': redirectOnViolation || 'None',
    });

    document.addEventListener('keydown', preventScreenshot, true);
    document.addEventListener('keyup', preventScreenshot, true);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('contextmenu', preventContextMenu);
    
    detectAutomation();
    detectScreenRecording();
    createWatermark();
    
    // Periodic checks
    const automationInterval = setInterval(detectAutomation, 5000);
    const watermarkInterval = setInterval(createWatermark, 30000);

    // Prevent text selection and copy
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';

    return () => {
      isActive = false;
      document.removeEventListener('keydown', preventScreenshot, true);
      document.removeEventListener('keyup', preventScreenshot, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('contextmenu', preventContextMenu);
      clearInterval(automationInterval);
      clearInterval(watermarkInterval);
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    };
  }, [onViolation, enableWarnings, redirectOnViolation, router, toast]);

  return (
    <>
      {/* Watermark overlay */}
      <div ref={overlayRef} className="pointer-events-none" />
      
      {/* Invisible overlay to detect screenshot tools */}
      <div 
        className="fixed inset-0 pointer-events-none z-[9998]"
        style={{
          background: 'transparent',
          mixBlendMode: 'difference',
          opacity: 0.01
        }}
      />
      
      {/* Security indicator using app's UI components */}
      {violations > 0 && (
        <div 
          className="fixed bottom-4 right-4 z-[10000]"
          style={{ pointerEvents: 'none' }}
        >
          <Badge variant="destructive" className="flex items-center gap-2 px-3 py-2 text-sm shadow-lg">
            <Shield className="h-4 w-4" />
            Security Active • {violations} violation{violations !== 1 ? 's' : ''}
          </Badge>
        </div>
      )}
    </>
  );
}
