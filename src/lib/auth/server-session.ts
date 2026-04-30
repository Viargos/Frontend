import { Buffer } from 'node:buffer';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AUTH_COOKIE_NAMES } from '@/lib/auth/constants';

type AccessTokenClaims = {
  email?: string;
  emailVerified?: boolean;
  sub?: string;
  userId?: string;
};

function decodeAccessTokenClaims(token: string): AccessTokenClaims | null {
  const parts = token.split('.');
  const payloadPart = parts[1];

  if (!payloadPart) {
    return null;
  }

  try {
    const payload = Buffer.from(payloadPart, 'base64url').toString('utf8');
    const parsed = JSON.parse(payload) as AccessTokenClaims;
    return parsed;
  } catch {
    return null;
  }
}

export async function requireAuthenticatedSession(redirectPath = '/') {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAMES.ACCESS_TOKEN)?.value;
  if (!accessToken) {
    redirect(redirectPath);
  }

  const session = {
    isAuthenticated: true as const,
  };

  const claims = decodeAccessTokenClaims(accessToken);
  if (claims?.emailVerified === false) {
    redirect('/verify-email');
  }

  return session;
}

export async function getAccessTokenClaimsFromCookies(): Promise<AccessTokenClaims | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAMES.ACCESS_TOKEN)?.value;

  if (!accessToken) {
    return null;
  }

  return decodeAccessTokenClaims(accessToken);
}
