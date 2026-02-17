import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  createErrorResponse,
  extractParams,
} from '@/lib/api/utils/response-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await extractParams(params);
    const res = await backendFetch(`/api/chat/conversations/${id}`, {
      method: HttpMethod.GET,
      forwardCookies: true,
    });
    return handleBackendResponse(res, 'Failed to fetch conversation');
  } catch (error) {
    console.error('[GET /api/chat/conversations/[id]] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

/**
 * DELETE /api/chat/conversations/:id
 *
 * Delete a conversation.
 *
 * Backend contract: { message: string } or { data: {...} }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await extractParams(params);
    const res = await backendFetch(`/api/chat/conversations/${id}`, {
      method: HttpMethod.DELETE,
      forwardCookies: true,
    });
    return handleBackendResponse(res, 'Failed to delete conversation');
  } catch (error) {
    console.error('[DELETE /api/chat/conversations/[id]] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
