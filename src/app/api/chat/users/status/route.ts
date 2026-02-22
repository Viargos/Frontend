import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api/utils';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  createErrorResponse,
  parseRequestBody,
} from '@/lib/api/utils';

/**
 * PUT /api/chat/users/status
 *
 * Update user's online/offline status.
 *
 * Backend contract: { data: ChatUser } or { message: string }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await parseRequestBody(request);
    const res = await backendFetch('/api/chat/users/status', {
      method: HttpMethod.PUT,
      body: JSON.stringify(body),
      forwardCookies: true,
    });
    return handleBackendResponse(res, 'Failed to update status');
  } catch (error) {
    console.error('[PUT /api/chat/users/status] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
