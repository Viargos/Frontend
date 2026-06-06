'use client';

import * as motion from 'framer-motion/client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthSession } from '@/modules/auth/hooks/use-auth-session';
import { AppLogo, useTheme } from '@/modules/common';

export const AuthGateway = () => {
  const router = useRouter();
  const { session, signOut } = useAuthSession();
  const { isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  const themeStyles = {
    header: {
      background: isDark ? 'rgba(25, 31, 39, 0.94)' : 'rgba(255, 255, 255, 0.92)',
      borderColor: isDark ? '#2f3744' : '#e5e7eb',
    },
    hero: {
      background: isDark
        ? 'linear-gradient(180deg, #161b23 0%, #1b2230 48%, #131821 100%)'
        : 'linear-gradient(180deg, #ffffff 0%, #f7f8fd 48%, #eef1ff 100%)',
    },
    illustration: {
      filter: 'none',
      opacity: isDark ? 0.9 : 0.95,
    },
    primaryButton: {
      background: isDark ? '#eef2ff' : '#160e53',
      boxShadow: isDark
        ? '0 18px 36px -22px rgba(0, 0, 0, 0.85)'
        : '0 14px 30px -18px rgba(22, 14, 83, 0.55)',
      color: isDark ? '#111827' : '#ffffff',
    },
    secondaryButton: {
      background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.76)',
      borderColor: isDark ? '#596273' : '#d1d5db',
      color: isDark ? '#edf2f7' : '#374151',
    },
    shell: {
      background: isDark
        ? 'linear-gradient(180deg, #11151b 0%, #171c24 48%, #12161d 100%)'
        : 'linear-gradient(180deg, #f8fafc 0%, #ffffff 48%, #f1f5f9 100%)',
    },
    titleAccent: {
      color: isDark ? '#b8c7ff' : '#160e53',
    },
  };

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

  return (
    <>
      {isLoading
        ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#160E53]">
              <div className="origin-center scale-[1.018] text-center md:scale-100">
                <div className="mb-8">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-3xl font-bold text-[#160E53] shadow-2xl">
                    V
                  </div>
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
              className="auth-gateway-shell flex min-h-screen flex-col"
              initial={{ opacity: 0 }}
              style={themeStyles.shell}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                animate={{ y: 0, opacity: 1 }}
                className="auth-gateway-header w-full border-b px-4"
                initial={{ y: -20, opacity: 0 }}
                style={themeStyles.header}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="mx-auto flex max-w-7xl items-center justify-between py-4">
                  <AppLogo />
                  {session.isAuthenticated
                    ? (
                        <button
                          className="auth-gateway-secondary-button rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all sm:text-lg"
                          style={themeStyles.secondaryButton}
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

              <div className="relative min-h-175 w-full flex-1 overflow-hidden sm:min-h-200">
                <div className="auth-gateway-hero-bg absolute inset-0" style={themeStyles.hero} />
                <div className="pointer-events-none absolute inset-x-0 top-12 bottom-0 xl:top-0">
                  <Image
                    alt="Viargos travel illustration"
                    className="auth-gateway-illustration object-contain object-bottom xl:object-cover xl:object-[center_86%]"
                    fill
                    priority
                    sizes="100vw"
                    src={isDark ? '/hero-dark.svg' : '/hero.svg'}
                    style={themeStyles.illustration}
                    unoptimized
                  />
                </div>
                <div className="relative z-10 mx-auto flex min-h-[700px] w-full max-w-7xl flex-col items-center justify-start px-4 pt-10 text-center sm:min-h-[800px] sm:pt-16">
                  <motion.h1
                    animate={showContent ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                    className="mb-6 max-w-4xl font-outfit text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl"
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  >
                    Welcome to
                    {' '}
                    <span className="auth-gateway-title-accent" style={themeStyles.titleAccent}>Viargos</span>
                  </motion.h1>

                  <motion.p
                    animate={showContent ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                    className="mx-auto mb-8 max-w-3xl text-base leading-8 text-slate-600 sm:text-xl"
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  >
                    The ultimate travel companion for planning journeys, sharing experiences, and
                    discovering amazing destinations with a global community of travelers.
                  </motion.p>

                  <motion.div
                    animate={showContent ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                    className="flex flex-row items-center justify-center gap-3 sm:gap-4"
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  >
                    {session.isAuthenticated
                      ? (
                          <button
                            className="auth-gateway-primary-button cursor-pointer rounded-xl px-4 py-3 text-sm font-semibold shadow-lg transition-all sm:px-8 sm:py-4 sm:text-lg"
                            style={themeStyles.primaryButton}
                            type="button"
                            onClick={() => router.push('/dashboard')}
                          >
                            Open Dashboard
                          </button>
                        )
                      : (
                          <>
                            <button
                              className="auth-gateway-primary-button cursor-pointer rounded-xl px-4 py-3 text-sm font-semibold shadow-lg transition-all sm:px-8 sm:py-4 sm:text-lg"
                              style={themeStyles.primaryButton}
                              type="button"
                              onClick={() => router.push('/register')}
                            >
                              Start Your Journey
                            </button>
                            <button
                              className="auth-gateway-secondary-button cursor-pointer rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all sm:px-8 sm:py-4 sm:text-lg"
                              style={themeStyles.secondaryButton}
                              type="button"
                              onClick={() => router.push('/login')}
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
    </>
  );
};
