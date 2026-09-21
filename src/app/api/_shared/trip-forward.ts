import { backendConfigErrorResponse, getBackendBaseUrl } from '@/app/api/_shared/backend-url';
import { proxyToBackend } from '@/app/api/_shared/proxy';

export async function forwardTripRequest(request: Request, path: string[]) {
  try {
    const requestUrl = new URL(request.url);
    const body = ['POST', 'PUT', 'PATCH'].includes(request.method)
      ? await request.text()
      : null;
    const revision = request.headers.get('if-match');
    const idempotencyKey = request.headers.get('idempotency-key');
    const additionalHeaders = new Headers();

    if (revision) {
      additionalHeaders.set('if-match', revision);
    }
    if (idempotencyKey) {
      additionalHeaders.set('idempotency-key', idempotencyKey);
    }

    const suffix = path.length > 0 ? `/${path.map(encodeURIComponent).join('/')}` : '';
    return proxyToBackend({
      additionalHeaders,
      backendBaseUrl: getBackendBaseUrl(),
      backendPath: `/v1/trips${suffix}${requestUrl.search}`,
      body,
      request,
    });
  } catch {
    return backendConfigErrorResponse();
  }
}
