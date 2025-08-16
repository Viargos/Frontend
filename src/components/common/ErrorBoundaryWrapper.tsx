'use client';

import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface ErrorBoundaryWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
}

/**
 * A wrapper component that provides a more functional approach to using ErrorBoundary
 * This allows functional components to interact with the ErrorBoundary more naturally
 */
export function ErrorBoundaryWrapper({ 
  children, 
  fallback,
  onError,
  resetKeys,
  resetOnPropsChange = true
}: ErrorBoundaryWrapperProps) {
  return (
    <ErrorBoundary
      fallback={fallback}
      onError={onError}
      resetKeys={resetKeys}
      resetOnPropsChange={resetOnPropsChange}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Custom error fallback component for more specific error handling
 */
export function CustomErrorFallback({ 
  error, 
  resetError, 
  title = "Something went wrong",
  subtitle = "An unexpected error occurred. Please try again."
}: { 
  error: Error; 
  resetError: () => void;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-64 bg-gray-50 border border-gray-200 rounded-lg p-6 flex items-center justify-center">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{subtitle}</p>
        <div className="space-y-3">
          <button
            onClick={resetError}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
          >
            Refresh Page
          </button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Error Details (Development Only)
            </summary>
            <pre className="mt-2 text-xs text-red-600 bg-red-50 p-3 rounded border overflow-auto">
              {error.toString()}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

/**
 * Hook for functional components to interact with ErrorBoundary
 */
export function useErrorBoundary() {
  const { throwError } = useErrorHandler();
  
  const captureError = React.useCallback((error: Error) => {
    console.error('Error captured by useErrorBoundary:', error);
    throwError(error);
  }, [throwError]);

  return { captureError };
}

/**
 * Example usage component showing how to handle errors in functional components
 */
export function ErrorHandlingExample() {
  const { captureError } = useErrorBoundary();

  const handleAsyncError = async () => {
    try {
      // Simulate an async operation that might fail
      throw new Error('Async operation failed');
    } catch (error) {
      captureError(error as Error);
    }
  };

  const handleSyncError = () => {
    // This will be caught by the ErrorBoundary
    throw new Error('Synchronous error occurred');
  };

  return (
    <div className="space-y-4 p-6">
      <h3 className="text-lg font-semibold">Error Handling Examples</h3>
      <div className="space-y-2">
        <button
          onClick={handleSyncError}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Trigger Sync Error
        </button>
        <button
          onClick={handleAsyncError}
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
        >
          Trigger Async Error
        </button>
      </div>
    </div>
  );
}

export default ErrorBoundaryWrapper;
