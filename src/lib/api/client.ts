/**
 * Centralized API client with cookie-based authentication and token refresh
 *
 * Delegates to the core ApiClient (single source of refresh + session-expired handling).
 * Injects logout handler as onSessionExpired for terminal auth failures.
 */

import { ApiClient as CoreApiClient } from './core/api-client';
import { logoutHandler, LogoutHandlerOptions } from '../auth/logout-handler';
import { RetryOptions } from './utils';

export interface ApiClientOptions {
  baseURL?: string;
  logoutOptions?: LogoutHandlerOptions;
  fetch?: typeof fetch;
  retryOptions?: RetryOptions;
}

export interface RequestOptions extends RequestInit {
  _isRetry?: boolean;
  disableRetry?: boolean;
}

/**
 * API client with automatic token refresh and session-expired handling
 */
export class ApiClient {
  private core: CoreApiClient;

  constructor(options: ApiClientOptions = {}) {
    const baseURL = options.baseURL ?? '';
    this.core = new CoreApiClient({
      baseURL,
      onSessionExpired: () => {
        logoutHandler(options.logoutOptions ?? {});
      },
    });
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.core.request<T>(endpoint, options);
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.core.get<T>(endpoint);
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.core.post<T>(endpoint, data);
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.core.put<T>(endpoint, data);
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.core.patch<T>(endpoint, data);
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.core.delete<T>(endpoint);
  }
}

let defaultClient: ApiClient | null = null;

export function initApiClient(options?: ApiClientOptions): ApiClient {
  defaultClient = new ApiClient(options);
  return defaultClient;
}

export function getApiClient(): ApiClient {
  if (!defaultClient) {
    defaultClient = new ApiClient();
  }
  return defaultClient;
}

export type { StandardError } from './utils';
export type { RetryOptions } from './utils';
