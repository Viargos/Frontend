import { redirect } from 'next/navigation';
import { getAccessTokenClaimsFromCookies } from '@/lib/auth/server-session';
import { VerifyEmailPageView } from '@/modules/auth';

export default async function VerifyEmailPage() {
  const claims = await getAccessTokenClaimsFromCookies();

  if (!claims?.email) {
    redirect('/');
  }

  if (claims.emailVerified === true) {
    redirect('/dashboard');
  }

  return <VerifyEmailPageView email={claims.email} />;
}
