
"use client";

import { useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase, WithId } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Quiz } from '@/lib/types';

export function useUserQuizzes() {
  const { user } = useUser();
  const firestore = useFirestore();

  const quizzesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, `users/${user.uid}/quizzes`),
      orderBy('createdAt', 'desc')
    );
  }, [user, firestore]);

  const { data, isLoading, error } = useCollection<Quiz>(quizzesQuery);

  return { quizzes: data as WithId<Quiz>[] | null, isLoading, error };
}
