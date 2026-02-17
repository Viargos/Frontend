import { NextRequest } from 'next/server';
import { AUTH_ENDPOINTS } from '@/lib/auth/auth.config';
import { backendFetch, proxyBackendResponse } from '@/lib/api/utils';
import { HttpMethod } from '@/enums';
import {
  parseRequestBody,
  createErrorResponse,
} from '@/lib/api/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await parseRequestBody(request);

    const res = await backendFetch(AUTH_ENDPOINTS.SIGNIN, {
      method: HttpMethod.POST,
      body: JSON.stringify(body),
      forwardCookies: true,
    });

    return proxyBackendResponse(res, { forwardSetCookie: true });
  } catch (error) {
    console.error('[POST /api/auth/signin] Error:', error);
    return createErrorResponse('Signin failed', 500);
  }
}
