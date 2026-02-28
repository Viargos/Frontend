'use client';

import { useCallback, useEffect, useRef } from 'react';

type UseDebounceResult<TArgs extends unknown[]> = {
  cancel: () => void;
  run: (...args: TArgs) => void;
};

export function useDebounce<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delayMs: number,
): UseDebounceResult<TArgs> {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const run = useCallback(
    (...args: TArgs) => {
      cancel();
      timeoutRef.current = window.setTimeout(() => {
        callbackRef.current(...args);
        timeoutRef.current = null;
      }, delayMs);
    },
    [cancel, delayMs],
  );

  useEffect(() => cancel, [cancel]);

  return {
    cancel,
    run,
  };
}
