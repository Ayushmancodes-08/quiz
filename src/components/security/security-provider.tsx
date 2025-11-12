'use client';

import { AntiScreenshot } from './anti-screenshot';
import { MobileSecurity } from './mobile-security';
import { useEffect, useState } from 'react';

interface SecurityProviderProps {
  children: React.ReactNode;
  enableLogging?: boolean;
  redirectOnViolation?: string;
}

export function SecurityProvider({ 
  children, 
  enableLogging = true,
  redirectOnViolation = '/security-violation'
}: SecurityProviderProps) {
  const [violations, setViolations] = useState<Array<{ type: string; timestamp: Date }>>([]);

  const handleViolation = async (type: string) => {
    const violation = { type, timestamp: new Date() };
    setViolations(prev => [...prev, violation]);

    if (enableLogging) {
      try {
        // Log to server
        await fetch('/api/security/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            timestamp: violation.timestamp,
            userAgent: navigator.userAgent,
            url: window.location.href,
            sessionId: sessionStorage.getItem('sessionId')
          })
        });
      } catch (error) {
        console.error('Failed to log security violation:', error);
      }
    }
  };

  useEffect(() => {
    // Generate session ID
    if (!sessionStorage.getItem('sessionId')) {
      sessionStorage.setItem('sessionId', `${Date.now()}-${Math.random().toString(36)}`);
    }

    // Store user ID for watermarking
    if (!sessionStorage.getItem('userId')) {
      sessionStorage.setItem('userId', `USER-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
    }
  }, []);

  return (
    <>
      <AntiScreenshot 
        onViolation={handleViolation}
        redirectOnViolation={redirectOnViolation}
      />
      <MobileSecurity onViolation={handleViolation} />
      {children}
    </>
  );
}
