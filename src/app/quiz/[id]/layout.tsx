'use client';

import { SecurityProvider } from '@/components/security';

// Quiz-specific layout without header for distraction-free experience
export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SecurityProvider redirectOnViolation="/security-violation">
      <div className="min-h-screen bg-background">
        {children}
      </div>
    </SecurityProvider>
  );
}
