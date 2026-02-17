import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api/utils';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  createErrorResponse,
  extractParams,
} from '@/lib/api/utils';

/**
 * GET /api/user/:userId
 *
 * Get user profile by user ID.
 *
 * Backend contract: { data: UserProfile }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await extractParams(params);
    const res = await backendFetch(`/api/users/${userId}`, {
      method: HttpMethod.GET,
      forwardCookies: true,
    });
    return handleBackendResponse(res, 'Failed to fetch user profile');
  } catch (error) {
    console.error('[GET /api/user/[userId]] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
