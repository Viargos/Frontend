import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api/utils';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  createErrorResponse,
  extractParams,
} from '@/lib/api/utils';

/**
 * GET /api/chat/users/:id
 *
 * Get a chat user by ID.
 *
 * Backend contract: { data: ChatUser }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await extractParams(params);
    const res = await backendFetch(`/api/chat/users/${id}`, {
      method: HttpMethod.GET,
      forwardCookies: true,
    });
    return handleBackendResponse(res, 'Failed to fetch chat user');
  } catch (error) {
    console.error('[GET /api/chat/users/[id]] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
