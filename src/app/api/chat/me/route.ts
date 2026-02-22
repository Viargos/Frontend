import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api/utils';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  createErrorResponse,
} from '@/lib/api/utils';

/**
 * GET /api/chat/me
 *
 * Get current user's chat profile.
 *
 * Backend contract: { data: ChatUser }
 */
export async function GET(request: NextRequest) {
  try {
    const res = await backendFetch('/api/chat/me', {
      method: HttpMethod.GET,
      forwardCookies: true,
    });
    return handleBackendResponse(res, 'Failed to fetch chat user');
  } catch (error) {
    console.error('[GET /api/chat/me] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
