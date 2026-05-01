'use client';

import type { SignupSchemaValues } from '@/modules/auth/validations/auth.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthActions } from '@/modules/auth/hooks/use-auth-actions';
import { toAuthServiceError } from '@/modules/auth/services/auth.errors';
import { signupSchema } from '@/modules/auth/validations/auth.validation';
import { Button } from '@/modules/common';

type SignupFormProps = {
  onSuccess: (email: string) => void;
  onSwitchToLogin: () => void;
  onErrorChange: (message: string | null) => void;
};

const inputClassName = 'h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50';

export const SignupForm = (props: SignupFormProps) => {
  const { onErrorChange, onSuccess, onSwitchToLogin } = props;
  const { signup } = useAuthActions();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<SignupSchemaValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (values: SignupSchemaValues) => {
    onErrorChange(null);

    try {
      await signup({
        email: values.email,
        password: values.password,
        phoneNumber: values.phoneNumber,
        username: values.username,
      });

      onSuccess(values.email);
    } catch (error) {
      const normalized = toAuthServiceError(error);
      onErrorChange(normalized.message);
    }
  };

  return (
    <form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="mb-1 block text-sm text-gray-700" htmlFor="signup-username">Username</label>
        <input className={inputClassName} disabled={isSubmitting} id="signup-username" placeholder="Enter your username" type="text" {...register('username')} />
        {errors.username ? <p className="mt-1 text-xs text-red-400">{errors.username.message}</p> : null}
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-700" htmlFor="signup-email">Email</label>
        <input className={inputClassName} disabled={isSubmitting} id="signup-email" placeholder="Enter your email" type="email" {...register('email')} />
        {errors.email ? <p className="mt-1 text-xs text-red-400">{errors.email.message}</p> : null}
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-700" htmlFor="signup-phone">Phone</label>
        <input className={inputClassName} disabled={isSubmitting} id="signup-phone" placeholder="Optional phone number" type="tel" {...register('phoneNumber')} />
        {errors.phoneNumber ? <p className="mt-1 text-xs text-red-400">{errors.phoneNumber.message}</p> : null}
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-700" htmlFor="signup-password">Password</label>
        <div className="flex gap-2">
          <input className={inputClassName} disabled={isSubmitting} id="signup-password" placeholder="Enter your password" type={showPassword ? 'text' : 'password'} {...register('password')} />
          <Button type="button" variant="outline" onClick={() => setShowPassword(prev => !prev)}>{showPassword ? 'Hide' : 'Show'}</Button>
        </div>
        {errors.password ? <p className="mt-1 text-xs text-red-400">{errors.password.message}</p> : null}
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-700" htmlFor="signup-confirm-password">Confirm Password</label>
        <div className="flex gap-2">
          <input className={inputClassName} disabled={isSubmitting} id="signup-confirm-password" placeholder="Confirm password" type={showConfirmPassword ? 'text' : 'password'} {...register('confirmPassword')} />
          <Button type="button" variant="outline" onClick={() => setShowConfirmPassword(prev => !prev)}>{showConfirmPassword ? 'Hide' : 'Show'}</Button>
        </div>
        {errors.confirmPassword ? <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p> : null}
      </div>

      <Button className="w-full" disabled={isSubmitting} type="submit" variant="default">
        {isSubmitting ? 'Creating account...' : 'Create account'}
      </Button>

      <p className="text-center text-sm text-gray-500">
        Already have an account?
        {' '}
        <button className="text-[#160E53] hover:text-[#0D0A3D]" type="button" onClick={onSwitchToLogin}>
          Sign in
        </button>
      </p>
    </form>
  );
};
