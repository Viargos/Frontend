'use client';

import * as Sentry from '@sentry/nextjs';
import { useState } from 'react';

export function SentryTestButton() {
  const [visible, setVisible] = useState(process.env.NODE_ENV === 'development');
  const [shouldThrow, setShouldThrow] = useState(false);

  // This simulates a render-time error, which ErrorBoundary will catch.
  if (shouldThrow) {
    throw new Error('🧪 Test render error - ErrorBoundary test');
  }

  if (!visible) return null;

  const sendTestError = () => {
    try {
      throw new Error('🧪 Test error from Viargos - Sentry is working!');
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          test: 'true',
          source: 'manual-test-button',
        },
      });
      // eslint-disable-next-line no-alert
      alert('Test error sent to Sentry! Check your dashboard.');
    }
  };

  const triggerRenderError = () => {
    // Flip state so that the next render throws inside the component
    setShouldThrow(true);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-purple-600 text-white p-4 rounded-lg shadow-lg z-50">
      <p className="text-sm font-semibold mb-2">Sentry Test (Dev Only)</p>
      <div className="space-y-2">
        <button
          type="button"
          onClick={sendTestError}
          className="w-full px-3 py-1 bg-purple-700 hover:bg-purple-800 rounded text-sm"
        >
          Test Sentry Error
        </button>
        <button
          type="button"
          onClick={triggerRenderError}
          className="w-full px-3 py-1 bg-red-700 hover:bg-red-800 rounded text-sm"
        >
          Test ErrorBoundary
        </button>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="w-full px-3 py-1 bg-gray-700 hover:bg-gray-800 rounded text-sm"
        >
          Hide
        </button>
      </div>
    </div>
  );
}

