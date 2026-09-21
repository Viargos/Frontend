import type { NotificationCategory } from '@/modules/notifications/types/notification.types';

export const NOTIFICATION_CATEGORY_LABELS: Record<
  NotificationCategory,
  string
> = {
  account_security: 'Account and security',
  errors_warnings: 'Errors and warnings',
  messages_activity: 'Messages and activity',
  product_system: 'Product and system',
  reminders: 'Reminders',
  success: 'Success',
  task_workflow: 'Tasks and workflows',
};

export function formatNotificationTime(value: string): string {
  const timestamp = new Date(value).getTime();
  const differenceSeconds = Math.round((timestamp - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(undefined, {
    numeric: 'auto',
    style: 'short',
  });

  if (Math.abs(differenceSeconds) < 60) {
    return formatter.format(differenceSeconds, 'second');
  }
  const differenceMinutes = Math.round(differenceSeconds / 60);
  if (Math.abs(differenceMinutes) < 60) {
    return formatter.format(differenceMinutes, 'minute');
  }
  const differenceHours = Math.round(differenceMinutes / 60);
  if (Math.abs(differenceHours) < 24) {
    return formatter.format(differenceHours, 'hour');
  }
  const differenceDays = Math.round(differenceHours / 24);
  if (Math.abs(differenceDays) < 7) {
    return formatter.format(differenceDays, 'day');
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(timestamp);
}
