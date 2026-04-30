import { backendConfigErrorResponse, getBackendBaseUrl } from '@/app/api/_shared/backend-url';
import { proxyToBackend } from '@/app/api/_shared/proxy';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const requestUrl = new URL(request.url);
    const { id } = await context.params;

    return proxyToBackend({
      backendBaseUrl: getBackendBaseUrl(),
      backendPath: `/posts/${id}/comments${requestUrl.search}`,
      request,
    });
  } catch {
    return backendConfigErrorResponse();
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.text();

    return proxyToBackend({
      backendBaseUrl: getBackendBaseUrl(),
      backendPath: `/posts/${id}/comments`,
      body,
      request,
    });
  } catch {
    return backendConfigErrorResponse();
  }
}
