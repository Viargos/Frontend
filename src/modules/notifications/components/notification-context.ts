'use client';

import type {
  BrowserPermissionStatus,
  NotificationItem,
  NotificationPreferences,
  UpdateNotificationPreferencesInput,
} from '@/modules/notifications/types/notification.types';
import { createContext, use } from 'react';

export type NotificationContextValue = {
  browserConfigurationAvailable: boolean;
  clearNotifications: () => Promise<void>;
  closePanel: () => void;
  deleteNotification: (notificationId: string) => Promise<void>;
  dismissPermissionPrompt: () => void;
  enableBrowserNotifications: () => Promise<void>;
  isLoading: boolean;
  hasError: boolean;
  isPanelOpen: boolean;
  isPermissionPromptVisible: boolean;
  items: NotificationItem[];
  markAllAsRead: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  openPanel: () => void;
  permissionStatus: BrowserPermissionStatus;
  preferences: NotificationPreferences | null;
  refetch: () => Promise<void>;
  setBrowserNotificationsEnabled: (enabled: boolean) => Promise<void>;
  togglePanel: () => void;
  unreadCount: number;
  updatePreferences: (
    input: UpdateNotificationPreferencesInput,
  ) => Promise<void>;
};

export const NotificationContext
  = createContext<NotificationContextValue | null>(null);

export function useNotifications(): NotificationContextValue {
  const context = use(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotifications must be used within NotificationProvider',
    );
  }
  return context;
}
