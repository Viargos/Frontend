import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  createErrorResponse,
  parseRequestBody,
  extractParams,
} from '@/lib/api/utils/response-helpers';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; locationId: string }> }
) {
  try {
    const { id, locationId } = await extractParams(params);
    const body = await parseRequestBody(request);

    const res = await backendFetch(`/journeys/${id}/activities/${locationId}`, {
      method: HttpMethod.PUT,
      body: JSON.stringify(body),
      forwardCookies: true,
    });

    return handleBackendResponse(res, 'Request failed');
  } catch (error) {
    console.error(
      '[PUT /api/journeys/[id]/activities/[locationId]] Error:',
      error
    );
    return createErrorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; locationId: string }> }
) {
  try {
    const { id, locationId } = await extractParams(params);

    const res = await backendFetch(`/journeys/${id}/activities/${locationId}`, {
      method: HttpMethod.DELETE,
      forwardCookies: true,
    });

    return handleBackendResponse(res, 'Request failed');
  } catch (error) {
    console.error(
      '[DELETE /api/journeys/[id]/activities/[locationId]] Error:',
      error
    );
    return createErrorResponse('Internal server error', 500);
  }
}
