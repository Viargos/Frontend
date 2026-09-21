'use client';

import { gsap } from 'gsap';
import { ArrowRight, CheckCheck, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import {
  formatNotificationTime,
  NOTIFICATION_CATEGORY_LABELS,
} from '@/modules/notifications/helpers/notification.helper';
import { useNotifications } from './notification-context';
import { NotificationCategoryIcon } from './NotificationCategoryIcon';

export function NotificationPanel() {
  const router = useRouter();
  const panelRef = useRef<HTMLElement>(null);
  const {
    closePanel,
    deleteNotification,
    hasError,
    isLoading,
    isPanelOpen,
    items,
    markAllAsRead,
    markAsRead,
    refetch,
    unreadCount,
  } = useNotifications();

  useEffect(() => {
    if (!isPanelOpen || !panelRef.current) {
      return;
    }

    const media = gsap.matchMedia();
    media.add(
      '(prefers-reduced-motion: no-preference)',
      () => {
        gsap.fromTo(
          panelRef.current,
          { autoAlpha: 0, x: 28 },
          {
            autoAlpha: 1,
            duration: 0.24,
            ease: 'power2.out',
            x: 0,
          },
        );
        gsap.fromTo(
          '[data-notification-panel-item]',
          { autoAlpha: 0, y: 8 },
          {
            autoAlpha: 1,
            duration: 0.22,
            ease: 'power1.out',
            stagger: 0.035,
            y: 0,
          },
        );
      },
      panelRef,
    );
    panelRef.current.focus();
    return () => media.revert();
  }, [isPanelOpen]);

  useEffect(() => {
    if (!isPanelOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePanel();
      }
      if (event.key !== 'Tab' || !panelRef.current) {
        return;
      }

      const focusableElements = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);
      if (!firstElement || !lastElement) {
        event.preventDefault();
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closePanel, isPanelOpen]);

  if (!isPanelOpen) {
    return null;
  }

  const visibleItems = items.slice(0, 12);

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        aria-label="Close notifications"
        className="absolute inset-0 h-full w-full bg-slate-950/25 backdrop-blur-[2px]"
        type="button"
        onClick={closePanel}
      />
      <aside
        ref={panelRef}
        aria-label="Notification centre"
        aria-modal="true"
        className="absolute top-0 right-0 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl outline-none dark:border-slate-800 dark:bg-slate-950"
        role="dialog"
        tabIndex={-1}
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
              Notifications
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {unreadCount > 0
                ? `${unreadCount} unread`
                : 'You are all caught up'}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0
              ? (
                  <button
                    aria-label="Mark all notifications as read"
                    className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                    title="Mark all as read"
                    type="button"
                    onClick={() => void markAllAsRead()}
                  >
                    <CheckCheck className="h-5 w-5" />
                  </button>
                )
              : null}
            <button
              aria-label="Close notification centre"
              className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              type="button"
              onClick={closePanel}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading
            ? (
                <div aria-label="Loading notifications" className="space-y-3 p-4">
                  {[0, 1, 2, 3].map(item => (
                    <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
                  ))}
                </div>
              )
            : hasError
              ? (
                  <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                    <p className="font-medium text-slate-900 dark:text-white">
                      Notifications could not be loaded
                    </p>
                    <button
                      className="mt-3 rounded-full bg-[#160E53] px-4 py-2 text-sm font-semibold text-white"
                      type="button"
                      onClick={() => void refetch()}
                    >
                      Reload
                    </button>
                  </div>
                )
              : visibleItems.length === 0
                ? (
                    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800">
                        <NotificationCategoryIcon category="reminders" className="h-6 w-6" />
                      </div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        No notifications yet
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Activity and reminders will appear here.
                      </p>
                    </div>
                  )
                : (
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                      {visibleItems.map(item => (
                        <li
                          key={item.id}
                          data-notification-panel-item
                          className={item.isRead
                            ? 'bg-white dark:bg-slate-950'
                            : 'bg-indigo-50/60 dark:bg-indigo-950/20'}
                        >
                          <div className="group flex gap-2 p-4">
                            <button
                              className="flex min-w-0 flex-1 gap-3 text-left"
                              type="button"
                              onClick={() => {
                                void markAsRead(item.id);
                                closePanel();
                                router.push(item.destinationUrl);
                              }}
                            >
                              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[#160E53] dark:bg-slate-800 dark:text-indigo-300">
                                <NotificationCategoryIcon category={item.category} />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="flex items-center gap-2">
                                  <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                                    {item.title}
                                  </span>
                                  {!item.isRead
                                    ? <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-600" />
                                    : null}
                                </span>
                                <span className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                                  {item.message}
                                </span>
                                <span className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                                  {NOTIFICATION_CATEGORY_LABELS[item.category]}
                                  <span aria-hidden="true">·</span>
                                  <time dateTime={item.createdAt}>
                                    {formatNotificationTime(item.createdAt)}
                                  </time>
                                </span>
                              </span>
                            </button>
                            <button
                              aria-label={`Delete ${item.title}`}
                              className="h-fit rounded-full p-2 text-slate-400 opacity-100 transition hover:bg-red-50 hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100 dark:hover:bg-red-950/30"
                              type="button"
                              onClick={() => void deleteNotification(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
        </div>

        <footer className="border-t border-slate-200 p-4 dark:border-slate-800">
          <Link
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#160E53] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#241a7a]"
            href="/notifications"
            onClick={closePanel}
          >
            View all notifications
            <ArrowRight className="h-4 w-4" />
          </Link>
        </footer>
      </aside>
    </div>
  );
}
