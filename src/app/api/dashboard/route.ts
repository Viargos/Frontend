import { backendConfigErrorResponse, getBackendBaseUrl } from '@/app/api/_shared/backend-url';
import { proxyToBackend } from '@/app/api/_shared/proxy';

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const query = requestUrl.search;

    return proxyToBackend({
      backendBaseUrl: getBackendBaseUrl(),
      backendPath: `/dashboard${query}`,
      request,
    });
  } catch {
    return backendConfigErrorResponse();
  }
}
