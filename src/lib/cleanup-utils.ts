/**
 * Cleanup utilities for quiz attempts and maintenance operations
 */

import { createClient } from '@/supabase/server';

export interface CleanupConfig {
  abandonedAttemptGracePeriodHours: number;
  violationRetentionDays: number;
  archivedDataRetentionDays: number;
  enableAutoCleanup: boolean;
}

export interface CleanupResult {
  abandonedAttempts: number;
  orphanedRecords: number;
  archivedViolations: number;
  deletedViolations: number;
  timestamp: Date;
}

export interface AbandonedAttempt {
  attemptId: string;
  userId: string;
  quizId: string;
  startedAt: Date;
}

/**
 * Find abandoned quiz attempts (started but not submitted after grace period)
 */
export async function findAbandonedAttempts(
  gracePeriodHours: number = 24
): Promise<AbandonedAttempt[]> {
  const supabase: any = await createClient();

  const gracePeriodMs = gracePeriodHours * 60 * 60 * 1000;
  const cutoffTime = new Date(Date.now() - gracePeriodMs).toISOString();

  const { data, error } = await supabase
    .from('quiz_attempts' as any)
    .select('id, user_id, quiz_id, started_at')
    .is('completed_at', null)
    .lt('started_at', cutoffTime);

  if (error) {
    console.error('Error finding abandoned attempts:', error);
    throw error;
  }

  return (data || []).map((attempt: any) => ({
    attemptId: attempt.id,
    userId: attempt.user_id,
    quizId: attempt.quiz_id,
    startedAt: new Date(attempt.started_at)
  }));
}

/**
 * Mark abandoned attempts as incomplete and timed out
 */
export async function markAbandonedAttemptsAsIncomplete(
  attemptIds: string[]
): Promise<number> {
  if (attemptIds.length === 0) return 0;

  const supabase: any = await createClient();

  const { error, count } = await supabase
    .from('quiz_attempts' as any)
    .update({
      completed_at: new Date().toISOString(),
      score: 0,
      is_flagged: true,
      violations: 999 // Mark as abandoned
    } as any)
    .in('id', attemptIds);

  if (error) {
    console.error('Error marking attempts as incomplete:', error);
    throw error;
  }

  return count || 0;
}

/**
 * Clean up abandoned quiz attempts
 */
export async function cleanupAbandonedAttempts(
  gracePeriodHours: number = 24,
  dryRun: boolean = false
): Promise<{ attemptsCleaned: number; details: AbandonedAttempt[] }> {
  const abandonedAttempts = await findAbandonedAttempts(gracePeriodHours);

  if (dryRun) {
    return {
      attemptsCleaned: abandonedAttempts.length,
      details: abandonedAttempts
    };
  }

  const attemptIds = abandonedAttempts.map(a => a.attemptId);
  const cleaned = await markAbandonedAttemptsAsIncomplete(attemptIds);

  return {
    attemptsCleaned: cleaned,
    details: abandonedAttempts
  };
}

/**
 * Find orphaned shuffled_questions records
 */
export async function findOrphanedShuffledQuestions(): Promise<string[]> {
  const supabase: any = await createClient();

  const { data, error } = await supabase.rpc('find_orphaned_shuffled_questions');

  if (error) {
    console.error('Error finding orphaned shuffled questions:', error);
    throw error;
  }

  return data || [];
}

/**
 * Find orphaned student_answers records
 */
export async function findOrphanedStudentAnswers(): Promise<string[]> {
  const supabase: any = await createClient();

  const { data, error } = await supabase.rpc('find_orphaned_student_answers');

  if (error) {
    console.error('Error finding orphaned student answers:', error);
    throw error;
  }

  return data || [];
}

/**
 * Delete orphaned records
 */
export async function deleteOrphanedRecords(): Promise<{
  shuffledQuestionsDeleted: number;
  studentAnswersDeleted: number;
}> {
  const supabase: any = await createClient();

  // Delete orphaned shuffled_questions
  const { count: shuffledCount, error: shuffledError } = await supabase
    .rpc('delete_orphaned_shuffled_questions');

  if (shuffledError) {
    console.error('Error deleting orphaned shuffled questions:', shuffledError);
  }

  // Delete orphaned student_answers
  const { count: answersCount, error: answersError } = await supabase
    .rpc('delete_orphaned_student_answers');

  if (answersError) {
    console.error('Error deleting orphaned student answers:', answersError);
  }

  return {
    shuffledQuestionsDeleted: shuffledCount || 0,
    studentAnswersDeleted: answersCount || 0
  };
}

/**
 * Archive old security violations
 */
export async function archiveOldViolations(
  retentionDays: number = 90
): Promise<number> {
  const supabase: any = await createClient();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const { count, error } = await supabase
    .rpc('archive_old_violations', {
      cutoff_date: cutoffDate.toISOString()
    });

  if (error) {
    console.error('Error archiving violations:', error);
    throw error;
  }

  return count || 0;
}

/**
 * Delete archived violations older than extended retention period
 */
export async function deleteArchivedViolations(
  extendedRetentionDays: number = 365
): Promise<number> {
  const supabase: any = await createClient();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - extendedRetentionDays);

  const { count, error } = await supabase
    .from('security_violations_archive' as any)
    .delete()
    .lt('timestamp', cutoffDate.toISOString());

  if (error) {
    console.error('Error deleting archived violations:', error);
    throw error;
  }

  return count || 0;
}

/**
 * Perform complete cleanup operation
 */
export async function performCompleteCleanup(
  config: Partial<CleanupConfig> = {}
): Promise<CleanupResult> {
  const defaultConfig: CleanupConfig = {
    abandonedAttemptGracePeriodHours: 24,
    violationRetentionDays: 90,
    archivedDataRetentionDays: 365,
    enableAutoCleanup: true
  };

  const finalConfig = { ...defaultConfig, ...config };

  // Clean up abandoned attempts
  const { attemptsCleaned } = await cleanupAbandonedAttempts(
    finalConfig.abandonedAttemptGracePeriodHours
  );

  // Delete orphaned records
  const { shuffledQuestionsDeleted, studentAnswersDeleted } =
    await deleteOrphanedRecords();

  // Archive old violations
  const archivedViolations = await archiveOldViolations(
    finalConfig.violationRetentionDays
  );

  // Delete very old archived violations
  const deletedViolations = await deleteArchivedViolations(
    finalConfig.archivedDataRetentionDays
  );

  return {
    abandonedAttempts: attemptsCleaned,
    orphanedRecords: shuffledQuestionsDeleted + studentAnswersDeleted,
    archivedViolations,
    deletedViolations,
    timestamp: new Date()
  };
}

/**
 * Get cleanup statistics without performing cleanup
 */
export async function getCleanupStatistics(
  gracePeriodHours: number = 24
): Promise<{
  abandonedAttempts: number;
  orphanedShuffledQuestions: number;
  orphanedStudentAnswers: number;
}> {
  const abandonedAttempts = await findAbandonedAttempts(gracePeriodHours);
  const orphanedShuffled = await findOrphanedShuffledQuestions();
  const orphanedAnswers = await findOrphanedStudentAnswers();

  return {
    abandonedAttempts: abandonedAttempts.length,
    orphanedShuffledQuestions: orphanedShuffled.length,
    orphanedStudentAnswers: orphanedAnswers.length
  };
}
