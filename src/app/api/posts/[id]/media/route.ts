import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  createErrorResponse,
  parseRequestBody,
  extractParams,
} from '@/lib/api/utils/response-helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await extractParams(params);
    const body = await parseRequestBody(request);
    const res = await backendFetch(`/api/posts/${postId}/media`, {
      method: HttpMethod.POST,
      body: JSON.stringify(body),
      forwardCookies: true,
    });

    return handleBackendResponse(res, 'Request failed');
  } catch (error) {
    console.error('[POST /api/posts/[id]/media] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
