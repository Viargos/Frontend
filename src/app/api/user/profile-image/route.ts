import { backendConfigErrorResponse, getBackendBaseUrl } from '@/app/api/_shared/backend-url';
import { proxyToBackend } from '@/app/api/_shared/proxy';

export async function POST(request: Request) {
  try {
    const body = await request.arrayBuffer();

    return proxyToBackend({
      backendBaseUrl: getBackendBaseUrl(),
      backendPath: '/users/profile-image',
      body,
      request,
    });
  } catch {
    return backendConfigErrorResponse();
  }
}

export async function DELETE(request: Request) {
  try {
    return proxyToBackend({
      backendBaseUrl: getBackendBaseUrl(),
      backendPath: '/users/profile-image',
      request,
    });
  } catch {
    return backendConfigErrorResponse();
  }
}
