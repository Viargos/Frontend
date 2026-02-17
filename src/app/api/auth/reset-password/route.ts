import { NextRequest } from 'next/server';
import { AUTH_ENDPOINTS } from '@/lib/auth/auth.config';
import { backendFetch, proxyBackendResponse } from '@/lib/api/backend-fetch';
import { HttpMethod } from '@/enums';
import {
  createErrorResponse,
  parseRequestBody,
} from '@/lib/api/utils/response-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await parseRequestBody(request);
    const res = await backendFetch(AUTH_ENDPOINTS.RESET_PASSWORD, {
      method: HttpMethod.POST,
      body: JSON.stringify(body),
      forwardCookies: true,
    });
    return proxyBackendResponse(res);
  } catch (error) {
    console.error('[Reset Password Route Handler] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
