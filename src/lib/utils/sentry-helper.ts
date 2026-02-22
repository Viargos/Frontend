import * as Sentry from '@sentry/nextjs';

type SentryStoreContext = {
  store: string;
  action: string;
  extra?: Record<string, unknown>;
};

/**
 * Capture an error to Sentry with store/action context.
 * No-op outside production to avoid noisy local/dev reporting.
 */
export function captureSentryError(error: unknown, context: SentryStoreContext) {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  const err = error instanceof Error ? error : new Error(String(error));

  Sentry.captureException(err, {
    tags: {
      store: context.store,
      action: context.action,
    },
    extra: context.extra,
  });
}

/**
 * Add a breadcrumb describing a user or store action.
 * Helpful for understanding the sequence of events leading to an error.
 */
export function addSentryBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>
) {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}

