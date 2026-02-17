import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api/utils';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  createErrorResponse,
} from '@/lib/api/utils';

export async function GET(request: NextRequest) {
  try {
    const res = await backendFetch('/api/users/profile/stats', {
      method: HttpMethod.GET,
      forwardCookies: true,
    });

    return handleBackendResponse(res, 'Request failed');
  } catch (error) {
    console.error('[GET /api/user/stats] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
