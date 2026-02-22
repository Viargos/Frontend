'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import OtpVerificationForm from './OtpVerificationForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import ResetPasswordForm from './ResetPasswordForm';
import { CloseIcon } from '@/components/icons';

export type AuthStep = 'login' | 'signup' | 'otp' | 'forgot-password' | 'reset-password';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: AuthStep;
}

export default function AuthModal({
  isOpen,
  onClose,
  initialStep = 'login',
}: AuthModalProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<AuthStep>(initialStep);
  const [signupEmail, setSignupEmail] = useState('');
  const [passwordResetEmail, setPasswordResetEmail] = useState('');
  const [isPasswordResetFlow, setIsPasswordResetFlow] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [direction, setDirection] = useState(0);
  const [prevStep, setPrevStep] = useState<AuthStep>(initialStep);
  
  // Local error state - owned by AuthModal
  const [error, setError] = useState<string | null>(null);
  
  // Error management functions
  const clearError = () => {
    setError(null);
  };
  
  const handleError = (message: string) => {
    setError(message);
  };

  /**
   * Gets stored redirect destination from sessionStorage
   * Validates and returns safe redirect path, or default
   */
  const getStoredRedirect = (): string => {
    try {
      const stored = sessionStorage.getItem('viargos_redirect_after_login');
      if (stored && isValidRedirect(stored)) {
        return stored;
      }
    } catch (error) {
      // sessionStorage might be disabled, ignore
    }
    return '/dashboard'; // Default redirect
  };

  /**
   * Clears stored redirect from sessionStorage
   */
  const clearStoredRedirect = (): void => {
    try {
      sessionStorage.removeItem('viargos_redirect_after_login');
    } catch (error) {
      // sessionStorage might be disabled, ignore
    }
  };

  /**
   * Validates redirect path for security
   * Prevents open redirect vulnerabilities
   */
  const isValidRedirect = (path: string): boolean => {
    if (!path) return false;
    
    // Must start with / (relative path only)
    if (!path.startsWith('/')) return false;
    
    // Must NOT contain :// (no absolute URLs)
    if (path.includes('://')) return false;
    
    // Must NOT start with javascript:, data:, etc.
    if (/^(javascript|data|vbscript|file):/i.test(path)) return false;
    
    return true;
  };

  /**
   * Navigates to redirect destination or default
   * Clears stored redirect after navigation
   */
  const navigateAfterAuth = (): void => {
    const redirectPath = getStoredRedirect();
    clearStoredRedirect();
    
    // Small delay to ensure modal closes smoothly
    setTimeout(() => {
      try {
        router.push(redirectPath);
      } catch (error) {
        // Fallback to default if navigation fails
        console.error('Navigation failed:', error);
        router.push('/dashboard');
      }
    }, 100);
  };

  // Initialize modal state when it opens
  useEffect(() => {
    if (isOpen && !isInitialized) {
      setCurrentStep(initialStep);
      setPrevStep(initialStep);
      setDirection(0);
      setError(null); // Clear any previous errors when opening modal
      setIsInitialized(true);
    } else if (!isOpen && isInitialized) {
      setIsInitialized(false);
    }
  }, [isOpen, isInitialized, initialStep]);

  // Only sync with initialStep when modal first opens, not during internal navigation
  useEffect(() => {
    if (isOpen && !isInitialized) {
      setCurrentStep(initialStep);
    }
  }, [isOpen, isInitialized, initialStep]);

  const handleClose = () => {
    // Don't close the modal if there's an active error
    if (error) {
      return;
    }

    resetModalState();
    onClose();
  };

  const handleForceClose = () => {
    // Force close and clear everything (for manual close button)
    resetModalState();
    onClose();
  };

  const resetModalState = () => {
    clearError();
    setCurrentStep(initialStep);
    setSignupEmail('');
    setPasswordResetEmail('');
    setIsPasswordResetFlow(false);
  };

  const handleLoginSuccess = () => {
    handleClose();
    // Navigate to stored redirect destination or default
    navigateAfterAuth();
  };

  const handleSignupSuccess = (email: string) => {
    setSignupEmail(email);
    setCurrentStep('otp');
  };

  const handleOtpSuccess = () => {
    if (isPasswordResetFlow) {
      // For password reset flow, go to reset password form
      setCurrentStep('reset-password');
    } else {
      // After successful OTP verification for signup, user is automatically logged in
      // Close the modal and navigate to stored redirect or default
      handleClose();
      navigateAfterAuth();
    }
  };

  const handleResendOtp = async () => {
    try {
      // Note: Resend OTP should be handled by OtpVerificationForm component
      // This handler is kept for backward compatibility but may need to be updated
      // when OtpVerificationForm is migrated to use server actions
      clearError();
    } catch {
      // Error handling will be done by the form component via onError callback
    }
  };

  const handleSwitchToSignup = () => {
    clearError(); // Clear any login errors when switching to signup
    setCurrentStep('signup');
  };

  const handleSwitchToLogin = () => {
    clearError(); // Clear any signup errors when switching to login
    setCurrentStep('login');
  };

  const handleSwitchToForgotPassword = () => {
    clearError();
    setCurrentStep('forgot-password');
    setIsPasswordResetFlow(false);
  };

  // 🔄 NEW: Handle email verification requirement from login
  const handleLoginEmailVerification = (email: string) => {
    setSignupEmail(email);
    setIsPasswordResetFlow(false); // This is email verification, not password reset
    setCurrentStep('otp');
    clearError(); // Clear login error when switching to OTP
  };

  const handleForgotPasswordSuccess = (email: string) => {
    setPasswordResetEmail(email);
    setIsPasswordResetFlow(true);
    setCurrentStep('otp');
  };

  const handleResetPasswordSuccess = () => {
    // After successful password reset, redirect to login
    resetModalState();
    setCurrentStep('login');
    // Show success message or close modal
    setTimeout(() => {
      handleClose();
    }, 500);
  };

  // Animation variants for step transitions
  const stepVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30,
      },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.8,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30,
      },
    }),
  };

  // Determine direction for slide animation
  const getStepIndex = (step: AuthStep): number => {
    const steps: AuthStep[] = ['login', 'signup', 'otp', 'forgot-password', 'reset-password'];
    return steps.indexOf(step);
  };

  useEffect(() => {
    if (prevStep !== currentStep) {
      const newIndex = getStepIndex(currentStep);
      const oldIndex = getStepIndex(prevStep);
      setDirection(newIndex - oldIndex);
      setPrevStep(currentStep);
    }
  }, [currentStep, prevStep]);

  const renderStep = () => {
    switch (currentStep) {
      case 'login':
        return (
          <LoginForm
            onSuccess={handleLoginSuccess}
            onSwitchToSignup={handleSwitchToSignup}
            onSwitchToForgotPassword={handleSwitchToForgotPassword}
            onSwitchToOtp={handleLoginEmailVerification}
            onError={handleError}
            onClearError={clearError}
          />
        );
      case 'signup':
        return (
          <SignupForm
            onSuccess={handleSignupSuccess}
            onSwitchToLogin={handleSwitchToLogin}
            onError={handleError}
            onClearError={clearError}
          />
        );
      case 'otp':
        const otpEmail = isPasswordResetFlow ? passwordResetEmail : signupEmail;
        if (!otpEmail) {
          return (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">Error: No email address available for verification.</p>
              <button
                onClick={() => setCurrentStep(isPasswordResetFlow ? 'forgot-password' : 'signup')}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                {isPasswordResetFlow ? 'Back to Forgot Password' : 'Back to Sign Up'}
              </button>
            </div>
          );
        }

        return (
          <OtpVerificationForm
            email={otpEmail}
            onSuccess={handleOtpSuccess}
            onResendOtp={handleResendOtp}
            isPasswordReset={isPasswordResetFlow}
            onError={handleError}
            onClearError={clearError}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPasswordForm
            onSuccess={handleForgotPasswordSuccess}
            onSwitchToLogin={handleSwitchToLogin}
            onError={handleError}
            onClearError={clearError}
          />
        );
      case 'reset-password':
        if (!passwordResetEmail) {
          return (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">Error: No email address available for password reset.</p>
              <button
                onClick={() => setCurrentStep('forgot-password')}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Back to Forgot Password
              </button>
            </div>
          );
        }
        return (
          <ResetPasswordForm
            email={passwordResetEmail}
            onSuccess={handleResetPasswordSuccess}
            onSwitchToLogin={handleSwitchToLogin}
            onError={handleError}
            onClearError={clearError}
          />
        );
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading...</p>
          </div>
        );
    }
  };



  return (
    <Modal isOpen={isOpen} onClose={handleClose} showBackdrop={false}>
      <motion.div
        className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md mx-auto relative"
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Animated close button - keeping original styling */}
        <motion.button
          onClick={handleForceClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
          aria-label={`Close modal`}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.2 }}
        >
          <CloseIcon className="w-6 h-6" />
        </motion.button>

        {/* Error Display */}
        {error && (
          <motion.div
            className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={clearError}
                className="ml-4 text-red-500 hover:text-red-700 focus:outline-none"
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}

        {/* Animated Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={stepVariants}
            custom={direction}
            initial="enter"
            animate="center"
            exit="exit"
            className="relative"
          >
            <div className="py-4">
              {renderStep()}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </Modal>
  );
}
