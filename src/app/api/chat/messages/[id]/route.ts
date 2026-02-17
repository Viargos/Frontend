import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  createErrorResponse,
  parseRequestBody,
  extractParams,
} from '@/lib/api/utils/response-helpers';

/**
 * PUT /api/chat/messages/:id
 *
 * Update a chat message.
 *
 * Backend contract: { data: ChatMessage }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await extractParams(params);
    const body = await parseRequestBody(request);
    const res = await backendFetch(`/api/chat/messages/${id}`, {
      method: HttpMethod.PUT,
      body: JSON.stringify(body),
      forwardCookies: true,
    });
    return handleBackendResponse(res, 'Failed to update message');
  } catch (error) {
    console.error('[PUT /api/chat/messages/[id]] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

/**
 * DELETE /api/chat/messages/:id
 *
 * Delete a chat message.
 *
 * Backend contract: { message: string } or { data: {...} }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await extractParams(params);
    const res = await backendFetch(`/api/chat/messages/${id}`, {
      method: HttpMethod.DELETE,
      forwardCookies: true,
    });
    return handleBackendResponse(res, 'Failed to delete message');
  } catch (error) {
    console.error('[DELETE /api/chat/messages/[id]] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
