'use client';

import { useEffect, useRef } from 'react';

/**
 * Custom hook to handle clicks outside of a referenced element
 * Useful for dropdowns, modals, tooltips, etc.
 */
export function useClickOutside<T extends HTMLElement = HTMLDivElement>(
  handler: () => void,
  listenCapturing: boolean = true
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('click', handleClick, listenCapturing);

    return () => {
      document.removeEventListener('click', handleClick, listenCapturing);
    };
  }, [handler, listenCapturing]);

  return ref;
}

/**
 * Alternative version that accepts multiple refs
 */
export function useClickOutsideMultiple(
  refs: React.RefObject<HTMLElement>[],
  handler: () => void,
  listenCapturing: boolean = true
) {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const isOutside = refs.every(
        ref => ref.current && !ref.current.contains(event.target as Node)
      );
      
      if (isOutside) {
        handler();
      }
    };

    document.addEventListener('click', handleClick, listenCapturing);

    return () => {
      document.removeEventListener('click', handleClick, listenCapturing);
    };
  }, [refs, handler, listenCapturing]);
}
