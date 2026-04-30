import { backendConfigErrorResponse, getBackendBaseUrl } from '@/app/api/_shared/backend-url';
import { proxyToBackend } from '@/app/api/_shared/proxy';

export async function GET(request: Request) {
  try {
    return proxyToBackend({
      backendBaseUrl: getBackendBaseUrl(),
      backendPath: '/users/profile/me',
      request,
    });
  } catch {
    return backendConfigErrorResponse();
  }
}
