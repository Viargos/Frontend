import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api/utils';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  createErrorResponse,
} from '@/lib/api/utils';

/**
 * GET /api/chat/users/search
 *
 * Search for chat users by query.
 *
 * Backend contract: { data: ChatUser[] }
 */
export async function GET(request: NextRequest) {
  try {
    const res = await backendFetch('/api/chat/users/search', {
      method: HttpMethod.GET,
      forwardCookies: true,
      searchParams: request.nextUrl.searchParams,
    });
    return handleBackendResponse(res, 'Failed to search users');
  } catch (error) {
    console.error('[GET /api/chat/users/search] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
