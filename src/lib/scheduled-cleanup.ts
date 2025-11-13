/**
 * Scheduled cleanup job for automated maintenance
 * This can be triggered by a cron job or scheduled task
 */

import { performCompleteCleanup, CleanupConfig } from './cleanup-utils';

export interface ScheduledCleanupConfig extends CleanupConfig {
  schedule: string; // cron expression
  notifyOnCompletion: boolean;
  notificationEmail?: string;
}

/**
 * Run scheduled cleanup with default configuration
 */
export async function runScheduledCleanup(
  config?: Partial<ScheduledCleanupConfig>
): Promise<void> {
  const defaultConfig: ScheduledCleanupConfig = {
    abandonedAttemptGracePeriodHours: 24,
    violationRetentionDays: 90,
    archivedDataRetentionDays: 365,
    enableAutoCleanup: true,
    schedule: '0 2 * * *', // Daily at 2 AM
    notifyOnCompletion: false
  };
  
  const finalConfig = { ...defaultConfig, ...config };
  
  if (!finalConfig.enableAutoCleanup) {
    console.log('Automated cleanup is disabled');
    return;
  }
  
  console.log('Starting scheduled cleanup...', new Date().toISOString());
  
  try {
    const result = await performCompleteCleanup({
      abandonedAttemptGracePeriodHours: finalConfig.abandonedAttemptGracePeriodHours,
      violationRetentionDays: finalConfig.violationRetentionDays,
      archivedDataRetentionDays: finalConfig.archivedDataRetentionDays,
      enableAutoCleanup: finalConfig.enableAutoCleanup
    });
    
    console.log('Cleanup completed successfully:', {
      abandonedAttempts: result.abandonedAttempts,
      orphanedRecords: result.orphanedRecords,
      archivedViolations: result.archivedViolations,
      deletedViolations: result.deletedViolations,
      timestamp: result.timestamp
    });
    
    if (finalConfig.notifyOnCompletion && finalConfig.notificationEmail) {
      await sendCleanupNotification(finalConfig.notificationEmail, result);
    }
    
  } catch (error) {
    console.error('Scheduled cleanup failed:', error);
    
    if (finalConfig.notifyOnCompletion && finalConfig.notificationEmail) {
      await sendCleanupErrorNotification(finalConfig.notificationEmail, error);
    }
    
    throw error;
  }
}

/**
 * Send cleanup completion notification
 */
async function sendCleanupNotification(
  email: string,
  result: any
): Promise<void> {
  // TODO: Implement email notification
  // This could use SendGrid, AWS SES, or another email service
  console.log(`Would send notification to ${email}:`, result);
}

/**
 * Send cleanup error notification
 */
async function sendCleanupErrorNotification(
  email: string,
  error: any
): Promise<void> {
  // TODO: Implement error notification
  console.error(`Would send error notification to ${email}:`, error);
}

/**
 * Example usage with node-cron (if installed)
 * 
 * import cron from 'node-cron';
 * 
 * // Run cleanup daily at 2 AM
 * cron.schedule('0 2 * * *', async () => {
 *   await runScheduledCleanup();
 * });
 */
