import * as Sentry from '@sentry/nextjs';
import { Env } from './src/libs/Env';

/**
 * Sentry client-side configuration.
 * Captures errors and performance metrics from the browser.
 */
Sentry.init({
  dsn: Env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session replay - records user sessions when errors occur
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

  // Filter out low-priority errors
  beforeSend(event, hint) {
    const error = hint.originalException;

    // Ignore network errors (user's internet connection issues)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return null;
    }

    // Ignore canceled requests
    if (event.exception?.values?.[0]?.value?.includes('AbortError')) {
      return null;
    }

    // Remove sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.Authorization;
    }

    return event;
  },

  // Performance tracking
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Don't send PII (personally identifiable information)
  sendDefaultPii: false,
});
