import { useState, useEffect } from 'react';
import { AuthState, User } from '../types';

const STORAGE_KEY = '***';
const TOKEN_KEY = '***';
const REFRESH_TOKEN_KEY = '***';

const defaultAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  refreshToken: null,
  expiresAt: null,
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        localStorage.removeItem(STORAGE_KEY);
        return defaultAuthState;
      }
      return parsed;
    }
    return defaultAuthState;
  });

  useEffect(() => {
    if (authState.isAuthenticated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [authState]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // TODO: 替换为实际 API 调用
      const mockUser: User = {
        id: '1',
        email,
        username: email.split('@')[0],
        name: '用户',
        role: 'user',
        isEmailVerified: true,
        isPhoneVerified: false,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        loginCount: 1,
      };

      const token = 'mock_token_' + Math.random().toString(36).substring(2);
      const refreshToken = 'mock_refresh_' + Math.random().toString(36).substring(2);
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

      setAuthState({
        isAuthenticated: true,
        user: mockUser,
        token,
        refreshToken,
        expiresAt,
      });

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    username: string;
    phone?: string;
  }): Promise<boolean> => {
    try {
      // TODO: 替换为实际 API 调用
      const mockUser: User = {
        id: '1',
        email: userData.email,
        username: userData.username,
        name: userData.username,
        phone: userData.phone,
        role: 'user',
        isEmailVerified: false,
        isPhoneVerified: false,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        loginCount: 0,
      };

      setAuthState({
        isAuthenticated: true,
        user: mockUser,
        token: 'mock_token_' + Math.random().toString(36).substring(2),
        refreshToken: 'mock_refresh_' + Math.random().toString(36).substring(2),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      });

      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = () => {
    setAuthState(defaultAuthState);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  };

  const updateUser = (updates: Partial<User>) => {
    setAuthState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...updates } : null,
    }));
  };

  const isTokenValid = (): boolean => {
    if (!authState.expiresAt) return false;
    return Date.now() < authState.expiresAt;
  };

  return {
    ...authState,
    login,
    register,
    logout,
    updateUser,
    isTokenValid,
  };
};
