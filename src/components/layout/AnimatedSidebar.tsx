'use client';

import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

export interface AnimatedSidebarProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  position?: 'left' | 'right';
  width?: string;
  showOnDesktop?: boolean;
  desktopBreakpoint?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function AnimatedSidebar({
  children,
  isOpen,
  onClose,
  title = 'Menu',
  position = 'left',
  width = 'w-64',
  showOnDesktop = true,
  desktopBreakpoint = 'lg',
}: AnimatedSidebarProps) {
  const breakpointClass = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
  }[desktopBreakpoint];

  // Handle body scroll lock when mobile sidebar is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        // Use empty string instead of 'unset' for better browser compatibility
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);
  
  // Ensure cleanup on unmount to prevent stuck states
  useEffect(() => {
    return () => {
      // Final cleanup to ensure body styles are reset
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, []);

  // Close sidebar on window resize if switching to desktop
  useEffect(() => {
    const handleResize = () => {
      const breakpoints = {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
      };
      
      if (window.innerWidth >= breakpoints[desktopBreakpoint]) {
        onClose();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [desktopBreakpoint, onClose]);

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
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

  const sidebarVariants = {
    hidden: {
      x: position === 'left' ? '-100%' : '100%',
      transition: {
        type: 'tween',
        duration: 0.3,
        ease: 'easeInOut'
      }
    },
    visible: {
      x: 0,
      transition: {
        type: 'tween',
        duration: 0.3,
        ease: 'easeInOut'
      }
    },
    exit: {
      x: position === 'left' ? '-100%' : '100%',
      transition: {
        type: 'tween',
        duration: 0.25,
        ease: 'easeInOut'
      }
    }
  };

  const contentVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.95,
    },
    visible: { 
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.1,
        duration: 0.2,
        ease: 'easeOut'
      }
    }
  };

  const sidebarContent = (
    <motion.div 
      className={`bg-white shadow-2xl h-full ${width} flex flex-col relative z-10`}
      variants={contentVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header with close button animation */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <motion.h2 
          className="text-lg font-semibold text-gray-900"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.2 }}
        >
          {title}
        </motion.h2>
        <motion.button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
          aria-label="Close sidebar"
          whileHover={{ scale: 1.05, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, rotate: -90 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ delay: 0.25, duration: 0.2 }}
        >
          <svg
            className="w-5 h-5"
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
      </div>

      {/* Content with stagger animation */}
      <motion.div 
        className="flex-1 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      {showOnDesktop && (
        <div className={`hidden ${breakpointClass}:block ${width} bg-gray-100 min-h-screen flex-shrink-0`}>
          {children}
        </div>
      )}

      {/* Mobile Sidebar with AnimatePresence for exit animations */}
      {typeof window !== 'undefined' && createPortal(
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div 
              className={`fixed inset-0 z-50 ${breakpointClass}:hidden`}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Animated Backdrop */}
              <motion.div
                className="fixed inset-0 bg-[#00000052]"
                variants={backdropVariants}
                onClick={onClose}
                aria-hidden="true"
              />
              
              {/* Animated Sidebar */}
              <motion.div 
                className={`fixed top-0 ${position === 'left' ? 'left-0' : 'right-0'} bottom-0 z-10`}
                variants={sidebarVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {sidebarContent}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
