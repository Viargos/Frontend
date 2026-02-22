import { NextRequest} from 'next/server';
import { backendFetch } from '@/lib/api/utils';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  createErrorResponse,
  parseRequestBody,
  extractParams,
} from '@/lib/api/utils';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id  } = await extractParams(params);
    const body = await parseRequestBody(request);

    const res = await backendFetch(`/journeys/${id}/activities/reorder`, {
      method: HttpMethod.PUT,
      body: JSON.stringify(body),
      forwardCookies: true,
    });

    

    return handleBackendResponse(res, 'Request failed');
  } catch (error) {
    console.error('[PUT /api/journeys/[id]/activities/reorder] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
