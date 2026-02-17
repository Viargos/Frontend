import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  createErrorResponse,
  parseRequestBody,
  extractParams,
} from '@/lib/api/utils/response-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await extractParams(params);
    const res = await backendFetch(`/api/posts/${id}/comments`, {
      method: HttpMethod.GET,
      forwardCookies: true,
      searchParams: request.nextUrl.searchParams,
    });

    return handleBackendResponse(res, 'Request failed');
  } catch (error) {
    const { id } = await extractParams(params);
    console.error(`[GET /api/posts/${id}/comments] Error:`, error);
    return createErrorResponse('Internal server error', 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await extractParams(params);
    const body = await parseRequestBody(request);
    const res = await backendFetch(`/api/posts/${id}/comments`, {
      method: HttpMethod.POST,
      body: JSON.stringify(body),
      forwardCookies: true,
    });

    return handleBackendResponse(res, 'Request failed');
  } catch (error) {
    const { id } = await extractParams(params);
    console.error(`[POST /api/posts/${id}/comments] Error:`, error);
    return createErrorResponse('Internal server error', 500);
  }
}
