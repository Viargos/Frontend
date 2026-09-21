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
      <div aria-label="Loading notification settings" className="space-y-3 p-4">
        {[0, 1, 2].map(item => (
          <div key={item} className="h-14 animate-pulse rounded-xl bg-slate-100" />
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
      <div className="px-4 py-4">
        <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20">
          <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-[#160E53] dark:text-indigo-300" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Browser notification permission
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
              Viargos asks the browser only after you choose Enable. Notifications
              can arrive while this tab is inactive, as long as the browser is
              running.
            </p>
            <span className="mt-2 inline-flex rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
              {statusLabel}
            </span>
          </div>
        </div>

        {permissionStatus === 'denied'
          ? (
              <div className="mt-3 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
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
              <div className="mt-3 flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
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

      <div className="bg-slate-50 px-4 py-2 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
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
      <div className="flex gap-2 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        Critical security alerts are clearly identified and may require immediate
        attention. The master browser switch always remains under your control.
      </div>

      <div className="bg-slate-50 px-4 py-2 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
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
            <div className="grid grid-cols-2 gap-3 px-4 py-4">
              <label className="text-xs font-medium text-slate-600">
                Start
                <input
                  aria-label="Quiet hours start"
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#160E53] focus:ring-2 focus:ring-indigo-100 focus:outline-none"
                  type="time"
                  value={preferences.quietHoursStart}
                  onChange={event => save({
                    quietHoursStart: event.target.value,
                  })}
                />
              </label>
              <label className="text-xs font-medium text-slate-600">
                End
                <input
                  aria-label="Quiet hours end"
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#160E53] focus:ring-2 focus:ring-indigo-100 focus:outline-none"
                  type="time"
                  value={preferences.quietHoursEnd}
                  onChange={event => save({
                    quietHoursEnd: event.target.value,
                  })}
                />
              </label>
              <div className="col-span-2 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <span className="truncate">
                  Timezone:
                  {' '}
                  {preferences.timezone}
                </span>
                <button
                  className="ml-3 shrink-0 font-semibold text-[#160E53]"
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
