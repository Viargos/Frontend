'use client';

import type {
  NotificationCategoryPreferences,
  UpdateNotificationPreferencesInput,
} from '@/modules/notifications/types/notification.types';
import {
  BellRing,
  CheckCircle2,
  Clock3,
  Info,
  ShieldAlert,
  Volume2,
} from 'lucide-react';
import { SettingsToggle } from '@/modules/settings/components/SettingsToggle';
import { useNotifications } from './notification-context';

const CATEGORY_SETTINGS: Array<{
  description: string;
  key: keyof NotificationCategoryPreferences;
  label: string;
}> = [
  {
    description: 'Scheduled reminders and upcoming deadlines',
    key: 'reminders',
    label: 'Reminders',
  },
  {
    description: 'Task, workflow, and long-running process updates',
    key: 'taskWorkflow',
    label: 'Task and workflow updates',
  },
  {
    description: 'Successful background operations and completed actions',
    key: 'success',
    label: 'Success notifications',
  },
  {
    description: 'Failed actions, errors, and important warnings',
    key: 'errorsWarnings',
    label: 'Errors and warnings',
  },
  {
    description: 'New messages, comments, likes, and follower activity',
    key: 'messagesActivity',
    label: 'Messages and activity',
  },
  {
    description: 'Important account changes and security alerts',
    key: 'accountSecurity',
    label: 'Account and security alerts',
  },
  {
    description: 'Viargos product news and system announcements',
    key: 'productSystem',
    label: 'Product and system announcements',
  },
];

