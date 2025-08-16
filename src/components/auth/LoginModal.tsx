'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import LoginForm from './LoginForm';
import { useAuthStore } from '@/store/auth.store';

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
  onSwitchToForgotPassword?: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onSwitchToSignup,
  onSwitchToForgotPassword,
}: LoginModalProps) {
  const router = useRouter();
  const { clearError, error } = useAuthStore();

  // Clear errors when modal opens
  useEffect(() => {
    if (isOpen) {
      clearError();
    }
  }, [isOpen, clearError]);

  const handleClose = () => {
    // Don't close the modal if there's an active error (user should see it)
    if (error) {
      return;
    }
    
    clearError();
    onClose();
  };

  const handleForceClose = () => {
    // Force close and clear everything (for manual close button)
    clearError();
    onClose();
  };

  const handleLoginSuccess = () => {
    clearError();
    onClose();
    // Redirect to dashboard
    router.push('/dashboard');
  };

  const handleSwitchToSignup = () => {
    clearError(); // Clear any login errors when switching
    onSwitchToSignup();
  };

  const handleSwitchToForgotPassword = () => {
    clearError();
    onSwitchToForgotPassword?.();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md">
      <motion.div 
        className="bg-white rounded-xl shadow-xl p-8 w-full relative"
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Close button */}
        <motion.button
          onClick={handleForceClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
          aria-label="Close login modal"
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

        {/* Login Form */}
        <div className="py-4">
          <LoginForm
            onSuccess={handleLoginSuccess}
            onSwitchToSignup={handleSwitchToSignup}
            onSwitchToForgotPassword={handleSwitchToForgotPassword}
          />
        </div>
      </motion.div>
    </Modal>
  );
}
