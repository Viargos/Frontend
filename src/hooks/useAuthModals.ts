'use client';

import { useState, useCallback } from 'react';

export type AuthModalType = 'login' | 'signup' | 'otp' | 'none';

export interface AuthModalsState {
  activeModal: AuthModalType;
  signupEmail: string;
}

export interface AuthModalsActions {
  openLogin: () => void;
  openSignup: () => void;
  openOtp: (email: string) => void;
  closeAll: () => void;
  switchToLogin: () => void;
  switchToSignup: () => void;
  switchToOtp: (email: string) => void;
}

export interface UseAuthModalsReturn extends AuthModalsState, AuthModalsActions {}

export function useAuthModals(initialModal: AuthModalType = 'none'): UseAuthModalsReturn {
  const [activeModal, setActiveModal] = useState<AuthModalType>(initialModal);
  const [signupEmail, setSignupEmail] = useState<string>('');

  const openLogin = useCallback(() => {
    setActiveModal('login');
    setSignupEmail('');
  }, []);

  const openSignup = useCallback(() => {
    setActiveModal('signup');
    setSignupEmail('');
  }, []);

  const openOtp = useCallback((email: string) => {
    setSignupEmail(email);
    setActiveModal('otp');
  }, []);

  const closeAll = useCallback(() => {
    setActiveModal('none');
    setSignupEmail('');
  }, []);

  const switchToLogin = useCallback(() => {
    setActiveModal('login');
  }, []);

  const switchToSignup = useCallback(() => {
    setActiveModal('signup');
  }, []);

  const switchToOtp = useCallback((email: string) => {
    setSignupEmail(email);
    setActiveModal('otp');
  }, []);

  return {
    // State
    activeModal,
    signupEmail,
    // Actions
    openLogin,
    openSignup,
    openOtp,
    closeAll,
    switchToLogin,
    switchToSignup,
    switchToOtp,
  };
}
