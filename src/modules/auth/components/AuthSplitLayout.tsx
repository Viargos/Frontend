'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AppLogo } from '@/modules/common';

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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(22,14,83,0.08),_transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)]">
      <div className="grid min-h-screen overflow-hidden lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden border-r border-white/60 bg-[#160E53] text-white lg:flex">
          <Image
            alt={imageAlt ?? 'Viargos travel illustration'}
            className="object-cover"
            fill
            priority
            sizes="50vw"
            src={imageSrc ?? '/hero.svg'}
            unoptimized
          />
          <div className="absolute inset-0 bg-black/30" />
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

        <section className="relative z-10 flex min-h-screen items-center justify-center bg-white px-5 py-8 sm:px-8 lg:-ml-10 lg:rounded-tl-[2.5rem] lg:rounded-bl-[2.5rem] lg:px-12">
          <div className="w-full max-w-xl">
            <div className="mb-8 flex items-center justify-between">
              <Link className="inline-flex items-center" href="/">
                <AppLogo />
              </Link>
              <Link className="text-sm font-medium text-slate-500 transition hover:text-[#0D0A3D]" href="/">
                Back home
              </Link>
            </div>

            <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.10)] backdrop-blur sm:p-8">
              <div className="mb-8">
                <p className="text-sm font-semibold tracking-[0.24em] text-[#160E53] uppercase">
                  {eyebrow}
                </p>
                <h2 className="mt-3 font-outfit text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  {title}
                </h2>
                <p className="mt-3 max-w-lg text-base leading-7 text-slate-600">
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
