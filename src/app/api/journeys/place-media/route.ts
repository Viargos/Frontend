import { backendConfigErrorResponse, getBackendBaseUrl } from '@/app/api/_shared/backend-url';
import { proxyToBackend } from '@/app/api/_shared/proxy';

export async function POST(request: Request) {
  try {
    const body = await request.arrayBuffer();

    return proxyToBackend({
      backendBaseUrl: getBackendBaseUrl(),
      backendPath: '/journeys/place-media',
      body,
      method: 'POST',
      request,
    });
  } catch {
    return backendConfigErrorResponse();
  }
}
