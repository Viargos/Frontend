import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api/utils';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  createErrorResponse,
  parseRequestBody,
} from '@/lib/api/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await parseRequestBody(request);
    const res = await backendFetch('/api/users/relationships/follow', {
      method: HttpMethod.POST,
      body: JSON.stringify(body),
      forwardCookies: true,
    });
    return handleBackendResponse(res, 'Failed to follow user');
  } catch (error) {
    console.error('[POST /api/user/relationships/follow] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
