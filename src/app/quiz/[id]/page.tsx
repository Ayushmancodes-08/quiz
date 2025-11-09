'use client';

import { useDoc, useFirestore, useMemoFirebase, WithId } from '@/firebase';
import { QuizTaker } from '@/components/quiz/quiz-taker';
import { notFound, useParams } from 'next/navigation';
import { doc } from 'firebase/firestore';
import type { Quiz } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useUser } from '@/firebase';

export default function QuizPage() {
  const { id: quizId } = useParams();
  const firestore = useFirestore();
  const { user } = useUser(); // We need the user to know which quizzes collection to read from

  // This is a simplification. In a real app, quizzes might be public,
  // requiring a different collection structure. For now, we assume a user can only take their own quizzes.
  const quizDocRef = useMemoFirebase(() => {
    if (!firestore || !user || !quizId) return null;
    return doc(firestore, `users/${user.uid}/quizzes/${quizId as string}`);
  }, [firestore, user, quizId]);

  const { data: quiz, isLoading } = useDoc<Quiz>(quizDocRef);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <span className="sr-only">Loading Quiz...</span>
      </div>
    );
  }

  if (!quiz) {
    return notFound();
  }

  // The quiz object from useDoc is already combined with its ID.
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <QuizTaker quiz={quiz as WithId<Quiz>} />
    </div>
  );
}
