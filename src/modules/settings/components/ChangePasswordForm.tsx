'use client';

import { Button, Input } from '@/modules/common';
import { useChangePassword } from '@/modules/settings/hooks/use-change-password';

export const ChangePasswordForm = () => {
  const {
    confirmPassword,
    currentPassword,
    error,
    isSubmitting,
    newPassword,
    setConfirmPassword,
    setCurrentPassword,
    setNewPassword,
    submit,
    success,
  } = useChangePassword();

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submit();
  };

  return (
    <div className="mx-auto max-w-2xl bg-white">
      <div className="space-y-4 p-4">
        <p className="text-sm text-gray-600">
          Make sure your new password is at least 8 characters long and includes a mix of letters and numbers.
        </p>

        {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        {success ? <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

        <form className="space-y-3" onSubmit={onSubmit}>
          <Input
            placeholder="Current password"
            type="password"
            value={currentPassword}
            onChange={event => setCurrentPassword(event.target.value)}
          />
          <Input placeholder="New password" type="password" value={newPassword} onChange={event => setNewPassword(event.target.value)} />
          <Input
            placeholder="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={event => setConfirmPassword(event.target.value)}
          />

          <div className="pt-2">
            <Button disabled={isSubmitting} type="submit">Change Password</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
