import { redirect } from 'next/navigation';
import { VerifyOtpPageView } from '@/modules/auth';

type VerifyOtpPageProps = {
  searchParams: Promise<{
    email?: string;
    mode?: string;
  }>;
};

export default async function VerifyOtpPage(props: VerifyOtpPageProps) {
  const searchParams = await props.searchParams;
  const email = searchParams.email?.trim();

  if (!email) {
    redirect('/forgot-password');
  }

  return <VerifyOtpPageView email={email} mode="reset" />;
}
