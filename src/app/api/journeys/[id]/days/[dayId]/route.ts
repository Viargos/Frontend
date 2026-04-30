import { backendConfigErrorResponse, getBackendBaseUrl } from '@/app/api/_shared/backend-url';
import { proxyToBackend } from '@/app/api/_shared/proxy';

export async function DELETE(request: Request, context: { params: Promise<{ id: string; dayId: string }> }) {
  try {
    const { id, dayId } = await context.params;

    return proxyToBackend({
      backendBaseUrl: getBackendBaseUrl(),
      backendPath: `/journeys/${id}/days/${dayId}`,
      request,
    });
  } catch {
    return backendConfigErrorResponse();
  }
}
