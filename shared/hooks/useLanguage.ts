import { useState, useEffect } from 'react';

const STORAGE_KEY = 'login_app:language';

const translations = {
  zh: {
    // 通用
    'app.name': '登录应用',
    'app.description': '安全、便捷的三端登录系统',
    
    // 登录页
    'login.title': '欢迎登录',
    'login.email': '邮箱地址',
    'login.password': '密码',
    'login.remember': '记住我',
    'login.forgot': '忘记密码？',
    'login.submit': '登录',
    'login.loading': '登录中...',
    'login.noAccount': '还没有账号？',
    'login.register': '立即注册',
    'login.or': '或',
    
    // 第三方登录
    'login.google': '使用 Google 登录',
    'login.github': '使用 GitHub 登录',
    'login.wechat': '使用微信登录',
    'login.phone': '手机号登录',
    
    // 注册页
    'register.title': '创建账号',
    'register.username': '用户名',
    'register.email': '邮箱地址',
    'register.phone': '手机号',
    'register.password': '密码',
    'register.confirmPassword': '确认密码',
    'register.verificationCode': '验证码',
    'register.sendCode': '发送验证码',
    'register.resend': '重新发送',
    'register.submit': '注册',
    'register.loading': '注册中...',
    'register.hasAccount': '已有账号？',
    'register.login': '立即登录',
    
    // 验证
    'validation.required': '此字段为必填项',
    'validation.email': '请输入有效的邮箱地址',
    'validation.password': '密码至少需要6个字符',
    'validation.passwordMatch': '两次输入的密码不一致',
    'validation.phone': '请输入有效的手机号',
    'validation.code': '请输入验证码',
    
    // 密码强度
    'password.empty': '请输入密码',
    'password.weak': '弱',
    'password.medium': '中等',
    'password.strong': '强',
    'password.veryStrong': '非常强',
    
    // 个人资料
    'profile.title': '个人资料',
    'profile.edit': '编辑资料',
    'profile.save': '保存',
    'profile.cancel': '取消',
    'profile.name': '姓名',
    'profile.bio': '个人简介',
    'profile.avatar': '头像',
    'profile.changeAvatar': '更换头像',
    
    // 安全设置
    'security.title': '安全设置',
    'security.password': '修改密码',
    'security.2fa': '双重认证',
    'security.devices': '设备管理',
    'security.history': '登录历史',
    'security.bindings': '账号绑定',
    
    // 主题
    'theme.light': '浅色模式',
    'theme.dark': '深色模式',
    'theme.system': '跟随系统',
    'theme.color': '主题色',
    'theme.fontSize': '字体大小',
    'theme.borderRadius': '圆角大小',
    
    // 提示
    'toast.success': '操作成功',
    'toast.error': '操作失败',
    'toast.warning': '警告',
    'toast.info': '提示',
    
    // 错误
    'error.network': '网络错误，请检查网络连接',
    'error.server': '服务器错误，请稍后重试',
    'error.unauthorized': '未授权，请重新登录',
    'error.forbidden': '无权访问',
    'error.notFound': '页面不存在',
    
    // 按钮
    'button.confirm': '确认',
    'button.cancel': '取消',
    'button.submit': '提交',
    'button.delete': '删除',
    'button.edit': '编辑',
    'button.back': '返回',
    'button.next': '下一步',
    'button.previous': '上一步',
    'button.finish': '完成',
    
    // 状态
    'status.online': '在线',
    'status.offline': '离线',
    'status.busy': '忙碌',
    'status.away': '离开',
  },
  en: {
    // General
    'app.name': 'Login App',
    'app.description': 'Secure, convenient three-platform login system',
    
    // Login
    'login.title': 'Welcome Back',
    'login.email': 'Email Address',
    'login.password': 'Password',
    'login.remember': 'Remember me',
    'login.forgot': 'Forgot password?',
    'login.submit': 'Sign In',
    'login.loading': 'Signing in...',
    'login.noAccount': "Don't have an account?",
    'login.register': 'Sign Up',
    'login.or': 'OR',
    
    // Third-party login
    'login.google': 'Continue with Google',
    'login.github': 'Continue with GitHub',
    'login.wechat': 'Continue with WeChat',
    'login.phone': 'Phone Sign In',
    
    // Register
    'register.title': 'Create Account',
    'register.username': 'Username',
    'register.email': 'Email Address',
    'register.phone': 'Phone Number',
    'register.password': 'Password',
    'register.confirmPassword': 'Confirm Password',
    'register.verificationCode': 'Verification Code',
    'register.sendCode': 'Send Code',
    'register.resend': 'Resend',
    'register.submit': 'Sign Up',
    'register.loading': 'Creating account...',
    'register.hasAccount': 'Already have an account?',
    'register.login': 'Sign In',
    
    // Validation
    'validation.required': 'This field is required',
    'validation.email': 'Please enter a valid email',
    'validation.password': 'Password must be at least 6 characters',
    'validation.passwordMatch': 'Passwords do not match',
    'validation.phone': 'Please enter a valid phone number',
    'validation.code': 'Please enter verification code',
    
    // Password strength
    'password.empty': 'Enter password',
    'password.weak': 'Weak',
    'password.medium': 'Medium',
    'password.strong': 'Strong',
    'password.veryStrong': 'Very Strong',
    
    // Profile
    'profile.title': 'Profile',
    'profile.edit': 'Edit Profile',
    'profile.save': 'Save',
    'profile.cancel': 'Cancel',
    'profile.name': 'Name',
    'profile.bio': 'Bio',
    'profile.avatar': 'Avatar',
    'profile.changeAvatar': 'Change Avatar',
    
    // Security
    'security.title': 'Security',
    'security.password': 'Change Password',
    'security.2fa': 'Two-Factor Auth',
    'security.devices': 'Devices',
    'security.history': 'Login History',
    'security.bindings': 'Account Bindings',
    
    // Theme
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'theme.system': 'System',
    'theme.color': 'Primary Color',
    'theme.fontSize': 'Font Size',
    'theme.borderRadius': 'Border Radius',
    
    // Toast
    'toast.success': 'Success',
    'toast.error': 'Error',
    'toast.warning': 'Warning',
    'toast.info': 'Info',
    
    // Errors
    'error.network': 'Network error, please check your connection',
    'error.server': 'Server error, please try again later',
    'error.unauthorized': 'Unauthorized, please sign in again',
    'error.forbidden': 'Access denied',
    'error.notFound': 'Page not found',
    
    // Buttons
    'button.confirm': 'Confirm',
    'button.cancel': 'Cancel',
    'button.submit': 'Submit',
    'button.delete': 'Delete',
    'button.edit': 'Edit',
    'button.back': 'Back',
    'button.next': 'Next',
    'button.previous': 'Previous',
    'button.finish': 'Finish',
    
    // Status
    'status.online': 'Online',
    'status.offline': 'Offline',
    'status.busy': 'Busy',
    'status.away': 'Away',
  }
};

type LanguageCode = keyof typeof translations;

export const useLanguage = () => {
  const [lang, setLang] = useState<LanguageCode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as LanguageCode;
    return stored || 'zh';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const t = (key: string): string => {
    return translations[lang][key as keyof typeof translations['zh']] || key;
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'zh' ? 'en' : 'zh');
  };

  return { lang, t, toggleLanguage, setLang };
};