export function NotificationSettings() {
  const {
    browserConfigurationAvailable,
    isLoading,
    permissionStatus,
    preferences,
    setBrowserNotificationsEnabled,
    updatePreferences,
  } = useNotifications();

  if (isLoading || !preferences) {
    return (
      <div aria-label="Loading notification settings" className="space-y-3 px-5 py-4">
        {[0, 1, 2].map(item => (
          <div key={item} className="h-14 rounded-lg bg-[var(--surface-1)] motion-safe:animate-pulse" />
        ))}
      </div>
    );
  }

  const statusLabel = permissionStatus === 'unsupported'
    ? 'Not supported'
    : permissionStatus === 'granted'
      ? 'Allowed by browser'
      : permissionStatus === 'denied'
        ? 'Blocked by browser'
        : 'Permission not requested';

  const save = (input: UpdateNotificationPreferencesInput) => {
    void updatePreferences(input).catch(() => undefined);
  };

  return (
    <>
      <div className="border-b border-[var(--border-subtle)] px-5 py-5">
        <div className="flex items-start gap-3">
          <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-[var(--text-secondary)]" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Browser notification permission
            </p>
            <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
              Viargos asks the browser only after you choose Enable. Notifications
              can arrive while this tab is inactive, as long as the browser is
              running.
            </p>
            <span className="mt-2 inline-flex rounded-full bg-[var(--surface-1)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-muted)]">
              {statusLabel}
            </span>
          </div>
        </div>

        {permissionStatus === 'denied'
          ? (
              <div className="mt-4 flex gap-2 border-l-2 border-[var(--border-subtle)] py-1 pl-3 text-xs leading-5 text-[var(--text-secondary)]">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  Your browser is blocking notifications. Open the site controls
                  beside the address bar, set Notifications to Allow, then refresh
                  Viargos. The app will not ask again while permission is blocked.
                </p>
              </div>
            )
          : null}

        {!browserConfigurationAvailable && permissionStatus !== 'denied'
          ? (
              <div className="mt-4 flex gap-2 border-l-2 border-[var(--border-subtle)] py-1 pl-3 text-xs leading-5 text-[var(--text-secondary)]">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                This browser or the Viargos push service is not currently available.
                In-app notifications will continue to work.
              </div>
            )
          : null}
      </div>

      <SettingsToggle
        checked={preferences.browserEnabled && permissionStatus === 'granted'}
        description="Master control for browser push across your signed-in devices"
        icon={<BellRing className="h-5 w-5" />}
        label="Browser notifications"
        onChange={enabled => void setBrowserNotificationsEnabled(enabled)}
      />

      <div className="px-5 pt-6 pb-2 text-sm font-semibold text-[var(--text-primary)]">
        Categories
      </div>
      {CATEGORY_SETTINGS.map(category => (
        <SettingsToggle
          key={category.key}
          checked={preferences.categories[category.key]}
          description={category.description}
          label={category.label}
          onChange={checked => save({
            categories: { [category.key]: checked },
          })}
        />
      ))}
      <div className="flex gap-2 bg-[var(--surface-1)] px-5 py-4 text-xs leading-5 text-[var(--text-secondary)]">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        Critical security alerts are clearly identified and may require immediate
        attention. The master browser switch always remains under your control.
      </div>

      <div className="px-5 pt-6 pb-2 text-sm font-semibold text-[var(--text-primary)]">
        Frequency and behaviour
      </div>
      <SettingsToggle
        checked={preferences.immediateEnabled}
        description="Send eligible notifications as events happen"
        icon={<CheckCircle2 className="h-5 w-5" />}
        label="Immediate notifications"
        onChange={checked => save({ immediateEnabled: checked })}
      />
      <SettingsToggle
        checked={preferences.groupingEnabled}
        description="Group related notifications to reduce clutter"
        label="Group notifications"
        onChange={checked => save({ groupingEnabled: checked })}
      />
      <SettingsToggle
        checked={preferences.quietHoursEnabled}
        description="Non-critical notifications are delivered silently during this period"
        icon={<Clock3 className="h-5 w-5" />}
        label="Quiet hours"
        onChange={checked => save({ quietHoursEnabled: checked })}
      />
      {preferences.quietHoursEnabled
        ? (
            <div className="grid grid-cols-2 gap-3 px-5 py-4">
              <label className="min-w-0 text-xs font-medium text-[var(--text-secondary)]">
                Start
                <input
                  aria-label="Quiet hours start"
                  className="mt-1 block min-h-10 w-full min-w-0 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-0)] px-2 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--text-primary)] focus:ring-1 focus:ring-[var(--text-primary)] focus:outline-none"
                  type="time"
                  value={preferences.quietHoursStart}
                  onChange={event => save({
                    quietHoursStart: event.target.value,
                  })}
                />
              </label>
              <label className="min-w-0 text-xs font-medium text-[var(--text-secondary)]">
                End
                <input
                  aria-label="Quiet hours end"
                  className="mt-1 block min-h-10 w-full min-w-0 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-0)] px-2 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--text-primary)] focus:ring-1 focus:ring-[var(--text-primary)] focus:outline-none"
                  type="time"
                  value={preferences.quietHoursEnd}
                  onChange={event => save({
                    quietHoursEnd: event.target.value,
                  })}
                />
              </label>
              <div className="col-span-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-[var(--text-muted)]">
                <span className="min-w-0 break-words">
                  Timezone:
                  {' '}
                  {preferences.timezone}
                </span>
                <button
                  className="shrink-0 rounded px-1 py-2 font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] focus-visible:outline-2 focus-visible:outline-offset-2"
                  type="button"
                  onClick={() => save({
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                  })}
                >
                  Use local
                </button>
              </div>
            </div>
          )
        : null}
      <SettingsToggle
        checked={preferences.soundEnabled}
        description="Allow notification sounds outside quiet hours"
        icon={<Volume2 className="h-5 w-5" />}
        label="Sound"
        onChange={checked => save({ soundEnabled: checked })}
      />
      <SettingsToggle
        checked={preferences.detailedPreviewEnabled}
        description="Show notification details on the lock screen and desktop"
        label="Detailed preview content"
        onChange={checked => save({ detailedPreviewEnabled: checked })}
      />
      <SettingsToggle
        checked={preferences.suppressDuplicatesEnabled}
        description="Prevent repeated events from creating duplicate alerts"
        label="Suppress duplicates"
        onChange={checked => save({
          suppressDuplicatesEnabled: checked,
        })}
      />
    </>
  );
}
