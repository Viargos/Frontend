import { backendConfigErrorResponse, getBackendBaseUrl } from '@/app/api/_shared/backend-url';
import { proxyToBackend } from '@/app/api/_shared/proxy';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    return proxyToBackend({
      backendBaseUrl: getBackendBaseUrl(),
      backendPath: `/products/${id}`,
      request,
    });
  } catch {
    return backendConfigErrorResponse();
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.text();

    return proxyToBackend({
      backendBaseUrl: getBackendBaseUrl(),
      backendPath: `/products/${id}`,
      body,
      method: 'PATCH',
      request,
    });
  } catch {
    return backendConfigErrorResponse();
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    return proxyToBackend({
      backendBaseUrl: getBackendBaseUrl(),
      backendPath: `/products/${id}`,
      method: 'DELETE',
      request,
    });
  } catch {
    return backendConfigErrorResponse();
  }
}
