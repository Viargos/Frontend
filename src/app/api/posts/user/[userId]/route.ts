import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  createErrorResponse,
  extractParams,
} from '@/lib/api/utils/response-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await extractParams(params);
    const res = await backendFetch(`/api/posts/user/${userId}`, {
      method: HttpMethod.GET,
      forwardCookies: true,
      searchParams: request.nextUrl.searchParams,
    });

    return handleBackendResponse(res, 'Request failed');
  } catch (error) {
    console.error('[GET /api/posts/user/[userId]] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
