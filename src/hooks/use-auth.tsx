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
  signInWithEmailAndPassword,
  updateProfile,
  type UserCredential
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
  signInWithGoogle: () => Promise<UserCredential | undefined>;
  signInWithEmail: (email: string, pass: string) => Promise<UserCredential | undefined>;
  signUpWithEmail: (email: string, pass: string, displayName: string) => Promise<UserCredential | undefined>;
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
    const userCredential = await signInWithPopup(auth, provider);
    router.push('/dashboard');
    return userCredential;
  }, [auth, router]);

  const signUpWithEmail = useCallback(async (email: string, password: string, displayName: string): Promise<UserCredential | undefined> => {
    if (!auth) throw new Error("Auth service not available.");
    // Do not await here to avoid the pending promise issue.
    // The onAuthStateChanged listener will handle the user state update.
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    // The router push is handled by the auth state listener in a real app,
    // or you can handle it after signup success.
    return userCredential;
  }, [auth]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!auth) throw new Error("Auth service not available.");
    // Do not await here.
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    router.push('/dashboard');
    return userCredential;
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
