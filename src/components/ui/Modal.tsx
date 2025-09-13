"use client";

import { ReactNode } from "react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useEscapeKey } from "@/hooks/useKeyboardShortcut";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  showBackdrop?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  children,
  className = "",
  showBackdrop = true,
}: ModalProps) {
  // Lock body scroll when modal is open
  useBodyScrollLock(isOpen);

  // Close modal on Escape key
  useEscapeKey(onClose, isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000060]">
      {/* Backdrop */}
      {showBackdrop && (
        <div
          className="absolute inset-0"
          onClick={onClose}
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
