import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';

export const ThemeToggle: React.FC = () => {
  const { isDark, setMode } = useTheme();
  return (
    <button className="theme-toggle" onClick={() => setMode(isDark ? 'light' : 'dark')}>
      {isDark ? '☀️' : '🌙'}
    </button>
  );
};

export const LanguageToggle: React.FC = () => {
  const { lang, toggleLanguage } = useLanguage();
  return (
    <button className="language-toggle" onClick={toggleLanguage}>
      {lang === 'zh' ? 'EN' : '中'}
    </button>
  );
};