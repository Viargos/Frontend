'use client';

import { createContext } from 'react';

export type AppTheme = 'dark' | 'light';

export type ThemeContextValue = {
  isDark: boolean;
  setTheme: (theme: AppTheme) => void;
  theme: AppTheme;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);
