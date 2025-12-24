/**
 * Error handling utility for Viargos frontend
 *
 * Features:
 * - Extract error messages from different error types
 * - Extract error details for field-specific validation
 * - Type-safe error handling
 * - Consistent error formatting
 *
 * Usage:
 * ```typescript
 * import { ErrorHandler } from '@/utils/error-handler';
 *
 * try {
 *   await api.call();
 * } catch (error) {
 *   const message = ErrorHandler.extractMessage(error);
 *   const details = ErrorHandler.extractDetails(error);
 * }
 * ```
 */

import { ApiError } from '@/lib/interfaces/http-client.interface';
import { ERROR_MESSAGES } from '@/constants/error-messages';
import { logger } from '@/utils/logger';

export class ErrorHandler {
  /**
   * Extract error message from any error type
   */
  static extractMessage(error: unknown): string {
    // Handle ApiError
    if (error instanceof ApiError) {
      return error.message || ERROR_MESSAGES.GENERIC.UNKNOWN_ERROR;
    }

    // Handle standard Error
    if (error instanceof Error) {
      return error.message || ERROR_MESSAGES.GENERIC.UNKNOWN_ERROR;
    }

    // Handle string errors
    if (typeof error === 'string') {
      return error;
    }

    // Handle axios-style errors
    if (this.isAxiosError(error)) {
      const axiosError = error as any;
      return axiosError.response?.data?.message ||
             axiosError.message ||
             ERROR_MESSAGES.GENERIC.UNKNOWN_ERROR;
    }

    // Handle fetch errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return ERROR_MESSAGES.GENERIC.NETWORK_ERROR;
    }

    // Default fallback
    return ERROR_MESSAGES.GENERIC.UNKNOWN_ERROR;
  }

  /**
   * Extract error details (field-specific validation errors)
   */
  static extractDetails(error: unknown): Record<string, unknown> | undefined {
    // Handle ApiError with details
    if (error instanceof ApiError) {
      return (error as any).details;
    }

    // Handle axios-style errors with validation details
    if (this.isAxiosError(error)) {
      const axiosError = error as any;
      const responseData = axiosError.response?.data;

      if (responseData && typeof responseData === 'object') {
        // Check for validation errors
        if (responseData.errors && typeof responseData.errors === 'object') {
          return responseData.errors;
        }

        // Check for details field
        if (responseData.details && typeof responseData.details === 'object') {
          return responseData.details;
        }
      }
    }

    return undefined;
  }

  /**
   * Extract HTTP status code from error
   */
  static extractStatusCode(error: unknown): number | undefined {
    if (error instanceof ApiError) {
      return error.statusCode;
    }

    if (this.isAxiosError(error)) {
      return (error as any).response?.status;
    }

    return undefined;
  }

  /**
   * Check if error is an axios error
   */
  private static isAxiosError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      'config' in error &&
      'request' in error
    );
  }

  /**
   * Check if error is a network error
   */
  static isNetworkError(error: unknown): boolean {
    // ApiError with status 0
    if (error instanceof ApiError && error.statusCode === 0) {
      return true;
    }

    // Fetch TypeError
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return true;
    }

    // Axios network error
    if (this.isAxiosError(error)) {
      const axiosError = error as any;
      return !axiosError.response && axiosError.request;
    }

    return false;
  }

  /**
   * Check if error is an authentication error
   */
  static isAuthError(error: unknown): boolean {
    const statusCode = this.extractStatusCode(error);
    return statusCode === 401 || statusCode === 403;
  }

  /**
   * Check if error is a validation error
   */
  static isValidationError(error: unknown): boolean {
    const statusCode = this.extractStatusCode(error);
    return statusCode === 400 && this.extractDetails(error) !== undefined;
  }

  /**
   * Check if error is a not found error
   */
  static isNotFoundError(error: unknown): boolean {
    const statusCode = this.extractStatusCode(error);
    return statusCode === 404;
  }

  /**
   * Check if error is a server error
   */
  static isServerError(error: unknown): boolean {
    const statusCode = this.extractStatusCode(error);
    return statusCode ? statusCode >= 500 : false;
  }

  /**
   * Format error for logging
   */
  static formatForLogging(error: unknown): {
    message: string;
    statusCode?: number;
    details?: Record<string, unknown>;
    stack?: string;
  } {
    return {
      message: this.extractMessage(error),
      statusCode: this.extractStatusCode(error),
      details: this.extractDetails(error),
      stack: error instanceof Error ? error.stack : undefined,
    };
  }

  /**
   * Handle error and log it
   */
  static handle(error: unknown, context?: string): void {
    const formatted = this.formatForLogging(error);

    logger.error(
      context ? `Error in ${context}` : 'An error occurred',
      error instanceof Error ? error : new Error(formatted.message),
      {
        statusCode: formatted.statusCode,
        details: formatted.details,
      }
    );
  }

  /**
   * Handle API error with automatic retry detection
   */
  static handleApiError(error: unknown, endpoint: string, method: string): {
    message: string;
    shouldRetry: boolean;
  } {
    const message = this.extractMessage(error);
    const shouldRetry = this.isNetworkError(error) || this.isServerError(error);

    logger.trackApiError(endpoint, method, error instanceof Error ? error : new Error(message), {
      statusCode: this.extractStatusCode(error),
      shouldRetry,
    });

    return { message, shouldRetry };
  }

  /**
   * Create user-friendly error message
   */
  static createUserMessage(error: unknown): string {
    if (this.isNetworkError(error)) {
      return ERROR_MESSAGES.GENERIC.NETWORK_ERROR;
    }

    if (this.isServerError(error)) {
      return ERROR_MESSAGES.GENERIC.SERVER_ERROR;
    }

    if (this.isNotFoundError(error)) {
      return ERROR_MESSAGES.GENERIC.NOT_FOUND;
    }

    if (this.isAuthError(error)) {
      return ERROR_MESSAGES.GENERIC.UNAUTHORIZED;
    }

    return this.extractMessage(error);
  }
}

/**
 * Custom error classes
 */

export class ValidationError extends Error {
  constructor(message: string, public details?: Record<string, unknown>) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = ERROR_MESSAGES.GENERIC.NETWORK_ERROR) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = ERROR_MESSAGES.GENERIC.UNAUTHORIZED) {
    super(message);
    this.name = 'AuthenticationError';
  }
}
