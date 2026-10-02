import { backendConfigErrorResponse, getBackendBaseUrl } from '@/app/api/_shared/backend-url';
import { proxyToBackend } from '@/app/api/_shared/proxy';

async function forward(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path } = await context.params;
    const requestUrl = new URL(request.url);
    const body = ['POST', 'PUT', 'PATCH'].includes(request.method)
      ? await request.text()
      : null;

    return proxyToBackend({
      backendBaseUrl: getBackendBaseUrl(),
      backendPath: `/notifications/${path.map(encodeURIComponent).join('/')}${requestUrl.search}`,
      body,
      request,
    });
  } catch {
    return backendConfigErrorResponse();
  }
}

export const DELETE = forward;
export const GET = forward;
export const PATCH = forward;
export const POST = forward;
