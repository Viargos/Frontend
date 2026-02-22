import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api/utils';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  createErrorResponse,
} from '@/lib/api/utils';

export async function GET(_request: NextRequest) {
  try {
    const res = await backendFetch('/api/location/current', {
      method: HttpMethod.GET,
      forwardCookies: false, // Public endpoint, no auth needed
    });

    return handleBackendResponse(res, 'Failed to get location');
  } catch (error) {
    console.error('[GET /api/location/current] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
