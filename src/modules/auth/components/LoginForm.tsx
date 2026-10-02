'use client';

import type { AuthSigninResult } from '@/modules/auth/types/auth.types';
import type { LoginSchemaValues } from '@/modules/auth/validations/auth.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthActions } from '@/modules/auth/hooks/use-auth-actions';
import { toAuthServiceError } from '@/modules/auth/services/auth.errors';
import { loginSchema } from '@/modules/auth/validations/auth.validation';
import { Button, useTheme } from '@/modules/common';

type LoginFormProps = {
  onSuccess: (result: AuthSigninResult) => void;
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
  onErrorChange: (message: string | null) => void;
};

export const LoginForm = (props: LoginFormProps) => {
  const { onErrorChange, onForgotPassword, onSuccess, onSwitchToSignup } = props;
  const { signin } = useAuthActions();
  const { isDark } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

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

  const inputClassName = isDark
    ? 'h-10 w-full rounded-lg border border-[#465060] bg-[#20262f] px-3 text-sm text-[#f6f7fb] placeholder:text-[#8a95a6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8c7ff] disabled:cursor-not-allowed disabled:opacity-50'
    : 'h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50';
  const labelClassName = isDark ? 'mb-1 block text-sm text-[#d8deea]' : 'mb-1 block text-sm text-gray-700';
  const linkClassName = isDark
    ? 'text-[#c7d2fe] transition hover:text-white'
    : 'text-[#160E53] transition hover:text-[#0D0A3D]';
  const submitClassName = isDark
    ? 'w-full bg-[#eef2ff] text-[#111827] hover:bg-[#dbe4ff]'
    : 'w-full';
  const passwordToggleClassName = isDark
    ? 'border-[#596273] bg-transparent text-[#c7d2fe] hover:bg-white/10 hover:text-white'
    : undefined;

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
        <label className={labelClassName} htmlFor="login-email">Email</label>
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
        <label className={labelClassName} htmlFor="login-password">Password</label>
        <div className="flex gap-2">
          <input
            autoComplete="current-password"
            className={inputClassName}
            disabled={isSubmitting}
            id="login-password"
            placeholder="Enter your password"
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
          />
          <Button
            className={passwordToggleClassName}
            disabled={isSubmitting}
            type="button"
            variant="outline"
            onClick={() => setShowPassword(prev => !prev)}
          >
            {showPassword ? 'Hide' : 'Show'}
          </Button>
        </div>
        {errors.password ? <p className="mt-1 text-xs text-red-400">{errors.password.message}</p> : null}
      </div>

      <div className="flex justify-between text-sm">
        <button className={linkClassName} type="button" onClick={onForgotPassword}>
          Forgot password?
        </button>
        <button className={linkClassName} type="button" onClick={onSwitchToSignup}>
          Create account
        </button>
      </div>

      <Button className={submitClassName} disabled={isSubmitting || !email || !password} type="submit" variant="default">
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
};
