'use client';

import { NotificationPanel } from '@/modules/notifications/components/NotificationPanel';
import { NotificationPermissionPrompt } from '@/modules/notifications/components/NotificationPermissionPrompt';
import { useNotificationProviderValue } from '@/modules/notifications/hooks/use-notification-provider-value';
import { NotificationContext } from './notification-context';

export function NotificationProvider(props: { children: React.ReactNode }) {
  const value = useNotificationProviderValue();

  return (
    <NotificationContext value={value}>
      {props.children}
      <NotificationPanel />
      <NotificationPermissionPrompt />
    </NotificationContext>
  );
}
