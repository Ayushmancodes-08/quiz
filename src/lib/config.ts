/**
 * Application configuration
 * Centralized config for easy customization
 */

export const config = {
  // Admin contact information
  admin: {
    email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com',
    supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@example.com',
  },

  // Security settings
  security: {
    violationThreshold: 3,
    redirectUrl: '/security-violation',
    enableLogging: true,
  },

  // Application URLs
  urls: {
    dashboard: '/dashboard',
    support: '/support',
    adminLogs: '/admin/security-logs',
  },
} as const;
