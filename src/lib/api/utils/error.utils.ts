/**
 * ErrorTransformer
 *
 * Transforms various error types into a standardized format
 * with user-friendly messages.
 *
 * Handles:
 * - HTTP errors (4xx, 5xx)
 * - Network errors (fetch failures)
 * - Unknown errors
 */

export interface StandardError {
  /**
   * Error code (machine-readable identifier)
   * Examples: 'UNAUTHORIZED', 'NETWORK_ERROR', 'SERVER_ERROR'
   */
  code: string;

  /**
   * User-friendly error message
   * Safe to display to end users
   */
  message: string;

  /**
   * HTTP status code (if applicable)
   */
  statusCode?: number;

  /**
   * Whether this error is retryable
   */
  retryable: boolean;

  /**
   * Original error details (for debugging)
   * Should NOT be shown to users
   */
  details?: unknown;
}

export class ErrorTransformer {
  /**
   * User-friendly error messages by status code
   */
  private readonly statusMessages: Record<number, string> = {
    // 4xx Client Errors
    400: 'Invalid request. Please check your input and try again.',
    401: 'Your session has expired. Please log in again.',
    403: "You don't have permission to access this resource.",
    404: 'The requested resource was not found.',
    408: 'Request timed out. Please try again.',
    409: 'This action conflicts with existing data. Please refresh and try again.',
    422: 'Invalid data provided. Please check your input.',
    429: 'Too many requests. Please wait a moment and try again.',

    // 5xx Server Errors
    500: 'Something went wrong on our end. Please try again later.',
    502: 'Service temporarily unavailable. Please try again in a moment.',
    503: 'Service temporarily unavailable. Please try again later.',
    504: 'Request timed out. Please try again.',
  };

  /**
   * Check if a status code represents a retryable error
   */
  private isRetryableStatus(status: number): boolean {
    return (
      status === 408 || // Request Timeout
      status === 429 || // Too Many Requests (rate limit)
      status === 500 || // Internal Server Error
      status === 502 || // Bad Gateway
      status === 503 || // Service Unavailable
      status === 504    // Gateway Timeout
    );
  }

  /**
   * Get error code from status
   */
  private getErrorCode(status: number): string {
    if (status === 401) return 'UNAUTHORIZED';
    if (status === 403) return 'FORBIDDEN';
    if (status === 404) return 'NOT_FOUND';
    if (status === 408) return 'TIMEOUT';
    if (status === 429) return 'RATE_LIMIT';
    if (status >= 500) return 'SERVER_ERROR';
    if (status >= 400) return 'CLIENT_ERROR';
    return 'UNKNOWN_ERROR';
  }

  /**
   * Transform HTTP error (Response object)
   */
  async transformHttpError(response: Response): Promise<StandardError> {
    const status = response.status;

    // Try to extract error message from response body
    let errorMessage = this.statusMessages[status] || response.statusText;
    let errorBody: any = null;

    try {
      // Try to parse JSON error body
      errorBody = await response.json();

      // Extract message from common response formats
      if (errorBody.message) {
        errorMessage = errorBody.message;
      } else if (errorBody.error && typeof errorBody.error === 'string') {
        errorMessage = errorBody.error;
      }
    } catch {
      // Failed to parse body, use default message
    }

    return {
      code: this.getErrorCode(status),
      message: errorMessage,
      statusCode: status,
      retryable: this.isRetryableStatus(status),
      details: errorBody || { statusText: response.statusText },
    };
  }

  /**
   * Transform network error (fetch failure, timeout, etc.)
   */
  transformNetworkError(error: Error): StandardError {
    // Detect specific error types
    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes('failed to fetch')) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection and try again.',
        retryable: true,
        details: error,
      };
    }

    if (errorMessage.includes('timeout')) {
      return {
        code: 'TIMEOUT',
        message: 'Request timed out. Please try again.',
        retryable: true,
        details: error,
      };
    }

    if (errorMessage.includes('aborted')) {
      return {
        code: 'ABORTED',
        message: 'Request was cancelled. Please try again.',
        retryable: false,
        details: error,
      };
    }

    // Generic network error
    return {
      code: 'NETWORK_ERROR',
      message: 'Connection error. Please check your network and try again.',
      retryable: true,
      details: error,
    };
  }

  /**
   * Transform unknown error
   */
  transformUnknownError(error: unknown): StandardError {
    // If it's an Error object, extract message
    if (error instanceof Error) {
      return {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred. Please try again.',
        retryable: false,
        details: error,
      };
    }

    // If it's a string, use it as message
    if (typeof error === 'string') {
      return {
        code: 'UNKNOWN_ERROR',
        message: error || 'An unexpected error occurred. Please try again.',
        retryable: false,
        details: error,
      };
    }

    // Completely unknown error type
    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred. Please try again.',
      retryable: false,
      details: error,
    };
  }

  /**
   * Main transform method - handles any error type
   *
   * @param error Error to transform (Response, Error, string, unknown)
   * @returns Standardized error object
   */
  async transform(error: unknown): Promise<StandardError> {
    // HTTP error (Response object)
    if (error instanceof Response) {
      return this.transformHttpError(error);
    }

    // Network error (TypeError from fetch)
    if (error instanceof TypeError) {
      return this.transformNetworkError(error);
    }

    // Generic Error object
    if (error instanceof Error) {
      return this.transformNetworkError(error);
    }

    // Unknown error type
    return this.transformUnknownError(error);
  }

  /**
   * Synchronous transform (for errors that don't need async parsing)
   */
  transformSync(error: unknown): StandardError {
    if (error instanceof TypeError || error instanceof Error) {
      return this.transformNetworkError(error);
    }

    return this.transformUnknownError(error);
  }
}
