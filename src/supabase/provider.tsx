'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect, DependencyList } from 'react';
import { SupabaseClient, User, AuthError } from '@supabase/supabase-js';
import { getSupabaseClient } from './client';
import type { Database } from './types';

interface SupabaseProviderProps {
  children: ReactNode;
}

interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: AuthError | Error | null;
}

export interface SupabaseContextState {
  supabase: SupabaseClient<Database> | null;
  user: User | null;
  isUserLoading: boolean;
  userError: AuthError | Error | null;
}

export interface SupabaseServicesAndUser {
  supabase: SupabaseClient<Database>;
  user: User | null;
  isUserLoading: boolean;
  userError: AuthError | Error | null;
}

export interface UserHookResult {
  user: User | null;
  isUserLoading: boolean;
  userError: AuthError | Error | null;
}

export const SupabaseContext = createContext<SupabaseContextState | undefined>(undefined);

export const SupabaseProvider: React.FC<SupabaseProviderProps> = ({ children }) => {
  const supabase = useMemo(() => getSupabaseClient(), []);
  
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true,
    userError: null,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('SupabaseProvider: getSession error:', error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
      } else {
        setUserAuthState({ user: session?.user ?? null, isUserLoading: false, userError: null });
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserAuthState({ user: session?.user ?? null, isUserLoading: false, userError: null });
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const contextValue = useMemo((): SupabaseContextState => {
    return {
      supabase,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
    };
  }, [supabase, userAuthState]);

  return (
    <SupabaseContext.Provider value={contextValue}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = (): SupabaseServicesAndUser => {
  const context = useContext(SupabaseContext);

  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider.');
  }

  if (!context.supabase) {
    throw new Error('Supabase client not available. Check SupabaseProvider.');
  }

  return {
    supabase: context.supabase,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
};

export const useSupabaseClient = (): SupabaseClient<Database> => {
  const { supabase } = useSupabase();
  return supabase;
};

export const useUser = (): UserHookResult => {
  const { user, isUserLoading, userError } = useSupabase();
  return { user, isUserLoading, userError };
};

type MemoSupabase<T> = T & { __memo?: boolean };

export function useMemoSupabase<T>(factory: () => T, deps: DependencyList): T | MemoSupabase<T> {
  const memoized = useMemo(factory, deps);

  if (typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoSupabase<T>).__memo = true;

  return memoized;
}
