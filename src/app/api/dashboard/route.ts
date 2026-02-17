import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api/utils';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  createErrorResponse,
} from '@/lib/api/utils';

export async function GET(request: NextRequest) {
  try {
    const res = await backendFetch('/api/dashboard', {
      method: HttpMethod.GET,
      forwardCookies: true,
      searchParams: request.nextUrl.searchParams,
    });

    return handleBackendResponse(res, 'Failed to fetch dashboard');
  } catch (error) {
    console.error('[GET /api/dashboard] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
