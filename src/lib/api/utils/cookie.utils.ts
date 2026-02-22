import { NextResponse } from 'next/server';
import { COOKIE_NAMES } from '@/lib/auth/auth.config';

/**
 * Forward Set-Cookie headers from backend response to Next.js response
 *
 * Why this exists:
 * - Backend may set multiple cookies (access_token, refresh_token)
 * - Set-Cookie can have multiple values in different formats
 * - Need clean way to pipe backend cookies to client
 *
 * Production-safe:
 * - Handles missing headers gracefully
 * - Preserves all cookie attributes (HttpOnly, Secure, SameSite, etc.)
 * - Uses append() to preserve multiple Set-Cookie headers (avoids overwriting)
 */
export function forwardBackendCookies(
  backendResponse: Response,
  nextResponse: NextResponse
): void {
  const headers = backendResponse.headers as Headers & {
    getSetCookie?(): string[];
  };
  const cookies = headers.getSetCookie?.() ?? [];

  if (cookies.length > 0) {
    for (const c of cookies) {
      nextResponse.headers.append('Set-Cookie', c);
    }
    console.log('[forwardBackendCookies] ✅ Forwarded cookies from backend');
    return;
  }

  const setCookieHeader = backendResponse.headers.get('set-cookie');
  if (setCookieHeader) {
    nextResponse.headers.append('set-cookie', setCookieHeader);
    console.log('[forwardBackendCookies] ✅ Forwarded cookies from backend');
  }
}

/**
 * Clear authentication cookies
 *
 * Used when refresh fails or user logs out
 */
export function clearAuthCookies(response: NextResponse): void {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 0,
    path: '/',
  };

  response.cookies.set(COOKIE_NAMES.ACCESS_TOKEN, '', cookieOptions);
  response.cookies.set(COOKIE_NAMES.REFRESH_TOKEN, '', cookieOptions);

  console.log('[clearAuthCookies] ✅ Cleared auth cookies');
}
