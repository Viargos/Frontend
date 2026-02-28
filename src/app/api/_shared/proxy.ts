import type { ApiError } from '@/modules/common';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

type ProxyRequestOptions = {
  request: Request;
  backendPath: string;
  backendBaseUrl: string;
  method?: string;
  body?: BodyInit | null;
  additionalHeaders?: HeadersInit;
  forwardCookies?: boolean;
  forwardSetCookie?: boolean;
};

function normalizeBackendPath(path: string): string {
  if (!path.startsWith('/')) {
    return `/api/${path}`;
  }

  if (path.startsWith('/api/')) {
    return path;
  }

  if (path === '/api') {
    return path;
  }

  return `/api${path}`;
}

function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object'
    && value !== null
    && 'error' in value
    && 'message' in value
    && 'statusCode' in value
    && typeof value.error === 'string'
    && typeof value.message === 'string'
    && typeof value.statusCode === 'number'
  );
}

function buildForwardHeaders(requestHeaders: Headers, additionalHeaders?: HeadersInit): Headers {
  const headers = new Headers();

  const allowedHeaderNames = [
    'accept',
    'accept-language',
    'content-type',
    'user-agent',
    'x-request-id',
    'x-correlation-id',
  ];

  for (const headerName of allowedHeaderNames) {
    const value = requestHeaders.get(headerName);
    if (value) {
      headers.set(headerName, value);
    }
  }

  if (additionalHeaders) {
    const extraHeaders = new Headers(additionalHeaders);
    extraHeaders.forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return headers;
}

function forwardSetCookieHeaders(backendResponse: Response, response: Response): void {
  const rawHeaders = backendResponse.headers as Headers & {
    getSetCookie?: () => string[];
  };

  const cookies = rawHeaders.getSetCookie?.() ?? [];

  if (cookies.length > 0) {
    for (const cookie of cookies) {
      response.headers.append('set-cookie', cookie);
    }

    return;
  }

  const singleHeader = backendResponse.headers.get('set-cookie');

  if (singleHeader) {
    response.headers.set('set-cookie', singleHeader);
  }
}

export async function proxyToBackend(options: ProxyRequestOptions): Promise<Response> {
  const normalizedPath = normalizeBackendPath(options.backendPath);
  const url = `${options.backendBaseUrl}${normalizedPath}`;
  const headers = buildForwardHeaders(options.request.headers, options.additionalHeaders);

  if (options.forwardCookies ?? true) {
    const requestCookieHeader = options.request.headers.get('cookie');
    if (requestCookieHeader) {
      headers.set('cookie', requestCookieHeader);
    } else {
      const cookieStore = await cookies();
      const serializedCookies = cookieStore.toString();
      if (serializedCookies) {
        headers.set('cookie', serializedCookies);
      }
    }
  }

  const backendResponse = await fetch(url, {
    body: options.body ?? null,
    credentials: 'include',
    headers,
    method: options.method ?? options.request.method,
  });

  const rawBody = await backendResponse.text();
  const parsedBody: unknown = rawBody
    ? (() => {
        try {
          return JSON.parse(rawBody);
        } catch {
          return rawBody;
        }
      })()
    : {};

  if (!backendResponse.ok && isApiError(parsedBody)) {
    return NextResponse.json(parsedBody, {
      status: parsedBody.statusCode,
    });
  }

  if (!backendResponse.ok) {
    const fallbackError: ApiError = {
      error: 'BACKEND_ERROR',
      message: `Backend request failed with status ${backendResponse.status}`,
      statusCode: backendResponse.status,
    };

    return NextResponse.json(fallbackError, {
      status: backendResponse.status,
    });
  }

  const contentType = backendResponse.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    const response = NextResponse.json(parsedBody, { status: backendResponse.status });

    if (options.forwardSetCookie) {
      forwardSetCookieHeaders(backendResponse, response);
    }

    return response;
  }

  const response = new Response(rawBody, {
    headers: backendResponse.headers,
    status: backendResponse.status,
  });

  if (options.forwardSetCookie) {
    forwardSetCookieHeaders(backendResponse, response);
  }

  return response;
}
