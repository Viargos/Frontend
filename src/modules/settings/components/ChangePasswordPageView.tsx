import { SETTINGS_FEATURES } from '@/modules/settings/constants';
import { ChangePasswordForm } from './ChangePasswordForm';
import { SettingsHeader } from './SettingsHeader';

export function ChangePasswordPageView() {
  if (!SETTINGS_FEATURES.changePassword) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl">
          <SettingsHeader showBackButton title="Change Password" />
          <div className="bg-white p-6">
            <p className="text-sm text-gray-700">Change Password is currently unavailable. This feature will be enabled when backend support is released.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl">
        <SettingsHeader showBackButton title="Change Password" />
        <ChangePasswordForm />
      </div>
    </div>
  );
}
