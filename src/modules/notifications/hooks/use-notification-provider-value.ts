'use client';

import type {
  BrowserPermissionStatus,
  NotificationList,
  NotificationPreferences,
  UpdateNotificationPreferencesInput,
} from '@/modules/notifications/types/notification.types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from '@/modules/common/hooks/use-toast';
import { notificationQueryKeys } from '@/modules/notifications/query-keys';
import { browserPushService } from '@/modules/notifications/services/browser-push.service';
import { notificationService } from '@/modules/notifications/services/notification.service';

const PERMISSION_PROMPT_DISMISSED_KEY
  = 'viargos_notification_prompt_dismissed';

export function useNotificationProviderValue() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [permissionStatus, setPermissionStatus]
    = useState<BrowserPermissionStatus>(
      () => browserPushService.getPermissionStatus(),
    );
  const [isPermissionPromptVisible, setIsPermissionPromptVisible]
    = useState(false);

  const listQuery = useQuery({
    queryFn: () => notificationService.list(),
    queryKey: notificationQueryKeys.list(),
    refetchInterval: 30_000,
  });
  const preferencesQuery = useQuery({
    queryFn: () => notificationService.getPreferences(),
    queryKey: notificationQueryKeys.preferences(),
  });
  const browserConfigurationQuery = useQuery({
    queryFn: () => notificationService.getBrowserConfiguration(),
    queryKey: notificationQueryKeys.browserConfiguration(),
    staleTime: 5 * 60_000,
  });

  const items = listQuery.data?.items ?? [];
  const unreadCount = listQuery.data?.unreadCount ?? 0;
  const preferences = preferencesQuery.data ?? null;
  const browserConfigurationAvailable
    = browserPushService.isSupported()
      && Boolean(browserConfigurationQuery.data?.supported);

  const setListData = (
    updater: (current: NotificationList) => NotificationList,
  ) => {
    queryClient.setQueryData<NotificationList>(
      notificationQueryKeys.list(),
      current => current ? updater(current) : current,
    );
  };

  const refetch = async () => {
    await Promise.all([
      listQuery.refetch(),
      preferencesQuery.refetch(),
      browserConfigurationQuery.refetch(),
    ]);
  };

  const updatePreferences = async (
    input: UpdateNotificationPreferencesInput,
  ) => {
    try {
      const updated = await notificationService.updatePreferences(input);
      queryClient.setQueryData<NotificationPreferences>(
        notificationQueryKeys.preferences(),
        updated,
      );
    } catch {
      toast.error(
        'Notification settings were not saved',
        'Your previous preferences are still active.',
      );
      throw new Error('Notification settings update failed');
    }
  };

  const enableBrowserNotifications = async () => {
    if (!browserConfigurationAvailable) {
      toast.error(
        'Browser notifications are unavailable',
        'In-app notifications will continue to work.',
      );
      return;
    }

    try {
      const permission = await browserPushService.enable();
      setPermissionStatus(permission);

      if (permission === 'granted') {
        await updatePreferences({
          browserEnabled: true,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
        setIsPermissionPromptVisible(false);
        window.localStorage.removeItem(PERMISSION_PROMPT_DISMISSED_KEY);
        toast.success(
          'Browser notifications enabled',
          'Viargos can now notify you when this tab is inactive.',
        );
        return;
      }

      await notificationService
        .updatePreferences({ browserEnabled: false })
        .then(updated => queryClient.setQueryData(
          notificationQueryKeys.preferences(),
          updated,
        ))
        .catch(() => undefined);
    } catch {
      toast.error(
        'Browser notifications are unavailable',
        'Check your browser settings and the Viargos notification configuration.',
      );
    }
  };

  const setBrowserNotificationsEnabled = async (enabled: boolean) => {
    if (enabled) {
      await enableBrowserNotifications();
      return;
    }

    try {
      await browserPushService.disable();
      setPermissionStatus(browserPushService.getPermissionStatus());
      await preferencesQuery.refetch();
    } catch {
      toast.error(
        'Browser notifications were not disabled',
        'Your current subscription may still be active.',
      );
    }
  };

  const markAsRead = async (notificationId: string) => {
    setListData(current => ({
      ...current,
      items: current.items.map(item => item.id === notificationId
        ? { ...item, isRead: true, readAt: new Date().toISOString() }
        : item),
      unreadCount: Math.max(
        0,
        current.unreadCount
        - (current.items.some(item => item.id === notificationId && !item.isRead)
          ? 1
          : 0),
      ),
    }));
    await notificationService.markAsRead(notificationId).catch(() => {
      void listQuery.refetch();
    });
  };

  const markAllAsRead = async () => {
    setListData(current => ({
      ...current,
      items: current.items.map(item => ({
        ...item,
        isRead: true,
        readAt: item.readAt ?? new Date().toISOString(),
      })),
      unreadCount: 0,
    }));
    await notificationService.markAllAsRead().catch(() => {
      void listQuery.refetch();
    });
  };

  const deleteNotification = async (notificationId: string) => {
    setListData((current) => {
      const deleted = current.items.find(item => item.id === notificationId);
      return {
        ...current,
        items: current.items.filter(item => item.id !== notificationId),
        pagination: {
          ...current.pagination,
          total: Math.max(0, current.pagination.total - 1),
        },
        unreadCount: deleted && !deleted.isRead
          ? Math.max(0, current.unreadCount - 1)
          : current.unreadCount,
      };
    });
    await notificationService.delete(notificationId).catch(() => {
      void listQuery.refetch();
    });
  };

  const clearNotifications = async () => {
    const previous = queryClient.getQueryData<NotificationList>(
      notificationQueryKeys.list(),
    );
    if (previous) {
      queryClient.setQueryData<NotificationList>(
        notificationQueryKeys.list(),
        {
          ...previous,
          items: [],
          pagination: { ...previous.pagination, total: 0 },
          unreadCount: 0,
        },
      );
    }
    await notificationService.clear().catch(() => {
      void listQuery.refetch();
    });
  };

  const dismissPermissionPrompt = () => {
    setIsPermissionPromptVisible(false);
    window.localStorage.setItem(PERMISSION_PROMPT_DISMISSED_KEY, 'true');
  };

  useEffect(() => {
    if (
      !preferences?.browserEnabled
      || permissionStatus !== 'granted'
      || !browserConfigurationAvailable
    ) {
      return;
    }

    void browserPushService.synchronizeGrantedSubscription().catch(() => {
      toast.warning(
        'Browser notification connection needs attention',
        'Open Settings to reconnect this browser.',
      );
    });
  }, [
    browserConfigurationAvailable,
    permissionStatus,
    preferences?.browserEnabled,
  ]);

  useEffect(() => {
    if (
      !preferences
      || preferences.browserEnabled
      || permissionStatus !== 'default'
      || !browserConfigurationAvailable
      || window.localStorage.getItem(PERMISSION_PROMPT_DISMISSED_KEY)
    ) {
      return;
    }

    let promptTimer: ReturnType<typeof setTimeout> | null = null;
    const showPromptAfterInteraction = () => {
      promptTimer = setTimeout(() => {
        setIsPermissionPromptVisible(true);
      }, 1200);
      window.removeEventListener('pointerdown', showPromptAfterInteraction);
      window.removeEventListener('keydown', showPromptAfterInteraction);
    };
    window.addEventListener('pointerdown', showPromptAfterInteraction, {
      once: true,
    });
    window.addEventListener('keydown', showPromptAfterInteraction, {
      once: true,
    });

    return () => {
      if (promptTimer) {
        clearTimeout(promptTimer);
      }
      window.removeEventListener('pointerdown', showPromptAfterInteraction);
      window.removeEventListener('keydown', showPromptAfterInteraction);
    };
  }, [
    browserConfigurationAvailable,
    permissionStatus,
    preferences,
  ]);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const onServiceWorkerMessage = (event: MessageEvent<{
      type?: string;
      url?: string;
    }>) => {
      if (event.data?.type === 'VIARGOS_NOTIFICATION_CHANGED') {
        void listQuery.refetch();
      }
      if (
        event.data?.type === 'VIARGOS_NOTIFICATION_NAVIGATE'
        && event.data.url
      ) {
        router.push(event.data.url);
      }
    };
    navigator.serviceWorker.addEventListener(
      'message',
      onServiceWorkerMessage,
    );
    return () => navigator.serviceWorker.removeEventListener(
      'message',
      onServiceWorkerMessage,
    );
  }, [listQuery, router]);

  return {
    browserConfigurationAvailable,
    clearNotifications,
    closePanel: () => setIsPanelOpen(false),
    deleteNotification,
    dismissPermissionPrompt,
    enableBrowserNotifications,
    hasError: listQuery.isError,
    isLoading: listQuery.isLoading || preferencesQuery.isLoading,
    isPanelOpen,
    isPermissionPromptVisible,
    items,
    markAllAsRead,
    markAsRead,
    openPanel: () => setIsPanelOpen(true),
    permissionStatus,
    preferences,
    refetch,
    setBrowserNotificationsEnabled,
    togglePanel: () => setIsPanelOpen(current => !current),
    unreadCount,
    updatePreferences,
  };
}
