'use client';

import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface ResponsiveSidebarProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  position?: 'left' | 'right';
  width?: string;
  showOnDesktop?: boolean;
  desktopBreakpoint?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function ResponsiveSidebar({
  children,
  isOpen,
  onClose,
  title = 'Menu',
  position = 'left',
  width = 'w-64',
  showOnDesktop = true,
  desktopBreakpoint = 'lg',
}: ResponsiveSidebarProps) {
  const breakpointClass = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
  }[desktopBreakpoint];

  // Handle body scroll lock when mobile sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Prevent background scrolling on iOS
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
    };
  }, [isOpen]);

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

  const sidebarContent = (
    <div className={`bg-white shadow-lg h-full ${width} flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          aria-label="Close sidebar"
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
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      {showOnDesktop && (
        <div className={`hidden ${breakpointClass}:block ${width} bg-gray-100 min-h-screen flex-shrink-0`}>
          {children}
        </div>
      )}

      {/* Mobile Sidebar */}
      {isOpen && typeof window !== 'undefined' && createPortal(
        <div className={`fixed inset-0 z-50 ${breakpointClass}:hidden`}>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-40"
            onClick={onClose}
            aria-hidden="true"
          />
          
          {/* Sidebar */}
          <div 
            className={`fixed top-0 ${position === 'left' ? 'left-0' : 'right-0'} bottom-0 transform transition-transform duration-300 ease-in-out ${
              isOpen ? 'translate-x-0' : position === 'left' ? '-translate-x-full' : 'translate-x-full'
            }`}
          >
            {sidebarContent}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
