'use client';

import type { PropsWithChildren } from 'react';
import type { AppTheme, ThemeContextValue } from './theme-context';
import { useEffect, useMemo, useState } from 'react';
import { ThemeContext } from './theme-context';

const DEFAULT_THEME: AppTheme = 'light';
const THEME_STORAGE_KEY = 'viargos-theme';

function readThemeFromDocument(): AppTheme {
  if (typeof document === 'undefined') {
    return DEFAULT_THEME;
  }

  const theme = document.documentElement.dataset.theme;
  return theme === 'dark' ? 'dark' : DEFAULT_THEME;
}

function applyTheme(theme: AppTheme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function ThemeProvider(props: PropsWithChildren) {
  const { children } = props;
  const [theme, setThemeState] = useState<AppTheme>(() => readThemeFromDocument());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(() => ({
    isDark: theme === 'dark',
    setTheme: setThemeState,
    theme,
    toggleTheme: () => {
      setThemeState(previousTheme => (previousTheme === 'dark' ? 'light' : 'dark'));
    },
  }), [theme]);

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
