/**
 * Frontend logging utility for Viargos
 *
 * Features:
 * - Development: Console logging with colors and formatting
 * - Production: Silent or send to analytics service (Sentry, LogRocket, etc.)
 * - Structured logging with metadata
 * - Log levels: debug, info, warn, error
 * - User action tracking
 * - Performance monitoring
 *
 * Usage:
 * ```typescript
 * import { logger } from '@/utils/logger';
 *
 * logger.info('User logged in', { userId: user.id });
 * logger.error('API call failed', error, { endpoint: '/api/posts' });
 * logger.trackEvent('post_created', { postId: post.id });
 * ```
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMetadata {
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  metadata?: LogMetadata;
  error?: Error;
}

class Logger {
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Log debug information (only in development)
   */
  debug(message: string, metadata?: LogMetadata): void {
    if (!this.isDevelopment) return;

    const entry = this.createLogEntry('debug', message, metadata);
    console.debug(`🔍 [DEBUG] ${entry.timestamp}`, message, metadata || '');
  }

  /**
   * Log informational messages
   */
  info(message: string, metadata?: LogMetadata): void {
    const entry = this.createLogEntry('info', message, metadata);

    if (this.isDevelopment) {
      console.info(`ℹ️ [INFO] ${entry.timestamp}`, message, metadata || '');
    }

    if (this.isProduction) {
      // TODO: Send to analytics service (Mixpanel, Amplitude, etc.)
      this.sendToAnalytics('info', entry);
    }
  }

  /**
   * Log warning messages
   */
  warn(message: string, metadata?: LogMetadata): void {
    const entry = this.createLogEntry('warn', message, metadata);

    if (this.isDevelopment) {
      console.warn(`⚠️ [WARN] ${entry.timestamp}`, message, metadata || '');
    }

    if (this.isProduction) {
      // TODO: Send to error tracking service
      this.sendToErrorTracking('warn', entry);
    }
  }

  /**
   * Log error messages
   */
  error(message: string, error?: Error | unknown, metadata?: LogMetadata): void {
    const entry = this.createLogEntry('error', message, metadata, error as Error);

    if (this.isDevelopment) {
      console.error(`❌ [ERROR] ${entry.timestamp}`, message, error, metadata || '');
    }

    if (this.isProduction) {
      // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
      this.sendToErrorTracking('error', entry);
    }
  }

  /**
   * Track user events for analytics
   */
  trackEvent(eventName: string, properties?: LogMetadata): void {
    const entry = this.createLogEntry('info', `Event: ${eventName}`, properties);

    if (this.isDevelopment) {
      console.log(`📊 [EVENT] ${entry.timestamp}`, eventName, properties || '');
    }

    if (this.isProduction) {
      // TODO: Send to analytics service
      this.sendToAnalytics('event', { ...entry, eventName });
    }
  }

  /**
   * Track page views
   */
  trackPageView(pageName: string, properties?: LogMetadata): void {
    this.trackEvent('page_view', { pageName, ...properties });
  }

  /**
   * Track user actions
   */
  trackAction(actionName: string, properties?: LogMetadata): void {
    this.trackEvent('user_action', { actionName, ...properties });
  }

  /**
   * Track API calls
   */
  trackApiCall(endpoint: string, method: string, properties?: LogMetadata): void {
    this.trackEvent('api_call', { endpoint, method, ...properties });
  }

  /**
   * Track API errors
   */
  trackApiError(endpoint: string, method: string, error: Error, properties?: LogMetadata): void {
    this.error('API call failed', error, { endpoint, method, ...properties });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metricName: string, durationMs: number, properties?: LogMetadata): void {
    this.trackEvent('performance', { metricName, durationMs, ...properties });
  }

  /**
   * Create a structured log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    metadata?: LogMetadata,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      metadata,
      error,
    };
  }

  /**
   * Send logs to analytics service (placeholder)
   * TODO: Implement integration with Mixpanel, Amplitude, or similar
   */
  private sendToAnalytics(type: string, entry: LogEntry | Record<string, unknown>): void {
    // Placeholder for analytics integration
    // Example: mixpanel.track(entry.message, entry.metadata);
    // Example: amplitude.logEvent(entry.message, entry.metadata);
  }

  /**
   * Send errors to error tracking service (placeholder)
   * TODO: Implement integration with Sentry, LogRocket, or similar
   */
  private sendToErrorTracking(level: string, entry: LogEntry): void {
    // Placeholder for error tracking integration
    // Example: Sentry.captureException(entry.error, { level, extra: entry.metadata });
    // Example: LogRocket.captureException(entry.error, { tags: { level }, extra: entry.metadata });
  }

  /**
   * Set user context for logging
   * Useful for tracking errors and events per user
   */
  setUserContext(userId: string, userEmail?: string, username?: string): void {
    if (this.isDevelopment) {
      console.log('👤 [USER CONTEXT]', { userId, userEmail, username });
    }

    if (this.isProduction) {
      // TODO: Set user context in analytics and error tracking
      // Example: Sentry.setUser({ id: userId, email: userEmail, username });
      // Example: mixpanel.identify(userId);
    }
  }

  /**
   * Clear user context (on logout)
   */
  clearUserContext(): void {
    if (this.isDevelopment) {
      console.log('👤 [USER CONTEXT CLEARED]');
    }

    if (this.isProduction) {
      // TODO: Clear user context in analytics and error tracking
      // Example: Sentry.setUser(null);
      // Example: mixpanel.reset();
    }
  }
}

// Singleton instance
export const logger = new Logger();
