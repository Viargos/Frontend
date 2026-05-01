'use client';

import type { AuthSigninResult } from '@/modules/auth/types/auth.types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthSplitLayout } from '@/modules/auth/components/AuthSplitLayout';
import { clearAuthRedirectPath, readAuthRedirectPath } from '@/modules/auth/helpers/redirect.helper';
import { useAuthSession } from '@/modules/auth/hooks/use-auth-session';
import { LoginForm } from './LoginForm';

export function LoginPageView() {
  const router = useRouter();
  const { setAuthenticatedUser } = useAuthSession();
  const [error, setError] = useState<string | null>(null);

  const handleLoginSuccess = (result: AuthSigninResult) => {
    if (result.requiresVerification || !result.verified || !result.user.isActive) {
      const query = new URLSearchParams({
        email: result.user.email,
        mode: 'signup',
      });
      router.push(`/verify-email?${query.toString()}`);
      return;
    }

    setAuthenticatedUser(result.user);
    const redirectPath = readAuthRedirectPath();
    clearAuthRedirectPath();
    router.replace(redirectPath);
  };

  return (
    <AuthSplitLayout
      accentLabel="Sign in"
      description="Pick up where you left off and jump back into your journeys, posts, and plans."
      eyebrow="Welcome Back"
      imageAlt="Sign in illustration"
      imageSrc="/signin.jpg"
      quote="Travel is the only thing you buy that makes you richer."
      title="Sign in to Viargos"
    >
      {error
        ? <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        : null}

      <LoginForm
        onErrorChange={setError}
        onForgotPassword={() => router.push('/forgot-password')}
        onSuccess={handleLoginSuccess}
        onSwitchToSignup={() => router.push('/register')}
      />
    </AuthSplitLayout>
  );
}
