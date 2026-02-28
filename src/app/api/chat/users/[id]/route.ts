import { backendConfigErrorResponse, getBackendBaseUrl } from '@/app/api/_shared/backend-url';
import { proxyToBackend } from '@/app/api/_shared/proxy';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    return proxyToBackend({
      backendBaseUrl: getBackendBaseUrl(),
      backendPath: `/chat/users/${id}`,
      request,
    });
  } catch {
    return backendConfigErrorResponse();
  }
}
