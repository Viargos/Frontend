'use client';

import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

export interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  showBackdrop?: boolean;
  backdropOpacity?: number;
  className?: string;
  closeOnBackdropClick?: boolean;
  showCloseButton?: boolean;
}

export default function AnimatedModal({
  isOpen,
  onClose,
  children,
  showBackdrop = true,
  backdropOpacity = 0.4,
  className = '',
  closeOnBackdropClick = true,
  showCloseButton = false,
}: AnimatedModalProps) {
  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        document.body.style.overflow = 'unset';
        document.body.style.position = 'unset';
        document.body.style.top = 'unset';
        document.body.style.width = 'unset';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: backdropOpacity,
      transition: {
        duration: 0.2,
        ease: 'easeOut'
      }
    },
    exit: { 
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: 'easeIn'
      }
    }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: -20,
      transition: {
        duration: 0.2,
        ease: 'easeIn'
      }
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1], // Custom cubic-bezier for smooth entry
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 10,
      transition: {
        duration: 0.2,
        ease: 'easeIn'
      }
    }
  };

  const contentVariants = {
    hidden: { 
      opacity: 0,
      y: 10,
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1,
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  };

  if (!isOpen && typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Backdrop */}
          {showBackdrop && (
            <motion.div
              className="fixed inset-0 bg-black"
              variants={backdropVariants}
              onClick={closeOnBackdropClick ? onClose : undefined}
              aria-hidden="true"
            />
          )}

          {/* Modal Container */}
          <motion.div
            className={`relative z-10 w-full max-w-md mx-auto ${className}`}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Close button */}
            {showCloseButton && (
              <motion.button
                onClick={onClose}
                className="absolute -top-2 -right-2 z-20 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                aria-label="Close modal"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, duration: 0.2 }}
              >
                <svg
                  className="w-4 h-4"
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
            )}

            {/* Content */}
            <motion.div
              variants={contentVariants}
              initial="hidden"
              animate="visible"
            >
              {children}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
