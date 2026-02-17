import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export type BackendFetchOptions = RequestInit & {
  /** When true, forwards the incoming request cookies to the backend (for auth). */
  forwardCookies?: boolean;
  /** Optional query string or URLSearchParams to append to path. */
  searchParams?: string | URLSearchParams;
};

/**
 * Centralized fetch to the backend API. Use in Route Handlers only.
 * - Ensures NEXT_PUBLIC_API_URL is set
 * - Sets Content-Type: application/json when not provided
 * - Optionally forwards cookies (only when forwardCookies: true)
 * - Uses cache: 'no-store' by default
 */
export async function backendFetch(
  path: string,
  options: BackendFetchOptions = {}
): Promise<Response> {
  const baseURL = process.env.NEXT_PUBLIC_API_URL;
  if (!baseURL) {
    throw new Error('NEXT_PUBLIC_API_URL is not defined');
  }

  const { forwardCookies, searchParams, ...init } = options;
  const headers = new Headers(init.headers);

  if (!headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (forwardCookies) {
    const cookieStore = await cookies();
    headers.set('cookie', cookieStore.toString());
  }

  const query =
    searchParams == null
      ? ''
      : typeof searchParams === 'string'
        ? searchParams
        : searchParams.toString();
  const url = `${baseURL}${path}${query ? `?${query}` : ''}`;

  return fetch(url, {
    ...init,
    cache: 'no-store',
    headers,
  });
}

/** Build NextResponse from backend Response (JSON body, same status). Optionally forward Set-Cookie. */
export async function proxyBackendResponse(
  backendResponse: Response,
  options: { forwardSetCookie?: boolean } = {}
): Promise<Response> {
  const body = await backendResponse.json().catch(() => ({}));
  const next = NextResponse.json(body, { status: backendResponse.status });
  if (options.forwardSetCookie) {
    const setCookie =
      (backendResponse.headers as Headers & { getSetCookie?(): string[] })
        .getSetCookie?.() ?? [];
    for (const c of setCookie) {
      next.headers.append('Set-Cookie', c);
    }
  }
  return next;
}
