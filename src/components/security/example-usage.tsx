'use client';

/**
 * Example usage of the security system
 * This file demonstrates different ways to implement security features
 */

import { SecurityProvider } from './security-provider';
import { useSecurity, usePreventSelection, useDevToolsDetection } from '@/hooks/use-security';
import { useRef } from 'react';

// Example 1: Using SecurityProvider (Recommended for full protection)
export function FullyProtectedPage({ children }: { children: React.ReactNode }) {
  return (
    <SecurityProvider 
      enableLogging={true}
      redirectOnViolation="/security-violation"
    >
      <div className="security-protected">
        {children}
      </div>
    </SecurityProvider>
  );
}

// Example 2: Using the useSecurity hook for custom behavior
export function CustomProtectedComponent() {
  const { violations, isSecure, lastViolation, isMobile } = useSecurity({
    enableScreenshotPrevention: true,
    enableTabSwitchDetection: true,
    enableAutomationDetection: true,
    onViolation: (type) => {
      console.warn(`Security violation detected: ${type}`);
      // Custom handling here
    }
  });

  if (!isSecure) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded">
        <h2 className="text-xl font-bold text-red-900 mb-2">Access Denied</h2>
        <p className="text-red-700">
          Too many security violations detected ({violations}).
        </p>
        <p className="text-sm text-red-600 mt-2">
          Last violation: {lastViolation}
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Protected Content</h1>
      <p className="text-gray-600 mb-2">
        Device: {isMobile ? 'Mobile' : 'Desktop'}
      </p>
      <p className="text-gray-600">
        Violations: {violations}
      </p>
      {/* Your protected content here */}
    </div>
  );
}

// Example 3: Preventing text selection on specific elements
export function NoSelectComponent() {
  const contentRef = useRef<HTMLDivElement>(null);
  usePreventSelection(contentRef);

  return (
    <div ref={contentRef} className="p-4 bg-gray-100 rounded">
      <p>This text cannot be selected or copied.</p>
      <p>Try selecting this text - it won't work!</p>
    </div>
  );
}

// Example 4: Detecting developer tools
export function DevToolsAlert() {
  const isDevToolsOpen = useDevToolsDetection(() => {
    alert('Developer tools detected! Please close them.');
  });

  if (isDevToolsOpen) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white p-4 text-center z-50">
        ⚠️ Developer tools are open. Please close them to continue.
      </div>
    );
  }

  return null;
}

// Example 5: Quiz page with full security
export function SecureQuizPage({ quizId }: { quizId: string }) {
  const { violations, isSecure } = useSecurity({
    onViolation: async (type) => {
      // Log to analytics
      console.log('Quiz violation:', type, 'Quiz ID:', quizId);
      
      // Could also pause the quiz, show warning, etc.
      if (type === 'tab_switch') {
        alert('⚠️ Tab switching detected. This may affect your quiz results.');
      }
    }
  });

  return (
    <SecurityProvider>
      <div className="min-h-screen bg-gray-50 security-protected">
        <DevToolsAlert />
        
        {!isSecure ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                Quiz Suspended
              </h2>
              <p className="text-gray-700 mb-4">
                Multiple security violations detected ({violations}).
              </p>
              <p className="text-gray-600 text-sm">
                Please contact your instructor if you believe this is an error.
              </p>
            </div>
          </div>
        ) : (
          <div className="container mx-auto p-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-2xl font-bold mb-4">Quiz {quizId}</h1>
              <p className="text-sm text-gray-500 mb-4">
                Security violations: {violations}
              </p>
              
              {/* Quiz content here */}
              <div className="space-y-4">
                <p>Question 1: What is 2 + 2?</p>
                {/* Quiz questions */}
              </div>
            </div>
          </div>
        )}
      </div>
    </SecurityProvider>
  );
}

// Example 6: Minimal protection (just screenshot prevention)
export function MinimalProtection({ children }: { children: React.ReactNode }) {
  useSecurity({
    enableScreenshotPrevention: true,
    enableTabSwitchDetection: false,
    enableAutomationDetection: false,
  });

  return <>{children}</>;
}

// Example 7: Mobile-only protection
export function MobileOnlyProtection({ children }: { children: React.ReactNode }) {
  const { isMobile } = useSecurity();

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <SecurityProvider>
      {children}
    </SecurityProvider>
  );
}
