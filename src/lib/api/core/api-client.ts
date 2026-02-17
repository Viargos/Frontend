import { ApiError, ApiErrorCode } from './api-error';

export interface ApiClientConfig {
  /** Optional base URL prepended to request URLs */
  baseURL?: string;
  /** Called when session is expired (e.g. refresh failed or 401 after retry) */
  onSessionExpired?: () => void;
}

/**
 * Extension of RequestInit with ApiClient-specific options.
 *
 * suppressSessionExpired: When true, suppresses handleSessionExpired() for
 * this request. Use only during boot-time rehydration to prevent premature
 * logout while a token refresh may still succeed in the background.
 */
export interface ExtendedRequestInit extends RequestInit {
  suppressSessionExpired?: boolean;
}

/**
 * Enterprise API client with automatic token refresh, concurrent-safe refresh,
 * and single source of session-expiration handling.
 */
class ApiClient {
  private readonly baseURL: string;
  private refreshPromise: Promise<void> | null = null;
  private refreshFailedAt: number | null = null;
  private readonly REFRESH_COOLDOWN_MS = 5000;
  private onSessionExpired: (() => void) | null = null;

  constructor(config?: ApiClientConfig) {
    this.baseURL = config?.baseURL ?? '';
    this.onSessionExpired = config?.onSessionExpired ?? null;
  }

  /**
   * Core request method with automatic token refresh.
   *
   * - Safe Content-Type handling (does not override caller headers; does not break FormData)
   * - Single source of handleSessionExpired calls
   * - Clean error propagation from refresh
   */
  async request<T>(url: string, options: ExtendedRequestInit = {}): Promise<T> {
    // Destructure ApiClient-specific flag before forwarding to fetch
    const { suppressSessionExpired, ...fetchOptions } = options;

    let hasRetried = false;
    const fullUrl = this.baseURL ? `${this.baseURL}${url}` : url;

    const makeRequest = async (): Promise<Response> => {
      const headers = new Headers(fetchOptions.headers);

      // Only set Content-Type if body exists, NOT FormData, AND caller did not set it
      if (
        fetchOptions.body &&
        !(fetchOptions.body instanceof FormData) &&
        !headers.has('Content-Type')
      ) {
        headers.set('Content-Type', 'application/json');
      }

      return fetch(fullUrl, {
        ...fetchOptions,
        credentials: 'include',
        headers,
      });
    };

    try {
      let response = await makeRequest();

      if (response.status === 401 && !hasRetried) {
        hasRetried = true;

        try {
          await this.refreshAccessToken();
          response = await makeRequest();

          if (response.status === 401) {
            if (!suppressSessionExpired) this.handleSessionExpired();
            throw new ApiError(
              401,
              ApiErrorCode.UNAUTHORIZED,
              'Session expired after refresh'
            );
          }
        } catch {
          if (!suppressSessionExpired) this.handleSessionExpired();
          throw new ApiError(
            401,
            ApiErrorCode.UNAUTHORIZED,
            'Session expired - refresh failed'
          );
        }
      } else if (response.status === 401 && hasRetried) {
        if (!suppressSessionExpired) this.handleSessionExpired();
        throw new ApiError(
          401,
          ApiErrorCode.UNAUTHORIZED,
          'Session expired'
        );
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const body = errorData as { message?: string };
        throw new ApiError(
          response.status,
          this.mapStatusToErrorCode(response.status),
          body.message ?? 'Request failed'
        );
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        0,
        ApiErrorCode.NETWORK_ERROR,
        error instanceof Error ? error.message : 'Network error'
      );
    }
  }

  private async refreshAccessToken(): Promise<void> {
    if (this.refreshFailedAt !== null) {
      const timeSinceFailure = Date.now() - this.refreshFailedAt;
      if (timeSinceFailure < this.REFRESH_COOLDOWN_MS) {
        const remainingMs = this.REFRESH_COOLDOWN_MS - timeSinceFailure;
        console.warn(
          `[ApiClient] Refresh cooldown active (${remainingMs}ms remaining)`
        );
        throw new ApiError(
          401,
          ApiErrorCode.UNAUTHORIZED,
          'Refresh cooldown active'
        );
      }
    }

    if (this.refreshPromise) {
      console.log('[ApiClient] Refresh in progress, waiting...');
      return this.refreshPromise;
    }

    this.refreshPromise = this._performRefresh();

    try {
      await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async _performRefresh(): Promise<void> {
    // Always hit same-origin refresh route so cookies are set on the frontend domain
    const refreshUrl = '/api/auth/refresh';

    try {
      console.log('[ApiClient] Refreshing access token...');

      const response = await fetch(refreshUrl, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('[ApiClient] Refresh failed:', response.status);
        this.refreshFailedAt = Date.now();
        throw new Error(`Refresh failed with status ${response.status}`);
      }

      this.refreshFailedAt = null;
      console.log('[ApiClient] ✅ Token refreshed successfully');
    } catch (error) {
      console.error('[ApiClient] Refresh error:', error);
      throw error;
    }
  }

  private handleSessionExpired(): void {
    console.log('[ApiClient] Session expired, invoking handler');
    if (this.onSessionExpired) {
      this.onSessionExpired();
    } else {
      console.warn('[ApiClient] No session expired handler configured');
    }
  }

  private mapStatusToErrorCode(status: number): ApiErrorCode {
    switch (status) {
      case 400:
        return ApiErrorCode.VALIDATION_ERROR;
      case 401:
        return ApiErrorCode.UNAUTHORIZED;
      case 403:
        return ApiErrorCode.FORBIDDEN;
      case 404:
        return ApiErrorCode.NOT_FOUND;
      case 500:
        return ApiErrorCode.SERVER_ERROR;
      default:
        return ApiErrorCode.UNKNOWN;
    }
  }

  async get<T>(url: string, options: ExtendedRequestInit = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    return this.request<T>(url, {
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  async delete<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: 'DELETE' });
  }

  async patch<T>(url: string, data?: unknown): Promise<T> {
    return this.request<T>(url, {
      method: 'PATCH',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }
}

export default ApiClient;
export { ApiClient };

/** Default instance for backward compatibility (no baseURL, no session handler). */
export const httpClient = new ApiClient();
