import { ApiError } from '@/lib/api/api-error';
import { normalizeApiError } from '@/lib/api/error-normalizer';
import { appConfig } from '@/lib/app-config';

export type HttpMethod = 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';

export type HttpRequestConfig = {
  body?: BodyInit | null;
  credentials?: never;
  headers?: HeadersInit;
  method?: HttpMethod;
  query?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
};

export class HttpClient {
  private readonly basePath: string;
  private readonly timeoutMs: number;
  private refreshPromise: Promise<boolean> | null = null;

  public constructor(options?: { basePath?: string; timeoutMs?: number }) {
    this.basePath = options?.basePath ?? appConfig.api.basePath;
    this.timeoutMs = options?.timeoutMs ?? appConfig.api.timeoutMs;
  }

  private shouldAttemptRefresh(path: string, statusCode: number): boolean {
    if (typeof window === 'undefined' || statusCode !== 401) {
      return false;
    }

    const nonRefreshableAuthPaths = new Set([
      '/auth/forgot-password',
      '/auth/logout',
      '/auth/refresh',
      '/auth/resend-otp',
      '/auth/reset-password',
      '/auth/signin',
      '/auth/signout',
      '/auth/signup',
      '/auth/verify-email',
      '/auth/verify-otp',
    ]);

    return !nonRefreshableAuthPaths.has(path);
  }

  private isVerificationRequiredPayload(payload: unknown): boolean {
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    const record = payload as {
      error?: string;
      message?: string;
      code?: string;
    };

    const message = (record.message ?? '').toLowerCase();
    const code = (record.code ?? '').toUpperCase();
    const error = (record.error ?? '').toUpperCase();

    if (code.includes('EMAIL_VERIFICATION_REQUIRED') || error.includes('EMAIL_VERIFICATION_REQUIRED')) {
      return true;
    }

    return message.includes('verify your email') || message.includes('email verification required');
  }

  private handleUnauthorizedFailure(payload?: unknown): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem('viargos_access_token');
    window.localStorage.removeItem('accessToken');
    window.sessionStorage.removeItem('viargos_access_token');
    window.sessionStorage.removeItem('accessToken');
    const verificationRequired = this.isVerificationRequiredPayload(payload);
    window.dispatchEvent(new CustomEvent(verificationRequired ? 'auth:verification-required' : 'auth:unauthorized'));

    const pathname = window.location.pathname;
    const isPublicRoute
      = pathname === '/'
        || pathname.startsWith('/login')
        || pathname.startsWith('/register')
        || pathname.startsWith('/verify-email');

    if (verificationRequired) {
      if (!pathname.startsWith('/verify-email')) {
        window.location.replace('/verify-email');
      }
      return;
    }

    if (!isPublicRoute) {
      window.location.replace('/');
    }
  }

  private async refreshSession(): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const refreshResponse = await fetch(`${this.basePath}/auth/refresh`, {
          credentials: 'include',
          method: 'POST',
        });

        return refreshResponse.ok;
      } catch {
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private async send<TResponse>(
    path: string,
    config?: HttpRequestConfig,
    hasRetriedUnauthorized = false,
  ): Promise<TResponse> {
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const url = new URL(`${this.basePath}${path}`, 'http://localhost');

      if (config?.query) {
        for (const [key, value] of Object.entries(config.query)) {
          if (value === undefined) {
            continue;
          }
          url.searchParams.set(key, String(value));
        }
      }

      const headers = new Headers(config?.headers);
      if (typeof config?.body === 'string' && !headers.has('content-type')) {
        headers.set('content-type', 'application/json');
      }

      const response = await fetch(`${url.pathname}${url.search}`, {
        body: config?.body,
        credentials: 'include',
        headers,
        method: config?.method ?? 'GET',
        signal: config?.signal ?? controller.signal,
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 401 && this.isVerificationRequiredPayload(payload)) {
          this.handleUnauthorizedFailure(payload);
          throw normalizeApiError(
            payload ?? {
              error: 'HTTP_ERROR',
              message: `Request failed with status ${response.status}`,
              statusCode: response.status,
            },
          );
        }

        if (!hasRetriedUnauthorized && this.shouldAttemptRefresh(path, response.status)) {
          const refreshed = await this.refreshSession();

          if (refreshed) {
            return this.send<TResponse>(path, config, true);
          }

          this.handleUnauthorizedFailure(payload);
        }

        throw normalizeApiError(
          payload ?? {
            error: 'HTTP_ERROR',
            message: `Request failed with status ${response.status}`,
            statusCode: response.status,
          },
        );
      }

      return payload as TResponse;
    } catch (error) {
      throw normalizeApiError(error);
    } finally {
      clearTimeout(timeoutHandle);
    }
  }

  public async request<TResponse>(path: string, config?: HttpRequestConfig): Promise<TResponse> {
    return this.send<TResponse>(path, config);
  }

  public delete<TResponse>(path: string): Promise<TResponse> {
    return this.request<TResponse>(path, { method: 'DELETE' });
  }

  public get<TResponse>(path: string, query?: HttpRequestConfig['query']): Promise<TResponse> {
    return this.request<TResponse>(path, { method: 'GET', query });
  }

  public patch<TResponse>(path: string, body?: BodyInit | null): Promise<TResponse> {
    return this.request<TResponse>(path, {
      body,
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
    });
  }

  public post<TResponse>(path: string, body?: BodyInit | null): Promise<TResponse> {
    return this.request<TResponse>(path, {
      body,
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
  }

  public put<TResponse>(path: string, body?: BodyInit | null): Promise<TResponse> {
    return this.request<TResponse>(path, {
      body,
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PUT',
    });
  }
}

export const httpClient = new HttpClient();
export { ApiError };
