import type {
  BrowserPermissionStatus,
  RegisterPushSubscriptionInput,
} from '@/modules/notifications/types/notification.types';
import { notificationService } from './notification.service';

const DEVICE_ID_STORAGE_KEY = 'viargos_notification_device_id';
const SERVICE_WORKER_URL = '/viargos-notifications-sw.js';

function getDeviceId(): string {
  const existing = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const deviceId = window.crypto.randomUUID();
  window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
  return deviceId;
}

function decodeApplicationServerKey(value: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const decoded = window.atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(decoded.length));
  for (let index = 0; index < decoded.length; index += 1) {
    bytes[index] = decoded.charCodeAt(index);
  }
  return bytes;
}

function toRegistrationInput(
  subscription: PushSubscription,
): RegisterPushSubscriptionInput {
  const serialized = subscription.toJSON();
  if (!serialized.endpoint || !serialized.keys?.auth || !serialized.keys.p256dh) {
    throw new Error('The browser returned an incomplete push subscription');
  }

  return {
    auth: serialized.keys.auth,
    deviceId: getDeviceId(),
    endpoint: serialized.endpoint,
    p256dh: serialized.keys.p256dh,
    permission: Notification.permission,
  };
}

async function getRegistration(): Promise<ServiceWorkerRegistration> {
  const registration = await navigator.serviceWorker.register(
    SERVICE_WORKER_URL,
    {
      scope: '/',
      updateViaCache: 'none',
    },
  );
  await registration.update().catch(() => undefined);
  return navigator.serviceWorker.ready;
}

export const browserPushService = {
  getPermissionStatus(): BrowserPermissionStatus {
    if (!this.isSupported()) {
      return 'unsupported';
    }
    return Notification.permission;
  },

  isSupported(): boolean {
    return (
      typeof window !== 'undefined'
      && window.isSecureContext
      && 'Notification' in window
      && 'serviceWorker' in navigator
      && 'PushManager' in window
    );
  },

  async enable(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('This browser does not support push notifications');
    }

    const permission = Notification.permission === 'default'
      ? await Notification.requestPermission()
      : Notification.permission;

    if (permission !== 'granted') {
      return permission;
    }

    await this.synchronizeGrantedSubscription();
    return permission;
  },

  async synchronizeGrantedSubscription(): Promise<void> {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return;
    }

    const configuration
      = await notificationService.getBrowserConfiguration();
    if (!configuration.supported || !configuration.publicKey) {
      throw new Error('Browser notifications are not configured');
    }

    const registration = await getRegistration();
    const existing = await registration.pushManager.getSubscription();
    const subscription = existing
      ?? await registration.pushManager.subscribe({
        applicationServerKey: decodeApplicationServerKey(
          configuration.publicKey,
        ),
        userVisibleOnly: true,
      });

    await notificationService.registerSubscription(
      toRegistrationInput(subscription),
    );
  },

  async disable(options?: { updatePreference?: boolean }): Promise<void> {
    const shouldUpdatePreference = options?.updatePreference ?? true;
    if (!this.isSupported()) {
      if (shouldUpdatePreference) {
        await notificationService.updatePreferences({
          browserEnabled: false,
        });
      }
      return;
    }

    const deviceId = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY);
    if (deviceId) {
      await notificationService
        .revokeSubscription(deviceId)
        .catch(() => undefined);
    }

    const registration = await navigator.serviceWorker.getRegistration('/');
    const subscription = await registration?.pushManager.getSubscription();
    await subscription?.unsubscribe().catch(() => false);

    if (shouldUpdatePreference) {
      await notificationService.updatePreferences({
        browserEnabled: false,
      });
    }
  },
};

export async function deactivateCurrentBrowserSubscription(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }
  await browserPushService.disable({ updatePreference: false });
}
