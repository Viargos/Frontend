import * as Sentry from '@sentry/nextjs';

export function reportError(error: unknown, context?: Record<string, unknown>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

export function reportMessage(message: string, context?: Record<string, unknown>) {
  Sentry.captureMessage(message, {
    extra: context,
    level: 'info',
  });
}
