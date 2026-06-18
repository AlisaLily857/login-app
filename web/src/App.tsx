import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '@shared/hooks/useToast';
import { useLanguage } from '@shared/hooks/useLanguage';
import { useTheme } from '@shared/hooks/useTheme';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import { authApi } from './utils/api';
import './App.css';

type View = 'login' | 'register' | 'profile';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('login');
  const { isAuthenticated, user, login, register, logout, fetchCurrentUser } = useAuth();
  const { showToast } = useToast();
  const { t, lang, toggleLanguage } = useLanguage();
  const { theme, isDark, setMode } = useTheme();

  const handleLogin = async (email: string, password: string) => {
    const success = await login(email, password);
    if (success) {
      showToast('success', t('toast.success'));
      setCurrentView('profile');
    } else {
      showToast('error', t('toast.error'));
    }
  };

  const handleRegister = async (data: any) => {
    const success = await register(data);
    if (success) {
      showToast('success', '注册成功！');
      setCurrentView('login');
    } else {
      showToast('error', '注册失败');
    }
  };

  const handleVerifyEmail = async (email: string): Promise<boolean> => {
    try {
      await authApi.sendVerificationCode({ email, type: 'EMAIL_VERIFICATION' });
      showToast('info', '验证码已发送');
      return true;
    } catch (error) {
      showToast('error', '发送验证码失败');
      return false;
    }
  };

  const handleGoogleLogin = () => {
    showToast('info', 'Google 登录');
    // TODO: 实现 Google OAuth 跳转
  };

  const handleGitHubLogin = () => {
    showToast('info', 'GitHub 登录');
    // TODO: 实现 GitHub OAuth 跳转
  };

  const handleWeChatLogin = () => {
    showToast('info', '微信登录');
    // TODO: 实现微信 OAuth 跳转
  };

  const handlePhoneLogin = () => {
    showToast('info', '手机号登录');
    // TODO: 实现手机号登录
  };

  const handleLogout = async () => {
    await logout();
    showToast('info', '已退出登录');
    setCurrentView('login');
  };

  const ThemeToggle = () => (
    <button className="theme-toggle" onClick={() => setMode(isDark ? 'light' : 'dark')}>
      {isDark ? '☀️' : '🌙'}
    </button>
  );

  const LanguageToggle = () => (
    <button className="language-toggle" onClick={toggleLanguage}>
      {lang === 'zh' ? 'EN' : '中'}
    </button>
  );

  const ProfileView = () => (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {user?.avatar ? (
            <img src={user.avatar} alt="avatar" />
          ) : (
            <div className="avatar-placeholder">{user?.name?.[0] || 'U'}</div>
          )}
        </div>
        <h2>{user?.name || user?.username}</h2>
        <p>{user?.email}</p>
      </div>
      
      <div className="profile-stats">
        <div className="stat-item">
          <span className="stat-value">{user?.loginCount || 0}</span>
          <span className="stat-label">登录次数</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{user?.isEmailVerified ? '✅' : '❌'}</span>
          <span className="stat-label">邮箱验证</span>
        </div>
      </div>

      <div className="profile-actions">
        <button className="action-button" onClick={() => showToast('info', '功能开发中')}>
          编辑资料
        </button>
        <button className="action-button" onClick={() => showToast('info', '功能开发中')}>
          安全设置
        </button>
        <button className="action-button danger" onClick={handleLogout}>
          退出登录
        </button>
      </div>
    </div>
  );

  return (
    <div className={`app ${isDark ? 'dark' : 'light'}`}>
      <header className="app-header">
        <h1>{t('app.name')}</h1>
        <div className="header-actions">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </header>

      <main className="app-main">
        {isAuthenticated && currentView === 'profile' ? (
          <ProfileView />
        ) : currentView === 'register' ? (
          <RegisterForm
            onSubmit={handleRegister}
            onLogin={() => setCurrentView('login')}
            onVerifyEmail={handleVerifyEmail}
          />
        ) : (
          <LoginForm
            onSubmit={handleLogin}
            onForgotPassword={() => showToast('info', '功能开发中')}
            onGoogleLogin={handleGoogleLogin}
            onGitHubLogin={handleGitHubLogin}
            onWeChatLogin={handleWeChatLogin}
            onPhoneLogin={handlePhoneLogin}
            onRegister={() => setCurrentView('register')}
          />
        )}
      </main>
    </div>
  );
};

export default App;