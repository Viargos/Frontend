import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api/utils';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  createErrorResponse,
} from '@/lib/api/utils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const res = await backendFetch('/api/posts/media', {
      method: HttpMethod.POST,
      body: formData,
      forwardCookies: true,
    });

    return handleBackendResponse(res, 'Request failed');
  } catch (error) {
    console.error('[POST /api/posts/media] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
