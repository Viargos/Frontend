import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  onIntersect?: () => void;
  enabled?: boolean;
}

export function useIntersectionObserver(options: UseIntersectionObserverOptions = {}) {
  const {
    root = null,
    rootMargin = '200px',
    threshold = 0.1,
    onIntersect,
    enabled = true,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!enabled || !targetRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsIntersecting(entry.isIntersecting);
        
        if (entry.isIntersecting && onIntersect) {
          onIntersect();
        }
      },
      {
        root,
        rootMargin,
        threshold,
      }
    );

    observerRef.current = observer;
    observer.observe(targetRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [root, rootMargin, threshold, onIntersect, enabled]);

  return {
    targetRef,
    isIntersecting,
  };
}
