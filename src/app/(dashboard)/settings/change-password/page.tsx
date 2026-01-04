'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import SettingsHeader from '@/components/settings/SettingsHeader';
import InputField from '@/components/ui/InputField';
import Button from '@/components/ui/Button';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement actual password change API call
      // await serviceFactory.authService.changePassword({
      //   currentPassword,
      //   newPassword
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Redirect to settings after success
      setTimeout(() => {
        router.push('/settings');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError('Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-2xl mx-auto">
        <SettingsHeader title="Change Password" showBackButton />

        <div className="p-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-6">
              Make sure your new password is at least 8 characters long and includes a mix of letters, numbers, and symbols.
            </p>

            {error && (
              <motion.div
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Password changed successfully! Redirecting...
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                label="Current Password"
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={setCurrentPassword}
                required
              />

              <InputField
                label="New Password"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={setNewPassword}
                required
              />

              <InputField
                label="Confirm New Password"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                required
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isLoading}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Change Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

