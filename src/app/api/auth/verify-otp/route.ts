import { NextRequest } from 'next/server';
import { AUTH_ENDPOINTS } from '@/lib/auth/auth.config';
import { backendFetch, proxyBackendResponse } from '@/lib/api/backend-fetch';
import { HttpMethod } from '@/enums';
import {
  parseRequestBody,
  createErrorResponse,
} from '@/lib/api/utils/response-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await parseRequestBody(request);

    const res = await backendFetch(AUTH_ENDPOINTS.VERIFY_OTP, {
      method: HttpMethod.POST,
      body: JSON.stringify(body),
      forwardCookies: true,
    });

    return proxyBackendResponse(res, { forwardSetCookie: true });
  } catch (error) {
    console.error('[POST /api/auth/verify-otp] Error:', error);
    return createErrorResponse('OTP verification failed', 500);
  }
}
