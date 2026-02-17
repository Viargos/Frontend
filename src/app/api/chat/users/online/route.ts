import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  createErrorResponse,
} from '@/lib/api/utils/response-helpers';

/**
 * GET /api/chat/users/online
 *
 * Get list of online chat users.
 *
 * Backend contract: { data: ChatUser[] }
 */
export async function GET(request: NextRequest) {
  try {
    const res = await backendFetch('/api/chat/users/online', {
      method: HttpMethod.GET,
      forwardCookies: true,
    });
    return handleBackendResponse(res, 'Failed to fetch online users');
  } catch (error) {
    console.error('[GET /api/chat/users/online] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
