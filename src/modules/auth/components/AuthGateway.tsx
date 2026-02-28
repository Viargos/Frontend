'use client';

import type { AuthSigninResult, AuthUser } from '@/modules/auth/types/auth.types';
import * as motion from 'framer-motion/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthStep } from '@/modules/auth/enums/auth-step.enum';
import { clearAuthRedirectPath, readAuthRedirectPath } from '@/modules/auth/helpers/redirect.helper';
import { useAuthModal } from '@/modules/auth/hooks/use-auth-modal';
import { useAuthSession } from '@/modules/auth/hooks/use-auth-session';
import { AppLogo } from '@/modules/common';
import { AuthModal } from './AuthModal';

export const AuthGateway = () => {
  const router = useRouter();
  const { session, setAuthenticatedUser, signOut } = useAuthSession();
  const {
    close,
    open,
    setError,
    setStep,
    showResetPassword,
    startPasswordResetOtp,
    startSignupOtp,
    state,
  } = useAuthModal();
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    let contentTimer: ReturnType<typeof setTimeout> | undefined;
    const timer = setTimeout(() => {
      setIsLoading(false);
      contentTimer = setTimeout(() => {
        setShowContent(true);
      }, 200);
    }, 1500);

    return () => {
      clearTimeout(timer);
      if (contentTimer) {
        clearTimeout(contentTimer);
      }
    };
  }, []);

  const navigateAfterAuth = () => {
    const redirectPath = readAuthRedirectPath();
    clearAuthRedirectPath();
    router.replace(redirectPath);
  };

  const handleLoginSuccess = (result: AuthSigninResult) => {
    if (result.requiresVerification || !result.verified || !result.user.isActive) {
      startSignupOtp(result.user.email);
      return;
    }

    setAuthenticatedUser(result.user);
    close();
    navigateAfterAuth();
  };

  const handleOtpSuccess = (user: AuthUser | null) => {
    if (state.isPasswordResetFlow) {
      showResetPassword();
      return;
    }

    if (!user) {
      setError('Unable to complete verification. Please try again.');
      return;
    }

    setAuthenticatedUser(user);
    close();
    navigateAfterAuth();
  };

  return (
    <>
      {isLoading
        ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#160E53]">
              <div className="origin-center scale-[1.018] text-center md:scale-100">
                <div className="mb-8">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-3xl font-bold text-[#160E53] shadow-2xl">V</div>
                </div>
                <h1 className="mb-4 text-4xl font-bold text-white">Viargos</h1>
                <motion.p
                  animate={{ opacity: 1 }}
                  className="text-xl text-white/80"
                  initial={{ opacity: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  Exploring Amazing Journeys...
                </motion.p>
              </div>
            </div>
          )
        : (
            <motion.div
              animate={{ opacity: 1 }}
              className="min-h-screen bg-gray-50"
              initial={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                animate={{ y: 0, opacity: 1 }}
                className="w-full border-b border-gray-200 bg-white px-4"
                initial={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="mx-auto flex max-w-7xl items-center justify-between py-4">
                  <AppLogo />
                  {session.isAuthenticated
                    ? (
                        <button
                          className="rounded-xl border-2 border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 sm:text-lg"
                          type="button"
                          onClick={async () => {
                            await signOut();
                            router.refresh();
                          }}
                        >
                          Sign out
                        </button>
                      )
                    : null}
                </div>
              </motion.div>

              <div className="relative min-h-[700px] w-full overflow-hidden sm:min-h-[800px]">
                <div
                  className="relative z-10 mx-auto flex min-h-[700px] w-full max-w-7xl flex-col items-center justify-start px-4 pt-8 text-center sm:min-h-[800px] sm:pt-12"
                  style={{
                    backgroundImage: 'url(/hero.svg)',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                  }}
                >
                  <motion.h1
                    animate={showContent ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                    className="mb-6 text-3xl font-bold text-gray-900 sm:text-6xl"
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  >
                    Welcome to
                    {' '}
                    <span className="text-blue-600">Viargos</span>
                  </motion.h1>

                  <motion.p
                    animate={showContent ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                    className="mx-auto mb-8 max-w-4xl text-xl leading-relaxed text-gray-600 sm:text-2xl"
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  >
                    The ultimate travel companion for planning journeys, sharing experiences, and discovering amazing destinations with a global community of travelers.
                  </motion.p>

                  <motion.div
                    animate={showContent ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                    className="flex flex-row items-center justify-center gap-3 sm:gap-4"
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  >
                    {session.isAuthenticated
                      ? (
                          <button
                            className="cursor-pointer rounded-xl bg-[#160E53] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-[#001456] sm:px-8 sm:py-4 sm:text-lg"
                            type="button"
                            onClick={() => router.push('/dashboard')}
                          >
                            Open Dashboard
                          </button>
                        )
                      : (
                          <>
                            <button
                              className="cursor-pointer rounded-xl bg-[#160E53] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-[#001456] sm:px-8 sm:py-4 sm:text-lg"
                              type="button"
                              onClick={() => open(AuthStep.SIGNUP)}
                            >
                              Start Your Journey
                            </button>
                            <button
                              className="cursor-pointer rounded-xl border-2 border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 sm:px-8 sm:py-4 sm:text-lg"
                              type="button"
                              onClick={() => open(AuthStep.LOGIN)}
                            >
                              Sign In
                            </button>
                          </>
                        )}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

      <AuthModal
        error={state.error}
        isOpen={state.isOpen}
        isPasswordResetFlow={state.isPasswordResetFlow}
        passwordResetEmail={state.passwordResetEmail}
        signupEmail={state.signupEmail}
        step={state.step}
        onClose={close}
        onErrorChange={setError}
        onForgotPasswordSuccess={startPasswordResetOtp}
        onLoginSuccess={handleLoginSuccess}
        onOtpSuccess={handleOtpSuccess}
        onSignupSuccess={startSignupOtp}
        onSwitchStep={setStep}
      />
    </>
  );
};
