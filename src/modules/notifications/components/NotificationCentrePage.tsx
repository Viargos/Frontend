'use client';

import { gsap } from 'gsap';
import { Check, CheckCheck, ExternalLink, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { OverlayModal } from '@/modules/common';
import {
  formatNotificationTime,
  NOTIFICATION_CATEGORY_LABELS,
} from '@/modules/notifications/helpers/notification.helper';
import { useNotifications } from './notification-context';
import { NotificationCategoryIcon } from './NotificationCategoryIcon';

export function NotificationCentrePage() {
  const listRef = useRef<HTMLDivElement>(null);
  const [isClearConfirmationVisible, setIsClearConfirmationVisible]
    = useState(false);
  const {
    clearNotifications,
    deleteNotification,
    hasError,
    isLoading,
    items,
    markAllAsRead,
    markAsRead,
    refetch,
    unreadCount,
  } = useNotifications();

  useEffect(() => {
    if (!listRef.current || items.length === 0) {
      return;
    }
    const media = gsap.matchMedia();
    media.add(
      '(prefers-reduced-motion: no-preference)',
      () => {
        gsap.fromTo(
          '[data-notification-centre-item]',
          { autoAlpha: 0, y: 10 },
          {
            autoAlpha: 1,
            duration: 0.25,
            ease: 'power1.out',
            stagger: 0.035,
            y: 0,
          },
        );
      },
      listRef,
    );
    return () => media.revert();
  }, [items.length]);

  return (
    <main className="min-h-screen flex-1 bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center dark:border-slate-800">
          <div>
            <h1 className="font-outfit text-3xl font-bold text-slate-950 dark:text-white">
              Notifications
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
                : 'You are all caught up'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {unreadCount > 0
              ? (
                  <button
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    type="button"
                    onClick={() => void markAllAsRead()}
                  >
                    <CheckCheck className="h-4 w-4" />
                    Mark all as read
                  </button>
                )
              : null}
            {items.length > 0
              ? (
                  <button
                    className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/50 dark:bg-slate-900"
                    type="button"
                    onClick={() => setIsClearConfirmationVisible(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear all
                  </button>
                )
              : null}
          </div>
        </header>

        {isLoading
          ? (
              <div aria-label="Loading notifications" className="space-y-3">
                {[0, 1, 2, 3].map(item => (
                  <div key={item} className="h-32 animate-pulse rounded-2xl bg-white shadow-sm dark:bg-slate-900" />
                ))}
              </div>
            )
          : hasError
            ? (
                <div className="rounded-2xl border border-red-100 bg-white px-6 py-14 text-center shadow-sm dark:border-red-900/40 dark:bg-slate-900">
                  <p className="font-semibold text-slate-950 dark:text-white">
                    Notifications could not be loaded
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Your notification history is still safe.
                  </p>
                  <button
                    className="mt-4 rounded-full bg-[#160E53] px-5 py-2 text-sm font-semibold text-white"
                    type="button"
                    onClick={() => void refetch()}
                  >
                    Reload
                  </button>
                </div>
              )
            : items.length === 0
              ? (
                  <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                      <NotificationCategoryIcon category="reminders" className="h-8 w-8" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                      No notifications
                    </h2>
                    <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                      Reminders, activity, workflow updates, and important alerts
                      will appear here.
                    </p>
                    <Link
                      className="mt-5 inline-flex rounded-full bg-[#160E53] px-5 py-2.5 text-sm font-semibold text-white"
                      href="/settings"
                    >
                      Notification settings
                    </Link>
                  </div>
                )
              : (
                  <div ref={listRef} className="space-y-3">
                    {items.map(item => (
                      <article
                        key={item.id}
                        data-notification-centre-item
                        className={`group rounded-2xl border p-4 shadow-sm transition-colors sm:p-5 ${
                          item.isRead
                            ? 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                            : 'border-indigo-200 bg-indigo-50/70 dark:border-indigo-900/50 dark:bg-indigo-950/20'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#160E53] shadow-sm dark:bg-slate-800 dark:text-indigo-300">
                            <NotificationCategoryIcon category={item.category} className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Link
                                className="font-semibold text-slate-950 hover:underline dark:text-white"
                                href={item.destinationUrl}
                                onClick={() => void markAsRead(item.id)}
                              >
                                {item.title}
                              </Link>
                              {!item.isRead
                                ? <span className="h-2 w-2 rounded-full bg-indigo-600" title="Unread" />
                                : null}
                              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                                {NOTIFICATION_CATEGORY_LABELS[item.category]}
                              </span>
                            </div>
                            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                              {item.message}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                              <time
                                className="text-xs text-slate-400"
                                dateTime={item.createdAt}
                                title={new Date(item.createdAt).toLocaleString()}
                              >
                                {formatNotificationTime(item.createdAt)}
                              </time>
                              <div className="flex items-center gap-1">
                                {!item.isRead
                                  ? (
                                      <button
                                        aria-label={`Mark ${item.title} as read`}
                                        className="rounded-full p-2 text-slate-400 transition-colors hover:bg-white hover:text-indigo-700 dark:hover:bg-slate-800"
                                        title="Mark as read"
                                        type="button"
                                        onClick={() => void markAsRead(item.id)}
                                      >
                                        <Check className="h-4 w-4" />
                                      </button>
                                    )
                                  : null}
                                <Link
                                  aria-label={`Open ${item.title}`}
                                  className="rounded-full p-2 text-slate-400 transition-colors hover:bg-white hover:text-slate-700 dark:hover:bg-slate-800"
                                  href={item.destinationUrl}
                                  title="Open"
                                  onClick={() => void markAsRead(item.id)}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Link>
                                <button
                                  aria-label={`Delete ${item.title}`}
                                  className="rounded-full p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                                  title="Delete"
                                  type="button"
                                  onClick={() => void deleteNotification(item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
      </div>
      {isClearConfirmationVisible
        ? (
            <OverlayModal
              ariaLabel="Clear all notifications"
              className="max-w-md p-6"
              onClose={() => setIsClearConfirmationVisible(false)}
            >
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                Clear all notifications?
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                This removes your notification history and cannot be undone.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  type="button"
                  onClick={() => setIsClearConfirmationVisible(false)}
                >
                  Cancel
                </button>
                <button
                  className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                  type="button"
                  onClick={() => {
                    setIsClearConfirmationVisible(false);
                    void clearNotifications();
                  }}
                >
                  Clear all
                </button>
              </div>
            </OverlayModal>
          )
        : null}
    </main>
  );
}
