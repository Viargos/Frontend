import type { RequestConfig } from './types';
import { ApiError, ApiErrorCode } from './api-error';
import { HttpMethod } from '@/enums';
import * as Sentry from '@sentry/nextjs';

export class HttpClient {
  private baseURL: string;

  constructor(baseURL = '') {
    this.baseURL = baseURL;
  }

  async request<T>(url: string, config: RequestConfig = {}): Promise<T> {
    const {
      method = HttpMethod.GET,
      headers = {},
      body,
      credentials = 'include',
      cache = 'no-store',
      bodyAsFormData = false,
    } = config;

    const fullUrl = `${this.baseURL}${url}`;
    const isFormData = bodyAsFormData && body instanceof FormData;

    try {
      const response = await fetch(fullUrl, {
        method,
        headers: isFormData
          ? { ...headers }
          : {
              'Content-Type': 'application/json',
              ...headers,
            },
        credentials,
        cache,
        body:
          body !== undefined
            ? isFormData
              ? (body as FormData)
              : JSON.stringify(body)
            : undefined,
      });

      const responseBody = await this.parseResponse(response);

      if (!response.ok) {
        throw ApiError.fromResponse(response.status, responseBody);
      }

      return responseBody as T;
    } catch (error) {
      // Capture API errors in Sentry in production
      if (process.env.NODE_ENV === 'production') {
        Sentry.captureException(error, {
          tags: {
            apiUrl: fullUrl,
            apiMethod: method,
          },
        });
      }

      if (error instanceof ApiError) throw error;
      throw new ApiError(
        0,
        ApiErrorCode.NETWORK_ERROR,
        error instanceof Error ? error.message : 'Network request failed',
        error
      );
    }
  }

  async get<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: HttpMethod.GET });
  }

  async post<T>(url: string, body?: unknown): Promise<T> {
    return this.request<T>(url, { method: HttpMethod.POST, body });
  }

  async put<T>(url: string, body?: unknown): Promise<T> {
    return this.request<T>(url, { method: HttpMethod.PUT, body });
  }

  async delete<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: HttpMethod.DELETE });
  }

  private async parseResponse(response: Response): Promise<unknown> {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json().catch(() => ({}));
    }
    return response.text();
  }
}

export const httpClient = new HttpClient();
