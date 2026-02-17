import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api/utils';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  parseRequestBody,
  createErrorResponse,
} from '@/lib/api/utils';

export async function GET(request: NextRequest) {
  try {
    const res = await backendFetch('/api/chat/conversations', {
      method: HttpMethod.GET,
      forwardCookies: true,
    });

    return handleBackendResponse(res, 'Failed to fetch conversations');
  } catch (error) {
    console.error('[GET /api/chat/conversations] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseRequestBody(request);

    const res = await backendFetch('/api/chat/conversations', {
      method: HttpMethod.POST,
      body: JSON.stringify(body),
      forwardCookies: true,
    });

    return handleBackendResponse(res, 'Failed to create conversation');
  } catch (error) {
    console.error('[POST /api/chat/conversations] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
