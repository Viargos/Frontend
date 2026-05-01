'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthSplitLayout } from '@/modules/auth/components/AuthSplitLayout';
import { SignupForm } from './SignupForm';

export function SignupPageView() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <AuthSplitLayout
      accentLabel="Create account"
      description="Start your Viargos profile and get ready to collect routes, memories, and future adventures."
      eyebrow="Join Viargos"
      imageAlt="Sign up illustration"
      imageSrc="/signup.jpg"
      quote="The journey of a thousand miles begins with a single step."
      title="Create your account"
    >
      {error
        ? <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        : null}

      <SignupForm
        onErrorChange={setError}
        onSuccess={(email) => {
          const query = new URLSearchParams({
            email,
            mode: 'signup',
          });
          router.push(`/verify-email?${query.toString()}`);
        }}
        onSwitchToLogin={() => router.push('/login')}
      />
    </AuthSplitLayout>
  );
}
