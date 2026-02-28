import { backendConfigErrorResponse, getBackendBaseUrl } from '@/app/api/_shared/backend-url';
import { proxyToBackend } from '@/app/api/_shared/proxy';

export async function PUT(request: Request) {
  try {
    const body = await request.text();

    return proxyToBackend({
      backendBaseUrl: getBackendBaseUrl(),
      backendPath: '/chat/users/status',
      body,
      request,
    });
  } catch {
    return backendConfigErrorResponse();
  }
}
