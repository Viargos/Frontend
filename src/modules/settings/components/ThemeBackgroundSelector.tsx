'use client';

import type { ThemeBackgroundId } from '@/modules/common/constants';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ThemeBackgroundSurface } from '@/modules/common/components/ThemeBackgroundSurface';
import { THEME_BACKGROUNDS } from '@/modules/common/constants';
import { useThemeBackground } from '@/modules/common/hooks';
import {
  CheckIcon,
  MoonIcon,
  RefreshCwIcon,
  SpinnerIcon,
  SunIcon,
  TrashIcon,
} from '@/modules/common/icons';

export function ThemeBackgroundSelector() {
  const {
    disableAutoRotation,
    enableAutoRotation,
    isAutoRotateLoading,
    isAutoRotating,
    pendingBackgroundId,
    removeBackground,
    selectedBackground,
    selectBackground,
  } = useThemeBackground();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (new URL(document.URL).hash !== '#theme-background-selector') {
      return;
    }

    window.requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      sectionRef.current?.focus({ preventScroll: true });
    });
  }, []);

  const selectThemeBackground = async (backgroundId: ThemeBackgroundId, backgroundName: string) => {
    setStatusMessage(`Loading ${backgroundName}.`);
    const wasSelected = await selectBackground(backgroundId);
    setStatusMessage(wasSelected ? `${backgroundName} background selected.` : `Unable to load ${backgroundName}.`);
  };

  const toggleAutoRotation = async () => {
    if (isAutoRotating) {
      disableAutoRotation();
      setStatusMessage('Automatic background rotation stopped.');
      return;
    }

    setStatusMessage('Preparing all theme backgrounds.');
    const wasEnabled = await enableAutoRotation();
    setStatusMessage(wasEnabled
      ? 'Automatic background rotation selected.'
      : 'Unable to prepare automatic background rotation.');
  };

  const hasCustomBackground = selectedBackground !== null;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="theme-background-heading"
      className="scroll-mt-6 outline-none"
      id="theme-background-selector"
      tabIndex={-1}
    >
      <div className="px-4 py-3">
        <h2 className="text-xs font-semibold tracking-wider text-gray-500 uppercase" id="theme-background-heading">
          Choose Your Theme.
        </h2>
        <p className="mt-1 text-xs leading-5 text-gray-500">
          Keep the automatic light and dark background, rotate through every image, or choose one theme.
        </p>
      </div>

      <div className="border-y border-gray-200 bg-white p-4">
        <ThemeBackgroundSurface
          className="mb-4 min-h-48 rounded-2xl border border-gray-200 shadow-sm"
          contentClassName="flex min-h-48 items-end p-4"
        >
          <div className="w-full rounded-xl border border-white/60 bg-white/90 p-4 text-gray-900 shadow-lg backdrop-blur-md">
            <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">Live preview</p>
            <p className="mt-1 text-base font-semibold">
              {isAutoRotating
                ? `Rotating themes · ${selectedBackground?.name ?? 'Preparing'}`
                : selectedBackground?.name ?? 'Automatic light and dark background'}
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-600">
              Your full dashboard background updates without reloading the page.
            </p>
          </div>
        </ThemeBackgroundSurface>

        <div aria-label="Theme backgrounds" className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="group">
          <button
            aria-label="Automatically rotate through all theme backgrounds"
            aria-pressed={isAutoRotating}
            className={`group relative overflow-hidden rounded-2xl border-2 p-2 text-left transition-all focus-visible:ring-2 focus-visible:ring-[#160E53] focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-wait ${
              isAutoRotating
                ? 'border-[#160E53] shadow-[0_0_0_3px_rgba(22,14,83,0.12)]'
                : 'border-gray-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md'
            }`}
            disabled={isAutoRotateLoading}
            type="button"
            onClick={() => void toggleAutoRotation()}
          >
            <span className="relative grid aspect-[16/9] grid-cols-2 overflow-hidden rounded-xl bg-gray-100">
              {THEME_BACKGROUNDS.slice(0, 4).map(background => (
                <span className="relative" key={background.id}>
                  <Image
                    fill
                    alt=""
                    className="object-cover"
                    sizes="150px"
                    src={background.src}
                  />
                </span>
              ))}
              <span className="absolute inset-0 bg-black/20" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[#160E53] shadow-lg backdrop-blur-sm">
                  {isAutoRotateLoading
                    ? <SpinnerIcon aria-hidden="true" className="h-6 w-6 animate-spin" />
                    : <RefreshCwIcon aria-hidden="true" className="h-6 w-6" />}
                </span>
              </span>
            </span>
            <span className="flex items-start justify-between gap-2 px-1 pt-2">
              <span>
                <span className="block text-sm font-semibold text-gray-900">Rotate all themes</span>
                <span className="mt-0.5 block text-xs text-gray-500">Smoothly change to the next image every 8 seconds</span>
              </span>
              {isAutoRotating
                ? (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#160E53] text-white">
                      <CheckIcon aria-hidden="true" className="h-4 w-4" />
                    </span>
                  )
                : null}
            </span>
          </button>

          <button
            aria-pressed={!hasCustomBackground && !isAutoRotating}
            className={`group relative overflow-hidden rounded-2xl border-2 p-2 text-left transition-all focus-visible:ring-2 focus-visible:ring-[#160E53] focus-visible:ring-offset-2 focus-visible:outline-none ${
              hasCustomBackground || isAutoRotating
                ? 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                : 'border-[#160E53] shadow-[0_0_0_3px_rgba(22,14,83,0.12)]'
            }`}
            type="button"
            onClick={() => {
              removeBackground();
              setStatusMessage('Automatic light and dark background selected.');
            }}
          >
            <span className="flex aspect-[16/9] items-stretch overflow-hidden rounded-xl border border-gray-200">
              <span className="flex flex-1 items-center justify-center bg-white text-amber-500">
                <SunIcon aria-hidden="true" className="h-6 w-6" />
              </span>
              <span className="flex flex-1 items-center justify-center bg-black text-white">
                <MoonIcon aria-hidden="true" className="h-6 w-6" />
              </span>
            </span>
            <span className="flex items-start justify-between gap-2 px-1 pt-2">
              <span>
                <span className="block text-sm font-semibold text-gray-900">Automatic</span>
                <span className="mt-0.5 block text-xs text-gray-500">White in light mode, black in dark mode</span>
              </span>
              {!hasCustomBackground && !isAutoRotating
                ? (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#160E53] text-white">
                      <CheckIcon aria-hidden="true" className="h-4 w-4" />
                    </span>
                  )
                : null}
            </span>
          </button>

          {THEME_BACKGROUNDS.map((background) => {
            const isSelected = !isAutoRotating && selectedBackground?.id === background.id;
            const isLoading = pendingBackgroundId === background.id;

            return (
              <button
                aria-label={`Use ${background.name} background`}
                aria-pressed={isSelected}
                className={`group relative overflow-hidden rounded-2xl border-2 p-2 text-left transition-all focus-visible:ring-2 focus-visible:ring-[#160E53] focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-wait ${
                  isSelected
                    ? 'border-[#160E53] shadow-[0_0_0_3px_rgba(22,14,83,0.12)]'
                    : 'border-gray-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md'
                }`}
                disabled={isLoading}
                key={background.id}
                type="button"
                onClick={() => void selectThemeBackground(background.id, background.name)}
              >
                <span className="relative block aspect-[16/9] overflow-hidden rounded-xl bg-gray-100">
                  <Image
                    fill
                    alt=""
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) calc(100vw - 48px), 300px"
                    src={background.src}
                  />
                  <span className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/5" />
                  {isLoading
                    ? (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-white">
                          <SpinnerIcon aria-hidden="true" className="h-7 w-7 animate-spin" />
                          <span className="sr-only">Loading background</span>
                        </span>
                      )
                    : null}
                </span>
                <span className="flex items-start justify-between gap-2 px-1 pt-2">
                  <span>
                    <span className="block text-sm font-semibold text-gray-900">{background.name}</span>
                    <span className="mt-0.5 block text-xs text-gray-500">{background.description}</span>
                  </span>
                  {isSelected
                    ? (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#160E53] text-white">
                          <CheckIcon aria-hidden="true" className="h-4 w-4" />
                        </span>
                      )
                    : null}
                </span>
              </button>
            );
          })}
        </div>

        {hasCustomBackground
          ? (
              <button
                className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:outline-none"
                type="button"
                onClick={() => {
                  removeBackground();
                  setStatusMessage('Custom background removed. Automatic background restored.');
                }}
              >
                <TrashIcon aria-hidden="true" className="h-4 w-4" />
                Remove custom background
              </button>
            )
          : null}

        <p aria-live="polite" className="sr-only" role="status">{statusMessage}</p>
      </div>
    </section>
  );
}
