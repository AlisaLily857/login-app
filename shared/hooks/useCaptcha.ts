import { useState, useEffect, useCallback } from 'react';
import { CaptchaConfig } from '../types';

const DEFAULT_CONFIG: CaptchaConfig = {
  enabled: true,
  maxAttempts: 5,
  lockoutDuration: 30, // 30 minutes
  showAfterAttempts: 3,
};

export const useCaptcha = (config: Partial<CaptchaConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [attempts, setAttempts] = useState(() => {
    const stored = sessionStorage.getItem('***');
    return stored ? parseInt(stored, 10) : 0;
  });
  
  const [isLocked, setIsLocked] = useState(() => {
    const lockedUntil = sessionStorage.getItem('***');
    return lockedUntil ? Date.now() < parseInt(lockedUntil, 10) : false;
  });
  
  const [showCaptcha, setShowCaptcha] = useState(() => attempts >= finalConfig.showAfterAttempts);
  const [captchaCode, setCaptchaCode] = useState('');
  const [userCaptcha, setUserCaptcha] = useState('');

  useEffect(() => {
    sessionStorage.setItem('***', attempts.toString());
    setShowCaptcha(attempts >= finalConfig.showAfterAttempts);
  }, [attempts, finalConfig.showAfterAttempts]);

  const generateCaptcha = useCallback(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    return code;
  }, []);

  const verifyCaptcha = useCallback((input: string): boolean => {
    return input.toLowerCase() === captchaCode.toLowerCase();
  }, [captchaCode]);

  const recordAttempt = useCallback(() => {
    setAttempts(prev => {
      const newAttempts = prev + 1;
      if (newAttempts >= finalConfig.maxAttempts) {
        const lockoutTime = Date.now() + finalConfig.lockoutDuration * 60 * 1000;
        sessionStorage.setItem('***', lockoutTime.toString());
        setIsLocked(true);
      }
      return newAttempts;
    });
  }, [finalConfig.maxAttempts, finalConfig.lockoutDuration]);

  const resetAttempts = useCallback(() => {
    setAttempts(0);
    setIsLocked(false);
    sessionStorage.removeItem('***');
    sessionStorage.removeItem('***');
    setShowCaptcha(false);
  }, []);

  const remainingAttempts = finalConfig.maxAttempts - attempts;

  return {
    attempts,
    isLocked,
    showCaptcha,
    captchaCode,
    userCaptcha,
    setUserCaptcha,
    remainingAttempts,
    generateCaptcha,
    verifyCaptcha,
    recordAttempt,
    resetAttempts,
  };
};
