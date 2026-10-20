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
import { focusSettingsSection } from '@/modules/settings/helpers/focus-settings-section';

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

    const frame = window.requestAnimationFrame(() => {
      focusSettingsSection(sectionRef.current);
    });
    return () => window.cancelAnimationFrame(frame);
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
      className="relative scroll-mt-6 outline-none"
      id="theme-background-selector"
      tabIndex={-1}
    >
      <div className="px-5 pt-5 pb-4">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]" id="theme-background-heading">
          Choose Your Theme.
        </h2>
        <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
          Keep the automatic light and dark background, rotate through every image, or choose one theme.
        </p>
      </div>

      <div className="px-5 pb-5">
        <ThemeBackgroundSurface
          className="mb-5 min-h-44 rounded-xl border border-[var(--border-subtle)]"
          contentClassName="flex min-h-44 items-end p-3"
        >
          <div className="w-full rounded-lg bg-[var(--surface-0)] p-3 text-[var(--text-primary)]">
            <p className="text-xs font-medium text-[var(--text-muted)]">Live preview</p>
            <p className="mt-1 text-sm font-semibold">
              {isAutoRotating
                ? `Rotating themes · ${selectedBackground?.name ?? 'Preparing'}`
                : selectedBackground?.name ?? 'Automatic light and dark background'}
            </p>
            <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
              Your full dashboard background updates without reloading the page.
            </p>
          </div>
        </ThemeBackgroundSurface>

        <div aria-label="Theme backgrounds" className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))] gap-3" role="group">
          <button
            aria-label="Automatically rotate through all theme backgrounds"
            aria-pressed={isAutoRotating}
            className={`relative min-w-0 overflow-hidden rounded-xl border p-2 text-left focus-visible:ring-2 focus-visible:ring-[var(--text-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-0)] focus-visible:outline-none disabled:cursor-wait motion-safe:transition-colors ${
              isAutoRotating
                ? 'border-[var(--text-primary)] bg-[var(--surface-1)]'
                : 'border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]'
            }`}
            disabled={isAutoRotateLoading}
            type="button"
            onClick={() => void toggleAutoRotation()}
          >
            <span className="relative grid aspect-[16/9] grid-cols-2 overflow-hidden rounded-lg bg-[var(--surface-1)]">
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
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-0)] text-[var(--text-primary)]">
                  {isAutoRotateLoading
                    ? <SpinnerIcon aria-hidden="true" className="h-5 w-5 motion-safe:animate-spin" />
                    : <RefreshCwIcon aria-hidden="true" className="h-5 w-5" />}
                </span>
              </span>
            </span>
            <span className="flex items-start justify-between gap-2 px-1 pt-2">
              <span>
                <span className="block text-sm font-semibold text-[var(--text-primary)]">Rotate all themes</span>
                <span className="mt-0.5 block text-xs leading-5 text-[var(--text-muted)]">Smoothly change to the next image every 8 seconds</span>
              </span>
              {isAutoRotating
                ? (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--surface-inverse)] text-[var(--text-inverse)]">
                      <CheckIcon aria-hidden="true" className="h-4 w-4" />
                    </span>
                  )
                : null}
            </span>
          </button>

          <button
            aria-pressed={!hasCustomBackground && !isAutoRotating}
            className={`relative min-w-0 overflow-hidden rounded-xl border p-2 text-left focus-visible:ring-2 focus-visible:ring-[var(--text-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-0)] focus-visible:outline-none motion-safe:transition-colors ${
              hasCustomBackground || isAutoRotating
                ? 'border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]'
                : 'border-[var(--text-primary)] bg-[var(--surface-1)]'
            }`}
            type="button"
            onClick={() => {
              removeBackground();
              setStatusMessage('Automatic light and dark background selected.');
            }}
          >
            <span className="flex aspect-[16/9] items-stretch overflow-hidden rounded-lg border border-[var(--border-subtle)]">
              <span className="flex flex-1 items-center justify-center bg-white text-amber-500">
                <SunIcon aria-hidden="true" className="h-6 w-6" />
              </span>
              <span className="flex flex-1 items-center justify-center bg-black text-white">
                <MoonIcon aria-hidden="true" className="h-6 w-6" />
              </span>
            </span>
            <span className="flex items-start justify-between gap-2 px-1 pt-2">
              <span>
                <span className="block text-sm font-semibold text-[var(--text-primary)]">Automatic</span>
                <span className="mt-0.5 block text-xs leading-5 text-[var(--text-muted)]">White in light mode, black in dark mode</span>
              </span>
              {!hasCustomBackground && !isAutoRotating
                ? (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--surface-inverse)] text-[var(--text-inverse)]">
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
                className={`relative min-w-0 overflow-hidden rounded-xl border p-2 text-left focus-visible:ring-2 focus-visible:ring-[var(--text-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-0)] focus-visible:outline-none disabled:cursor-wait motion-safe:transition-colors ${
                  isSelected
                    ? 'border-[var(--text-primary)] bg-[var(--surface-1)]'
                    : 'border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]'
                }`}
                disabled={isLoading}
                key={background.id}
                type="button"
                onClick={() => void selectThemeBackground(background.id, background.name)}
              >
                <span className="relative block aspect-[16/9] overflow-hidden rounded-lg bg-[var(--surface-1)]">
                  <Image
                    fill
                    alt=""
                    className="object-cover"
                    sizes="(max-width: 640px) calc(100vw - 48px), 300px"
                    src={background.src}
                  />
                  <span className="absolute inset-0 bg-black/10" />
                  {isLoading
                    ? (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-white">
                          <SpinnerIcon aria-hidden="true" className="h-7 w-7 motion-safe:animate-spin" />
                          <span className="sr-only">Loading background</span>
                        </span>
                      )
                    : null}
                </span>
                <span className="flex items-start justify-between gap-2 px-1 pt-2">
                  <span>
                    <span className="block text-sm font-semibold text-[var(--text-primary)]">{background.name}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-[var(--text-muted)]">{background.description}</span>
                  </span>
                  {isSelected
                    ? (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--surface-inverse)] text-[var(--text-inverse)]">
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
                className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--border-subtle)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] focus-visible:ring-2 focus-visible:ring-[var(--text-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-0)] focus-visible:outline-none motion-safe:transition-colors"
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
