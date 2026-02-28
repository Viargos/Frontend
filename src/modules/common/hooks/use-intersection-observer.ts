'use client';

import { useEffect, useRef } from 'react';

type UseIntersectionObserverOptions = {
  enabled?: boolean;
  onIntersect: () => void;
  root?: Element | null;
  rootMargin?: string;
  threshold?: number;
};

export function useIntersectionObserver(
  targetRef: React.RefObject<Element | null>,
  options: UseIntersectionObserverOptions,
) {
  const { enabled = true, onIntersect, root = null, rootMargin = '0px', threshold = 0 } = options;
  const hasIgnoredInitialIntersectionRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      hasIgnoredInitialIntersectionRef.current = false;
      return;
    }

    const target = targetRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (!firstEntry?.isIntersecting) {
          return;
        }

        // Avoid triggering next-page fetch on initial mount intersection.
        if (!hasIgnoredInitialIntersectionRef.current) {
          hasIgnoredInitialIntersectionRef.current = true;
          return;
        }

        onIntersect();
      },
      {
        root,
        rootMargin,
        threshold,
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [enabled, onIntersect, root, rootMargin, targetRef, threshold]);
}
