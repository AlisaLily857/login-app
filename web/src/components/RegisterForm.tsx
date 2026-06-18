import React, { useState, useEffect } from 'react';
import { RegisterFormProps, RegisterData } from '@shared/types';
import './RegisterForm.css';

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, onLogin, onVerifyEmail }) => {
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    phone: '',
    verificationCode: '',
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RegisterData, string>> = {};
    
    if (!formData.username || formData.username.length < 3) {
      newErrors.username = '用户名至少需要3个字符';
    }
    
    if (!formData.email) {
      newErrors.email = '请输入邮箱地址';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }
    
    if (!formData.password) {
      newErrors.password = '请输入密码';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少需要6个字符';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }
    
    if (formData.phone && !/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '请输入有效的手机号';
    }
    
    if (!formData.verificationCode) {
      newErrors.verificationCode = '请输入验证码';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendCode = async () => {
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors(prev => ({ ...prev, email: '请输入有效的邮箱地址' }));
      return;
    }
    
    setIsVerifying(true);
    try {
      const success = await onVerifyEmail?.(formData.email);
      if (success) {
        setCountdown(60);
      }
    } catch (error) {
      console.error('发送验证码失败:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await onSubmit?.(formData);
    } catch (error) {
      console.error('注册失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof RegisterData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="register-form-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2 className="register-title">创建账号</h2>
        
        <div className="form-group">
          <label htmlFor="username" className="form-label">用户名</label>
          <input
            id="username"
            type="text"
            className={`form-input ${errors.username ? 'error' : ''}`}
            placeholder="请输入用户名"
            value={formData.username}
            onChange={handleChange('username')}
            disabled={isLoading}
          />
          {errors.username && <span className="error-message">{errors.username}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">邮箱地址</label>
          <input
            id="email"
            type="email"
            className={`form-input ${errors.email ? 'error' : ''}`}
            placeholder="请输入邮箱"
            value={formData.email}
            onChange={handleChange('email')}
            disabled={isLoading}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="phone" className="form-label">手机号（可选）</label>
          <input
            id="phone"
            type="tel"
            className={`form-input ${errors.phone ? 'error' : ''}`}
            placeholder="请输入手机号"
            value={formData.phone}
            onChange={handleChange('phone')}
            disabled={isLoading}
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">密码</label>
          <div className="password-input-wrapper">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="请输入密码"
              value={formData.password}
              onChange={handleChange('password')}
              disabled={isLoading}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">确认密码</label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
            placeholder="请再次输入密码"
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
            disabled={isLoading}
          />
          {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="verificationCode" className="form-label">验证码</label>
          <div className="verification-code-wrapper">
            <input
              id="verificationCode"
              type="text"
              className={`form-input ${errors.verificationCode ? 'error' : ''}`}
              placeholder="请输入验证码"
              value={formData.verificationCode}
              onChange={handleChange('verificationCode')}
              disabled={isLoading}
              maxLength={6}
            />
            <button
              type="button"
              className="send-code-button"
              onClick={handleSendCode}
              disabled={countdown > 0 || isVerifying || isLoading}
            >
              {isVerifying ? '发送中...' : countdown > 0 ? `${countdown}秒后重发` : '发送验证码'}
            </button>
          </div>
          {errors.verificationCode && <span className="error-message">{errors.verificationCode}</span>}
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={isLoading}
        >
          {isLoading ? '注册中...' : '注册'}
        </button>

        <div className="login-link">
          已有账号？<button type="button" className="link-button" onClick={onLogin}>立即登录</button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
