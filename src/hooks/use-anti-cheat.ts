"use client";

import { useEffect, useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

type UseAntiCheatProps = {
  enabled: boolean;
  onViolation: (reason: string) => void;
  maxViolations?: number;
};

export function useAntiCheat({ enabled, onViolation, maxViolations = 3 }: UseAntiCheatProps) {
  const { toast } = useToast();
  const [violationCount, setViolationCount] = useState(0);

  const triggerViolation = useCallback((reason: string, details: string) => {
    const newCount = violationCount + 1;
    setViolationCount(newCount);
    
    toast({
      variant: 'destructive',
      title: `Violation Detected: ${reason}`,
      description: `${details} (${newCount}/${maxViolations} violations).`,
    });

    if (newCount >= maxViolations) {
      onViolation(`Exceeded maximum violations (${maxViolations}).`);
    }
  }, [violationCount, onViolation, maxViolations, toast]);

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'hidden') {
      triggerViolation('Tab Switched', 'You must stay on the quiz tab.');
    }
  }, [triggerViolation]);
  
  const handleFullscreenChange = useCallback(() => {
    if (!document.fullscreenElement) {
        // This can be triggered by user exiting or by violation auto-submit.
        // We only trigger a violation if the quiz is still active.
        if (enabled) {
            triggerViolation('Exited Fullscreen', 'You must remain in fullscreen mode.');
            // try to re-enter fullscreen
            document.documentElement.requestFullscreen().catch(() => {
                onViolation('Failed to re-enter fullscreen.');
            });
        }
    }
  }, [triggerViolation, onViolation, enabled]);

  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();
    triggerViolation('Right-Click', 'Right-clicking is disabled during the quiz.');
  }, [triggerViolation]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Block print screen, cmd+shift+3/4/5, etc.
    if (e.key === 'PrintScreen' || (e.metaKey && e.shiftKey)) {
      e.preventDefault();
      triggerViolation('Screenshot Attempt', 'Screenshots are disabled.');
    }
  }, [triggerViolation]);

  useEffect(() => {
    if (enabled) {
      // Enter fullscreen
      document.documentElement.requestFullscreen().catch(err => {
        console.warn(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
        onViolation("Could not enter fullscreen. Please enable it in your browser settings.");
      });

      // Add event listeners
      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('contextmenu', handleContextMenu);
      window.addEventListener('keydown', handleKeyDown);
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      
      // Disable text selection
      document.body.style.userSelect = 'none';

      // Cleanup
      return () => {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('contextmenu', handleContextMenu);
        window.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.body.style.userSelect = 'auto';
      };
    }
  }, [enabled, handleVisibilityChange, handleContextMenu, handleKeyDown, handleFullscreenChange, onViolation]);

  return { violationCount };
}
