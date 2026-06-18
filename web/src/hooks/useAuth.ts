import { useState, useEffect, useCallback } from 'react';
import { authApi, userApi, clearToken } from '../utils/api';
import { User, AuthState } from '@shared/types';

const STORAGE_KEY = '***';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    refreshToken: null,
    expiresAt: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // 初始化时检查本地存储
  useEffect(() => {
    const initAuth = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
          setAuthState(parsed);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  // 持久化存储
  useEffect(() => {
    if (authState.isAuthenticated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [authState]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login({ email, password });
      
      const newState: AuthState = {
        isAuthenticated: true,
        user: response.user,
        token: response.tokens.accessToken,
        refreshToken: response.tokens.refreshToken,
        expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
      };

      setAuthState(newState);
      localStorage.setItem('access_token', response.tokens.accessToken);
      localStorage.setItem('refresh_token', response.tokens.refreshToken);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    username: string;
    phone?: string;
  }): Promise<boolean> => {
    try {
      const response = await authApi.register(data);
      
      const newState: AuthState = {
        isAuthenticated: true,
        user: response.user,
        token: response.tokens.accessToken,
        refreshToken: response.tokens.refreshToken,
        expiresAt: Date.now() + 15 * 60 * 1000,
      };

      setAuthState(newState);
      localStorage.setItem('access_token', response.tokens.accessToken);
      localStorage.setItem('refresh_token', response.tokens.refreshToken);
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearToken();
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        refreshToken: null,
        expiresAt: null,
      });
    }
  };

  const updateUser = (updates: Partial<User>) => {
    setAuthState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...updates } : null,
    }));
  };

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await authApi.getCurrentUser();
      setAuthState(prev => ({
        ...prev,
        user: response.user,
      }));
    } catch (error) {
      console.error('Fetch user failed:', error);
    }
  }, []);

  return {
    ...authState,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    fetchCurrentUser,
  };
};