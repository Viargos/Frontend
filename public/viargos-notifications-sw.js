const SERVICE_WORKER_VERSION = 'viargos-notifications-v1';
const serviceWorker = globalThis;

serviceWorker.addEventListener('install', () => {
  serviceWorker.skipWaiting();
});

serviceWorker.addEventListener('activate', (event) => {
  event.waitUntil(serviceWorker.clients.claim());
});

serviceWorker.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    serviceWorker.skipWaiting();
  }
});

serviceWorker.addEventListener('push', (event) => {
  event.waitUntil((async () => {
    let payload;
    try {
      payload = event.data?.json();
    } catch {
      payload = null;
    }

    if (!payload?.id || !payload.title) {
      return;
    }

    const existing = await serviceWorker.registration.getNotifications({
      tag: payload.tag,
    });
    if (existing.some(notification => notification.data?.id === payload.id)) {
      return;
    }

    await serviceWorker.registration.showNotification(payload.title, {
      actions: Array.isArray(payload.actions)
        ? payload.actions.map(action => ({
            action: action.action,
            title: action.title,
          }))
        : [],
      badge: payload.badge || '/favicon-32x32.png',
      body: payload.body,
      data: {
        actions: payload.actions || [],
        category: payload.category,
        id: payload.id,
        url: payload.url || '/notifications',
        version: SERVICE_WORKER_VERSION,
      },
      icon: payload.icon || '/viargos-favicon.png',
      renotify: Boolean(payload.renotify),
      requireInteraction: Boolean(payload.requireInteraction),
      silent: Boolean(payload.silent),
      tag: payload.tag || payload.id,
      timestamp: Date.parse(payload.timestamp) || Date.now(),
    });
  })());
});

async function updateNotificationState(id, action) {
  if (!id) {
    return;
  }

  await fetch(`/api/notifications/${encodeURIComponent(id)}/${action}`, {
    credentials: 'include',
    method: action === 'read' ? 'PATCH' : 'POST',
  }).catch(() => undefined);
}

async function focusOrOpenViargos(destination) {
  const target = new URL(
    destination || '/notifications',
    serviceWorker.location.origin,
  );
  if (target.origin !== serviceWorker.location.origin) {
    target.pathname = '/notifications';
    target.search = '';
    target.hash = '';
  }

  const windows = await serviceWorker.clients.matchAll({
    includeUncontrolled: true,
    type: 'window',
  });
  const existingWindow = windows.find((client) => {
    try {
      return new URL(client.url).origin === serviceWorker.location.origin;
    } catch {
      return false;
    }
  });

  if (existingWindow) {
    const navigatedWindow = 'navigate' in existingWindow
      ? await existingWindow.navigate(target.href).catch(() => existingWindow)
      : existingWindow;
    const focusedWindow = navigatedWindow || existingWindow;
    focusedWindow.postMessage({
      type: 'VIARGOS_NOTIFICATION_CHANGED',
    });
    return focusedWindow.focus();
  }

  return serviceWorker.clients.openWindow(target.href);
}

serviceWorker.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};

  event.waitUntil((async () => {
    if (event.action === 'dismiss') {
      await updateNotificationState(data.id, 'dismiss');
      return;
    }

    const selectedAction = Array.isArray(data.actions)
      ? data.actions.find(action => action.action === event.action)
      : null;
    await updateNotificationState(data.id, 'read');
    await focusOrOpenViargos(selectedAction?.url || data.url);
  })());
});

serviceWorker.addEventListener('notificationclose', (event) => {
  event.waitUntil(
    updateNotificationState(event.notification.data?.id, 'dismiss'),
  );
});
