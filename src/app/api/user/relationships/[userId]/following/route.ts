import { NextRequest} from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  createErrorResponse,
  parseRequestBody,
  extractParams,
} from '@/lib/api/utils/response-helpers';

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
    const { userId  } = await extractParams(params);
    const res = await backendFetch(`/api/users/relationships/${userId}/following`, {
      method: HttpMethod.GET,
      forwardCookies: true,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        {
          error: (body as ApiErrorDto).error ?? 'Failed to fetch following',
          message: (body as ApiErrorDto).message,
        } as ApiErrorDto,
        { status: res.status }
      );
    }
    return handleBackendResponse(res, 'Request failed');
  } catch (error) {
    console.error('[GET /api/user/relationships/[userId]/following] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
