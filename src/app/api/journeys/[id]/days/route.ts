import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  createErrorResponse,
  parseRequestBody,
  extractParams,
} from '@/lib/api/utils/response-helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await extractParams(params);
    const body = await parseRequestBody(request);

    const res = await backendFetch(`/journeys/${id}/days`, {
      method: HttpMethod.POST,
      body: JSON.stringify(body),
      forwardCookies: true,
    });

    return handleBackendResponse(res, 'Request failed');
  } catch (error) {
    console.error('[POST /api/journeys/[id]/days] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
