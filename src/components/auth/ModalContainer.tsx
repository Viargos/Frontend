'use client';

import AuthModal from './AuthModal';
import { useAuthModalStore } from '@/store/auth-modal.store';

export default function ModalContainer() {
  const {
    activeModal,
    closeAllModals,
  } = useAuthModalStore();

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
