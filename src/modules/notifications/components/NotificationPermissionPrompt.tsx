'use client';

import { gsap } from 'gsap';
import { BellRing, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useNotifications } from './notification-context';

export function NotificationPermissionPrompt() {
  const promptRef = useRef<HTMLDivElement>(null);
  const {
    dismissPermissionPrompt,
    enableBrowserNotifications,
    isPermissionPromptVisible,
  } = useNotifications();

  useEffect(() => {
    if (!isPermissionPromptVisible || !promptRef.current) {
      return;
    }
    const media = gsap.matchMedia();
    media.add(
      '(prefers-reduced-motion: no-preference)',
      () => {
        gsap.fromTo(
          promptRef.current,
          { autoAlpha: 0, y: 18 },
          {
            autoAlpha: 1,
            duration: 0.28,
            ease: 'power2.out',
            y: 0,
          },
        );
      },
      promptRef,
    );
    return () => media.revert();
  }, [isPermissionPromptVisible]);

  if (!isPermissionPromptVisible) {
    return null;
  }

  return (
    <div
      ref={promptRef}
      aria-label="Enable browser notifications"
      className="fixed right-4 bottom-20 z-[70] w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-indigo-100 bg-white p-4 shadow-2xl sm:bottom-6 dark:border-indigo-900/50 dark:bg-slate-950"
      role="region"
    >
      <button
        aria-label="Dismiss notification prompt"
        className="absolute top-3 right-3 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
        type="button"
        onClick={dismissPermissionPrompt}
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex gap-3 pr-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[#160E53] dark:bg-indigo-950/40 dark:text-indigo-300">
          <BellRing className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-slate-950 dark:text-white">
            Stay updated when Viargos is in the background
          </p>
          <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-300">
            Get reminders, workflow updates, messages, and important alerts.
            You control every category in Settings.
          </p>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button
          className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          type="button"
          onClick={dismissPermissionPrompt}
        >
          Not now
        </button>
        <button
          className="rounded-full bg-[#160E53] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#241a7a]"
          type="button"
          onClick={() => void enableBrowserNotifications()}
        >
          Enable notifications
        </button>
      </div>
    </div>
  );
}
