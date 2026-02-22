import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api/utils';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  createErrorResponse,
  extractParams,
} from '@/lib/api/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await extractParams(params);
    const res = await backendFetch(
      `/api/users/relationships/${userId}/followers`,
      {
        method: HttpMethod.GET,
        forwardCookies: true,
      }
    );
    return handleBackendResponse(res, 'Failed to fetch followers');
  } catch (error) {
    console.error(
      '[GET /api/user/relationships/[userId]/followers] Error:',
      error
    );
    return createErrorResponse('Internal server error', 500);
  }
}
