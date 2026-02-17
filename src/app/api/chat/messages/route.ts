import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  createErrorResponse,
  parseRequestBody,
} from '@/lib/api/utils/response-helpers';

/**
 * POST /api/chat/messages
 *
 * Send a new chat message.
 *
 * Backend contract: { data: ChatMessage }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await parseRequestBody(request);
    const res = await backendFetch('/api/chat/messages', {
      method: HttpMethod.POST,
      body: JSON.stringify(body),
      forwardCookies: true,
    });
    return handleBackendResponse(res, 'Failed to send message');
  } catch (error) {
    console.error('[POST /api/chat/messages] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
