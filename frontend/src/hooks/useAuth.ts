'use client';

import { useState, useEffect } from 'react';
import { authApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  full_name?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sync token to cookie for middleware
    const token = authApi.getToken();
    if (token) {
      authApi.syncTokenToCookie(token);
    }
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (authApi.isAuthenticated()) {
        const result = await authApi.getProfile();
        if (result.user && !result.error) {
          setUser(result.user);
        } else {
          authApi.signOut();
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      authApi.signOut();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    authApi.signOut();
    setUser(null);
    window.location.href = '/';
  };

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
    checkAuthStatus
  };
}