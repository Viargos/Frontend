import { backendConfigErrorResponse, getBackendBaseUrl } from '@/app/api/_shared/backend-url';
import { proxyToBackend } from '@/app/api/_shared/proxy';

export async function DELETE(request: Request, context: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await context.params;

    return proxyToBackend({
      backendBaseUrl: getBackendBaseUrl(),
      backendPath: `/users/relationships/unfollow/${userId}`,
      request,
    });
  } catch {
    return backendConfigErrorResponse();
  }
}
