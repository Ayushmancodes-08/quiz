'use client';

import { useFirestore, useCollection, useMemoFirebase, WithId } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import type { QuizAttempt } from '@/lib/types';

export function useFirebaseQuizAttempts(authorId: string | null) {
  const firestore = useFirestore();

  const attemptsQuery = useMemoFirebase(() => {
    if (!authorId || !firestore) return null;
    return query(
      collection(firestore, 'quiz_attempts'),
      where('authorId', '==', authorId),
      orderBy('completedAt', 'desc'),
      limit(500)
    );
  }, [authorId, firestore]);

  const { data, isLoading, error } = useCollection<QuizAttempt>(attemptsQuery);

  return { 
    attempts: data as WithId<QuizAttempt>[] | null, 
    isLoading, 
    error 
  };
}

