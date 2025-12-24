'use client';

import AuthModal from './AuthModal';
import { useAuthStore } from '@/store/auth.store';

export default function ModalContainer() {
  const {
    activeModal,
    closeAllModals,
  } = useAuthStore();

  // Map auth store modal types to AuthModal steps
  const getInitialStep = (): 'login' | 'signup' | 'otp' => {
    switch (activeModal) {
      case 'signup':
        return 'signup';
      case 'otp':
        return 'otp';
      case 'login':
      default:
        return 'login';
    }
  };

  return (
    <AuthModal
      isOpen={activeModal !== 'none'}
      onClose={closeAllModals}
      initialStep={getInitialStep()}
    />
  );
}
