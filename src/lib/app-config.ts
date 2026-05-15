export const appConfig = {
  api: {
    basePath: '/api',
    timeoutMs: 15000,
  },
  reactQuery: {
    gcTimeMs: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    staleTimeMs: 2 * 60 * 1000,
  },
} as const;

export const runtimeEnv = {
  loggingLevel: process.env.NEXT_PUBLIC_LOGGING_LEVEL ?? 'info',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  sentryDisabled: process.env.NEXT_PUBLIC_SENTRY_DISABLED ?? '',
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? '',
} as const;

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001';
}
