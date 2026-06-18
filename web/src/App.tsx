import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '@shared/hooks/useToast';
import { useLanguage } from '@shared/hooks/useLanguage';
import { useTheme } from '@shared/hooks/useTheme';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import BiometricAuth from './components/BiometricAuth';
import MessageCenter from './components/MessageCenter';
import Achievements from './components/Achievements';
import StatsDashboard from './components/StatsDashboard';
import { authApi } from './utils/api';
import './App.css';

type View = 'login' | 'register' | 'profile' | 'messages' | 'achievements' | 'stats';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('login');
  const { isAuthenticated, user, login, register, logout } = useAuth();
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

  const handleBiometricSuccess = (tokens: { accessToken: string; refreshToken: string }) => {
    localStorage.setItem('access_token', tokens.accessToken);
    localStorage.setItem('refresh_token', tokens.refreshToken);
    showToast('success', '生物识别登录成功！');
    setCurrentView('profile');
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

  const Navigation = () => (
    <nav className="app-nav">
      <button 
        className={`nav-item ${currentView === 'profile' ? 'active' : ''}`}
        onClick={() => setCurrentView('profile')}
      >
        👤 个人资料
      </button>
      <button 
        className={`nav-item ${currentView === 'messages' ? 'active' : ''}`}
        onClick={() => setCurrentView('messages')}
      >
        📬 消息中心
      </button>
      <button 
        className={`nav-item ${currentView === 'achievements' ? 'active' : ''}`}
        onClick={() => setCurrentView('achievements')}
      >
        🏆 成就
      </button>
      <button 
        className={`nav-item ${currentView === 'stats' ? 'active' : ''}`}
        onClick={() => setCurrentView('stats')}
      >
        📊 统计
      </button>
      <button className="nav-item logout" onClick={handleLogout}>
        🚪 退出
      </button>
    </nav>
  );

  const ProfileView = () => (
    <div className="profile-view">
      <div className="profile-header">
        <div className="profile-avatar">
          {user?.avatar ? (
            <img src={user.avatar} alt="avatar" />
          ) : (
            <div className="avatar-placeholder">{user?.name?.[0] || 'U'}</div>
          )}
        </div>
        <div className="profile-info">
          <h2>{user?.name || user?.username}</h2>
          <p>{user?.email}</p>
        </div>
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

      <BiometricAuth 
        email={user?.email || ''} 
        onSuccess={handleBiometricSuccess} 
      />
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

      {isAuthenticated && <Navigation />}

      <main className="app-main">
        {!isAuthenticated ? (
          currentView === 'register' ? (
            <RegisterForm
              onSubmit={handleRegister}
              onLogin={() => setCurrentView('login')}
              onVerifyEmail={handleVerifyEmail}
            />
          ) : (
            <LoginForm
              onSubmit={handleLogin}
              onForgotPassword={() => showToast('info', '功能开发中')}
              onGoogleLogin={() => showToast('info', 'Google 登录')}
              onGitHubLogin={() => showToast('info', 'GitHub 登录')}
              onWeChatLogin={() => showToast('info', '微信登录')}
              onPhoneLogin={() => showToast('info', '手机号登录')}
              onRegister={() => setCurrentView('register')}
            />
          )
        ) : (
          <>
            {currentView === 'profile' && <ProfileView />}
            {currentView === 'messages' && <MessageCenter />}
            {currentView === 'achievements' && <Achievements />}
            {currentView === 'stats' && <StatsDashboard />}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
