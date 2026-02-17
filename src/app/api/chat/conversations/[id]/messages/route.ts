import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  extractParams,
  createErrorResponse,
} from '@/lib/api/utils/response-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await extractParams(params);

    const res = await backendFetch(`/api/chat/conversations/${id}/messages`, {
      method: HttpMethod.GET,
      forwardCookies: true,
      searchParams: request.nextUrl.searchParams,
    });

    return handleBackendResponse(res, 'Failed to fetch messages');
  } catch (error) {
    console.error('[GET /api/chat/conversations/[id]/messages] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
