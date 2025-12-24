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
import { useAuthStore } from '@/store/auth.store';

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
  const { clearError, error } = useAuthStore();

  // Initialize modal state when it opens
  useEffect(() => {
    if (isOpen && !isInitialized) {
      setCurrentStep(initialStep);
      setPrevStep(initialStep);
      setDirection(0);
      clearError(); // Clear any previous errors when opening modal
      setIsInitialized(true);
    } else if (!isOpen && isInitialized) {
      setIsInitialized(false);
    }
  }, [isOpen, isInitialized, initialStep, clearError]);

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
      // Close the modal and let the header show the authenticated state
      handleClose();
      
      // Redirect to dashboard with a small delay to ensure modal closes
      setTimeout(() => {
        try {
          router.push('/dashboard');
        } catch (error) {
          window.location.href = '/dashboard';
        }
      }, 100);
    }
  };

  const handleResendOtp = async () => {
    try {
      const { resendOtp, forgotPassword, clearError } = useAuthStore.getState();
      const email = isPasswordResetFlow ? passwordResetEmail : signupEmail;
      
      if (isPasswordResetFlow) {
        // For password reset, use forgotPassword to resend OTP
        const result = await forgotPassword(email);
        if (result.success) {
          clearError();
        }
      } else {
        // For signup, use resendOtp
        const result = await resendOtp(email);
        if (result.success) {
          clearError();
        }
      }
    } catch (error) {
      // Error is handled by the store
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
            onSwitchToOtp={handleLoginEmailVerification} // 🔄 NEW: Handle email verification requirement
          />
        );
      case 'signup':
        return (
          <SignupForm
            onSuccess={handleSignupSuccess}
            onSwitchToLogin={handleSwitchToLogin}
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
          />
        );
      case 'forgot-password':
        return (
          <ForgotPasswordForm
            onSuccess={handleForgotPasswordSuccess}
            onSwitchToLogin={handleSwitchToLogin}
          />
        );
      case 'reset-password':
        return (
          <ResetPasswordForm
            onSuccess={handleResetPasswordSuccess}
            onSwitchToLogin={handleSwitchToLogin}
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
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </motion.button>

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
