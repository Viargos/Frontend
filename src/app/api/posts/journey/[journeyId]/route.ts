import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  createErrorResponse,
  extractParams,
} from '@/lib/api/utils/response-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ journeyId: string }> }
) {
  try {
    const { journeyId } = await extractParams(params);
    const res = await backendFetch(`/api/posts/journey/${journeyId}`, {
      method: HttpMethod.GET,
      forwardCookies: true,
    });

    return handleBackendResponse(res, 'Request failed');
  } catch (error) {
    console.error('[GET /api/posts/journey/[journeyId]] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
