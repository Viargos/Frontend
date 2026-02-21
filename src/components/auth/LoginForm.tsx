'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import { AuthApi, ApiError, ApiErrorCode } from '@/lib/api';
import Button from '@/components/ui/Button';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
  onSwitchToForgotPassword?: () => void;
  onSwitchToOtp?: (email: string) => void; // 🔄 NEW: Callback to switch to OTP verification
  onError?: (message: string) => void; // Callback to report errors to parent
  onClearError?: () => void; // Callback to clear errors
}

export default function LoginForm({
  onSuccess,
  onSwitchToSignup,
  onSwitchToForgotPassword,
  onSwitchToOtp,
  onError,
  onClearError,
}: LoginFormProps) {
  const { setUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasHandledVerificationErrorRef = useRef(false); // 🔄 NEW: Prevent duplicate handling

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  // Watch email and password fields for real-time validation
  const email = watch('email') || '';
  const password = watch('password') || '';

  // Form validation based on field content only
  const isFormValid = email.trim().length > 0 && password.trim().length > 0;

  const onSubmit = async (formData: LoginFormData) => {
    onClearError?.();
    hasHandledVerificationErrorRef.current = false;
    setIsSubmitting(true);

    try {
      const data = await AuthApi.signin({
        email: formData.email,
        password: formData.password,
      });

      // Extract user from response (handle different response formats)
      let user: unknown;
      if (data && typeof data === 'object') {
        if ('user' in data && data.user) {
          user = data.user;
        } else if ('data' in data && data.data && typeof data.data === 'object' && 'user' in data.data) {
          user = (data.data as { user?: unknown }).user;
        } else if ('id' in data && 'email' in data) {
          user = data;
        }
      }

      if (!user || typeof user !== 'object' || !('id' in user) || !('email' in user)) {
        onError?.('Invalid response format');
        return;
      }

      setUser(user as Parameters<typeof setUser>[0]);
      reset();
      onSuccess?.();
    } catch (error) {
      if (error instanceof ApiError) {
        // Log full error details for debugging backend error messages
        console.error('[LoginForm] API Error:', {
          code: error.code,
          message: error.message,
          statusCode: error.statusCode,
          details: error.details,
        });

        if (error.is(ApiErrorCode.EMAIL_NOT_VERIFIED)) {
          onSwitchToOtp?.(formData.email);
        } else {
          onError?.(error.getUserMessage());
        }
      } else {
        console.error('[LoginForm] Unexpected error:', error);
        const message =
          error instanceof Error ? error.message : 'An unexpected error occurred';
        onError?.(message);
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
        <p className="text-gray-600">Sign in to your account</p>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <motion.div variants={itemVariants}>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email address
          </label>
          <motion.input
            {...register('email')}
            type="email"
            id="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black transition-all duration-200"
            placeholder="Enter your email"
            disabled={isSubmitting}
            autoComplete="email"
            whileFocus={{ scale: 1.02, borderColor: '#160E53' }}
          />
          {errors.email && (
            <motion.p
              className="mt-1 text-sm text-red-600"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              {errors.email.message}
            </motion.p>
          )}
        </motion.div>

        <motion.div variants={itemVariants}>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <div className="relative">
            <motion.input
              {...register('password')}
              type="password"
              id="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black transition-all duration-200"
              placeholder="Enter your password"
              disabled={isSubmitting}
              autoComplete="current-password"
              whileFocus={{ scale: 1.02, borderColor: '#3B82F6' }}
            />
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

        <motion.div
          className="flex items-center justify-between"
          variants={itemVariants}
        >
          <motion.button
            type="button"
            onClick={onSwitchToForgotPassword}
            className="text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Forgot password?
          </motion.button>
        </motion.div>

        <motion.div variants={itemVariants}>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isSubmitting || !isFormValid}
              loading={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </motion.div>
        </motion.div>

        <motion.div className="text-center" variants={itemVariants}>
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <motion.button
              type="button"
              onClick={onSwitchToSignup}
              className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
              disabled={isSubmitting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign up
            </motion.button>
          </p>
        </motion.div>
      </form>
    </motion.div>
  );
}
