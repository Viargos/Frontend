'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function RootError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(props.error);
  }, [props.error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg border border-red-200 bg-white p-6 shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <span aria-hidden="true" className="text-2xl leading-none text-red-600">x</span>
        </div>

        <h2 className="mb-2 text-center text-xl font-bold text-gray-900">
          Something went wrong!
        </h2>

        <p className="mb-6 text-center text-gray-600">
          {props.error.message || 'An unexpected error occurred. Please try again.'}
        </p>

        <button
          type="button"
          onClick={props.reset}
          className="w-full rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
