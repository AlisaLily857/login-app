import React from 'react';
import { View, StyleSheet } from 'react-native';
import LoginForm from './components/LoginForm';

const App = () => {
  const handleLogin = (email: string, password: string) => {
    console.log('Mobile 登录:', { email, password });
    // TODO: 调用移动端登录 API
  };

  const handleForgotPassword = () => {
    console.log('忘记密码');
    // TODO: 导航到忘记密码页面
  };

  const handleGoogleLogin = () => {
    console.log('Google 登录');
    // TODO: 调用 Google Sign-In SDK
  };

  return (
    <View style={styles.container}>
      <LoginForm 
        onSubmit={handleLogin}
        onForgotPassword={handleForgotPassword}
        onGoogleLogin={handleGoogleLogin}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default App;
