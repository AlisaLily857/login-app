import { useState, useEffect } from 'react';
import { PasswordStrength } from '../types';

export const usePasswordStrength = (password: string): PasswordStrength => {
  const [strength, setStrength] = useState<PasswordStrength>({
    score: 0,
    label: '',
    color: '#e0e0e0'
  });

  useEffect(() => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    const strengthMap: Record<number, { label: string; color: string }> = {
      0: { label: '请输入密码', color: '#e0e0e0' },
      1: { label: '弱', color: '#e74c3c' },
      2: { label: '中等', color: '#f39c12' },
      3: { label: '强', color: '#3498db' },
      4: { label: '非常强', color: '#27ae60' },
    };

    setStrength({ score, ...strengthMap[score] });
  }, [password]);

  return strength;
};

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const login = async (email: string, password: string) => {
    // TODO: 实现实际登录逻辑
    console.log('登录:', email, password);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return { isAuthenticated, user, login, logout };
};
