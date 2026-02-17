import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  createErrorResponse,
  parseRequestBody,
} from '@/lib/api/utils/response-helpers';

export async function PATCH(request: NextRequest) {
  try {
    const body = await parseRequestBody(request);

    const res = await backendFetch('/api/users/profile', {
      method: HttpMethod.PATCH,
      body: JSON.stringify(body),
      forwardCookies: true,
    });

    return handleBackendResponse(res, 'Request failed');
  } catch (error) {
    console.error('[PATCH /api/user/profile] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
