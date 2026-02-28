'use client';

import type { AuthUser } from '@/modules/auth/types/auth.types';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { VerifyEmailModal } from '@/modules/auth/components/VerifyEmailModal';
import { useAuthSession } from '@/modules/auth/hooks/use-auth-session';
import { authQueryKeys } from '@/modules/auth/query-keys';

type VerifyEmailPageViewProps = {
  email: string;
};

export function VerifyEmailPageView(props: VerifyEmailPageViewProps) {
  const { email } = props;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setAuthenticatedUser } = useAuthSession();
  const [error, setError] = useState<string | null>(null);

  const handleVerificationSuccess = (user: AuthUser | null) => {
    if (!user) {
      setError('Unable to verify email. Please try again.');
      return;
    }

    setAuthenticatedUser(user);
    void queryClient.invalidateQueries({ queryKey: authQueryKeys.profile() });
    router.replace('/dashboard');
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold text-gray-900">Verify your email</h1>
        <p className="mb-4 text-sm text-gray-600">
          Enter the OTP sent to
          {' '}
          <span className="font-medium text-gray-900">{email}</span>
          .
        </p>

        {error
          ? <p className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          : null}

        <VerifyEmailModal
          email={email}
          onErrorChange={setError}
          onSuccess={handleVerificationSuccess}
        />
      </div>
    </div>
  );
}
