import { NextRequest, NextResponse } from 'next/server';
import { AUTH_ENDPOINTS } from '@/lib/auth/auth.config';
import { backendFetch } from '@/lib/api/utils';
import { HttpMethod } from '@/enums';

/**
 * POST /api/auth/signout
 *
 * Signs out the user by calling backend and clearing cookies.
 * Always succeeds from user perspective, even if backend fails.
 *
 * Backend contract: { message: string }
 */
export async function POST(request: NextRequest) {
  try {
    const backendResponse = await backendFetch(AUTH_ENDPOINTS.SIGNOUT, {
      method: HttpMethod.POST,
      forwardCookies: true,
    }).catch(() => null);

    const nextResponse = NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
      },
      { status: 200 }
    );

    // If backend returned cookie-clearing headers, forward them
    if (backendResponse) {
      const setCookieHeaders =
        (backendResponse.headers as any).getSetCookie?.() ?? [];

      for (const cookie of setCookieHeaders) {
        nextResponse.headers.append('Set-Cookie', cookie);
      }
    }

    // ALWAYS clear cookies on frontend (even if backend call failed)
    // This ensures user can logout even if backend is down
    nextResponse.cookies.set('viargos_access_token', '', {
      maxAge: 0,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
    });

    nextResponse.cookies.set('viargos_refresh_token', '', {
      maxAge: 0,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
    });

    return nextResponse;
  } catch (error) {
    console.error('[POST /api/auth/signout] Error:', error);

    // Even on error, clear cookies and return success
    // Logout should always succeed from user perspective
    const nextResponse = NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
      },
      { status: 200 }
    );

    nextResponse.cookies.set('viargos_access_token', '', {
      maxAge: 0,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
    });

    nextResponse.cookies.set('viargos_refresh_token', '', {
      maxAge: 0,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
    });

    return nextResponse;
  }
}
