import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark';
    return saved || 'light';
  });

  const isDark = theme === 'dark';

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', isDark);
  }, [theme, isDark]);

  const setMode = (mode: 'light' | 'dark') => {
    setTheme(mode);
  };

  return { theme, isDark, setMode };
};