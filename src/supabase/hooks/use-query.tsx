'use client';

import { useState, useEffect } from 'react';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { errorEmitter } from '../error-emitter';
import { SupabasePermissionError } from '../errors';
import type { Database } from '../types';

export type WithId<T> = T & { id: string };

export interface UseQueryResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: Error | null;
}

// Use a looser type to avoid strict generic mismatches during build
type QueryBuilder = any;

export function useQuery<T = any>(
  memoizedQuery: (QueryBuilder & { __memo?: boolean }) | null | undefined
): UseQueryResult<T> {
  const [data, setData] = useState<WithId<T>[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!memoizedQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Execute the query
    memoizedQuery
      .then(
        ({ data: queryData, error: queryError }: any) => {
          if (queryError) {
            const contextualError = new SupabasePermissionError({
              operation: 'select',
              table: 'unknown',
            });
            setError(contextualError);
            setData(null);
            errorEmitter.emit('permission-error', contextualError);
          } else {
            setData((queryData as WithId<T>[]) || []);
            setError(null);
          }
          setIsLoading(false);
        },
        (err: any) => {
          setError(err);
          setData(null);
          setIsLoading(false);
        }
      );
  }, [memoizedQuery]);

  if (memoizedQuery && !memoizedQuery.__memo) {
    throw new Error('Query was not properly memoized using useMemoSupabase');
  }

  return { data, isLoading, error };
}
