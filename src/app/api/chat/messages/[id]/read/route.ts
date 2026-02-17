import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api/utils';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  createErrorResponse,
  extractParams,
} from '@/lib/api/utils';

/**
 * PUT /api/chat/messages/:id/read
 *
 * Mark a message as read.
 *
 * Backend contract: { message: string } or { data: {...} }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await extractParams(params);
    const res = await backendFetch(`/api/chat/messages/${id}/read`, {
      method: HttpMethod.PUT,
      forwardCookies: true,
    });
    return handleBackendResponse(res, 'Failed to mark message as read');
  } catch (error) {
    console.error('[PUT /api/chat/messages/[id]/read] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
