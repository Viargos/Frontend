'use client';

import type { AuthUser } from '@/modules/auth/types/auth.types';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthSplitLayout } from '@/modules/auth/components/AuthSplitLayout';
import { clearAuthRedirectPath, readAuthRedirectPath } from '@/modules/auth/helpers/redirect.helper';
import { useAuthSession } from '@/modules/auth/hooks/use-auth-session';
import { authQueryKeys } from '@/modules/auth/query-keys';
import { OtpVerificationForm } from './OtpVerificationForm';

type VerifyOtpPageViewProps = {
  email: string;
  mode: 'reset' | 'signup';
};

export function VerifyOtpPageView(props: VerifyOtpPageViewProps) {
  const { email, mode } = props;
  const isPasswordReset = mode === 'reset';
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setAuthenticatedUser } = useAuthSession();
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = (user: AuthUser | null) => {
    if (isPasswordReset) {
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      return;
    }

    if (!user) {
      setError('Unable to verify your account right now. Please try again.');
      return;
    }

    setAuthenticatedUser(user);
    void queryClient.invalidateQueries({ queryKey: authQueryKeys.profile() });
    const redirectPath = readAuthRedirectPath();
    clearAuthRedirectPath();
    router.replace(redirectPath);
  };

  return (
    <AuthSplitLayout
      accentLabel={isPasswordReset ? 'Verify reset code' : 'Verify email'}
      description={isPasswordReset
        ? 'Enter the code we sent to confirm it’s really you before choosing a new password.'
        : 'One more step and your Viargos account will be ready to use.'}
      eyebrow={isPasswordReset ? 'Security Check' : 'Email Verification'}
      imageAlt="OTP verification illustration"
      imageSrc="/otp.jpg"
      quote={isPasswordReset
        ? 'Once a year, go someplace you have never been before.'
        : 'Life is short and the world is wide.'}
      title={isPasswordReset ? 'Enter your reset code' : 'Verify your email'}
    >
      {error
        ? <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        : null}

      <OtpVerificationForm
        email={email}
        isPasswordReset={isPasswordReset}
        onErrorChange={setError}
        onSuccess={handleSuccess}
      />
    </AuthSplitLayout>
  );
}
