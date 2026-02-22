import { NextRequest } from 'next/server';
import { AUTH_ENDPOINTS } from '@/lib/auth/auth.config';
import { backendFetch, proxyBackendResponse } from '@/lib/api/utils';
import { HttpMethod } from '@/enums';
import {
  createErrorResponse,
  parseRequestBody,
} from '@/lib/api/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await parseRequestBody(request);
    const res = await backendFetch(AUTH_ENDPOINTS.SIGNUP, {
      method: HttpMethod.POST,
      body: JSON.stringify(body),
      forwardCookies: true,
    });
    return proxyBackendResponse(res);
  } catch (error) {
    console.error('[Signup Route Handler] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
