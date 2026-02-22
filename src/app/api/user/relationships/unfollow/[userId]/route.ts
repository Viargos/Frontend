import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api/utils';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  createErrorResponse,
  extractParams,
} from '@/lib/api/utils';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await extractParams(params);
    const res = await backendFetch(
      `/api/users/relationships/unfollow/${userId}`,
      {
        method: HttpMethod.DELETE,
        forwardCookies: true,
      }
    );
    return handleBackendResponse(res, 'Failed to unfollow user');
  } catch (error) {
    console.error(
      '[DELETE /api/user/relationships/unfollow/[userId]] Error:',
      error
    );
    return createErrorResponse('Internal server error', 500);
  }
}
