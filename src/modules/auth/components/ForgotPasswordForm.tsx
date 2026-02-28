'use client';

import type { ForgotPasswordSchemaValues } from '@/modules/auth/validations/auth.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useAuthActions } from '@/modules/auth/hooks/use-auth-actions';
import { toAuthServiceError } from '@/modules/auth/services/auth.errors';
import { forgotPasswordSchema } from '@/modules/auth/validations/auth.validation';
import { Button } from '@/modules/common';

type ForgotPasswordFormProps = {
  onSuccess: (email: string) => void;
  onSwitchToLogin: () => void;
  onErrorChange: (message: string | null) => void;
};

export const ForgotPasswordForm = (props: ForgotPasswordFormProps) => {
  const { onErrorChange, onSuccess, onSwitchToLogin } = props;
  const { forgotPassword } = useAuthActions();
  const inputClassName = 'h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50';

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<ForgotPasswordSchemaValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordSchemaValues) => {
    onErrorChange(null);

    try {
      await forgotPassword(values);
      onSuccess(values.email);
    } catch (error) {
      const normalized = toAuthServiceError(error);
      onErrorChange(normalized.message);
    }
  };

  return (
    <form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
      <p className="text-sm text-gray-600">Enter your email address and we&apos;ll send you a reset code.</p>

      <div>
        <label className="mb-1 block text-sm text-gray-700" htmlFor="forgot-email">Email</label>
        <input className={inputClassName} disabled={isSubmitting} id="forgot-email" placeholder="Enter your email" type="email" {...register('email')} />
        {errors.email ? <p className="mt-1 text-xs text-red-400">{errors.email.message}</p> : null}
      </div>

      <Button className="w-full" disabled={isSubmitting} type="submit" variant="default">
        {isSubmitting ? 'Sending...' : 'Send reset code'}
      </Button>

      <p className="text-center text-sm text-gray-500">
        Remember your password?
        {' '}
        <button className="text-[#160E53] hover:text-blue-700" type="button" onClick={onSwitchToLogin}>
          Sign in
        </button>
      </p>
    </form>
  );
};
