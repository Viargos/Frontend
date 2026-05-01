'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthSplitLayout } from '@/modules/auth/components/AuthSplitLayout';
import { ForgotPasswordForm } from './ForgotPasswordForm';

export function ForgotPasswordPageView() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <AuthSplitLayout
      accentLabel="Password recovery"
      description="We’ll send a verification code so you can safely get back into your account."
      eyebrow="Reset Access"
      imageAlt="Forgot password illustration"
      imageSrc="/forgot-password.jpg"
      quote="Wherever you go becomes a part of you somehow."
      title="Forgot your password?"
    >
      {error
        ? <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        : null}

      <ForgotPasswordForm
        onErrorChange={setError}
        onSuccess={(email) => {
          const query = new URLSearchParams({
            email,
            mode: 'reset',
          });
          router.push(`/verify-otp?${query.toString()}`);
        }}
        onSwitchToLogin={() => router.push('/login')}
      />
    </AuthSplitLayout>
  );
}
