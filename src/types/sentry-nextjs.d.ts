declare module '@sentry/nextjs' {
  import type { Event, EventHint, Integration } from '@sentry/core';
  import type { NextConfig } from 'next';

  type ExtraData = Record<string, unknown>;

  type CaptureContext = {
    extra?: ExtraData;
    level?: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';
    tags?: Record<string, string>;
  };

  type InitOptions = {
    beforeSend?: (event: Event, hint: EventHint) => Event | null | Promise<Event | null>;
    debug?: boolean;
    dsn?: string;
    enableLogs?: boolean;
    environment?: string;
    integrations?: Integration[];
    replaysOnErrorSampleRate?: number;
    replaysSessionSampleRate?: number;
    sendDefaultPii?: boolean;
    tracesSampleRate?: number;
  };

  export function init(options: InitOptions): void;
  export function captureException(error: unknown, context?: CaptureContext): string;
  export function captureMessage(message: string, context?: CaptureContext): string;
  export function addBreadcrumb(breadcrumb: {
    data?: ExtraData;
    level?: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';
    message?: string;
  }): void;

  export function browserTracingIntegration(): Integration;
  export function replayIntegration(options?: ExtraData): Integration;
  export function consoleLoggingIntegration(options?: ExtraData): Integration;
  export function spotlightBrowserIntegration(options?: ExtraData): Integration;

  export const captureRouterTransitionStart: (...args: unknown[]) => void;

  export function withSentryConfig(
    config: NextConfig,
    sentryWebpackPluginOptions?: ExtraData,
  ): NextConfig;
}
