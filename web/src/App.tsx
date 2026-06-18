import React from 'react';
import LoginForm from './components/LoginForm';

const App: React.FC = () => {
  const handleLogin = (email: string, password: string) => {
    console.log('Web 登录:', { email, password });
    alert(`Web 登录成功！邮箱: ${email}`);
  };

  const handleForgotPassword = () => {
    console.log('忘记密码');
    alert('请检查您的邮箱以重置密码');
  };

  const handleGoogleLogin = () => {
    console.log('Google 登录');
    window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=code&scope=email profile';
  };

  return (
    <div className="app">
      <LoginForm 
        onSubmit={handleLogin}
        onForgotPassword={handleForgotPassword}
        onGoogleLogin={handleGoogleLogin}
      />
    </div>
  );
};

export default App;
