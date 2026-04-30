import type { SessionRefreshResult } from '@/modules/common/types';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAMES } from '@/modules/common/constants';

export async function refreshSessionStub(): Promise<SessionRefreshResult> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(AUTH_COOKIE_NAMES.REFRESH_TOKEN)?.value;

  if (!refreshToken) {
    return {
      reason: 'missing_refresh_cookie',
      refreshed: false,
    };
  }

  return {
    reason: 'not_implemented',
    refreshed: false,
  };
}
