'use client';

import type { AuthSigninResult } from '@/modules/auth/types/auth.types';
import type { LoginSchemaValues } from '@/modules/auth/validations/auth.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useAuthActions } from '@/modules/auth/hooks/use-auth-actions';
import { toAuthServiceError } from '@/modules/auth/services/auth.errors';
import { loginSchema } from '@/modules/auth/validations/auth.validation';
import { Button } from '@/modules/common';

type LoginFormProps = {
  onSuccess: (result: AuthSigninResult) => void;
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
  onErrorChange: (message: string | null) => void;
};

export const LoginForm = (props: LoginFormProps) => {
  const { onErrorChange, onForgotPassword, onSuccess, onSwitchToSignup } = props;
  const { signin } = useAuthActions();

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    watch,
  } = useForm<LoginSchemaValues>({
    mode: 'onBlur',
    resolver: zodResolver(loginSchema),
  });

  const email = watch('email') ?? '';
  const password = watch('password') ?? '';

  const inputClassName = 'h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50';

  const onSubmit = async (values: LoginSchemaValues) => {
    onErrorChange(null);

    try {
      const user = await signin(values);
      onSuccess(user);
    } catch (error) {
      const normalized = toAuthServiceError(error);

      if (normalized.code === 'EMAIL_NOT_VERIFIED') {
        onErrorChange('Please verify your email first. Sign up again or contact support.');
        return;
      }

      onErrorChange(normalized.message);
    }
  };

  return (
    <form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="mb-1 block text-sm text-gray-700" htmlFor="login-email">Email</label>
        <input
          autoComplete="email"
          className={inputClassName}
          disabled={isSubmitting}
          id="login-email"
          placeholder="Enter your email"
          type="email"
          {...register('email')}
        />
        {errors.email ? <p className="mt-1 text-xs text-red-400">{errors.email.message}</p> : null}
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-700" htmlFor="login-password">Password</label>
        <input
          autoComplete="current-password"
          className={inputClassName}
          disabled={isSubmitting}
          id="login-password"
          placeholder="Enter your password"
          type="password"
          {...register('password')}
        />
        {errors.password ? <p className="mt-1 text-xs text-red-400">{errors.password.message}</p> : null}
      </div>

      <div className="flex justify-between text-sm">
        <button className="text-[#160E53] hover:text-blue-700" type="button" onClick={onForgotPassword}>
          Forgot password?
        </button>
        <button className="text-[#160E53] hover:text-blue-700" type="button" onClick={onSwitchToSignup}>
          Create account
        </button>
      </div>

      <Button className="w-full" disabled={isSubmitting || !email || !password} type="submit" variant="default">
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
};
