'use client';

import type { ThemeBackgroundId, ThemeBackgroundOption } from '@/modules/common/constants';
import { createContext } from 'react';

export type ThemeBackgroundContextValue = {
  disableAutoRotation: () => void;
  enableAutoRotation: () => Promise<boolean>;
  isAutoRotateLoading: boolean;
  isAutoRotating: boolean;
  pendingBackgroundId: ThemeBackgroundId | null;
  removeBackground: () => void;
  selectedBackground: ThemeBackgroundOption | null;
  selectBackground: (backgroundId: ThemeBackgroundId) => Promise<boolean>;
};

export const ThemeBackgroundContext = createContext<ThemeBackgroundContextValue | null>(null);
