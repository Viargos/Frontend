'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthSplitLayout } from '@/modules/auth/components/AuthSplitLayout';
import { ResetPasswordForm } from './ResetPasswordForm';

type ResetPasswordPageViewProps = {
  email: string;
};

export function ResetPasswordPageView(props: ResetPasswordPageViewProps) {
  const { email } = props;
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <AuthSplitLayout
      accentLabel="Choose a new password"
      description="Create a fresh password for your Viargos account and then sign back in."
      eyebrow="Almost There"
      imageAlt="Reset password illustration"
      imageSrc="/forgot-password.jpg"
      quote="Jobs fill your pocket, but adventures fill your soul."
      title="Reset your password"
    >
      {error
        ? <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        : null}

      <ResetPasswordForm
        email={email}
        onErrorChange={setError}
        onSuccess={() => router.replace('/login')}
        onSwitchToLogin={() => router.push('/login')}
      />
    </AuthSplitLayout>
  );
}
