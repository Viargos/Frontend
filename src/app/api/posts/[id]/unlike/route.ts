import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api/utils';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  createErrorResponse,
  extractParams,
} from '@/lib/api/utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await extractParams(params);
    const res = await backendFetch(`/api/posts/${id}/unlike`, {
      method: HttpMethod.POST,
      forwardCookies: true,
    });

    return handleBackendResponse(res, 'Request failed');
  } catch (error) {
    const { id } = await extractParams(params);
    console.error(`[POST /api/posts/${id}/unlike] Error:`, error);
    return createErrorResponse('Internal server error', 500);
  }
}
