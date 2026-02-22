import { NextRequest} from 'next/server';
import { backendFetch } from '@/lib/api/utils';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  createErrorResponse,
  parseRequestBody,
  extractParams,
} from '@/lib/api/utils';

/**
 * GET /api/user/relationships/[userId]/following - Get users that a user is following.
 * Proxies to backend /api/users/relationships/:userId/following.
 * Returns backend response as-is (no unwrapping).
  *
 * Backend returns: { data: T } or { data: T[] }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await extractParams(params);
    const res = await backendFetch(
      `/api/users/relationships/${userId}/following`,
      {
        method: HttpMethod.GET,
        forwardCookies: true,
      }
    );
    return handleBackendResponse(res, 'Failed to fetch following');
  } catch (error) {
    console.error('[GET /api/user/relationships/[userId]/following] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
