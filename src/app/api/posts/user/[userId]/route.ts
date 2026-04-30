import { backendConfigErrorResponse, getBackendBaseUrl } from '@/app/api/_shared/backend-url';
import { proxyToBackend } from '@/app/api/_shared/proxy';

export async function GET(request: Request, context: { params: Promise<{ userId: string }> }) {
  try {
    const requestUrl = new URL(request.url);
    const { userId } = await context.params;

    return proxyToBackend({
      backendBaseUrl: getBackendBaseUrl(),
      backendPath: `/posts/user/${userId}${requestUrl.search}`,
      request,
    });
  } catch {
    return backendConfigErrorResponse();
  }
}
