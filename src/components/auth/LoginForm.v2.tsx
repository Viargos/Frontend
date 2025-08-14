'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAuthStoreV2 } from '@/store/auth.store.v2';
import Button from '@/components/ui/Button';
import InputField from '@/components/ui/InputField';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export interface LoginFormV2Props {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
  onSwitchToForgotPassword?: () => void;
}

export default function LoginFormV2({
  onSuccess,
  onSwitchToSignup,
  onSwitchToForgotPassword,
}: LoginFormV2Props) {
  const { login, isLoading, error, clearError } = useAuthStoreV2();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    
    try {
      const result = await login(data);
      
      if (result.success) {
        reset();
        onSuccess?.();
      }
      // Error is already handled in the store
    } catch (error) {
      console.error('Login form error:', error);
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
        {error && (
          <motion.div 
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.div>
        )}

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
            disabled={isLoading}
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
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <div className="relative">
            <motion.input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              id="password"
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black transition-all duration-200"
              placeholder="Enter your password"
              disabled={isLoading}
              autoComplete="current-password"
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
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
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

        <motion.div className="flex items-center justify-between" variants={itemVariants}>
          <motion.button
            type="button"
            onClick={onSwitchToForgotPassword}
            className="text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
            disabled={isLoading}
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
              disabled={isLoading || !isValid}
              loading={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
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
              disabled={isLoading}
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
