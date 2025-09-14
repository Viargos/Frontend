"use client";

import { ReactNode, useEffect, useRef } from "react";
import { useEscapeKey } from "@/hooks/useKeyboardShortcut";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  showBackdrop?: boolean;
}

// Aggressive scroll management functions
const lockScroll = () => {
  if (typeof window === "undefined") return;
  
  const body = document.body;
  const scrollY = window.scrollY;
  
  // Store the current scroll position
  body.style.position = 'fixed';
  body.style.top = `-${scrollY}px`;
  body.style.width = '100%';
  body.style.overflow = 'hidden';
};

const unlockScroll = () => {
  if (typeof window === "undefined") return;
  
  const body = document.body;
  const scrollY = body.style.top;
  
  // Restore scroll position
  body.style.position = '';
  body.style.top = '';
  body.style.width = '';
  body.style.overflow = '';
  
  // Restore the scroll position
  if (scrollY) {
    window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
  }
  
  // Force additional cleanup
  setTimeout(() => {
    const html = document.documentElement;
    body.style.overflow = '';
    body.style.position = '';
    body.style.top = '';
    body.style.width = '';
    body.style.height = '';
    html.style.overflow = '';
    html.style.position = '';
    html.style.top = '';
    html.style.width = '';
    html.style.height = '';
    
    // Remove potential classes
    body.classList.remove('modal-open', 'scroll-locked', 'overflow-hidden');
    html.classList.remove('modal-open', 'scroll-locked', 'overflow-hidden');
    
    // Force reflow
    body.offsetHeight;
  }, 10);
};

export function Modal({
  isOpen,
  onClose,
  children,
  className = "",
  showBackdrop = true,
}: ModalProps) {
  const isOpenRef = useRef(isOpen);
  
  // Track modal state and manage scroll
  useEffect(() => {
    isOpenRef.current = isOpen;
    
    if (isOpen) {
      lockScroll();
    } else {
      unlockScroll();
    }
    
    // Cleanup on unmount or when modal closes
    return () => {
      if (isOpenRef.current) {
        unlockScroll();
      }
    };
  }, [isOpen]);
  
  // Additional cleanup on component unmount
  useEffect(() => {
    return () => {
      unlockScroll();
    };
  }, []);

  // Enhanced close handler
  const handleClose = () => {
    unlockScroll();
    setTimeout(() => onClose(), 10);
  };

  // Close modal on Escape key
  useEscapeKey(handleClose, isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000060]">
      {/* Backdrop */}
      {showBackdrop && (
        <div
          className="absolute inset-0"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* Modal Content */}
      <div
        className={`relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto ${className}`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default Modal;
