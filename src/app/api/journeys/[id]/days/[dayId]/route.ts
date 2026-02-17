import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  createErrorResponse,
  parseRequestBody,
  extractParams,
} from '@/lib/api/utils/response-helpers';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; dayId: string }> }
) {
  try {
    const { id, dayId } = await extractParams(params);

    const res = await backendFetch(`/journeys/${id}/days/${dayId}`, {
      method: HttpMethod.DELETE,
      forwardCookies: true,
    });

    return handleBackendResponse(res, 'Request failed');
  } catch (error) {
    console.error('[DELETE /api/journeys/[id]/days/[dayId]] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
