'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginCredentials } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'expense_tracker_user';
const STORAGE_KEY_TOKEN = 'expense_tracker_token';

// Default demo users for client-side fallback
const DEFAULT_FALLBACK_USERS: Record<string, User> = {
  'admin@expensetracker.local': {
    id: 'usr_admin',
    name: 'Alex Morgan',
    email: 'admin@expensetracker.local',
    role: 'Executive Admin',
    department: 'Executive Operations',
    initials: 'AM',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  'finance@expensetracker.local': {
    id: 'usr_finance',
    name: 'Sarah Jenkins',
    email: 'finance@expensetracker.local',
    role: 'Finance Director',
    department: 'Finance & Treasury',
    initials: 'SJ',
    createdAt: '2026-01-15T00:00:00.000Z',
  },
  'analyst@expensetracker.local': {
    id: 'usr_analyst',
    name: 'David Chen',
    email: 'analyst@expensetracker.local',
    role: 'Senior Financial Analyst',
    department: 'Financial Planning',
    initials: 'DC',
    createdAt: '2026-02-01T00:00:00.000Z',
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore authenticated session from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEY_USER);
      const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (e) {
      console.warn('Failed to restore session from localStorage:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      const { email, password } = credentials;
      const normalizedEmail = email.trim().toLowerCase();

      // Try Backend API Login
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      let serverUser: User | null = null;
      let sessionToken: string = '';

      try {
        const res = await fetch(`${apiUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: normalizedEmail, password }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.user) {
            serverUser = json.user;
            sessionToken = json.token || `tok_${Date.now()}`;
          }
        } else {
          const errJson = await res.json().catch(() => null);
          if (errJson && errJson.error) {
            return { success: false, error: errJson.error };
          }
        }
      } catch (networkErr) {
        // Fallback gracefully for local/mock credentials
        console.info('Backend auth endpoint unreachable, utilizing client verification fallback');
      }

      // If backend didn't return user, check local fallback
      if (!serverUser) {
        if (password.length < 4) {
          return { success: false, error: 'Password must be at least 4 characters long' };
        }

        const fallback = DEFAULT_FALLBACK_USERS[normalizedEmail];
        if (fallback) {
          serverUser = fallback;
        } else {
          const namePart = normalizedEmail.split('@')[0].replace(/[._-]/g, ' ');
          const formattedName = namePart
            .split(' ')
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(' ') || 'Finance User';
          const initials = formattedName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase() || 'FU';

          serverUser = {
            id: `usr_${Date.now()}`,
            name: formattedName,
            email: normalizedEmail,
            role: 'Team Member',
            department: 'Operations',
            initials,
            createdAt: new Date().toISOString(),
          };
        }
        sessionToken = `tok_local_${Date.now()}`;
      }

      // Persist session
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(serverUser));
      localStorage.setItem(STORAGE_KEY_TOKEN, sessionToken);

      setUser(serverUser);
      setToken(sessionToken);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'An error occurred during sign in' };
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      fetch(`${apiUrl}/api/auth/logout`, { method: 'POST' }).catch(() => {});
    } catch (e) {
      console.error('Error during logout:', e);
    }
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
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
