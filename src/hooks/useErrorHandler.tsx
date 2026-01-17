'use client';

import { useCallback, useState } from 'react';

interface ErrorState {
  error: Error | null;
  hasError: boolean;
  errorId: string | null;
}

interface UseErrorHandlerReturn {
  error: Error | null;
  hasError: boolean;
  errorId: string | null;
  throwError: (error: Error) => void;
  clearError: () => void;
  captureError: (error: Error) => void;
}

/**
 * Custom hook for error handling that works with ErrorBoundary
 * Provides a way to programmatically trigger errors that will be caught by ErrorBoundary
 */
export function useErrorHandler(): UseErrorHandlerReturn {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    hasError: false,
    errorId: null,
  });

  const throwError = useCallback((error: Error) => {
    // This will trigger the ErrorBoundary
    throw error;
  }, []);

  const captureError = useCallback((error: Error) => {
    const errorId = Math.random().toString(36).substring(7);
    setErrorState({
      error,
      hasError: true,
      errorId,
    });
    
    // Log error for debugging
    console.error('Error captured by useErrorHandler:', error);
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      hasError: false,
      errorId: null,
    });
  }, []);

  return {
    error: errorState.error,
    hasError: errorState.hasError,
    errorId: errorState.errorId,
    throwError,
    captureError,
    clearError,
  };
}

/**
 * Higher-order component that provides error boundary functionality
 * This is a functional alternative pattern for wrapping components
 */
export function withErrorHandler<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
) {
  return function WithErrorHandlerComponent(props: T) {
    const { error, hasError, clearError } = useErrorHandler();

    if (hasError && error) {
      if (fallback) {
        const FallbackComponent = fallback;
        return <FallbackComponent error={error} resetError={clearError} />;
      }
      
      return (
        <div className="min-h-32 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 font-medium mb-2">Something went wrong</div>
            <button 
              onClick={clearError}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

/**
 * Utility function for async error handling
 */
export function handleAsyncError<T>(
  promise: Promise<T>,
  errorHandler?: (error: Error) => void
): Promise<[Error | null, T | null]> {
  return promise
    .then<[null, T]>((data: T) => [null, data])
    .catch<[Error, null]>((error: Error) => {
      if (errorHandler) {
        errorHandler(error);
      }
      return [error, null];
    });
}
