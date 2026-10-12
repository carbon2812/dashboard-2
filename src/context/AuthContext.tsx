'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginCredentials, RegisterData } from '@/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  demoUsers: User[];
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchUser: (user: User) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fallback initial demo user if clean boot
const DEFAULT_FALLBACK_USER: User = {
  id: 'user_julian',
  name: 'Julian Sterling',
  email: 'julian@nova.fin',
  role: 'Finance Director',
  department: 'Corporate Finance & Treasury',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  initials: 'JS',
  createdAt: '2026-01-10T08:00:00.000Z',
  lastLogin: '2026-05-18T10:00:00.000Z',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const router = useRouter();

  // Load available demo users
  const fetchDemoUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/demo-users');
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setDemoUsers(data.users);
      }
    } catch (err) {
      console.warn('Failed to fetch demo users list:', err);
    }
  }, []);

  // Initialize session from server / localStorage
  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('nova_user', JSON.stringify(data.user));
        return;
      }
    } catch {
      // ignore network errors on init
    }

    // Local storage fallback
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nova_user');
      const savedToken = localStorage.getItem('nova_token');
      if (saved) {
        try {
          setUser(JSON.parse(saved));
          setToken(savedToken);
        } catch {
          setUser(DEFAULT_FALLBACK_USER);
        }
      } else {
        // Set default session for seamless first run
        setUser(DEFAULT_FALLBACK_USER);
        localStorage.setItem('nova_user', JSON.stringify(DEFAULT_FALLBACK_USER));
      }
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([refreshSession(), fetchDemoUsers()]);
      setIsLoading(false);
    };
    init();
  }, [refreshSession, fetchDemoUsers]);

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setIsLoading(false);
        return { success: false, error: data.error || 'Login failed' };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('nova_user', JSON.stringify(data.user));
      localStorage.setItem('nova_token', data.token);

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'An unexpected error occurred during login' };
    }
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (!res.ok || !resData.success) {
        setIsLoading(false);
        return { success: false, error: resData.error || 'Registration failed' };
      }

      setUser(resData.user);
      setToken(resData.token);
      localStorage.setItem('nova_user', JSON.stringify(resData.user));
      localStorage.setItem('nova_token', resData.token);

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'An unexpected error occurred during registration' };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('nova_user');
    localStorage.removeItem('nova_token');
    router.push('/login');
  };

  const switchUser = async (targetUser: User): Promise<void> => {
    setUser(targetUser);
    localStorage.setItem('nova_user', JSON.stringify(targetUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(user),
        demoUsers,
        login,
        register,
        logout,
        switchUser,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
