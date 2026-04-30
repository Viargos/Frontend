import * as Sentry from '@sentry/nextjs';
import { Env } from './src/libs/Env';

/**
 * Sentry server-side configuration.
 * Captures errors from Server Components, Server Actions, and API routes.
 */
Sentry.init({
  dsn: Env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Performance monitoring for server-side operations
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Capture more context for server errors
  beforeSend(event) {
    // Don't send sensitive environment variables
    if (event.contexts?.runtime?.env) {
      delete event.contexts.runtime.env;
    }

    // Filter sensitive headers
    if (event.request?.headers) {
      delete event.request.headers.authorization;
      delete event.request.headers.cookie;
    }

    return event;
  },

  // Don't send PII
  sendDefaultPii: false,
});
