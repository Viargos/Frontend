import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAMES } from '@/lib/auth/constants';
import { PUBLIC_PATH_PREFIXES } from '@/modules/common/constants';

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATH_PREFIXES.some((prefix) => {
    if (prefix === '/') {
      return pathname === '/';
    }

    return pathname.startsWith(prefix);
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.ACCESS_TOKEN)?.value;
  const refreshToken = request.cookies.get(AUTH_COOKIE_NAMES.REFRESH_TOKEN)?.value;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (accessToken) {
    return NextResponse.next();
  }

  if (!refreshToken) {
    const loginUrl = new URL('/', request.url);
    return NextResponse.redirect(loginUrl);
  }

  const refreshUrl = new URL('/api/auth/refresh', request.url);

  return fetch(refreshUrl, {
    headers: {
      cookie: request.headers.get('cookie') ?? '',
    },
    method: 'POST',
  }).then((refreshResponse) => {
    if (!refreshResponse.ok) {
      const loginUrl = new URL('/', request.url);
      return NextResponse.redirect(loginUrl);
    }

    const redirectResponse = NextResponse.redirect(request.nextUrl);
    const setCookieHeader = refreshResponse.headers.get('set-cookie');

    if (setCookieHeader) {
      redirectResponse.headers.append('set-cookie', setCookieHeader);
    }

    return redirectResponse;
  }).catch(() => {
    const loginUrl = new URL('/', request.url);
    return NextResponse.redirect(loginUrl);
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
