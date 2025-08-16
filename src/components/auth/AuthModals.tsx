'use client';

import { AnimatePresence } from 'framer-motion';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import OtpModal from './OtpModal';
import { AuthModalType } from '@/hooks/useAuthModals';

export interface AuthModalsProps {
  activeModal: AuthModalType;
  signupEmail: string;
  onClose: () => void;
  onSwitchToLogin: () => void;
  onSwitchToSignup: () => void;
  onSwitchToOtp: (email: string) => void;
  onSwitchToForgotPassword?: () => void;
}

export default function AuthModals({
  activeModal,
  signupEmail,
  onClose,
  onSwitchToLogin,
  onSwitchToSignup,
  onSwitchToOtp,
  onSwitchToForgotPassword,
}: AuthModalsProps) {
  return (
    <AnimatePresence mode="wait">
      {/* Login Modal */}
      {activeModal === 'login' && (
        <LoginModal
          key="login-modal"
          isOpen={true}
          onClose={onClose}
          onSwitchToSignup={onSwitchToSignup}
          onSwitchToForgotPassword={onSwitchToForgotPassword}
        />
      )}

      {/* Signup Modal */}
      {activeModal === 'signup' && (
        <SignupModal
          key="signup-modal"
          isOpen={true}
          onClose={onClose}
          onSwitchToLogin={onSwitchToLogin}
          onSwitchToOtp={onSwitchToOtp}
        />
      )}

      {/* OTP Modal */}
      {activeModal === 'otp' && (
        <OtpModal
          key="otp-modal"
          isOpen={true}
          onClose={onClose}
          onSwitchToSignup={onSwitchToSignup}
          email={signupEmail}
        />
      )}
    </AnimatePresence>
  );
}
