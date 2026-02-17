import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api/utils';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  createErrorResponse,
  parseRequestBody,
} from '@/lib/api/utils';

/**
 * PUT /api/chat/messages/read
 *
 * Mark multiple messages as read.
 *
 * Backend contract: { message: string } or { data: {...} }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await parseRequestBody(request);
    const res = await backendFetch('/api/chat/messages/read', {
      method: HttpMethod.PUT,
      body: JSON.stringify(body),
      forwardCookies: true,
    });
    return handleBackendResponse(res, 'Failed to mark messages as read');
  } catch (error) {
    console.error('[PUT /api/chat/messages/read] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
