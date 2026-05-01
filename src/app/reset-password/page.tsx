import { redirect } from 'next/navigation';
import { ResetPasswordPageView } from '@/modules/auth';

type ResetPasswordPageProps = {
  searchParams: Promise<{
    email?: string;
  }>;
};

export default async function ResetPasswordPage(props: ResetPasswordPageProps) {
  const searchParams = await props.searchParams;
  const email = searchParams.email?.trim();

  if (!email) {
    redirect('/forgot-password');
  }

  return <ResetPasswordPageView email={email} />;
}
