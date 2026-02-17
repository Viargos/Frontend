'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { AuthApi, ApiError, ApiErrorCode } from '@/lib/api';
import Button from '@/components/ui/Button';
import { EyeIcon, EyeOffIcon } from '@/components/icons';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export interface ResetPasswordFormProps {
  email: string; // Required: email from forgot password flow
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  onError?: (message: string) => void; // Callback to report errors to parent
  onClearError?: () => void; // Callback to clear errors
}

export default function ResetPasswordForm({
  email,
  onSuccess,
  onSwitchToLogin,
  onError,
  onClearError,
}: ResetPasswordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (formData: ResetPasswordFormData) => {
    onClearError?.();
    setIsSubmitting(true);

    try {
      await AuthApi.resetPassword({
        email,
        newPassword: formData.password,
      });

      reset();
      onSuccess?.();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.is(ApiErrorCode.INVALID_OTP)) {
          onError?.('Invalid or expired code. Please try again.');
        } else if (error.is(ApiErrorCode.VALIDATION_ERROR)) {
          onError?.(error.message);
        } else {
          onError?.(error.getUserMessage());
        }
      } else {
        onError?.(
          error instanceof Error ? error.message : 'An unexpected error occurred'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants for form elements
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div 
      className="w-full max-w-md mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="text-center mb-8" variants={itemVariants}>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
        <p className="text-gray-600">
          Enter your new password below.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <motion.div variants={itemVariants}>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            New Password
          </label>
          <div className="relative">
            <motion.input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              id="password"
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black transition-all duration-200"
              placeholder="Enter your new password"
              disabled={isSubmitting}
              autoComplete="new-password"
              whileFocus={{ scale: 1.02, borderColor: '#3B82F6' }}
            />
            <motion.button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              tabIndex={-1}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={{ rotate: showPassword ? 0 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </motion.div>
            </motion.button>
          </div>
          {errors.password && (
            <motion.p 
              className="mt-1 text-sm text-red-600"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              {errors.password.message}
            </motion.p>
          )}
        </motion.div>

        <motion.div variants={itemVariants}>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <motion.input
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black transition-all duration-200"
              placeholder="Confirm your new password"
              disabled={isSubmitting}
              autoComplete="new-password"
              whileFocus={{ scale: 1.02, borderColor: '#3B82F6' }}
            />
            <motion.button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              tabIndex={-1}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={{ rotate: showConfirmPassword ? 0 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {showConfirmPassword ? (
                  <EyeOffIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </motion.div>
            </motion.button>
          </div>
          {errors.confirmPassword && (
            <motion.p 
              className="mt-1 text-sm text-red-600"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              {errors.confirmPassword.message}
            </motion.p>
          )}
        </motion.div>

        <motion.div variants={itemVariants}>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isSubmitting || !isValid}
              loading={isSubmitting}
            >
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </Button>
          </motion.div>
        </motion.div>

        <motion.div className="text-center" variants={itemVariants}>
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <motion.button
              type="button"
              onClick={onSwitchToLogin}
              className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
              disabled={isSubmitting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign in
            </motion.button>
          </p>
        </motion.div>
      </form>
    </motion.div>
  );
}











