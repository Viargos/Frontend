/**
 * Authentication configuration constants
 * Single source of truth for auth-related routes and endpoints
 */

export const AUTH_ROUTES = {
  // Public routes (accessible without authentication)
  PUBLIC: [
    '/',
    '/signin',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/about',
    '/privacy',
    '/terms',
  ],

  // Protected routes (require authentication)
  PROTECTED: [
    '/dashboard',
    '/create-journey',
    '/journey',
    '/profile',
    '/settings',
    '/messages',
  ],

  // Routes excluded from middleware
  EXCLUDED: [
    '/_next',
    '/api',
    '/static',
    '/favicon.ico',
  ],
} as const;

export const AUTH_ENDPOINTS = {
  SIGNIN: '/api/auth/signin',
  SIGNOUT: '/api/auth/signout',
  REFRESH: '/api/auth/refresh',
  PROFILE: '/api/auth/profile',
  SIGNUP: '/api/auth/signup',
  VERIFY_OTP: '/api/auth/verify-otp',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',
  RESEND_OTP: '/api/auth/resend-otp',
  USER_ME: '/api/users/profile/me',
} as const;

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'viargos_access_token',
  REFRESH_TOKEN: 'viargos_refresh_token',
} as const;

export const AUTH_ERROR_CODES = {
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  REFRESH_EXPIRED: 'REFRESH_EXPIRED',
  REFRESH_REVOKED: 'REFRESH_REVOKED',
  REFRESH_INVALID: 'REFRESH_INVALID',
  REFRESH_FAILED: 'REFRESH_FAILED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  USER_INACTIVE: 'USER_INACTIVE',
} as const;

/**
 * Check if a route is public
 */
export function isPublicRoute(pathname: string): boolean {
  return AUTH_ROUTES.PUBLIC.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Check if a route is protected
 */
export function isProtectedRoute(pathname: string): boolean {
  return AUTH_ROUTES.PROTECTED.some(route => 
    pathname.startsWith(route)
  );
}

/**
 * Check if a route should be excluded from middleware
 */
export function isExcludedRoute(pathname: string): boolean {
  return AUTH_ROUTES.EXCLUDED.some(route => 
    pathname.startsWith(route) || pathname.endsWith('.ico') || pathname.endsWith('.png') || pathname.endsWith('.svg')
  );
}
