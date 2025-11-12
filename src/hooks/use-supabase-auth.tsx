'use client';

import { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useSupabaseClient } from '@/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const { user: supabaseUser, isUserLoading } = useUser();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);

  const signUpWithEmail = useCallback(async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });
      if (error) throw error;
      
      // User profile is automatically created via database trigger
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      const redirectUrl = process.env.NEXT_PUBLIC_APP_URL 
        ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
        : `${window.location.origin}/auth/callback`;
        
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (error) throw error;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);

  return (
    <AuthContext.Provider
      value={{
        user: supabaseUser,
        loading: loading || isUserLoading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};
