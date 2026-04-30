import { backendConfigErrorResponse, getBackendBaseUrl } from '@/app/api/_shared/backend-url';
import { proxyToBackend } from '@/app/api/_shared/proxy';

export async function GET(request: Request, context: { params: Promise<{ journeyId: string }> }) {
  try {
    const requestUrl = new URL(request.url);
    const { journeyId } = await context.params;

    return proxyToBackend({
      backendBaseUrl: getBackendBaseUrl(),
      backendPath: `/posts/journey/${journeyId}${requestUrl.search}`,
      request,
    });
  } catch {
    return backendConfigErrorResponse();
  }
}
