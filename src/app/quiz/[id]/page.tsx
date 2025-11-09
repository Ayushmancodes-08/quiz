'use client';

import { useDoc, useFirestore, useMemoFirebase, WithId } from '@/firebase';
import { QuizTaker } from '@/components/quiz/quiz-taker';
import { notFound, useParams } from 'next/navigation';
import { doc } from 'firebase/firestore';
import type { Quiz } from '@/lib/types';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function QuizPage() {
  const { id: quizId } = useParams();
  const firestore = useFirestore();

  // Load from public /quizzes collection - works for anyone with the link
  const quizDocRef = useMemoFirebase(() => {
    if (!firestore || !quizId) return null;
    return doc(firestore, `quizzes/${quizId as string}`);
  }, [firestore, quizId]);

  const { data: quiz, isLoading, error } = useDoc<Quiz>(quizDocRef);

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
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <QuizTaker quiz={quiz as WithId<Quiz>} />
    </div>
  );
}
