'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginCredentials, RegisterData } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signup: (data: RegisterData) => Promise<{ success: boolean; error?: string; message?: string }>;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'expense_tracker_user';
const STORAGE_KEY_TOKEN = 'expense_tracker_token';
const STORAGE_KEY_REGISTERED = 'expense_tracker_registered_users';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore authenticated session from localStorage on mount & setup global fetch auth
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

    // Attach global client fetch interceptor for zero-leakage user-scoped API queries
    if (typeof window !== 'undefined') {
      const originalFetch = window.fetch;
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        try {
          const urlStr =
            typeof input === 'string'
              ? input
              : input instanceof URL
              ? input.toString()
              : (input as any)?.url || '';

          if (
            urlStr.includes('/api/') &&
            !urlStr.includes('/api/auth/login') &&
            !urlStr.includes('/api/auth/signup')
          ) {
            const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
            const storedUser = localStorage.getItem(STORAGE_KEY_USER);
            let userId = '';
            if (storedUser) {
              try {
                userId = JSON.parse(storedUser)?.id || '';
              } catch {}
            }

            const existingHeaders = init?.headers ? new Headers(init.headers) : new Headers();
            if (storedToken && !existingHeaders.has('Authorization')) {
              existingHeaders.set('Authorization', `Bearer ${storedToken}`);
            }
            if (userId && !existingHeaders.has('x-user-id')) {
              existingHeaders.set('x-user-id', userId);
            }

            return originalFetch(input, {
              ...init,
              headers: existingHeaders,
            });
          }
        } catch (e) {
          // fallback safely
        }
        return originalFetch(input, init);
      };

      return () => {
        window.fetch = originalFetch;
      };
    }
  }, []);

  // 1. User Sign Up (Account & Profile Creation)
  const signup = async (data: RegisterData): Promise<{ success: boolean; error?: string; message?: string }> => {
    try {
      const { name, email, password } = data;
      const normalizedEmail = email.trim().toLowerCase();

      if (!name.trim()) return { success: false, error: 'Name is required' };
      if (!normalizedEmail) return { success: false, error: 'Email address is required' };
      if (!password || password.length < 4) {
        return { success: false, error: 'Password must be at least 4 characters long' };
      }

      const apiBase = process.env.NEXT_PUBLIC_API_URL || '';

      try {
        const res = await fetch(`${apiBase}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: normalizedEmail,
            password,
          }),
        });

        const json = await res.json().catch(() => null);

        if (res.ok && json?.success) {
          return {
            success: true,
            message: json.message || 'Account created successfully! Please log in.',
          };
        } else if (json && json.error) {
          return { success: false, error: json.error };
        }
      } catch (networkErr) {
        console.info('Backend registration endpoint offline, using local client registry');
      }

      // Local fallback registry
      const registeredStr = localStorage.getItem(STORAGE_KEY_REGISTERED);
      const registeredList: any[] = registeredStr ? JSON.parse(registeredStr) : [];

      if (registeredList.some((u) => u.email.toLowerCase() === normalizedEmail)) {
        return { success: false, error: 'An account with this email already exists. Please log in.' };
      }

      const initials = name
        .trim()
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'U';

      const newUser = {
        id: `usr_${Date.now()}`,
        name: name.trim(),
        email: normalizedEmail,
        password,
        initials,
        createdAt: new Date().toISOString(),
      };

      registeredList.push(newUser);
      localStorage.setItem(STORAGE_KEY_REGISTERED, JSON.stringify(registeredList));

      return {
        success: true,
        message: 'Account created successfully! Please log in.',
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to create account.' };
    }
  };

  // 2. User Log In (Enter Dashboard)
  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      const { email, password } = credentials;
      const normalizedEmail = email.trim().toLowerCase();

      const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
      let serverUser: User | null = null;
      let sessionToken: string = '';

      try {
        const res = await fetch(`${apiBase}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: normalizedEmail, password }),
        });

        const json = await res.json().catch(() => null);

        if (res.ok && json?.success && json.user) {
          serverUser = json.user;
          sessionToken = json.token || `tok_${Date.now()}`;
        } else if (json && json.error) {
          return { success: false, error: json.error };
        }
      } catch (networkErr) {
        console.info('Backend auth endpoint unreachable, utilizing client verification fallback');
      }

      // Fallback verification
      if (!serverUser) {
        const registeredStr = localStorage.getItem(STORAGE_KEY_REGISTERED);
        const registeredList: any[] = registeredStr ? JSON.parse(registeredStr) : [];
        const localMatched = registeredList.find((u) => u.email.toLowerCase() === normalizedEmail);

        if (localMatched) {
          if (localMatched.password !== password) {
            return { success: false, error: 'Invalid password. Please try again.' };
          }
          serverUser = {
            id: localMatched.id,
            name: localMatched.name,
            email: localMatched.email,
            initials: localMatched.initials,
            createdAt: localMatched.createdAt,
          };
          sessionToken = `tok_local_${Date.now()}`;
        } else {
          return { success: false, error: 'No account found with this email. Please sign up first.' };
        }
      }

      // Save user session
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(serverUser));
      localStorage.setItem(STORAGE_KEY_TOKEN, sessionToken);

      setUser(serverUser);
      setToken(sessionToken);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'An error occurred during log in' };
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
      fetch(`${apiBase}/api/auth/logout`, { method: 'POST' }).catch(() => {});
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
        signup,
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
