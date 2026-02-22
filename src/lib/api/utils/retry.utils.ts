/**
 * RetryHandler
 *
 * Implements retry logic with exponential backoff for transient errors.
 *
 * Retryable errors:
 * - 408 Request Timeout
 * - 500 Internal Server Error
 * - 502 Bad Gateway
 * - 503 Service Unavailable
 * - 504 Gateway Timeout
 * - Network errors (fetch failures)
 *
 * Non-retryable errors:
 * - 401 Unauthorized (handled by refresh logic)
 * - 403 Forbidden
 * - 404 Not Found
 * - 400 Bad Request
 * - All 4xx except 408
 */

export interface RetryOptions {
  /**
   * Maximum number of retry attempts (excluding initial attempt)
   * Default: 2
   */
  maxAttempts?: number;

  /**
   * Base delay in milliseconds for exponential backoff
   * Default: 300ms
   *
   * Delay formula: baseDelay * (2 ^ attempt)
   * - Attempt 1: 300ms
   * - Attempt 2: 600ms
   * - Attempt 3: 1200ms
   */
  baseDelay?: number;

  /**
   * Maximum delay cap in milliseconds
   * Default: 5000ms (5 seconds)
   */
  maxDelay?: number;
}

export class RetryHandler {
  private readonly defaultOptions: Required<RetryOptions> = {
    maxAttempts: 2,
    baseDelay: 300,
    maxDelay: 5000,
  };

  /**
   * Check if an HTTP status code is retryable
   */
  private isRetryableStatus(status: number): boolean {
    return (
      status === 408 || // Request Timeout
      status === 500 || // Internal Server Error
      status === 502 || // Bad Gateway
      status === 503 || // Service Unavailable
      status === 504    // Gateway Timeout
    );
  }

  /**
   * Check if an error is retryable
   * Network errors are always retryable
   */
  private isRetryableError(error: unknown): boolean {
    // Network errors (fetch failures) are retryable
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return true;
    }

    // Check if error has status property (HTTP error)
    if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as any).status;
      return this.isRetryableStatus(status);
    }

    return false;
  }

  /**
   * Calculate delay for exponential backoff
   */
  private calculateDelay(attempt: number, options: Required<RetryOptions>): number {
    const delay = options.baseDelay * Math.pow(2, attempt);
    return Math.min(delay, options.maxDelay);
  }

  /**
   * Sleep for specified milliseconds
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Execute a function with retry logic
   *
   * @param fn Function to execute (should throw on failure)
   * @param options Retry configuration
   * @returns Result of successful execution
   * @throws Last error if all retries fail
   */
  async execute<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const config = { ...this.defaultOptions, ...options };
    let lastError: unknown;

    for (let attempt = 0; attempt <= config.maxAttempts; attempt++) {
      try {
        // Try executing the function
        return await fn();
      } catch (error) {
        lastError = error;

        // Check if this is the last attempt
        if (attempt === config.maxAttempts) {
          // No more retries, throw the error
          throw error;
        }

        // Check if error is retryable
        if (!this.isRetryableError(error)) {
          // Non-retryable error, throw immediately
          throw error;
        }

        // Calculate backoff delay
        const delay = this.calculateDelay(attempt, config);

        // Log retry attempt (optional, can be removed in production)
        console.warn(
          `Retry attempt ${attempt + 1}/${config.maxAttempts} after ${delay}ms:`,
          error
        );

        // Wait before retrying
        await this.sleep(delay);
      }
    }

    // Should never reach here, but TypeScript needs it
    throw lastError;
  }

  /**
   * Execute a fetch request with retry logic
   *
   * Convenience method for retrying fetch calls.
   * Automatically checks response status and retries on 5xx/network errors.
   *
   * @param url URL to fetch
   * @param init Fetch options
   * @param options Retry configuration
   * @returns Fetch response
   */
  async executeFetch(
    url: string,
    init?: RequestInit,
    options?: RetryOptions
  ): Promise<Response> {
    return this.execute(async () => {
      const response = await fetch(url, init);

      // If response is not OK and is retryable, throw error to trigger retry
      if (!response.ok && this.isRetryableStatus(response.status)) {
        const error: any = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.response = response;
        throw error;
      }

      return response;
    }, options);
  }
}
