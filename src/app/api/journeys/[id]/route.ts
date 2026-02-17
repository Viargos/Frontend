import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api/utils';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  createErrorResponse,
  parseRequestBody,
  extractParams,
} from '@/lib/api/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await extractParams(params);
    const res = await backendFetch(`/api/journeys/${id}`, {
      method: HttpMethod.GET,
      forwardCookies: true,
    });
    return handleBackendResponse(res, 'Failed to fetch journey');
  } catch (error) {
    console.error('[GET /api/journeys/[id]] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await extractParams(params);
    const body = await parseRequestBody(request);
    const res = await backendFetch(`/api/journeys/${id}`, {
      method: HttpMethod.PATCH,
      body: JSON.stringify(body),
      forwardCookies: true,
    });
    return handleBackendResponse(res, 'Failed to update journey');
  } catch (error) {
    console.error('[PATCH /api/journeys/[id]] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await extractParams(params);
    const res = await backendFetch(`/api/journeys/${id}`, {
      method: HttpMethod.DELETE,
      forwardCookies: true,
    });
    return handleBackendResponse(res, 'Failed to delete journey');
  } catch (error) {
    console.error('[DELETE /api/journeys/[id]] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
