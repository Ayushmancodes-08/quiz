'use client';

import { useMemo } from 'react';
import { useSupabaseClient, useRealtimeQuery, WithId } from '@/supabase';
import type { QuizAttempt } from '@/lib/types';
import type { Database } from '@/supabase/types';

type QuizAttemptRow = Database['public']['Tables']['quiz_attempts']['Row'];

function mapAttemptRowToAttempt(row: QuizAttemptRow): QuizAttempt {
  return {
    id: row.id,
    quizId: row.quiz_id,
    quizTitle: row.quiz_title,
    userId: row.user_id,
    userName: row.user_name,
    studentName: row.student_name,
    registrationNumber: row.registration_number,
    authorId: row.author_id,
    answers: row.answers as any,
    score: row.score,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    violations: row.violations,
    isFlagged: row.is_flagged,
  };
}

export function useSupabaseQuizAttempts(authorId: string | null) {
  const supabase = useSupabaseClient();

  const queryConfig = useMemo(() => {
    if (!authorId) return null;
    
    return {
      table: 'quiz_attempts' as const,
      filter: (query: any) => query.eq('author_id', authorId),
      orderBy: { column: 'completed_at', ascending: false },
    };
  }, [authorId]);

  const { data, isLoading, error } = useRealtimeQuery<QuizAttemptRow>(queryConfig);

  const attempts = useMemo(() => {
    if (!data) return null;
    return data.map(mapAttemptRowToAttempt) as WithId<QuizAttempt>[];
  }, [data]);

  return { attempts, isLoading, error };
}
