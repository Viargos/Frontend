import type { SessionState } from '@/modules/common/types';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AUTH_COOKIE_NAMES } from '@/modules/common/constants';
import { refreshSessionStub } from './refresh-orchestrator.server';

export async function getServerSessionState(): Promise<SessionState> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAMES.ACCESS_TOKEN)?.value;

  if (accessToken) {
    return { isAuthenticated: true };
  }

  const refreshResult = await refreshSessionStub();

  if (refreshResult.refreshed) {
    return { isAuthenticated: true };
  }

  return { isAuthenticated: false };
}

export async function requireServerSession(redirectTo = '/'): Promise<SessionState> {
  const session = await getServerSessionState();

  if (!session.isAuthenticated) {
    redirect(redirectTo);
  }

  return session;
}
