import type {
  BrowserNotificationConfiguration,
  NotificationItem,
  NotificationList,
  NotificationPreferences,
  RegisterPushSubscriptionInput,
  UpdateNotificationPreferencesInput,
} from '@/modules/notifications/types/notification.types';
import { httpClient } from '@/lib/api/http-client';
import { unwrapEnvelope } from '@/modules/common/mappers';

async function request<TResponse>(
  path: string,
  options?: {
    body?: unknown;
    method?: 'DELETE' | 'GET' | 'PATCH' | 'POST';
  },
): Promise<TResponse> {
  const payload = await httpClient.request<unknown>(path, {
    body: options?.body === undefined
      ? null
      : JSON.stringify(options.body),
    method: options?.method ?? 'GET',
  });

  if (payload && typeof payload === 'object' && 'data' in payload) {
    return unwrapEnvelope<TResponse>(payload).data;
  }

  return payload as TResponse;
}

export const notificationService = {
  clear(): Promise<{ cleared: boolean }> {
    return request('/notifications/clear', { method: 'DELETE' });
  },

  delete(notificationId: string): Promise<{ deleted: boolean }> {
    return request(
      `/notifications/${encodeURIComponent(notificationId)}`,
      { method: 'DELETE' },
    );
  },

  dismiss(notificationId: string): Promise<{ dismissed: boolean }> {
    return request(
      `/notifications/${encodeURIComponent(notificationId)}/dismiss`,
      { method: 'POST' },
    );
  },

  getBrowserConfiguration(): Promise<BrowserNotificationConfiguration> {
    return request('/notifications/vapid-public-key');
  },

  getPreferences(): Promise<NotificationPreferences> {
    return request('/notifications/preferences');
  },

  list(): Promise<NotificationList> {
    return request('/notifications?limit=100');
  },

  markAllAsRead(): Promise<{ updated: boolean }> {
    return request('/notifications/read-all', { method: 'POST' });
  },

  markAsRead(notificationId: string): Promise<NotificationItem> {
    return request(
      `/notifications/${encodeURIComponent(notificationId)}/read`,
      { method: 'PATCH' },
    );
  },

  registerSubscription(
    input: RegisterPushSubscriptionInput,
  ): Promise<{ deviceId: string; registered: boolean }> {
    return request('/notifications/subscriptions', {
      body: input,
      method: 'POST',
    });
  },

  revokeSubscription(
    deviceId: string,
  ): Promise<{ revoked: boolean }> {
    return request('/notifications/subscriptions/revoke', {
      body: { deviceId },
      method: 'POST',
    });
  },

  updatePreferences(
    input: UpdateNotificationPreferencesInput,
  ): Promise<NotificationPreferences> {
    return request('/notifications/preferences', {
      body: input,
      method: 'PATCH',
    });
  },
};
