'use client';

import type { ResetPasswordSchemaValues } from '@/modules/auth/validations/auth.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthActions } from '@/modules/auth/hooks/use-auth-actions';
import { toAuthServiceError } from '@/modules/auth/services/auth.errors';
import { resetPasswordSchema } from '@/modules/auth/validations/auth.validation';
import { Button } from '@/modules/common';

type ResetPasswordFormProps = {
  email: string;
  onSuccess: () => void;
  onSwitchToLogin: () => void;
  onErrorChange: (message: string | null) => void;
};

export const ResetPasswordForm = (props: ResetPasswordFormProps) => {
  const { email, onErrorChange, onSuccess, onSwitchToLogin } = props;
  const { resetPassword } = useAuthActions();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const inputClassName = 'h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50';

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<ResetPasswordSchemaValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (values: ResetPasswordSchemaValues) => {
    onErrorChange(null);

    try {
      await resetPassword({
        email,
        newPassword: values.password,
      });

      onSuccess();
    } catch (error) {
      const normalized = toAuthServiceError(error);
      onErrorChange(normalized.message);
    }
  };

  return (
    <form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
      <p className="text-sm text-gray-600">Enter your new password.</p>

      <div>
        <label className="mb-1 block text-sm text-gray-700" htmlFor="reset-password">New password</label>
        <div className="flex gap-2">
          <input
            autoComplete="new-password"
            className={inputClassName}
            disabled={isSubmitting}
            id="reset-password"
            placeholder="Enter your new password"
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
          />
          <Button type="button" variant="outline" onClick={() => setShowPassword(prev => !prev)}>{showPassword ? 'Hide' : 'Show'}</Button>
        </div>
        {errors.password ? <p className="mt-1 text-xs text-red-400">{errors.password.message}</p> : null}
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-700" htmlFor="reset-confirm-password">Confirm password</label>
        <div className="flex gap-2">
          <input
            autoComplete="new-password"
            className={inputClassName}
            disabled={isSubmitting}
            id="reset-confirm-password"
            placeholder="Confirm your new password"
            type={showConfirmPassword ? 'text' : 'password'}
            {...register('confirmPassword')}
          />
          <Button type="button" variant="outline" onClick={() => setShowConfirmPassword(prev => !prev)}>{showConfirmPassword ? 'Hide' : 'Show'}</Button>
        </div>
        {errors.confirmPassword ? <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p> : null}
      </div>

      <Button className="w-full" disabled={isSubmitting} type="submit" variant="default">
        {isSubmitting ? 'Resetting...' : 'Reset password'}
      </Button>

      <p className="text-center text-sm text-gray-500">
        Remember your password?
        {' '}
        <button className="text-[#160E53] hover:text-[#0D0A3D]" type="button" onClick={onSwitchToLogin}>
          Sign in
        </button>
      </p>
    </form>
  );
};
