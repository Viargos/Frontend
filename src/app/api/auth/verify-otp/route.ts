import { cookies } from 'next/headers';
import { backendConfigErrorResponse, getBackendBaseUrl } from '@/app/api/_shared/backend-url';
import { proxyToBackend } from '@/app/api/_shared/proxy';
import { AUTH_COOKIE_NAMES } from '@/modules/common/constants';

export async function POST(request: Request) {
  try {
    const body = await request.text();

    const response = await proxyToBackend({
      backendBaseUrl: getBackendBaseUrl(),
      backendPath: '/auth/verify-otp',
      body,
      forwardSetCookie: true,
      request,
    });

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const clone = response.clone();
        const data = await clone.json() as { accessToken?: string } | null;
        if (data && data.accessToken) {
          const cookieStore = await cookies();
          cookieStore.set(AUTH_COOKIE_NAMES.ACCESS_TOKEN, data.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
          });
        }
      }
    }

    return response;
  } catch {
    return backendConfigErrorResponse();
  }
}
