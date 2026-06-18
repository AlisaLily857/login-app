import { useState } from 'react';

const translations = {
  zh: {
    'app.name': '登录系统',
    'app.tagline': '安全、便捷、智能',
    'login.title': '欢迎回来',
    'login.subtitle': '请登录您的账户',
    'login.email': '邮箱地址',
    'login.password': '密码',
    'login.remember': '记住我',
    'login.forgot': '忘记密码？',
    'login.submit': '登录',
    'login.noAccount': '还没有账户？',
    'login.register': '立即注册',
    'register.title': '创建账户',
    'register.subtitle': '开始您的旅程',
    'register.username': '用户名',
    'register.email': '邮箱地址',
    'register.password': '密码',
    'register.confirmPassword': '确认密码',
    'register.agree': '我同意',
    'register.terms': '服务条款',
    'register.submit': '注册',
    'register.hasAccount': '已有账户？',
    'register.login': '立即登录',
    'toast.success': '操作成功',
    'toast.error': '操作失败',
  },
  en: {
    'app.name': 'Login System',
    'app.tagline': 'Secure, Convenient, Smart',
    'login.title': 'Welcome Back',
    'login.subtitle': 'Please login to your account',
    'login.email': 'Email Address',
    'login.password': 'Password',
    'login.remember': 'Remember Me',
    'login.forgot': 'Forgot Password?',
    'login.submit': 'Login',
    'login.noAccount': "Don't have an account?",
    'login.register': 'Register Now',
    'register.title': 'Create Account',
    'register.subtitle': 'Start Your Journey',
    'register.username': 'Username',
    'register.email': 'Email Address',
    'register.password': 'Password',
    'register.confirmPassword': 'Confirm Password',
    'register.agree': 'I agree to',
    'register.terms': 'Terms of Service',
    'register.submit': 'Register',
    'register.hasAccount': 'Already have an account?',
    'register.login': 'Login Now',
    'toast.success': 'Operation successful',
    'toast.error': 'Operation failed',
  },
};

export const useLanguage = () => {
  const [lang, setLang] = useState<'zh' | 'en'>('zh');

  const t = (key: string): string => {
    return translations[lang][key as keyof typeof translations['zh']] || key;
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'zh' ? 'en' : 'zh');
  };

  return { lang, t, toggleLanguage };
};