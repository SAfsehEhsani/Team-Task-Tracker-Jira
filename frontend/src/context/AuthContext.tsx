'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthTokens, Role } from '@/types';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: Role) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setSession: (user: User, tokens: AuthTokens) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedAccess = localStorage.getItem('access_token');
        const storedRefresh = localStorage.getItem('refresh_token');
        const storedUser = localStorage.getItem('user_data');

        if (storedAccess && storedRefresh) {
          setTokens({
            access: storedAccess,
            refresh: storedRefresh,
            access_expires_in: 3600,
          });

          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch (e) {
              // Ignore JSON parse error
            }
          }

          // Fetch fresh user data from server
          try {
            const res = await api.get('/auth/me/');
            setUser(res.data.user);
            localStorage.setItem('user_data', JSON.stringify(res.data.user));
          } catch (err) {
            console.warn('Failed to fetch current user on init', err);
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login/', { email, password });
    const { user: loggedInUser, tokens: authTokens } = res.data;

    setUser(loggedInUser);
    setTokens(authTokens);

    localStorage.setItem('access_token', authTokens.access);
    localStorage.setItem('refresh_token', authTokens.refresh);
    localStorage.setItem('user_data', JSON.stringify(loggedInUser));

    router.push('/dashboard');
  };

  const register = async (name: string, email: string, password: string, role: Role) => {
    const res = await api.post('/auth/register/', { name, email, password, role });
    const { user: registeredUser, tokens: authTokens } = res.data;

    setUser(registeredUser);
    setTokens(authTokens);

    localStorage.setItem('access_token', authTokens.access);
    localStorage.setItem('refresh_token', authTokens.refresh);
    localStorage.setItem('user_data', JSON.stringify(registeredUser));

    router.push('/dashboard');
  };

  const logout = () => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    router.push('/login');
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me/');
      setUser(res.data.user);
      localStorage.setItem('user_data', JSON.stringify(res.data.user));
    } catch (e) {
      console.error('Failed to refresh user', e);
    }
  };

  const setSession = (newUserData: User, newTokens: AuthTokens) => {
    setUser(newUserData);
    setTokens(newTokens);
    localStorage.setItem('access_token', newTokens.access);
    localStorage.setItem('refresh_token', newTokens.refresh);
    localStorage.setItem('user_data', JSON.stringify(newUserData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        loading,
        login,
        register,
        logout,
        refreshUser,
        setSession,
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
