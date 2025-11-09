"use client";

import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  useUser, 
  useFirebase 
} from '@/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';

// Define a user type that can be used in the app, separate from Firebase's
export type AppUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
};

type AuthContextType = {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Helper to format Firebase user to app user
const formatUser = (user: FirebaseUser): AppUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: firebaseUser, isUserLoading } = useUser();
  const { auth } = useFirebase();
  const router = useRouter();

  const appUser = firebaseUser ? formatUser(firebaseUser) : null;
  
  const signInWithGoogle = useCallback(async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    router.push('/dashboard');
  }, [auth, router]);

  const signUpWithEmail = useCallback(async (email: string, password: string): Promise<void> => {
    if (!auth) throw new Error("Auth service not available.");
    await createUserWithEmailAndPassword(auth, email, password);
  }, [auth]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!auth) throw new Error("Auth service not available.");
    await signInWithEmailAndPassword(auth, email, password);
    router.push('/dashboard');
  }, [auth, router]);

  const logout = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/auth');
  }, [auth, router]);

  const value = {
    user: appUser,
    loading: isUserLoading,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
