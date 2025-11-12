/**
 * Beautiful console logger for security events
 * Provides styled, organized logging for better debugging
 */

type LogLevel = 'info' | 'warn' | 'error' | 'success' | 'debug';

interface LogOptions {
  level?: LogLevel;
  data?: Record<string, any>;
  emoji?: string;
}

class SecurityLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  
  private styles = {
    info: 'color: #3b82f6; font-weight: bold;',
    warn: 'color: #f59e0b; font-weight: bold;',
    error: 'color: #ef4444; font-weight: bold;',
    success: 'color: #10b981; font-weight: bold;',
    debug: 'color: #8b5cf6; font-weight: bold;',
    label: 'color: #6b7280; font-weight: normal;',
    value: 'color: #1f2937; font-weight: normal;',
  };

  private emojis = {
    info: '🔵',
    warn: '⚠️',
    error: '🔴',
    success: '✅',
    debug: '🔍',
    security: '🔒',
    mobile: '📱',
    desktop: '💻',
    violation: '🚨',
    detection: '👁️',
    blocked: '🛑',
  };

  /**
   * Log a security violation with beautiful formatting
   */
  violation(type: string, options: Omit<LogOptions, 'level'> = {}) {
    if (!this.isDevelopment) return;

    const emoji = options.emoji || this.emojis.violation;
    const timestamp = new Date().toLocaleTimeString();
    
    console.group(
      `%c${emoji} Security Violation Detected`,
      this.styles.error
    );
    
    console.log(
      `%cType: %c${type.replace(/_/g, ' ')}`,
      this.styles.label,
      this.styles.value
    );
    
    console.log(
      `%cTime: %c${timestamp}`,
      this.styles.label,
      this.styles.value
    );
    
    if (options.data) {
      console.log('%cDetails:', this.styles.label);
      console.table(options.data);
    }
    
    console.groupEnd();
  }

  /**
   * Log mobile security event
   */
  mobile(type: string, options: Omit<LogOptions, 'level'> = {}) {
    if (!this.isDevelopment) return;

    const emoji = this.emojis.mobile;
    const timestamp = new Date().toLocaleTimeString();
    
    console.group(
      `%c${emoji} Mobile Security Event`,
      this.styles.warn
    );
    
    console.log(
      `%cType: %c${type.replace(/_/g, ' ')}`,
      this.styles.label,
      this.styles.value
    );
    
    console.log(
      `%cTime: %c${timestamp}`,
      this.styles.label,
      this.styles.value
    );
    
    if (options.data) {
      console.log('%cDetails:', this.styles.label);
      console.table(options.data);
    }
    
    console.groupEnd();
  }

  /**
   * Log detection event
   */
  detection(message: string, options: LogOptions = {}) {
    if (!this.isDevelopment) return;

    const emoji = options.emoji || this.emojis.detection;
    const level = options.level || 'info';
    
    console.log(
      `%c${emoji} ${message}`,
      this.styles[level]
    );
    
    if (options.data) {
      console.table(options.data);
    }
  }

  /**
   * Log blocked action
   */
  blocked(action: string, options: Omit<LogOptions, 'level'> = {}) {
    if (!this.isDevelopment) return;

    const emoji = this.emojis.blocked;
    
    console.log(
      `%c${emoji} Blocked: %c${action}`,
      this.styles.error,
      this.styles.value
    );
    
    if (options.data) {
      console.table(options.data);
    }
  }

  /**
   * Log success event
   */
  success(message: string, data?: Record<string, any>) {
    if (!this.isDevelopment) return;

    console.log(
      `%c${this.emojis.success} ${message}`,
      this.styles.success
    );
    
    if (data) {
      console.table(data);
    }
  }

  /**
   * Log API request
   */
  api(method: string, endpoint: string, data?: Record<string, any>) {
    if (!this.isDevelopment) return;

    console.group(
      `%c🌐 API Request: ${method} ${endpoint}`,
      this.styles.info
    );
    
    if (data) {
      console.log('%cPayload:', this.styles.label);
      console.table(data);
    }
    
    console.groupEnd();
  }

  /**
   * Log initialization
   */
  init(component: string, config?: Record<string, any>) {
    if (!this.isDevelopment) return;

    console.group(
      `%c${this.emojis.security} Security System Initialized: ${component}`,
      this.styles.success
    );
    
    if (config) {
      console.log('%cConfiguration:', this.styles.label);
      console.table(config);
    }
    
    console.groupEnd();
  }

  /**
   * Log debug information
   */
  debug(message: string, data?: any) {
    if (!this.isDevelopment) return;

    console.log(
      `%c${this.emojis.debug} ${message}`,
      this.styles.debug
    );
    
    if (data) {
      console.dir(data, { depth: 3 });
    }
  }

  /**
   * Create a styled banner
   */
  banner(title: string, subtitle?: string) {
    if (!this.isDevelopment) return;

    console.log(
      `%c╔════════════════════════════════════════╗\n` +
      `║  ${title.padEnd(38)}║\n` +
      (subtitle ? `║  ${subtitle.padEnd(38)}║\n` : '') +
      `╚════════════════════════════════════════╝`,
      'color: #3b82f6; font-weight: bold; font-family: monospace;'
    );
  }
}

// Export singleton instance
export const securityLogger = new SecurityLogger();

// Export for testing
export { SecurityLogger };
