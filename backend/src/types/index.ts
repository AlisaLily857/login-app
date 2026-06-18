export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
  avatar?: string;
  role: string;
  isEmailVerified: boolean;
  loginCount: number;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  name?: string;
}

export interface Message {
  id: string;
  type: 'SYSTEM' | 'SECURITY' | 'ACTIVITY' | 'PROMOTION';
  title: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
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
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  progress: number;
  completed: boolean;
  completedAt?: Date;
}

export interface LoginHistory {
  id: string;
  userId: string;
  ipAddress: string;
  deviceType: string;
  browser: string;
  location?: string;
  createdAt: Date;
}

export interface Device {
  id: string;
  userId: string;
  name: string;
  type: string;
  browser: string;
  os: string;
  lastActive: Date;
  isCurrent: boolean;
}
