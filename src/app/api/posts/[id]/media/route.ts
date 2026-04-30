import { backendConfigErrorResponse, getBackendBaseUrl } from '@/app/api/_shared/backend-url';
import { proxyToBackend } from '@/app/api/_shared/proxy';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.text();
    return proxyToBackend({
      backendBaseUrl: getBackendBaseUrl(),
      backendPath: `/posts/${id}/media`,
      body,
      request,
    });
  } catch {
    return backendConfigErrorResponse();
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url') ?? '';
    const backendPath = url
      ? `/posts/${id}/media?url=${encodeURIComponent(url)}`
      : `/posts/${id}/media`;
    return proxyToBackend({
      backendBaseUrl: getBackendBaseUrl(),
      backendPath,
      request,
    });
  } catch {
    return backendConfigErrorResponse();
  }
}
