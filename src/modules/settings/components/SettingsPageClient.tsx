'use client';

import type { ReactNode } from 'react';
import * as motion from 'framer-motion/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuthSession } from '@/modules/auth';
import { MODAL_SURFACE_BASE_CLASS, MODAL_TRANSITION_DURATION_SECONDS, OVERLAY_BASE_CLASS } from '@/modules/common/constants';
import { EditProfileModal } from '@/modules/settings/components/EditProfileModal';
import { SettingsHeader } from '@/modules/settings/components/SettingsHeader';
import { SettingsItem } from '@/modules/settings/components/SettingsItem';
import { SettingsSection } from '@/modules/settings/components/SettingsSection';
import { SettingsToggle } from '@/modules/settings/components/SettingsToggle';
import { SETTINGS_FEATURES, SETTINGS_LINK_AVAILABILITY } from '@/modules/settings/constants';
import { useSettings } from '@/modules/settings/hooks/use-settings';

const SettingsGlyphIcon = (props: { label: string }) => {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-5 w-5 items-center justify-center text-xs font-semibold"
    >
      {props.label}
    </span>
  );
};

export const SettingsPageClient = () => {
  const router = useRouter();
  const { session, signOut } = useAuthSession();
  const { setToggle, toggles } = useSettings();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const emailLabel = session.user?.email ?? 'Not set';
  const emailVerificationLabel = session.user?.email ? 'Verified' : '';
  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };
  const emailRightContent = (
    <span className="text-sm text-gray-500">
      {emailVerificationLabel}
    </span>
  );
  const comingSoonNode = <span className="text-xs font-medium text-gray-500">Soon</span>;
  const logoutModal = isLogoutOpen
    ? (
        <div className={OVERLAY_BASE_CLASS}>
          <div
            aria-hidden="true"
            className="absolute inset-0"
            onClick={() => setIsLogoutOpen(false)}
          />
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            aria-labelledby="logout-dialog-title"
            aria-modal="true"
            className={`${MODAL_SURFACE_BASE_CLASS} relative mx-4 max-h-[90vh] max-w-md overflow-y-auto`}
            initial={{ opacity: 0, y: 12 }}
            role="dialog"
            transition={{ duration: MODAL_TRANSITION_DURATION_SECONDS }}
          >
            <div className="p-6">
              <h2 className="mb-2 text-xl font-semibold text-gray-900" id="logout-dialog-title">Log Out</h2>
              <p className="mb-6 text-gray-600">Are you sure you want to log out?</p>
              <div className="flex justify-end gap-3">
                <button
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  type="button"
                  onClick={() => setIsLogoutOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="rounded-lg border border-red-600 bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                  type="button"
                  onClick={async () => {
                    setIsLogoutOpen(false);
                    await handleLogout();
                  }}
                >
                  Log Out
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )
    : null;

  const getToggleValue = (id: string, defaultValue: boolean) => {
    const existingToggle = toggles.find(toggle => toggle.id === id);
    return existingToggle?.checked ?? defaultValue;
  };

  const buildIcon = (label: string): ReactNode => <SettingsGlyphIcon label={label} />;

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mx-auto max-w-2xl">
        <SettingsHeader title="Settings" />

        <div className="space-y-6 py-4">
          <SettingsSection title="Account">
            <SettingsItem
              icon={buildIcon('U')}
              label="Edit Profile"
              description="Update your profile information and photo"
              onClick={() => setIsEditProfileOpen(true)}
            />
            <SettingsItem
              icon={buildIcon('K')}
              label="Change Password"
              description={SETTINGS_FEATURES.changePassword ? 'Update your password to keep your account secure' : 'Coming soon'}
              disabled={!SETTINGS_FEATURES.changePassword}
              href={SETTINGS_FEATURES.changePassword ? '/settings/change-password' : undefined}
              rightContent={SETTINGS_FEATURES.changePassword ? undefined : comingSoonNode}
            />
            <SettingsItem
              icon={buildIcon('M')}
              label="Email"
              description={emailLabel}
              rightContent={emailRightContent}
            />
            <SettingsItem
              icon={buildIcon('P')}
              label="Phone Number"
              description="Not set"
            />
          </SettingsSection>

          <SettingsSection title="Privacy & Security">
            <SettingsItem
              icon={buildIcon('L')}
              label="Privacy"
              description="Coming soon"
              disabled={!SETTINGS_LINK_AVAILABILITY.privacy}
              href={SETTINGS_LINK_AVAILABILITY.privacy ? '/settings/privacy' : undefined}
              rightContent={comingSoonNode}
            />
            <SettingsToggle
              icon={buildIcon('E')}
              label="Private Account"
              description="Only approved followers can see your content"
              checked={getToggleValue('private-account', false)}
              onChange={checked => setToggle('private-account', checked)}
            />
            <SettingsItem
              icon={buildIcon('B')}
              label="Blocked Accounts"
              description="Coming soon"
              disabled={!SETTINGS_LINK_AVAILABILITY.blockedAccounts}
              href={SETTINGS_LINK_AVAILABILITY.blockedAccounts ? '/settings/blocked' : undefined}
              rightContent={comingSoonNode}
            />
          </SettingsSection>

          <SettingsSection title="Notifications">
            <SettingsToggle
              icon={buildIcon('N')}
              label="Push Notifications"
              description="Receive notifications about your activity"
              checked={getToggleValue('push-notifications', true)}
              onChange={checked => setToggle('push-notifications', checked)}
            />
            <SettingsToggle
              icon={buildIcon('M')}
              label="Email Notifications"
              description="Get updates via email"
              checked={getToggleValue('email-notifications', true)}
              onChange={checked => setToggle('email-notifications', checked)}
            />
            <SettingsToggle
              icon={buildIcon('H')}
              label="Likes & Comments"
              description="Get notified when someone likes or comments"
              checked={getToggleValue('likes-comments', true)}
              onChange={checked => setToggle('likes-comments', checked)}
            />
            <SettingsToggle
              icon={buildIcon('C')}
              label="Messages"
              description="Get notified about new messages"
              checked={getToggleValue('message-notifications', true)}
              onChange={checked => setToggle('message-notifications', checked)}
            />
            <SettingsToggle
              icon={buildIcon('F')}
              label="New Followers"
              description="Get notified when someone follows you"
              checked={getToggleValue('new-followers', true)}
              onChange={checked => setToggle('new-followers', checked)}
            />
          </SettingsSection>

          <SettingsSection title="Preferences">
            <SettingsItem
              icon={buildIcon('T')}
              label="Theme"
              description="Coming soon"
              disabled={!SETTINGS_LINK_AVAILABILITY.theme}
              href={SETTINGS_LINK_AVAILABILITY.theme ? '/settings/theme' : undefined}
              rightContent={comingSoonNode}
            />
            <SettingsItem
              icon={buildIcon('L')}
              label="Language"
              description="Coming soon"
              disabled={!SETTINGS_LINK_AVAILABILITY.language}
              href={SETTINGS_LINK_AVAILABILITY.language ? '/settings/language' : undefined}
              rightContent={comingSoonNode}
            />
          </SettingsSection>

          <SettingsSection title="Help & Support">
            <SettingsItem
              icon={buildIcon('?')}
              label="Help Center"
              description="Coming soon"
              disabled={!SETTINGS_LINK_AVAILABILITY.helpCenter}
              href={SETTINGS_LINK_AVAILABILITY.helpCenter ? '/help' : undefined}
              rightContent={comingSoonNode}
            />
            <SettingsItem
              icon={buildIcon('M')}
              label="Contact Us"
              description="Coming soon"
              disabled={!SETTINGS_LINK_AVAILABILITY.contact}
              href={SETTINGS_LINK_AVAILABILITY.contact ? '/contact' : undefined}
              rightContent={comingSoonNode}
            />
            <SettingsItem
              icon={buildIcon('I')}
              label="Terms of Service"
              description="Coming soon"
              disabled={!SETTINGS_LINK_AVAILABILITY.termsOfService}
              href={SETTINGS_LINK_AVAILABILITY.termsOfService ? '/terms' : undefined}
              rightContent={comingSoonNode}
            />
            <SettingsItem
              icon={buildIcon('I')}
              label="Privacy Policy"
              description="Coming soon"
              disabled={!SETTINGS_LINK_AVAILABILITY.privacyPolicy}
              href={SETTINGS_LINK_AVAILABILITY.privacyPolicy ? '/privacy' : undefined}
              rightContent={comingSoonNode}
            />
          </SettingsSection>

          <SettingsSection title="About">
            <SettingsItem
              icon={buildIcon('I')}
              label="App Version"
              description="1.0.0"
              rightContent={null}
            />
            <SettingsItem
              icon={buildIcon('I')}
              label="What's New"
              description="Coming soon"
              disabled={!SETTINGS_LINK_AVAILABILITY.whatsNew}
              href={SETTINGS_LINK_AVAILABILITY.whatsNew ? '/whats-new' : undefined}
              rightContent={comingSoonNode}
            />
          </SettingsSection>

          <SettingsSection>
            <SettingsItem
              icon={buildIcon('O')}
              label="Log Out"
              variant="danger"
              onClick={() => setIsLogoutOpen(true)}
            />
          </SettingsSection>

          <SettingsSection>
            <SettingsItem
              icon={buildIcon('D')}
              label="Delete Account"
              description="Coming soon"
              variant="danger"
              disabled={!SETTINGS_LINK_AVAILABILITY.deleteAccount}
              href={SETTINGS_LINK_AVAILABILITY.deleteAccount ? '/settings/delete-account' : undefined}
              rightContent={comingSoonNode}
            />
          </SettingsSection>

          <div className="px-4 pb-8 text-center text-xs text-gray-400">
            <p> 2026 Viargos. All rights reserved.</p>
            <p className="mt-1">Made with love for travelers</p>
          </div>
        </div>
      </div>

      {logoutModal}

      {isEditProfileOpen
        ? (
            <EditProfileModal onClose={() => setIsEditProfileOpen(false)} />
          )
        : null}
    </motion.div>
  );
};
