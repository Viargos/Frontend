'use client';

import { useEffect, useRef } from 'react';
import { MODAL_SURFACE_BASE_CLASS, OVERLAY_BASE_CLASS } from '@/modules/common/constants';

type OverlayModalProps = {
  ariaLabel?: string;
  children: React.ReactNode;
  className?: string;
  onClose: () => void;
};

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];

  return Array.from(container.querySelectorAll<HTMLElement>(selectors.join(','))).filter(
    element => !element.hasAttribute('disabled') && !element.getAttribute('aria-hidden'),
  );
}

export function OverlayModal(props: OverlayModalProps) {
  const { ariaLabel, children, className, onClose } = props;
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousActiveElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusId = window.setTimeout(() => {
      if (!dialogRef.current) {
        return;
      }

      const focusables = getFocusableElements(dialogRef.current);
      const firstElement = focusables[0];
      (firstElement ?? dialogRef.current).focus();
    }, 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (!dialogRef.current) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusables = getFocusableElements(dialogRef.current);
      if (focusables.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const firstElement = focusables[0];
      const lastElement = focusables[focusables.length - 1];
      const activeElement = document.activeElement;

      if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      } else if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(focusId);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousActiveElementRef.current?.focus();
    };
  }, [onClose]);

  return (
    <div className={`${OVERLAY_BASE_CLASS} p-4`}>
      <button
        aria-label="Close dialog overlay"
        className="absolute inset-0 h-full w-full cursor-default"
        tabIndex={-1}
        type="button"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        aria-label={ariaLabel}
        aria-modal="true"
        className={`${MODAL_SURFACE_BASE_CLASS} relative w-full outline-none ${className ?? ''}`}
        role="dialog"
        tabIndex={-1}
      >
        {children}
      </div>
    </div>
  );
}
