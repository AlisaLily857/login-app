export interface LoginFormProps {
  onSubmit?: (email: string, password: string) => void;
  onForgotPassword?: () => void;
  onGoogleLogin?: () => void;
}

export interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}
