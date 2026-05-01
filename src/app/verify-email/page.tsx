import { redirect } from 'next/navigation';
import { getAccessTokenClaimsFromCookies } from '@/lib/auth/server-session';
import { VerifyEmailPageView } from '@/modules/auth';

type VerifyEmailPageProps = {
  searchParams: Promise<{
    email?: string;
  }>;
};

export default async function VerifyEmailPage(props: VerifyEmailPageProps) {
  const searchParams = await props.searchParams;
  const claims = await getAccessTokenClaimsFromCookies();
  const email = claims?.email ?? searchParams.email?.trim();

  if (!email) {
    redirect('/register');
  }

  if (claims?.emailVerified === true) {
    redirect('/dashboard');
  }

  return <VerifyEmailPageView email={email} />;
}
