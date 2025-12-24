'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
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
}

export default function LoginForm({
  onSuccess,
  onSwitchToSignup,
  onSwitchToForgotPassword,
  onSwitchToOtp,
}: LoginFormProps) {
  const router = useRouter();
  const { login, isLoading, error, clearError, resendOtp } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const hasHandledVerificationErrorRef = useRef(false); // 🔄 NEW: Prevent duplicate handling

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
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

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    hasHandledVerificationErrorRef.current = false; // Reset flag on new submission
    
    try {
      const result = await login(data);
      
      if (result.success) {
        reset();
        onSuccess?.();
        // Redirect to dashboard after successful login
        router.push('/dashboard');
      } else {
        // 🔄 FIX: Check if error is "Please verify your email address"
        // Check both result.error and store error
        const errorToCheck = result.error || error;
        if (!hasHandledVerificationErrorRef.current) {
          hasHandledVerificationErrorRef.current = true;
          await handleEmailVerificationError(data.email, errorToCheck);
        }
      }
    } catch (error) {
      console.error('Login form error:', error);
      
      // 🔄 FIX: Also check error from store in case it's set there
      const userEmail = getValues('email');
      if (userEmail && !hasHandledVerificationErrorRef.current) {
        hasHandledVerificationErrorRef.current = true;
        // Check both caught error and store error
        const errorToCheck = error || useAuthStore.getState().error;
        await handleEmailVerificationError(userEmail, errorToCheck);
      }
    }
  };

  // 🔄 NEW: Helper function to handle email verification errors
  const handleEmailVerificationError = async (email: string, error: unknown) => {
    const errorMessage = typeof error === 'string' 
      ? error 
      : (error as any)?.message || error || '';
    
    const errorString = String(errorMessage).toLowerCase();
    
    // Check if error indicates email verification is required
    if (
      errorString.includes('verify your email') ||
      errorString.includes('please verify your email address') ||
      errorString.includes('account not active') ||
      errorString.includes('email not verified') ||
      errorString.includes('verify email')
    ) {
      // Send OTP to user's email
      try {
        await resendOtp(email);
        // Navigate to OTP verification form
        onSwitchToOtp?.(email);
      } catch (otpError) {
        // If resend fails, still navigate to OTP (OTP might have been sent during login attempt)
        // The backend generates OTP when login fails, so it should be available
        console.warn('Failed to resend OTP, but navigating to verification:', otpError);
        onSwitchToOtp?.(email);
      }
    }
  };

  // 🔄 NEW: Also check error from store when it changes (in case error is set after async operation)
  useEffect(() => {
    if (error && !hasHandledVerificationErrorRef.current) {
      const errorString = String(error).toLowerCase();
      if (
        errorString.includes('verify your email') ||
        errorString.includes('please verify your email address') ||
        errorString.includes('account not active') ||
        errorString.includes('email not verified') ||
        errorString.includes('verify email')
      ) {
        const userEmail = getValues('email');
        if (userEmail && onSwitchToOtp) {
          hasHandledVerificationErrorRef.current = true; // Mark as handled
          // Automatically navigate to OTP verification
          handleEmailVerificationError(userEmail, error);
        }
      }
    }
    
    // Reset flag when error is cleared
    if (!error) {
      hasHandledVerificationErrorRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

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
              disabled={isLoading || !isFormValid}
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
