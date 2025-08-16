'use client';

import { useState, useEffect } from 'react';

interface WindowSize {
  width: number | undefined;
  height: number | undefined;
}

interface UseWindowSizeReturn extends WindowSize {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isSmallScreen: boolean;
  isMediumScreen: boolean;
  isLargeScreen: boolean;
}

/**
 * Custom hook to track window size and responsive breakpoints
 */
export function useWindowSize(): UseWindowSizeReturn {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Set initial size
    handleResize();

    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const width = windowSize.width || 0;

  return {
    ...windowSize,
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
    isSmallScreen: width < 640,
    isMediumScreen: width >= 640 && width < 1024,
    isLargeScreen: width >= 1024,
  };
}

/**
 * Hook for specific breakpoint detection
 */
export function useBreakpoint(breakpoint: number): boolean {
  const [isAboveBreakpoint, setIsAboveBreakpoint] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsAboveBreakpoint(window.innerWidth >= breakpoint);
    }

    // Set initial value
    handleResize();

    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isAboveBreakpoint;
}

/**
 * Hook for media query matching
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    
    function handleChange() {
      setMatches(mediaQuery.matches);
    }

    // Set initial value
    setMatches(mediaQuery.matches);

    // Listen for changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [query]);

  return matches;
}

/**
 * Hook for common Tailwind CSS breakpoints
 */
export function useTailwindBreakpoints() {
  const sm = useMediaQuery('(min-width: 640px)');
  const md = useMediaQuery('(min-width: 768px)');
  const lg = useMediaQuery('(min-width: 1024px)');
  const xl = useMediaQuery('(min-width: 1280px)');
  const xxl = useMediaQuery('(min-width: 1536px)');

  return {
    sm,
    md,
    lg,
    xl,
    '2xl': xxl,
    isMobile: !sm,
    isTablet: sm && !lg,
    isDesktop: lg,
  };
}

/**
 * Hook to detect if device is likely touch-enabled
 */
export function useIsTouchDevice(): boolean {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore - for IE
        navigator.msMaxTouchPoints > 0
      );
    };

    setIsTouchDevice(checkTouch());
  }, []);

  return isTouchDevice;
}

/**
 * Hook to get viewport dimensions (excluding scrollbars)
 */
export function useViewportSize() {
  const [viewportSize, setViewportSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    function updateViewportSize() {
      setViewportSize({
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
      });
    }

    updateViewportSize();
    window.addEventListener('resize', updateViewportSize);

    return () => window.removeEventListener('resize', updateViewportSize);
  }, []);

  return viewportSize;
}
