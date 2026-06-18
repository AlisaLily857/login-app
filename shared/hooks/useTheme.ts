import { useState, useEffect } from 'react';
import { Theme } from '../types';

const STORAGE_KEY = 'app_theme';

const defaultTheme: Theme = {
  mode: 'system',
  primaryColor: '#667eea',
  fontSize: 'medium',
  borderRadius: 'medium',
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultTheme;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
    
    // Apply theme to document
    const root = document.documentElement;
    root.setAttribute('data-theme', theme.mode);
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--font-size', theme.fontSize);
    root.style.setProperty('--border-radius', theme.borderRadius);
    
    // Handle system preference
    if (theme.mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  }, [theme]);

  const setMode = (mode: Theme['mode']) => setTheme(prev => ({ ...prev, mode }));
  const setPrimaryColor = (color: string) => setTheme(prev => ({ ...prev, primaryColor: color }));
  const setFontSize = (size: Theme['fontSize']) => setTheme(prev => ({ ...prev, fontSize: size }));
  const setBorderRadius = (radius: Theme['borderRadius']) => setTheme(prev => ({ ...prev, borderRadius: radius }));

  const isDark = theme.mode === 'dark' || 
    (theme.mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return {
    theme,
    isDark,
    setMode,
    setPrimaryColor,
    setFontSize,
    setBorderRadius,
  };
};
