/**
 * Security utility functions for detecting and preventing unauthorized access
 */

export interface SecurityViolation {
  type: string;
  timestamp: Date;
  userAgent: string;
  url: string;
  sessionId: string;
}

/**
 * Detect if the current environment is likely automated
 */
export function detectAutomation(): boolean {
  // Check for webdriver
  if (navigator.webdriver) {
    return true;
  }

  // Check for common automation properties
  const automationIndicators = [
    'callPhantom',
    '_phantom',
    'phantom',
    '__nightmare',
    'Buffer',
    '__selenium_unwrapped',
    '__webdriver_evaluate',
    '__driver_evaluate',
    'webdriver',
    '__webdriver_script_fn',
    '__webdriver_script_func',
    '__webdriver_script_function',
  ];

  for (const indicator of automationIndicators) {
    if ((window as any)[indicator] || (document as any)[indicator]) {
      return true;
    }
  }

  // Check for headless browser (ONLY on desktop, not mobile)
  // Mobile browsers often have 0 plugins, which causes false positives
  const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (!isMobile) {
    if (
      /HeadlessChrome/.test(navigator.userAgent) ||
      navigator.plugins.length === 0
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Detect if running on mobile device
 */
export function isMobileDevice(): boolean {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a user identifier for watermarking
 */
export function generateUserId(): string {
  return `USER-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

/**
 * Log security violation to server
 */
export async function logSecurityViolation(
  violation: Partial<SecurityViolation>
): Promise<boolean> {
  try {
    const response = await fetch('/api/security/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: violation.type,
        timestamp: violation.timestamp || new Date(),
        userAgent: violation.userAgent || navigator.userAgent,
        url: violation.url || window.location.href,
        sessionId: violation.sessionId || sessionStorage.getItem('sessionId'),
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to log security violation:', error);
    return false;
  }
}

/**
 * Check if user has exceeded violation threshold
 */
export async function checkViolationThreshold(
  userId: string,
  threshold: number = 10
): Promise<boolean> {
  try {
    const response = await fetch(`/api/security/check?userId=${userId}`);
    const data = await response.json();
    return data.violations >= threshold;
  } catch (error) {
    console.error('Failed to check violation threshold:', error);
    return false;
  }
}

/**
 * Prevent text selection on element
 */
export function preventSelection(element: HTMLElement): void {
  element.style.userSelect = 'none';
  element.style.webkitUserSelect = 'none';
  element.style.msUserSelect = 'none';
}

/**
 * Add watermark to element
 */
export function addWatermark(
  element: HTMLElement,
  text: string,
  options?: {
    opacity?: number;
    fontSize?: string;
    color?: string;
  }
): void {
  const watermark = document.createElement('div');
  watermark.textContent = text;
  watermark.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    opacity: ${options?.opacity || 0.05};
    font-size: ${options?.fontSize || '5rem'};
    color: ${options?.color || '#000'};
    pointer-events: none;
    user-select: none;
    z-index: 9999;
    white-space: nowrap;
  `;
  element.appendChild(watermark);
}

/**
 * Detect if developer tools are open
 */
export function detectDevTools(): boolean {
  const threshold = 160;
  const widthThreshold = window.outerWidth - window.innerWidth > threshold;
  const heightThreshold = window.outerHeight - window.innerHeight > threshold;
  
  return widthThreshold || heightThreshold;
}

/**
 * Monitor for screenshot attempts
 */
export function monitorScreenshots(
  callback: (type: string) => void
): () => void {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Windows: PrtScn, Alt+PrtScn, Win+Shift+S
    // Mac: Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5
    if (
      e.key === 'PrintScreen' ||
      (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) ||
      (e.key === 's' && e.metaKey && e.shiftKey) ||
      (e.key === 's' && e.ctrlKey && e.shiftKey)
    ) {
      e.preventDefault();
      callback('screenshot_attempt');
    }
  };

  document.addEventListener('keydown', handleKeyDown, true);

  return () => {
    document.removeEventListener('keydown', handleKeyDown, true);
  };
}

/**
 * Get security violation statistics
 */
export interface SecurityStats {
  totalViolations: number;
  uniqueUsers: number;
  last24Hours: number;
  byType: Record<string, number>;
}

export async function getSecurityStats(): Promise<SecurityStats | null> {
  try {
    const response = await fetch('/api/security/stats');
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch security stats:', error);
    return null;
  }
}
