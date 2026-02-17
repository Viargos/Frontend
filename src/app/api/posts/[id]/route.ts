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
    const res = await backendFetch(`/api/posts/${id}`, {
      method: HttpMethod.GET,
      forwardCookies: true,
    });

    return handleBackendResponse(res, 'Request failed');
  } catch (error) {
    const { id } = await extractParams(params);
    console.error(`[GET /api/posts/${id}] Error:`, error);
    return createErrorResponse('Internal server error', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await extractParams(params);
    const body = await parseRequestBody(request);
    const res = await backendFetch(`/api/posts/${id}`, {
      method: HttpMethod.PUT,
      body: JSON.stringify(body),
      forwardCookies: true,
    });

    return handleBackendResponse(res, 'Request failed');
  } catch (error) {
    const { id } = await extractParams(params);
    console.error(`[PUT /api/posts/${id}] Error:`, error);
    return createErrorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await extractParams(params);
    const res = await backendFetch(`/api/posts/${id}`, {
      method: HttpMethod.DELETE,
      forwardCookies: true,
    });

    return handleBackendResponse(res, 'Request failed');
  } catch (error) {
    const { id } = await extractParams(params);
    console.error(`[DELETE /api/posts/${id}] Error:`, error);
    return createErrorResponse('Internal server error', 500);
  }
}
