"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/lib/types';
import { useRouter } from 'next/navigation';

// Mock user for demonstration
const MOCK_ADMIN_USER: User = {
  id: 'usr_admin001',
  name: 'Admin',
  email: 'admin@quizmaster.ai',
  role: 'admin',
};

type AuthContextType = {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('quizmaster_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
      localStorage.removeItem('quizmaster_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (email: string) => {
    // In a real app, you'd call an API. Here we just mock it.
    // For this demo, any login attempt succeeds and logs in the mock admin user.
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('quizmaster_user', JSON.stringify(MOCK_ADMIN_USER));
      setUser(MOCK_ADMIN_USER);
      setLoading(false);
      router.push('/dashboard');
    }, 500);
  };

  const logout = () => {
    localStorage.removeItem('quizmaster_user');
    setUser(null);
    router.push('/auth');
  };

  const value = { user, login, logout, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
