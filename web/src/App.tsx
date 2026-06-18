import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useToast } from '@shared/hooks/useToast';
import { useLanguage } from './hooks/useLanguage';
import { useTheme } from './hooks/useTheme';
import { ThemeToggle, LanguageToggle } from './components/ui/ToggleButtons';
import { Navigation } from './components/layout/Navigation';
import { ProfileView } from './components/pages/ProfileView';
import LoginForm from './components/forms/LoginForm';
import RegisterForm from './components/RegisterForm';
import MessageCenter from './components/MessageCenter';
import Achievements from './components/Achievements';
import StatsDashboard from './components/StatsDashboard';
import { authApi } from './services/api';
import './App.css';

type View = 'login' | 'register' | 'profile' | 'messages' | 'achievements' | 'stats';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('login');
  const { isAuthenticated, login, register, logout, setUser, setIsAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const { isDark } = useTheme();

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
    try {
      const result = await register(data);
      if (result) {
        localStorage.setItem('access_token', result.tokens.accessToken);
        localStorage.setItem('refresh_token', result.tokens.refreshToken);
        setUser(result.user);
        setIsAuthenticated(true);
        showToast('success', '注册成功！');
        setCurrentView('profile');
      } else {
        showToast('error', '注册失败');
      }
    } catch (error) {
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

  return (
    <div className={`app ${isDark ? 'dark' : 'light'}`}>
      <header className="app-header">
        <h1>{t('app.name')}</h1>
        <div className="header-actions">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </header>

      {isAuthenticated && (
        <Navigation 
          currentView={currentView} 
          onViewChange={setCurrentView} 
          onLogout={handleLogout} 
        />
      )}

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
            {currentView === 'profile' && <ProfileView onBiometricSuccess={handleBiometricSuccess} />}
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
