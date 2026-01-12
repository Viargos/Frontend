"use client";

import { useEffect } from "react";

/**
 * Error UI for dashboard routes
 * This is shown automatically by Next.js when an error occurs
 * Provides error recovery with reset functionality
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service (e.g., Sentry)
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white border border-red-200 rounded-lg shadow-sm p-6 max-w-md w-full">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
          Something went wrong!
        </h2>

        <p className="text-gray-600 text-center mb-6">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>

        <button
          onClick={reset}
          className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
