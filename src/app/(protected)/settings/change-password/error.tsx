'use client';

import { useEffect } from 'react';
import { reportError } from '@/lib/monitoring';

export default function RouteError(props: { error: Error; reset: () => void }) {
  const { error, reset } = props;

  useEffect(() => {
    reportError(error, { route: 'src/app/(protected)/settings/change-password' });
  }, [error]);

  return (
    <div className="p-4 sm:p-6">
      <div className="rounded-md border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-700">Something went wrong.</p>
        <button className="mt-3 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white" onClick={reset} type="button">
          Retry
        </button>
      </div>
    </div>
  );
}
