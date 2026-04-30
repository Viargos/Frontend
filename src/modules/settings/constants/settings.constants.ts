import type { SettingsSectionModel, SettingsToggleModel } from '@/modules/settings/types/settings.types';
import { SettingsRoute } from '@/modules/settings/enums/settings.enum';

export const SETTINGS_SECTIONS: SettingsSectionModel[] = [
  {
    id: 'account',
    items: [
      {
        description: 'Update your profile information and photo',
        href: SettingsRoute.PROFILE,
        id: 'edit-profile',
        label: 'Edit Profile',
      },
      {
        description: 'Update your password to keep your account secure',
        href: SettingsRoute.CHANGE_PASSWORD,
        id: 'change-password',
        label: 'Change Password',
      },
      {
        description: 'Manage who can see your content',
        id: 'privacy',
        label: 'Privacy',
      },
    ],
    title: 'Account',
  },
  {
    id: 'help',
    items: [
      {
        description: 'Get help with using Viargos',
        id: 'help-center',
        label: 'Help Center',
      },
      {
        description: 'See the latest features and updates',
        id: 'whats-new',
        label: 'What\'s New',
      },
    ],
    title: 'Help & Support',
  },
  {
    id: 'account-actions',
    items: [
      {
        id: 'logout',
        label: 'Log Out',
        tone: 'danger',
      },
      {
        description: 'Permanently delete your account and all data',
        id: 'delete-account',
        label: 'Delete Account',
        tone: 'danger',
      },
    ],
  },
];

export const SETTINGS_TOGGLES: SettingsToggleModel[] = [
  {
    defaultChecked: true,
    description: 'Receive notifications about your activity',
    id: 'push-notifications',
    label: 'Push Notifications',
  },
  {
    defaultChecked: true,
    description: 'Get notified about new messages',
    id: 'message-notifications',
    label: 'Messages',
  },
  {
    defaultChecked: false,
    description: 'Only approved followers can see your content',
    id: 'private-account',
    label: 'Private Account',
  },
];
