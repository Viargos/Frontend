import { backendConfigErrorResponse, getBackendBaseUrl } from '@/app/api/_shared/backend-url';
import { proxyToBackend } from '@/app/api/_shared/proxy';

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);

    return proxyToBackend({
      backendBaseUrl: getBackendBaseUrl(),
      backendPath: `/journeys/nearby${requestUrl.search}`,
      request,
    });
  } catch {
    return backendConfigErrorResponse();
  }
}
