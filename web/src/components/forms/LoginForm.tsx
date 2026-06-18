import React, { useState } from 'react';
import { useToast } from '../hooks/useToast';
import { authApi } from '../services/api';
import './LoginForm.css';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  onForgotPassword: () => void;
  onGoogleLogin: () => void;
  onGitHubLogin: () => void;
  onWeChatLogin: () => void;
  onPhoneLogin: () => void;
  onRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onForgotPassword,
  onGoogleLogin,
  onGitHubLogin,
  onWeChatLogin,
  onPhoneLogin,
  onRegister,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('error', '请填写邮箱和密码');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-form-container">
      <div className="login-form">
        <h2>欢迎回来</h2>
        <p className="subtitle">请登录您的账户</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>邮箱地址</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱"
              required
            />
          </div>

          <div className="form-group">
            <label>密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              required
            />
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              记住我
            </label>
            <button type="button" className="forgot-password" onClick={onForgotPassword}>
              忘记密码？
            </button>
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="divider">
          <span>或使用以下方式登录</span>
        </div>

        <div className="social-login">
          <button className="social-button google" onClick={onGoogleLogin}>
            🔍 Google
          </button>
          <button className="social-button github" onClick={onGitHubLogin}>
            🐙 GitHub
          </button>
          <button className="social-button wechat" onClick={onWeChatLogin}>
            💬 微信
          </button>
          <button className="social-button phone" onClick={onPhoneLogin}>
            📱 手机号
          </button>
        </div>

        <p className="register-link">
          还没有账户？ <button onClick={onRegister}>立即注册</button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
