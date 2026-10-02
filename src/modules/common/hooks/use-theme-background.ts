'use client';

import { use } from 'react';
import { ThemeBackgroundContext } from '@/modules/common/components/theme-background-context';

export function useThemeBackground() {
  const context = use(ThemeBackgroundContext);

  if (!context) {
    throw new Error('useThemeBackground must be used within ThemeBackgroundProvider.');
  }

  return context;
}
