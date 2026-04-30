import { backendConfigErrorResponse, getBackendBaseUrl } from '@/app/api/_shared/backend-url';
import { proxyToBackend } from '@/app/api/_shared/proxy';

export async function POST(request: Request) {
  try {
    const body = await request.text();

    return proxyToBackend({
      backendBaseUrl: getBackendBaseUrl(),
      backendPath: '/auth/verify-email',
      body,
      forwardSetCookie: true,
      request,
    });
  } catch {
    return backendConfigErrorResponse();
  }
}
