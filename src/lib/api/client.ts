/**
 * Centralized API client with cookie-based authentication and retry logic
 *
 * Responsibilities:
 * - Add credentials: 'include' to all requests
 * - Detect auth errors from backend
 * - Coordinate refresh and retry flow
 * - Call logout handler on terminal auth failures
 * - Prevent infinite retry loops
 * - Retry transient errors (5xx, network) with exponential backoff
 * - Transform errors to user-friendly format
 *
 * SOLID Principles:
 * - Single Responsibility: HTTP + retry coordination only
 * - Dependency Inversion: Accepts logout handler via options
 * - Open/Closed: Extensible via options, closed to modification
 */

import { AUTH_ERROR_CODES } from '../auth/auth.config';
import { AuthErrorResponse, isTerminalAuthError } from '../auth/auth.types';
import { HttpMethod } from '@/enums';
import { logoutHandler, LogoutHandlerOptions } from '../auth/logout-handler';
import { API_ENDPOINTS } from './config/endpoints';
import { RefreshHandler } from './handlers/refresh.handler';
import { RetryHandler, RetryOptions } from './handlers/retry.handler';
import { ErrorTransformer } from './handlers/error.transformer';

export interface ApiClientOptions {
  /**
   * Base URL for API requests
   */
  baseURL?: string;

  /**
   * Logout handler options
   */
  logoutOptions?: LogoutHandlerOptions;

  /**
   * Custom fetch implementation (for testing)
   */
  fetch?: typeof fetch;

  /**
   * Retry configuration for transient errors
   */
  retryOptions?: RetryOptions;
}

export interface RequestOptions extends RequestInit {
  /**
   * Internal flag to track retry attempts
   * @internal
   */
  _isRetry?: boolean;

  /**
   * Disable retry for this request
   * Use this for non-idempotent operations or when retry is not desired
   */
  disableRetry?: boolean;
}

/**
 * API client with automatic token refresh and retry logic
 */
export class ApiClient {
  private baseURL: string;
  private logoutOptions: LogoutHandlerOptions;
  private fetchImpl: typeof fetch;
  private refreshHandler: RefreshHandler;
  private retryHandler: RetryHandler;
  private errorTransformer: ErrorTransformer;

  constructor(options: ApiClientOptions = {}) {
    this.baseURL = options.baseURL || '';
    this.logoutOptions = options.logoutOptions || {};
    this.fetchImpl = options.fetch || fetch.bind(globalThis);

    // Initialize handlers
    const refreshUrl = `${this.baseURL}${API_ENDPOINTS.AUTH.REFRESH}`;
    this.refreshHandler = new RefreshHandler(refreshUrl, this.fetchImpl);
    this.retryHandler = new RetryHandler();
    this.errorTransformer = new ErrorTransformer();
  }

  /**
   * Main fetch wrapper with retry and refresh logic
   */
  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<Response> {
    const url = `${this.baseURL}${endpoint}`;

    // Ensure credentials are included for cookie-based auth
    const requestOptions: RequestOptions = {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // Function to execute the actual fetch
    const executeFetch = async (): Promise<Response> => {
      try {
        const response = await this.fetchImpl(url, requestOptions);

        // If response is OK, return it
        if (response.ok) {
          return response;
        }

        // Handle 401 errors (authentication failures)
        if (response.status === 401) {
          return await this.handleAuthError(response, endpoint, requestOptions);
        }

        // For other errors, return response (will be checked for retry)
        return response;
      } catch (error) {
        // Network errors - will be retried by RetryHandler
        throw error;
      }
    };

    // Execute with retry if not disabled
    if (options.disableRetry) {
      return executeFetch();
    } else {
      return this.retryHandler.execute(executeFetch);
    }
  }

  /**
   * Handle authentication errors (401 responses)
   */
  private async handleAuthError(
    response: Response,
    originalEndpoint: string,
    originalOptions: RequestOptions
  ): Promise<Response> {
    try {
      // Clone response for reading (can only read body once)
      const responseClone = response.clone();

      // Parse error response
      const errorData: AuthErrorResponse = await responseClone.json();
      const { error: errorCode, shouldRetry } = errorData;

      // Check if this is a retryable error (TOKEN_EXPIRED with shouldRetry)
      if (
        errorCode === AUTH_ERROR_CODES.TOKEN_EXPIRED &&
        shouldRetry === true &&
        !originalOptions._isRetry
      ) {
        // Attempt to refresh token (with concurrency control)
        const refreshSuccess = await this.refreshHandler.refresh();

        if (refreshSuccess) {
          // Retry original request with retry flag set
          const retryOptions: RequestOptions = {
            ...originalOptions,
            _isRetry: true,
            disableRetry: true, // Don't retry the retry
          };
          return await this.request(originalEndpoint, retryOptions);
        } else {
          // Refresh failed - logout
          await logoutHandler(this.logoutOptions);
          throw new Error('Token refresh failed');
        }
      }

      // Terminal error - logout immediately
      if (isTerminalAuthError(errorCode)) {
        await logoutHandler(this.logoutOptions);
        throw new Error(`Authentication failed: ${errorCode}`);
      }

      // Other 401 errors - return response as-is
      return response;
    } catch (error) {
      // If error parsing fails or is thrown, handle appropriately
      if (
        error instanceof Error &&
        error.message.includes('Authentication failed')
      ) {
        throw error; // Re-throw terminal auth errors
      }

      // For parsing errors, try to logout as safety measure
      await logoutHandler(this.logoutOptions);
      throw error;
    }
  }

  /**
   * Transform and throw standardized error
   */
  private async throwStandardError(response: Response): Promise<never> {
    const standardError = await this.errorTransformer.transform(response);
    const error: any = new Error(standardError.message);
    error.code = standardError.code;
    error.statusCode = standardError.statusCode;
    error.retryable = standardError.retryable;
    error.details = standardError.details;
    throw error;
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const response = await this.request(endpoint, {
      ...options,
      method: HttpMethod.GET,
    });

    if (!response.ok) {
      await this.throwStandardError(response);
    }

    return response.json();
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const response = await this.request(endpoint, {
      ...options,
      method: HttpMethod.POST,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      await this.throwStandardError(response);
    }

    return response.json();
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const response = await this.request(endpoint, {
      ...options,
      method: HttpMethod.PUT,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      await this.throwStandardError(response);
    }

    return response.json();
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const response = await this.request(endpoint, {
      ...options,
      method: HttpMethod.PATCH,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      await this.throwStandardError(response);
    }

    return response.json();
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const response = await this.request(endpoint, {
      ...options,
      method: HttpMethod.DELETE,
    });

    if (!response.ok) {
      await this.throwStandardError(response);
    }

    return response.json();
  }
}

/**
 * Default API client instance
 * Configure with logout handler when Zustand store is available
 */
let defaultClient: ApiClient | null = null;

/**
 * Initialize default API client
 */
export function initApiClient(options?: ApiClientOptions): ApiClient {
  defaultClient = new ApiClient(options);
  return defaultClient;
}

/**
 * Get default API client instance
 */
export function getApiClient(): ApiClient {
  if (!defaultClient) {
    defaultClient = new ApiClient();
  }
  return defaultClient;
}

// Export types and handlers for external use
export type { StandardError } from './handlers/error.transformer';
export type { RetryOptions } from './handlers/retry.handler';
