'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Modal from '@/components/ui/Modal';
import LoginFormV2 from './LoginForm.v2';
import SignupFormV2 from './SignupForm.v2';
import OtpVerificationFormV2 from './OtpVerificationForm.v2';
import { useAuthStoreV2 } from '@/store/auth.store.v2';

export type AuthStep = 'login' | 'signup' | 'otp' | 'forgot-password';

export interface AuthModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: AuthStep;
}

export default function AuthModalV2({
  isOpen,
  onClose,
  initialStep = 'login',
}: AuthModalV2Props) {
  const [currentStep, setCurrentStep] = useState<AuthStep>(initialStep);
  const [signupEmail, setSignupEmail] = useState('');
  const { clearError, error } = useAuthStoreV2();

  // Update currentStep when initialStep changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(initialStep);
      clearError(); // Clear any previous errors when opening modal
    }
  }, [isOpen, initialStep, clearError]);

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


  const renderStep = () => {
    console.log('Rendering step:', currentStep); // Debug log
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
        console.log('Rendering SignupFormV2'); // Debug log
        return (
          <SignupFormV2
            onSuccess={(email) => handleSignupSuccess(email)}
            onSwitchToLogin={handleSwitchToLogin}
          />
        );
      case 'otp':
        console.log('Rendering OtpVerificationFormV2 for email:', signupEmail); // Debug log
        return (
          <OtpVerificationFormV2
            email={signupEmail}
            onSuccess={handleOtpSuccess}
            onResendOtp={handleResendOtp}
          />
        );
      case 'forgot-password':
        return (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Forgot Password</h2>
            <p className="text-gray-600 mb-6">
              Forgot password functionality will be implemented soon.
            </p>
            <button
              onClick={handleSwitchToLogin}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Back to Sign In
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (currentStep) {
      case 'login':
        return 'Sign In';
      case 'signup':
        return 'Sign Up';
      case 'otp':
        return 'Verify Email';
      case 'forgot-password':
        return 'Reset Password';
      default:
        return 'Authentication';
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
        {/* Animated close button */}
        <motion.button
          onClick={handleForceClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
          aria-label={`Close ${getModalTitle()} modal`}
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
        
        {/* Animated step content */}
        <motion.div 
          key={currentStep} 
          className="relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {renderStep()}
        </motion.div>
      </motion.div>
    </Modal>
  );
}
