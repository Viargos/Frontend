'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/hooks/auth/use-logout';
import { SettingsHeader, SettingsSection, SettingsItem, SettingsToggle } from '@/components/settings';
import { Modal } from '@/components/ui';
import {
  UserProfileIcon,
  KeyIcon,
  MailIcon,
  PhoneIcon,
  LockIcon,
  EyeOffIcon,
  BanIcon,
  BellIcon,
  HeartIcon,
  MessageSquareIcon,
  UserPlusIcon,
  ThemeIcon,
  LanguageIcon,
  HelpCircleIcon,
  FileTextIcon,
  InfoIcon,
  ClockIcon,
  LogoutIcon,
  TrashIcon,
} from '@/components/icons';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { logout } = useLogout();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout(); // logoutAction will handle redirect
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-2xl mx-auto">
        <SettingsHeader title="Settings" />

        <div className="py-4 space-y-6">
          {/* Account Section */}
          <SettingsSection title="Account">
            <SettingsItem
              icon={<UserProfileIcon className="w-5 h-5" />}
              label="Edit Profile"
              description="Update your profile information and photo"
              href="/profile"
            />
            <SettingsItem
              icon={<KeyIcon className="w-5 h-5" />}
              label="Change Password"
              description="Update your password to keep your account secure"
              href="/settings/change-password"
            />
            <SettingsItem
              icon={<MailIcon className="w-5 h-5" />}
              label="Email"
              description={user?.email || 'Not set'}
              rightContent={
                <span className="text-sm text-gray-500">
                  {user?.email ? 'Verified' : ''}
                </span>
              }
            />
            {user?.phoneNumber && (
              <SettingsItem
                icon={<PhoneIcon className="w-5 h-5" />}
                label="Phone Number"
                description={user.phoneNumber}
              />
            )}
          </SettingsSection>

          {/* Privacy & Security Section */}
          <SettingsSection title="Privacy & Security">
            <SettingsItem
              icon={<LockIcon className="w-5 h-5" />}
              label="Privacy"
              description="Manage who can see your content"
              href="/settings/privacy"
            />
            <SettingsToggle
              icon={<EyeOffIcon className="w-5 h-5" />}
              label="Private Account"
              description="Only approved followers can see your content"
              defaultChecked={false}
            />
            <SettingsItem
              icon={<BanIcon className="w-5 h-5" />}
              label="Blocked Accounts"
              description="Manage blocked users"
              href="/settings/blocked"
            />
          </SettingsSection>

          {/* Notifications Section */}
          <SettingsSection title="Notifications">
            <SettingsToggle
              icon={<BellIcon className="w-5 h-5" />}
              label="Push Notifications"
              description="Receive notifications about your activity"
              defaultChecked={true}
            />
            <SettingsToggle
              icon={<MailIcon className="w-5 h-5" />}
              label="Email Notifications"
              description="Get updates via email"
              defaultChecked={true}
            />
            <SettingsToggle
              icon={<HeartIcon className="w-5 h-5" />}
              label="Likes & Comments"
              description="Get notified when someone likes or comments"
              defaultChecked={true}
            />
            <SettingsToggle
              icon={<MessageSquareIcon className="w-5 h-5" />}
              label="Messages"
              description="Get notified about new messages"
              defaultChecked={true}
            />
            <SettingsToggle
              icon={<UserPlusIcon className="w-5 h-5" />}
              label="New Followers"
              description="Get notified when someone follows you"
              defaultChecked={true}
            />
          </SettingsSection>

          {/* Preferences Section */}
          <SettingsSection title="Preferences">
            <SettingsItem
              icon={<ThemeIcon className="w-5 h-5" />}
              label="Theme"
              description="Light"
              href="/settings/theme"
            />
            <SettingsItem
              icon={<LanguageIcon className="w-5 h-5" />}
              label="Language"
              description="English"
              href="/settings/language"
            />
          </SettingsSection>

          {/* Help & Support Section */}
          <SettingsSection title="Help & Support">
            <SettingsItem
              icon={<HelpCircleIcon className="w-5 h-5" />}
              label="Help Center"
              description="Get help with using Viargos"
              href="/help"
            />
            <SettingsItem
              icon={<MailIcon className="w-5 h-5" />}
              label="Contact Us"
              description="Send us a message"
              href="/contact"
            />
            <SettingsItem
              icon={<FileTextIcon className="w-5 h-5" />}
              label="Terms of Service"
              href="/terms"
            />
            <SettingsItem
              icon={<FileTextIcon className="w-5 h-5" />}
              label="Privacy Policy"
              href="/privacy"
            />
          </SettingsSection>

          {/* About Section */}
          <SettingsSection title="About">
            <SettingsItem
              icon={<InfoIcon className="w-5 h-5" />}
              label="App Version"
              description="1.0.0"
              rightContent={null}
            />
            <SettingsItem
              icon={<ClockIcon className="w-5 h-5" />}
              label="What's New"
              description="See the latest features and updates"
              href="/whats-new"
            />
          </SettingsSection>

          {/* Logout Section */}
          <SettingsSection>
            <SettingsItem
              icon={<LogoutIcon className="w-5 h-5" />}
              label="Log Out"
              variant="danger"
              onClick={() => setShowLogoutModal(true)}
            />
          </SettingsSection>

          {/* Account Deletion Section */}
          <SettingsSection>
            <SettingsItem
              icon={<TrashIcon className="w-5 h-5" />}
              label="Delete Account"
              description="Permanently delete your account and all data"
              variant="danger"
              href="/settings/delete-account"
            />
          </SettingsSection>

          {/* Footer Info */}
          <div className="text-center text-xs text-gray-400 pb-8 px-4">
            <p>© 2026 Viargos. All rights reserved.</p>
            <p className="mt-1">Made with ❤️ for travelers</p>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)}>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Log Out
          </h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to log out?
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}

