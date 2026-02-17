'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { AuthApi, ApiError, ApiErrorCode } from '@/lib/api';
import Button from '@/components/ui/Button';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export interface ForgotPasswordFormProps {
  onSuccess?: (email: string) => void;
  onSwitchToLogin?: () => void;
  onError?: (message: string) => void; // Callback to report errors to parent
  onClearError?: () => void; // Callback to clear errors
}

export default function ForgotPasswordForm({
  onSuccess,
  onSwitchToLogin,
  onError,
  onClearError,
}: ForgotPasswordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (formData: ForgotPasswordFormData) => {
    onClearError?.();
    setIsSubmitting(true);

    try {
      await AuthApi.forgotPassword({ email: formData.email });

      reset();
      onSuccess?.(formData.email);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.is(ApiErrorCode.NOT_FOUND)) {
          onError?.('Email not found. Please check and try again.');
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
        <p className="text-gray-600">
          Enter your email address and we&apos;ll send you a code to reset your password.
        </p>
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
            whileFocus={{ scale: 1.02, borderColor: '#3B82F6' }}
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
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isSubmitting || !isValid}
              loading={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Code'}
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











