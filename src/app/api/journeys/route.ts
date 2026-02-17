import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  parseRequestBody,
  createErrorResponse,
} from '@/lib/api/utils/response-helpers';

export async function GET(request: NextRequest) {
  try {
    const res = await backendFetch('/api/journeys', {
      method: HttpMethod.GET,
      forwardCookies: true,
      searchParams: request.nextUrl.searchParams,
    });

    return handleBackendResponse(res, 'Failed to fetch journeys');
  } catch (error) {
    console.error('[GET /api/journeys] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseRequestBody(request);

    const res = await backendFetch('/api/journeys', {
      method: HttpMethod.POST,
      body: JSON.stringify(body),
      forwardCookies: true,
    });

    return handleBackendResponse(res, 'Failed to create journey');
  } catch (error) {
    console.error('[POST /api/journeys] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
