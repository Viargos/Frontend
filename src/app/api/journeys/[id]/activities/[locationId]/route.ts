import { backendConfigErrorResponse, getBackendBaseUrl } from '@/app/api/_shared/backend-url';
import { proxyToBackend } from '@/app/api/_shared/proxy';

type Params = { id: string; locationId: string };

export async function PUT(request: Request, context: { params: Promise<Params> }) {
  try {
    const { id, locationId } = await context.params;
    const body = await request.text();

    return proxyToBackend({
      backendBaseUrl: getBackendBaseUrl(),
      backendPath: `/journeys/${id}/activities/${locationId}`,
      body,
      request,
    });
  } catch {
    return backendConfigErrorResponse();
  }
}

export async function DELETE(request: Request, context: { params: Promise<Params> }) {
  try {
    const { id, locationId } = await context.params;

    return proxyToBackend({
      backendBaseUrl: getBackendBaseUrl(),
      backendPath: `/journeys/${id}/activities/${locationId}`,
      request,
    });
  } catch {
    return backendConfigErrorResponse();
  }
}
