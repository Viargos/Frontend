import * as Sentry from '@sentry/nextjs';
import { useAuthStore } from '@/store/auth.store';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment
  environment: process.env.NODE_ENV,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Only send events in production to avoid dev noise
  enabled: process.env.NODE_ENV === 'production',

  // Attach user context from auth store when available
  beforeSend(event) {
    try {
      const authState = useAuthStore.getState();
      const user = authState.user as
        | { id?: string; email?: string; username?: string }
        | null;

      if (user) {
        event.user = {
          id: user.id,
          email: user.email,
          username: user.username,
        };
      }
    } catch {
      // Swallow any errors from reading auth state
    }

    return event;
  },

  // Basic tags to identify this app
  initialScope: {
    tags: {
      app: 'viargos-frontend',
      runtime: 'client',
    },
  },
});

