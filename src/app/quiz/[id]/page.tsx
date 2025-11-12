'use client';

import { useSupabaseClient, WithId } from '@/supabase';
import { MobileQuizTaker } from '@/components/quiz/mobile-quiz-taker';
import { useParams } from 'next/navigation';
import type { Quiz } from '@/lib/types';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useEffect, useState } from 'react';
import type { Database } from '@/supabase/types';

type QuizRow = Database['public']['Tables']['quizzes']['Row'];

function mapQuizRowToQuiz(row: QuizRow): WithId<Quiz> {
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

export default function QuizPage() {
  const { id: quizId } = useParams();
  const supabase = useSupabaseClient();
  const [quiz, setQuiz] = useState<WithId<Quiz> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!quizId) return;

    const fetchQuiz = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('id', quizId as string)
          .single();

        if (fetchError) throw fetchError;
        if (data) {
          setQuiz(mapQuizRowToQuiz(data));
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, supabase]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <span className="sr-only">Loading Quiz...</span>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Quiz Not Found</AlertTitle>
          <AlertDescription>
            {error 
              ? 'Unable to load the quiz. Please check the link and try again.'
              : 'The quiz you are looking for does not exist or has been deleted.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // The quiz object from useDoc is already combined with its ID.
  return (
    <MobileQuizTaker quiz={quiz as WithId<Quiz>} />
  );
}
