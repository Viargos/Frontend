'use client';

import { gsap } from 'gsap';
import { useEffect, useRef } from 'react';
import { BellIcon } from '@/modules/dashboard/components/dashboard-icons';
import { useNotifications } from './notification-context';

export function NotificationBell(props: {
  active?: boolean;
  collapsed?: boolean;
  label?: string;
}) {
  const { isPanelOpen, togglePanel, unreadCount } = useNotifications();
  const badgeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!badgeRef.current || unreadCount === 0) {
      return;
    }
    const media = gsap.matchMedia();
    media.add(
      '(prefers-reduced-motion: no-preference)',
      () => {
        gsap.fromTo(
          badgeRef.current,
          { scale: 0.65 },
          {
            duration: 0.28,
            ease: 'back.out(2)',
            overwrite: 'auto',
            scale: 1,
          },
        );
      },
      badgeRef,
    );
    return () => media.revert();
  }, [unreadCount]);

  const label = props.label ?? 'Notifications';

  return (
    <button
      aria-expanded={isPanelOpen}
      aria-haspopup="dialog"
      aria-label={
        unreadCount > 0
          ? `${label}, ${unreadCount} unread`
          : label
      }
      className={`dashboard-sidebar-item group relative flex w-full items-center ${
        props.collapsed ? 'justify-center' : 'justify-center lg:justify-start'
      } rounded-full px-2 py-3 text-base transition-colors lg:px-3 ${
        props.active
          ? 'font-semibold text-gray-950 dark:text-slate-100'
          : 'font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
      }`}
      title={label}
      type="button"
      onClick={togglePanel}
    >
      <span className={`relative ${props.collapsed ? '' : 'lg:mr-3'}`}>
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0
          ? (
              <span
                ref={badgeRef}
                className="absolute -top-2 -right-2 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] leading-none font-bold text-white ring-2 ring-white"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )
          : null}
      </span>
      <span className={props.collapsed ? 'hidden' : 'hidden flex-1 text-left lg:inline'}>
        {label}
      </span>
    </button>
  );
}
