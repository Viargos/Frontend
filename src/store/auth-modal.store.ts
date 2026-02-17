/**
 * Modal UI Store
 * 
 * Manages authentication modal open/close state.
 * Separate from auth store to maintain separation of concerns:
 * - Auth store: Session state (user, setUser, clearUser)
 * - Modal store: UI state (activeModal, openLogin, openSignup)
 * 
 * @example
 * const { openLogin, closeAllModals } = useAuthModalStore();
 * openLogin(); // Opens login modal
 */

import { create } from 'zustand';

export type ModalType = 'none' | 'login' | 'signup' | 'otp';

interface AuthModalState {
  // Current active modal (none = closed)
  activeModal: ModalType;
  
  // Email for OTP verification flow
  signupEmail: string;

  // Actions
  openLogin: () => void;
  openSignup: () => void;
  openOtp: (email: string) => void;
  closeAllModals: () => void;
  setSignupEmail: (email: string) => void;
}

export const useAuthModalStore = create<AuthModalState>(set => ({
  // Initial state
  activeModal: 'none',
  signupEmail: '',

  // Open login modal
  openLogin: () => {
    set({ activeModal: 'login' });
  },

  // Open signup modal
  openSignup: () => {
    set({ activeModal: 'signup' });
  },

  // Open OTP verification modal
  openOtp: (email: string) => {
    set({ activeModal: 'otp', signupEmail: email });
  },

  // Close all modals
  closeAllModals: () => {
    set({ activeModal: 'none' });
  },

  // Set signup email (for OTP flow)
  setSignupEmail: (email: string) => {
    set({ signupEmail: email });
  },
}));
