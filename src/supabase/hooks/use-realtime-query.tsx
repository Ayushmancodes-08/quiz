'use client';

import { useState, useEffect } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useSupabaseClient } from '../provider';
import type { Database } from '../types';

export type WithId<T> = T & { id: string };

export interface UseRealtimeQueryResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: Error | null;
}

interface RealtimeQueryConfig<T> {
  table: keyof Database['public']['Tables'];
  filter?: (query: any) => any;
  orderBy?: { column: string; ascending?: boolean };
}

export function useRealtimeQuery<T = any>(
  config: RealtimeQueryConfig<T> | null
): UseRealtimeQueryResult<T> {
  const supabase = useSupabaseClient();
  const [data, setData] = useState<WithId<T>[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!config) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    let channel: RealtimeChannel;

    const fetchData = async () => {
      try {
        let query = supabase.from(config.table as string).select('*');

        if (config.filter) {
          query = config.filter(query);
        }

        if (config.orderBy) {
          query = query.order(config.orderBy.column, {
            ascending: config.orderBy.ascending ?? true,
          });
        }

        const { data: queryData, error: queryError } = await query;

        if (queryError) {
          setError(queryError);
          setData(null);
        } else {
          setData((queryData as WithId<T>[]) || []);
          setError(null);
        }
        setIsLoading(false);
      } catch (err) {
        setError(err as Error);
        setData(null);
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up realtime subscription
    channel = supabase
      .channel(`${config.table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: config.table as string,
        },
        () => {
          // Refetch data on any change
          fetchData();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [config, supabase]);

  return { data, isLoading, error };
}
