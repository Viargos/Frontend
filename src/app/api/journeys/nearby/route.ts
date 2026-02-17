import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  createErrorResponse,
} from '@/lib/api/utils/response-helpers';

export async function GET(request: NextRequest) {
  try {
    const res = await backendFetch('/api/journeys/nearby', {
      method: HttpMethod.GET,
      forwardCookies: true,
      searchParams: request.nextUrl.searchParams,
    });

    return handleBackendResponse(res, 'Failed to fetch nearby journeys');
  } catch (error) {
    console.error('[GET /api/journeys/nearby] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
