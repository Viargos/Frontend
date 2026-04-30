import { backendConfigErrorResponse, getBackendBaseUrl } from '@/app/api/_shared/backend-url';
import { proxyToBackend } from '@/app/api/_shared/proxy';

export async function GET(request: Request) {
  try {
    return proxyToBackend({
      backendBaseUrl: getBackendBaseUrl(),
      backendPath: '/chat/conversations',
      request,
    });
  } catch {
    return backendConfigErrorResponse();
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    return proxyToBackend({
      backendBaseUrl: getBackendBaseUrl(),
      backendPath: '/chat/conversations',
      body,
      request,
    });
  } catch {
    return backendConfigErrorResponse();
  }
}
