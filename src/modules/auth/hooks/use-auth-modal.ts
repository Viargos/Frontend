'use client';

import type { AuthModalState } from '@/modules/auth/types/auth.types';
import { useState } from 'react';
import { AuthStep } from '@/modules/auth/enums/auth-step.enum';

const INITIAL_MODAL_STATE: AuthModalState = {
  error: null,
  isOpen: false,
  isPasswordResetFlow: false,
  passwordResetEmail: '',
  signupEmail: '',
  step: AuthStep.LOGIN,
};

export function useAuthModal() {
  const [state, setState] = useState<AuthModalState>(INITIAL_MODAL_STATE);

  const open = (step: AuthStep = AuthStep.LOGIN) => {
    setState(prev => ({ ...prev, error: null, isOpen: true, step }));
  };

  const close = () => {
    setState(INITIAL_MODAL_STATE);
  };

  const setStep = (step: AuthStep) => {
    setState(prev => ({ ...prev, error: null, step }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const startSignupOtp = (email: string) => {
    setState(prev => ({
      ...prev,
      error: null,
      isPasswordResetFlow: false,
      signupEmail: email,
      step: AuthStep.OTP,
    }));
  };

  const startPasswordResetOtp = (email: string) => {
    setState(prev => ({
      ...prev,
      error: null,
      isPasswordResetFlow: true,
      passwordResetEmail: email,
      step: AuthStep.OTP,
    }));
  };

  const showResetPassword = () => {
    setState(prev => ({ ...prev, error: null, step: AuthStep.RESET_PASSWORD }));
  };

  return {
    close,
    open,
    setError,
    setStep,
    showResetPassword,
    startPasswordResetOtp,
    startSignupOtp,
    state,
  };
}
