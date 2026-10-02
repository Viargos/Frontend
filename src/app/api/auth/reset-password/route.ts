import { cookies } from 'next/headers';
import { backendConfigErrorResponse, getBackendBaseUrl } from '@/app/api/_shared/backend-url';
import { proxyToBackend } from '@/app/api/_shared/proxy';
import { AUTH_COOKIE_NAMES } from '@/modules/common/constants';

export async function POST(request: Request) {
  try {
    const body = await request.text();

    const response = await proxyToBackend({
      backendBaseUrl: getBackendBaseUrl(),
      backendPath: '/auth/reset-password',
      body,
      request,
    });

    if (response.ok) {
      const cookieStore = await cookies();
      cookieStore.delete(AUTH_COOKIE_NAMES.ACCESS_TOKEN);
    }

    return response;
  } catch {
    return backendConfigErrorResponse();
  }
}
