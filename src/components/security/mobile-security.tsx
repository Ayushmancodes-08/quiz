'use client';

import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { securityLogger } from '@/lib/security-logger';

interface MobileSecurityProps {
  onViolation?: (type: string) => void;
}

export function MobileSecurity({ onViolation }: MobileSecurityProps) {
  const { toast } = useToast();
  const [isSecure, setIsSecure] = useState(true);
  const confirmTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isActive = true;

    // Enhanced Android screenshot detection
    const detectAndroidScreenshot = () => {
      let lastVisibilityChange = 0;
      let rapidChanges = 0;
      
      const handleVisibilityChange = () => {
        const now = Date.now();
        const timeSinceLastChange = now - lastVisibilityChange;
        
        // Rapid visibility changes can indicate screenshot
        if (timeSinceLastChange < 1000 && timeSinceLastChange > 0) {
          rapidChanges++;
          if (rapidChanges > 2) {
            handleViolation('mobile_screenshot_suspected');
            rapidChanges = 0;
          }
        } else {
          rapidChanges = 0;
        }
        
        lastVisibilityChange = now;
        
        // Brief hidden state typical of screenshot
        if (document.hidden) {
          setTimeout(() => {
            if (!document.hidden) {
              // Was hidden briefly - possible screenshot
              handleViolation('mobile_screenshot_suspected');
            }
          }, 100);
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Detect screenshot via media query (some Android devices)
      if (window.matchMedia) {
        const screenshotQuery = window.matchMedia('(display-mode: fullscreen)');
        screenshotQuery.addEventListener('change', (e) => {
          if (!e.matches) {
            handleViolation('mobile_screenshot_suspected');
          }
        });
      }
    };

    // Prevent iOS screenshot (limited capability) - passive monitoring
    const preventIOSScreenshot = () => {
      // iOS doesn't allow direct screenshot prevention
      // Passive monitoring only - don't trigger violations for normal app switching
      
      // Log when app goes to background (passive)
      window.addEventListener('pagehide', () => {
        securityLogger.detection('iOS app backgrounded (passive monitoring)', {
          level: 'info',
        });
      });

      // Log focus loss (passive)
      window.addEventListener('blur', () => {
        securityLogger.detection('iOS focus lost (passive monitoring)', {
          level: 'info',
        });
      });
    };

    // Prevent screen recording on mobile
    const preventMobileRecording = () => {
      // Add meta tag to prevent screen recording (Android)
      const meta = document.createElement('meta');
      meta.name = 'screen-capture';
      meta.content = 'disabled';
      document.head.appendChild(meta);

      // Detect if running in screen recording mode
      if (window.screen.width !== window.innerWidth || 
          window.screen.height !== window.innerHeight) {
        handleViolation('screen_recording_suspected');
      }
    };

    // Detect mobile automation tools
    const detectMobileAutomation = () => {
      // Check for Appium
      if ((window as any).appium) {
        handleViolation('appium_detected');
      }

      // Check for other mobile automation frameworks
      if (
        (window as any).uiautomator ||
        (window as any).espresso ||
        (window as any).xcuitest
      ) {
        handleViolation('mobile_automation_detected');
      }
    };

    // Prevent long press (which can trigger screenshot on some devices)
    const preventLongPress = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        let pressTimer: NodeJS.Timeout;

        const touchStart = () => {
          pressTimer = setTimeout(() => {
            e.preventDefault();
            handleViolation('long_press_detected');
          }, 500);
        };

        const touchEnd = () => {
          clearTimeout(pressTimer);
        };

        document.addEventListener('touchstart', touchStart);
        document.addEventListener('touchend', touchEnd);
        document.addEventListener('touchmove', touchEnd);
      }
    };

    // Handle violation
    const handleViolation = (type: string) => {
      if (!isActive) return;
      
      // Beautiful console logging
      securityLogger.mobile(type, {
        data: {
          'Violation Type': type.replace(/_/g, ' '),
          'Device': navigator.userAgent.match(/iPhone|iPad|iPod|Android/i)?.[0] || 'Unknown',
          'Session ID': sessionStorage.getItem('sessionId')?.substring(0, 8) || 'N/A',
          'URL': window.location.pathname,
        }
      });
      
      // Defer toast and state update to avoid render issues
      setTimeout(() => {
        // Show toast notification
        toast({
          variant: "destructive",
          title: "Security Violation",
          description: `${type.replace(/_/g, ' ')} detected on mobile device.`,
        });
        
        // Set insecure state with delay
        if (confirmTimeoutRef.current) {
          clearTimeout(confirmTimeoutRef.current);
        }
        confirmTimeoutRef.current = setTimeout(() => {
          setIsSecure(false);
        }, 100);
      }, 0);
      
      onViolation?.(type);
    };

    // Apply mobile-specific security
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      securityLogger.init('Mobile Security', {
        'Device': navigator.userAgent.match(/iPhone|iPad|iPod|Android/i)?.[0] || 'Unknown',
        'Platform': navigator.platform,
        'Screen Size': `${window.screen.width}x${window.screen.height}`,
      });

      detectAndroidScreenshot();
      preventIOSScreenshot();
      preventMobileRecording();
      detectMobileAutomation();
      
      document.addEventListener('touchstart', preventLongPress);
      
      // Note: Text selection blocking removed to allow quiz interaction on mobile
    }

    // Periodic automation checks
    const interval = setInterval(detectMobileAutomation, 5000);

    return () => {
      isActive = false;
      clearInterval(interval);
      if (confirmTimeoutRef.current) {
        clearTimeout(confirmTimeoutRef.current);
      }
      document.removeEventListener('touchstart', preventLongPress);
    };
  }, [onViolation, toast]);

  if (!isSecure) {
    return (
      <div className="fixed inset-0 bg-destructive/90 z-[10000] flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md bg-background">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-lg">Security Violation Detected</AlertTitle>
          <AlertDescription className="mt-2">
            Multiple security violations have been detected on your mobile device. 
            Please reload the page and avoid suspicious activities.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return null;
}
