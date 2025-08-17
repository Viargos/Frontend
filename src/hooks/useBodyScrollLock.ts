'use client';

import { useEffect, useRef } from 'react';

/**
 * Custom hook to lock/unlock body scroll
 * Useful for modals, sidebars, and overlays
 */
export function useBodyScrollLock(isLocked: boolean) {
  const scrollPositionRef = useRef<number>(0);
  const originalStyleRef = useRef<{
    overflow: string;
    position: string;
    top: string;
    width: string;
  } | null>(null);

  useEffect(() => {
    const body = document.body;
    
    if (isLocked) {
      // Store original values only when locking
      scrollPositionRef.current = window.scrollY;
      const computedStyle = window.getComputedStyle(body);
      originalStyleRef.current = {
        overflow: body.style.overflow || computedStyle.overflow,
        position: body.style.position || computedStyle.position,
        top: body.style.top || computedStyle.top,
        width: body.style.width || computedStyle.width,
      };
      
      // Apply scroll lock
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.top = `-${scrollPositionRef.current}px`;
      body.style.width = '100%';
    } else if (originalStyleRef.current) {
      // Restore original styles when unlocking
      const original = originalStyleRef.current;
      body.style.overflow = original.overflow === 'visible' ? '' : original.overflow;
      body.style.position = original.position === 'static' ? '' : original.position;
      body.style.top = original.top === 'auto' ? '' : original.top;
      body.style.width = original.width === 'auto' ? '' : original.width;
      
      // Restore scroll position
      window.scrollTo(0, scrollPositionRef.current);
      
      // Clear refs
      originalStyleRef.current = null;
      scrollPositionRef.current = 0;
    }

    return () => {
      // Cleanup function - always restore to ensure no stuck state
      if (originalStyleRef.current) {
        const original = originalStyleRef.current;
        body.style.overflow = original.overflow === 'visible' ? '' : original.overflow;
        body.style.position = original.position === 'static' ? '' : original.position;
        body.style.top = original.top === 'auto' ? '' : original.top;
        body.style.width = original.width === 'auto' ? '' : original.width;
        
        // Restore scroll position
        window.scrollTo(0, scrollPositionRef.current);
      }
    };
  }, [isLocked]);
}

/**
 * Simple version that just toggles overflow hidden
 */
export function useSimpleBodyScrollLock(isLocked: boolean) {
  const originalOverflowRef = useRef<string>('');

  useEffect(() => {
    const body = document.body;
    
    if (isLocked) {
      // Store original overflow value
      originalOverflowRef.current = body.style.overflow || window.getComputedStyle(body).overflow;
      body.style.overflow = 'hidden';
    } else {
      // Restore original overflow
      body.style.overflow = originalOverflowRef.current === 'visible' ? '' : originalOverflowRef.current;
    }

    return () => {
      // Cleanup - always restore to prevent stuck state
      if (originalOverflowRef.current) {
        body.style.overflow = originalOverflowRef.current === 'visible' ? '' : originalOverflowRef.current;
      } else {
        body.style.overflow = '';
      }
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

/**
 * Emergency function to reset body scroll if it gets stuck
 * Call this manually if scroll gets stuck after modal closes
 */
export function resetBodyScroll() {
  const body = document.body;
  const html = document.documentElement;
  
  // Reset all scroll-related styles
  body.style.overflow = '';
  body.style.position = '';
  body.style.top = '';
  body.style.width = '';
  html.style.overflow = '';
  
  // Force a reflow
  body.offsetHeight;
}

/**
 * Hook that automatically resets scroll on component unmount
 * Use as a failsafe for modal components
 */
export function useScrollResetOnUnmount() {
  useEffect(() => {
    return () => {
      // Reset scroll on unmount as a failsafe
      setTimeout(() => {
        resetBodyScroll();
      }, 100);
    };
  }, []);
}
