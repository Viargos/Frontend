import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';
import { HttpMethod } from '@/enums';
import {
  handleBackendResponse,
  createErrorResponse,
} from '@/lib/api/utils/response-helpers';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const res = await backendFetch('/api/users/profile/image', {
      method: HttpMethod.POST,
      body: formData,
      forwardCookies: true,
    });

    return handleBackendResponse(res, 'Failed to upload profile image');
  } catch (error) {
    console.error('[POST /api/user/profile-image] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const res = await backendFetch('/api/users/profile/image', {
      method: HttpMethod.DELETE,
      forwardCookies: true,
    });

    return handleBackendResponse(res, 'Failed to delete profile image');
  } catch (error) {
    console.error('[DELETE /api/user/profile-image] Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
