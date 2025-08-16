'use client';

import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import OtpModal from './OtpModal';
import { useAuthStore } from '@/store/auth.store';

export default function ModalContainer() {
  const {
    activeModal,
    signupEmail,
    closeAllModals,
    switchToLogin,
    switchToSignup,
    switchToOtp,
  } = useAuthStore();

  return (
    <>
      <LoginModal
        isOpen={activeModal === 'login'}
        onClose={closeAllModals}
        onSwitchToSignup={switchToSignup}
        onSwitchToForgotPassword={() => {
          // You can handle forgot password here or create a separate modal
          // For now, we'll just switch to login as a placeholder
          switchToLogin();
        }}
      />

      <SignupModal
        isOpen={activeModal === 'signup'}
        onClose={closeAllModals}
        onSwitchToLogin={switchToLogin}
        onSwitchToOtp={switchToOtp}
      />

      <OtpModal
        isOpen={activeModal === 'otp'}
        onClose={closeAllModals}
        onSwitchToSignup={switchToSignup}
        email={signupEmail}
      />
    </>
  );
}
