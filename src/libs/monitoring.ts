/**
 * Monitoring and observability utilities.
 * Provides helpers for tracking custom events, errors, and performance metrics.
 */

import * as Sentry from '@sentry/nextjs';
import { Env } from './Env';

/**
 * Custom event tracking for business metrics.
 */
export const tracking = {
  /**
   * Track counter increment for analytics.
   * @param value - Increment value
   * @param success - Whether the operation succeeded
   */
  counterIncrement(value: number, success: boolean) {
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('counter_increment', {
        value,
        success,
        timestamp: Date.now(),
      });
    }
  },

  /**
   * Track API errors for monitoring.
   * @param endpoint - API endpoint that failed
   * @param statusCode - HTTP status code
   * @param errorMessage - Error message
   */
  apiError(endpoint: string, statusCode: number, errorMessage?: string) {
    // Log to Sentry
    Sentry.captureMessage(`API Error: ${endpoint}`, {
      level: 'error',
      tags: {
        endpoint,
        statusCode: String(statusCode),
      },
      extra: {
        errorMessage,
      },
    });

    // Track in PostHog
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('api_error', {
        endpoint,
        statusCode,
        errorMessage,
      });
    }
  },

  /**
   * Track page performance metrics.
   * @param route - Page route
   * @param loadTime - Page load time in milliseconds
   */
  pagePerformance(route: string, loadTime: number) {
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('page_load', {
        route,
        loadTime,
        timestamp: Date.now(),
      });
    }
  },

  /**
   * Track custom events.
   * @param eventName - Name of the event
   * @param properties - Event properties
   */
  customEvent(eventName: string, properties?: Record<string, unknown>) {
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture(eventName, properties);
    }
  },
};

/**
 * Logger utility for consistent logging across the application.
 */
export const logger = {
  /**
   * Log informational messages.
   * @param message - Log message
   * @param meta - Additional metadata
   */
  info(message: string, meta?: Record<string, unknown>) {
    if (Env.NEXT_PUBLIC_LOGGING_LEVEL !== 'error') {
      Sentry.addBreadcrumb({
        level: 'info',
        message,
        data: meta,
      });
    }
  },

  /**
   * Log warning messages.
   * @param message - Warning message
   * @param meta - Additional metadata
   */
  warn(message: string, meta?: Record<string, unknown>) {
    if (
      Env.NEXT_PUBLIC_LOGGING_LEVEL !== 'error'
      && Env.NEXT_PUBLIC_LOGGING_LEVEL !== 'fatal'
    ) {
      Sentry.addBreadcrumb({
        level: 'warning',
        message,
        data: meta,
      });
    }
  },

  /**
   * Log error messages and send to Sentry in production.
   * @param message - Error message
   * @param error - Error object
   * @param meta - Additional metadata
   */
  error(message: string, error?: Error, meta?: Record<string, unknown>) {
    Sentry.captureMessage(message, { level: 'error' });
    Sentry.captureException(error || new Error(message), {
      extra: meta,
    });
  },

  /**
   * Log debug messages (only in development).
   * @param message - Debug message
   * @param meta - Additional metadata
   */
  debug(message: string, meta?: Record<string, unknown>) {
    if (Env.NEXT_PUBLIC_LOGGING_LEVEL === 'debug' || Env.NEXT_PUBLIC_LOGGING_LEVEL === 'trace') {
      Sentry.addBreadcrumb({
        level: 'debug',
        message,
        data: meta,
      });
    }
  },
};

/**
 * Performance monitoring utilities.
 */
export const performance = {
  /**
   * Measure and track the execution time of an async function.
   * @param name - Name of the operation
   * @param fn - Async function to measure
   * @returns Result of the function
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const startTime = Date.now();

    try {
      const result = await fn();
      const duration = Date.now() - startTime;

      logger.debug(`Performance: ${name}`, { duration });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error(`Performance (failed): ${name}`, error as Error, {
        duration,
      });

      throw error;
    }
  },

  /**
   * Measure and track the execution time of a sync function.
   * @param name - Name of the operation
   * @param fn - Function to measure
   * @returns Result of the function
   */
  measure<T>(name: string, fn: () => T): T {
    const startTime = Date.now();

    try {
      const result = fn();
      const duration = Date.now() - startTime;

      logger.debug(`Performance: ${name}`, { duration });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error(`Performance (failed): ${name}`, error as Error, {
        duration,
      });

      throw error;
    }
  },
};

// Global type declarations (interface required for declaration merging)
declare global {
  // eslint-disable-next-line ts/consistent-type-definitions -- declaration merging
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, unknown>) => void;
      identify: (distinctId: string, properties?: Record<string, unknown>) => void;
      reset: () => void;
      isFeatureEnabled: (flag: string) => boolean;
      getFeatureFlagPayload: (flag: string) => unknown;
    };
  }
}
