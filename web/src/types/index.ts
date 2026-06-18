export interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
  avatar?: string;
  role: string;
  isEmailVerified: boolean;
  loginCount: number;
  lastLoginAt?: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  name?: string;
  verificationCode?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Message {
  id: string;
  type: 'SYSTEM' | 'SECURITY' | 'ACTIVITY' | 'PROMOTION';
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  actionText?: string;
}

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  userProgress?: {
    progress: number;
    completed: boolean;
    completedAt: string | null;
  };
}

export interface LoginHistory {
  id: string;
  ipAddress: string;
  deviceType: string;
  browser: string;
  location?: string;
  createdAt: string;
}

export interface DeviceInfo {
  id: string;
  name: string;
  type: string;
  browser: string;
  os: string;
  lastActive: string;
  isCurrent: boolean;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'zh' | 'en';
