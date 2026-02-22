import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api/utils';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  createErrorResponse,
  extractParams,
} from '@/lib/api/utils';

/**
 * PUT /api/chat/conversations/:id/read
 *
 * Marks a conversation as read.
 *
 * Backend contract: { message: string } or { data: {...} }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await extractParams(params);
    const res = await backendFetch(`/api/chat/conversations/${id}/read`, {
      method: HttpMethod.PUT,
      forwardCookies: true,
    });
    return handleBackendResponse(res, 'Failed to mark conversation as read');
  } catch (error) {
    console.error('[PUT /api/chat/conversations/[id]/read] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
