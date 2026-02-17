import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  isPublicRoute,
  isProtectedRoute,
  isExcludedRoute,
} from '@/lib/auth/auth.config';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Exclude static files and Next.js internals
  if (isExcludedRoute(pathname)) return NextResponse.next();

   // NEW: Redirect authenticated users from homepage to dashboard
   if (pathname === '/') {
     const accessToken = request.cookies.get('viargos_access_token');
     if (accessToken) {
       return NextResponse.redirect(new URL('/dashboard', request.url));
     }
   }

  // Allow public routes unconditionally
  if (isPublicRoute(pathname)) return NextResponse.next();

  // Check protected routes
  if (isProtectedRoute(pathname)) {
    // Check for access token cookie
    const accessToken = request.cookies.get('viargos_access_token');

    if (!accessToken) {
      // Redirect to homepage with redirect parameter
      // Homepage will auto-open login modal when redirect param is present
      const homeUrl = new URL('/', request.url);
      homeUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(homeUrl);
    }
  }

  // Default: allow request
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)',
  ],
};
