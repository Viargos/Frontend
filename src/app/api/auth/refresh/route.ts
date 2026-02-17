import { NextRequest } from 'next/server';
import { AUTH_ENDPOINTS } from '@/lib/auth/auth.config';
import { backendFetch, proxyBackendResponse } from '@/lib/api/backend-fetch';
import { HttpMethod } from '@/enums';
import { createErrorResponse } from '@/lib/api/utils/response-helpers';

export async function POST(request: NextRequest) {
  try {
    const res = await backendFetch(AUTH_ENDPOINTS.REFRESH, {
      method: HttpMethod.POST,
      forwardCookies: true,
    });
    return proxyBackendResponse(res, { forwardSetCookie: true });
  } catch (error) {
    console.error('Refresh route handler error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
