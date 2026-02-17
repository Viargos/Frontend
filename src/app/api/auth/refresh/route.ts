import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { backendFetch } from '@/lib/api/utils';
import {
  forwardBackendCookies,
  clearAuthCookies,
} from '@/lib/api/utils';
import { AUTH_ENDPOINTS, COOKIE_NAMES } from '@/lib/auth/auth.config';

/**
 * Token refresh endpoint
 *
 * - Verifies refresh_token cookie before calling backend
 * - Forwards Set-Cookie from backend on success
 * - Clears auth cookies on failure
 * - Single code path for success vs failure
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(COOKIE_NAMES.REFRESH_TOKEN);

    if (!refreshToken) {
      console.log('[Refresh] No refresh_token cookie');
      return NextResponse.json(
        { error: 'No refresh token' },
        { status: 401 }
      );
    }

    const backendResponse = await backendFetch(AUTH_ENDPOINTS.REFRESH, {
      method: 'POST',
      forwardCookies: true,
    });

    if (!backendResponse.ok) {
      console.error('[Refresh] Backend rejected refresh:', backendResponse.status);

      const failureResponse = NextResponse.json(
        { error: 'Refresh failed' },
        { status: 401 }
      );
      clearAuthCookies(failureResponse);
      return failureResponse;
    }

    const successResponse = NextResponse.json(
      { success: true, message: 'Token refreshed' },
      { status: 200 }
    );
    forwardBackendCookies(backendResponse, successResponse);

    console.log('[Refresh] ✅ Refresh successful');
    return successResponse;
  } catch (error) {
    console.error('[Refresh] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
