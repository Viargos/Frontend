'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook to debounce a value
 * Useful for search inputs, API calls, etc.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook to debounce a callback function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    [delay]
  );
}

/**
 * Hook that combines debounced value and callback
 * Useful when you need both the debounced value and want to trigger an action
 */
export function useDebounceWithCallback<T>(
  value: T,
  callback: (value: T) => void,
  delay: number
) {
  const debouncedValue = useDebounce(value, delay);

  useEffect(() => {
    if (debouncedValue !== undefined && debouncedValue !== null) {
      callback(debouncedValue);
    }
  }, [debouncedValue, callback]);

  return debouncedValue;
}

/**
 * Advanced debounce hook with immediate execution option
 */
export function useAdvancedDebounce<T>(
  value: T,
  delay: number,
  options: {
    leading?: boolean; // Execute immediately on first call
    trailing?: boolean; // Execute after delay (default behavior)
    maxWait?: number; // Maximum time to wait before forcing execution
  } = {}
) {
  const { leading = false, trailing = true, maxWait } = options;
  
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const maxTimeoutRef = useRef<NodeJS.Timeout>();
  const lastCallTimeRef = useRef<number>();
  const lastInvokeTimeRef = useRef<number>(0);

  useEffect(() => {
    const currentTime = Date.now();
    const timeSinceLastCall = currentTime - (lastCallTimeRef.current || 0);
    const timeSinceLastInvoke = currentTime - lastInvokeTimeRef.current;

    lastCallTimeRef.current = currentTime;

    const invoke = () => {
      setDebouncedValue(value);
      lastInvokeTimeRef.current = Date.now();
    };

    const shouldInvokeLeading = leading && timeSinceLastInvoke >= delay;
    const shouldInvokeTrailing = trailing;

    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
    }

    // Leading edge execution
    if (shouldInvokeLeading) {
      invoke();
      return;
    }

    // Trailing edge execution
    if (shouldInvokeTrailing) {
      timeoutRef.current = setTimeout(invoke, delay);
    }

    // Max wait timeout
    if (maxWait && timeSinceLastInvoke < maxWait) {
      const remainingWait = maxWait - timeSinceLastInvoke;
      maxTimeoutRef.current = setTimeout(invoke, remainingWait);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (maxTimeoutRef.current) clearTimeout(maxTimeoutRef.current);
    };
  }, [value, delay, leading, trailing, maxWait]);

  return debouncedValue;
}

/**
 * Hook for debouncing search functionality specifically
 */
export function useSearchDebounce(
  searchTerm: string,
  searchFunction: (term: string) => void | Promise<void>,
  delay: number = 300,
  minLength: number = 0
) {
  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  useEffect(() => {
    if (debouncedSearchTerm.length >= minLength) {
      searchFunction(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, searchFunction, minLength]);

  return debouncedSearchTerm;
}
