export interface LoginFormProps {
  onSubmit?: (email: string, password: string) => void;
  onForgotPassword?: () => void;
  onGoogleLogin?: () => void;
  onGitHubLogin?: () => void;
  onWeChatLogin?: () => void;
  onPhoneLogin?: () => void;
  onRegister?: () => void;
}

export interface RegisterFormProps {
  onSubmit?: (data: RegisterData) => void;
  onLogin?: () => void;
  onVerifyEmail?: (email: string) => Promise<boolean>;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  phone?: string;
  verificationCode?: string;
}

export interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  role: 'user' | 'admin' | 'moderator';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
  loginCount: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}

export interface LoginHistory {
  id: string;
  userId: string;
  ip: string;
  device: string;
  browser: string;
  location: string;
  loginAt: string;
  status: 'success' | 'failed';
}

export interface Device {
  id: string;
  userId: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface Theme {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  borderRadius: 'small' | 'medium' | 'large';
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface CaptchaConfig {
  enabled: boolean;
  maxAttempts: number;
  lockoutDuration: number; // minutes
  showAfterAttempts: number;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod: 'totp' | 'sms' | 'email';
  loginNotifications: boolean;
  trustedDevices: string[];
}

export interface RBACPermission {
  id: string;
  name: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
}

export interface RBACRole {
  id: string;
  name: string;
  permissions: RBACPermission[];
  userCount: number;
}

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  loginAttempts: number;
  failedAttempts: number;
  averageSessionDuration: number;
}
