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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.ACCESS_TOKEN)?.value;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (!accessToken) {
    const loginUrl = new URL('/', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
