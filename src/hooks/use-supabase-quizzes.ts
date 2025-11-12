'use client';

import { useMemo } from 'react';
import { useUser, useSupabaseClient, useRealtimeQuery, WithId } from '@/supabase';
import type { Quiz } from '@/lib/types';
import type { Database } from '@/supabase/types';

type QuizRow = Database['public']['Tables']['quizzes']['Row'];

function mapQuizRowToQuiz(row: QuizRow): Quiz {
  return {
    id: row.id,
    authorId: row.author_id,
    title: row.title,
    topic: row.topic,
    difficulty: row.difficulty as 'easy' | 'medium' | 'hard',
    questions: row.questions as any,
    createdAt: row.created_at,
  };
}

export function useSupabaseQuizzes() {
  const { user } = useUser();
  const supabase = useSupabaseClient();

  const queryConfig = useMemo(() => {
    if (!user) return null;
    
    return {
      table: 'quizzes' as const,
      filter: (query: any) => query.eq('author_id', user.id),
      orderBy: { column: 'created_at', ascending: false },
    };
  }, [user]);

  const { data, isLoading, error } = useRealtimeQuery<QuizRow>(queryConfig);

  const quizzes = useMemo(() => {
    if (!data) return null;
    return data.map(mapQuizRowToQuiz) as WithId<Quiz>[];
  }, [data]);

  return { quizzes, isLoading, error };
}
