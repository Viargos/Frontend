'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AppLogo, useTheme } from '@/modules/common';

type AuthSplitLayoutProps = {
  title: string;
  description: string;
  eyebrow: string;
  accentLabel: string;
  imageSrc?: string;
  imageAlt?: string;
  quote: string;
  quoteAttribution?: string;
  children: React.ReactNode;
};

export function AuthSplitLayout(props: AuthSplitLayoutProps) {
  const { isDark } = useTheme();
  const {
    accentLabel,
    children,
    description,
    eyebrow,
    imageAlt,
    imageSrc,
    quote,
    quoteAttribution,
    title,
  } = props;

  const themeStyles = {
    card: {
      background: isDark ? 'rgba(31, 38, 48, 0.94)' : 'rgba(255, 255, 255, 0.9)',
      borderColor: isDark ? 'rgba(89, 98, 115, 0.68)' : 'rgba(226, 232, 240, 0.8)',
      boxShadow: isDark
        ? '0 30px 90px rgba(0, 0, 0, 0.36), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
        : '0 30px 90px rgba(15, 23, 42, 0.10)',
    },
    description: {
      color: isDark ? '#c4cfdd' : '#45556c',
    },
    eyebrow: {
      color: isDark ? '#b8c7ff' : '#160e53',
    },
    imageOverlay: {
      background: isDark ? 'rgba(0, 0, 0, 0.42)' : 'rgba(0, 0, 0, 0.30)',
    },
    page: {
      background: isDark
        ? 'linear-gradient(180deg, #11151b 0%, #171c24 54%, #12161d 100%)'
        : 'radial-gradient(circle at top left, rgba(22, 14, 83, 0.08), transparent 30%), linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)',
    },
    panel: {
      background: isDark ? '#1b212a' : '#ffffff',
    },
    panelBorder: {
      borderColor: isDark ? 'rgba(55, 64, 77, 0.88)' : 'rgba(255, 255, 255, 0.6)',
    },
    title: {
      color: isDark ? '#f6f7fb' : '#020618',
    },
  };

  return (
    <div className="min-h-screen" style={themeStyles.page}>
      <div className="grid min-h-screen overflow-hidden lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden border-r bg-[#160E53] text-white lg:flex" style={themeStyles.panelBorder}>
          <Image
            alt={imageAlt ?? 'Viargos travel illustration'}
            className="object-cover"
            fill
            priority
            sizes="50vw"
            src={imageSrc ?? '/hero.svg'}
            unoptimized
          />
          <div className="absolute inset-0" style={themeStyles.imageOverlay} />
          <div className="relative flex w-full flex-col justify-between px-10 py-10 xl:px-14 xl:py-12">
            <div>
              <div className="mb-10 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1 text-sm font-medium text-white/90 backdrop-blur">
                {accentLabel}
              </div>
              <blockquote className="max-w-2xl">
                <p className="font-outfit text-5xl leading-tight font-semibold tracking-tight">
                  {quote}
                </p>
                {quoteAttribution
                  ? <footer className="mt-5 text-lg leading-8 text-white/75">{quoteAttribution}</footer>
                  : null}
              </blockquote>
            </div>
          </div>
        </section>

        <section
          className="relative z-10 flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:-ml-10 lg:rounded-tl-[2.5rem] lg:rounded-bl-[2.5rem] lg:px-12"
          style={themeStyles.panel}
        >
          <div className="w-full max-w-xl">
            <div className="mb-8 flex items-center justify-between">
              <Link className="inline-flex items-center" href="/">
                <AppLogo />
              </Link>
              <Link
                className="text-sm font-medium transition"
                href="/"
                style={{ color: isDark ? '#b8c7ff' : '#64748b' }}
              >
                Back home
              </Link>
            </div>

            <div className="rounded-[2rem] border p-6 backdrop-blur sm:p-8" style={themeStyles.card}>
              <div className="mb-8">
                <p className="text-sm font-semibold tracking-[0.24em] uppercase" style={themeStyles.eyebrow}>
                  {eyebrow}
                </p>
                <h2 className="mt-3 font-outfit text-3xl font-semibold tracking-tight sm:text-4xl" style={themeStyles.title}>
                  {title}
                </h2>
                <p className="mt-3 max-w-lg text-base leading-7" style={themeStyles.description}>
                  {description}
                </p>
              </div>

              {children}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
