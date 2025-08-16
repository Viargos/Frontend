'use client';

import { useEffect } from 'react';

/**
 * Custom hook to lock/unlock body scroll
 * Useful for modals, sidebars, and overlays
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) {
      return;
    }

    // Store original values
    const originalStyle = window.getComputedStyle(document.body);
    const scrollY = window.scrollY;
    
    // Apply scroll lock
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      // Restore original styles
      document.body.style.overflow = originalStyle.overflow || 'unset';
      document.body.style.position = originalStyle.position || 'unset';
      document.body.style.top = originalStyle.top || 'unset';
      document.body.style.width = originalStyle.width || 'unset';
      
      // Restore scroll position
      window.scrollTo(0, scrollY);
    };
  }, [isLocked]);
}

/**
 * Simple version that just toggles overflow hidden
 */
export function useSimpleBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (isLocked) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isLocked]);
}

/**
 * Advanced version with support for mobile Safari and custom scroll restoration
 */
export function useAdvancedBodyScrollLock(
  isLocked: boolean,
  restoreScrollPosition: boolean = true
) {
  useEffect(() => {
    if (!isLocked) {
      return;
    }

    const scrollY = window.scrollY;
    const body = document.body;
    const html = document.documentElement;
    
    // Store original styles
    const originalBodyStyle = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };
    
    const originalHtmlStyle = {
      overflow: html.style.overflow,
    };

    // Apply lock styles
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    html.style.overflow = 'hidden'; // For mobile Safari

    return () => {
      // Restore styles
      body.style.overflow = originalBodyStyle.overflow;
      body.style.position = originalBodyStyle.position;
      body.style.top = originalBodyStyle.top;
      body.style.width = originalBodyStyle.width;
      html.style.overflow = originalHtmlStyle.overflow;
      
      // Restore scroll position if requested
      if (restoreScrollPosition) {
        window.scrollTo(0, scrollY);
      }
    };
  }, [isLocked, restoreScrollPosition]);
}
