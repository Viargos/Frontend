'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '@/components/ui/Modal';
import LoginFormV2 from './LoginForm.v2';
import SignupFormV2 from './SignupForm.v2';
import OtpVerificationFormV2 from './OtpVerificationForm.v2';
import { useAuthStoreV2 } from '@/store/auth.store.v2';

export type AuthStep = 'login' | 'signup' | 'otp' | 'forgot-password';

export interface AnimatedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: AuthStep;
}

export default function AnimatedAuthModal({
  isOpen,
  onClose,
  initialStep = 'login',
}: AnimatedAuthModalProps) {
  const [currentStep, setCurrentStep] = useState<AuthStep>(initialStep);
  const [signupEmail, setSignupEmail] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [direction, setDirection] = useState(0);
  const [prevStep, setPrevStep] = useState<AuthStep>(initialStep);
  const { clearError, error } = useAuthStoreV2();

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

  // Update step when initialStep changes while modal is open
  // But only if we're still on the initial step (don't override programmatic step changes like signup -> otp)
  useEffect(() => {
    if (isOpen && isInitialized && initialStep !== currentStep) {
      // Only update if we're still on the original initial step and it has changed
      // Don't override internal step transitions like signup -> otp
      const allowedTransitions = {
        'login': ['signup'], // Can go from login to signup if initialStep changes
        'signup': ['login'], // Can go from signup to login if initialStep changes
        // Don't allow changes when we're on OTP or other internal states
      };
      
      const currentTransitions = allowedTransitions[currentStep as keyof typeof allowedTransitions] || [];
      if (currentTransitions.includes(initialStep)) {
        setCurrentStep(initialStep);
      }
    }
  }, [isOpen, isInitialized, initialStep, currentStep]);

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
  };

  const handleLoginSuccess = () => {
    handleClose();
  };

  const handleSignupSuccess = (email: string) => {
    setSignupEmail(email);
    setCurrentStep('otp');
  };

  const handleOtpSuccess = () => {
    // After successful OTP verification, user is automatically logged in
    // Close the modal and let the header show the authenticated state
    handleClose();
  };

  const handleResendOtp = async () => {
    try {
      const { resendOtp, clearError } = useAuthStoreV2.getState();
      const result = await resendOtp(signupEmail);
      
      if (result.success) {
        console.log('OTP resent successfully');
        clearError();
      } else {
        console.log('Failed to resend OTP:', result.error);
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
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
    const steps: AuthStep[] = ['login', 'signup', 'otp', 'forgot-password'];
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
          <LoginFormV2
            onSuccess={handleLoginSuccess}
            onSwitchToSignup={handleSwitchToSignup}
            onSwitchToForgotPassword={handleSwitchToForgotPassword}
          />
        );
      case 'signup':
        return (
          <SignupFormV2
            onSuccess={handleSignupSuccess}
            onSwitchToLogin={handleSwitchToLogin}
          />
        );
      case 'otp':
        if (!signupEmail) {
          return (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">Error: No email address available for verification.</p>
              <button
                onClick={() => setCurrentStep('signup')}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Back to Sign Up
              </button>
            </div>
          );
        }
        
        return (
          <OtpVerificationFormV2
            email={signupEmail}
            onSuccess={handleOtpSuccess}
            onResendOtp={handleResendOtp}
          />
        );
      case 'forgot-password':
        return (
          <motion.div 
            className="text-center py-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v-2H7v-2H5l1.257-1.257A6 6 0 0117 7z" />
                </svg>
              </div>
            </motion.div>
            <motion.h2 
              className="text-2xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Forgot Password
            </motion.h2>
            <motion.p 
              className="text-gray-600 mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Forgot password functionality will be implemented soon.
            </motion.p>
            <motion.button
              onClick={handleSwitchToLogin}
              className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Back to Sign In
            </motion.button>
          </motion.div>
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

        {/* Simplified Step Content - NO ANIMATIONS FOR DEBUGGING */}
        <div className="relative">
          <div className="py-4">
            {renderStep()}
          </div>
        </div>
      </motion.div>
    </Modal>
  );
}
