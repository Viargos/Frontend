'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuthSession } from '@/modules/auth';
import { cn } from '@/modules/common/components/ui/cn';
import { AddPostIcon } from '@/modules/common/icons';
import { DASHBOARD_NAV_ITEMS } from '@/modules/dashboard/constants/dashboard.constants';
import { NotificationBell } from '@/modules/notifications';
import {
  BellIcon,
  ChatBubbleIcon,
  ClipboardListIcon,
  ExploreIcon,
  HomeIcon,
  SettingsIcon,
  UserProfileIcon,
} from './dashboard-icons';
import { DashboardCreatePostModal } from './DashboardCreatePostModal';

type DashboardSidebarProps = {
  collapsed: boolean;
};

function renderIcon(icon: (typeof DASHBOARD_NAV_ITEMS)[number]['icon']) {
  const className = 'h-6 w-6';

  switch (icon) {
    case 'home':
      return <HomeIcon className={className} />;
    case 'explore':
      return <ExploreIcon className={className} />;
    case 'profile':
      return <UserProfileIcon className={className} />;
    case 'messages':
      return <ChatBubbleIcon className={className} />;
    case 'plan':
      return <ClipboardListIcon className={className} />;
    case 'settings':
      return <SettingsIcon className={className} />;
    case 'notifications':
      return <BellIcon className={className} />;
    default:
      return null;
  }
}

export const DashboardSidebar = (props: DashboardSidebarProps) => {
  const { collapsed } = props;
  const pathname = usePathname();
  const router = useRouter();
  const { session, signOut } = useAuthSession();
  const user = session.user;
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        showPopup
        && popupRef.current
        && !popupRef.current.contains(event.target as Node)
        && buttonRef.current
        && !buttonRef.current.contains(event.target as Node)
      ) {
        setShowPopup(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPopup]);

  const settingsItem = DASHBOARD_NAV_ITEMS.find(item => item.href === '/settings');
  const notificationsItem = DASHBOARD_NAV_ITEMS.find(item => item.href === '/notifications');
  const mainItems = DASHBOARD_NAV_ITEMS.filter(
    item => item.href !== '/settings' && item.href !== '/profile' && item.href !== '/notifications',
  );
  const showTooltips = collapsed;

  return (
    <div className="dashboard-sidebar relative flex h-full flex-col bg-white">
      <div className={cn('flex h-18 shrink-0 items-center px-3 lg:px-5', collapsed ? 'justify-center' : 'justify-center lg:justify-start')}>
        <Link aria-label="Go to dashboard" className="inline-flex items-center rounded-full p-2 transition-colors hover:bg-gray-100" href="/dashboard">
          <Image alt="Viargos" className={cn('theme-logo h-10 w-10', collapsed ? 'block' : 'block lg:hidden')} height={40} src="/viargos.svg" width={40} />
          {!collapsed
            ? (
                <Image
                  alt="Viargos"
                  className="theme-logo hidden lg:block"
                  height={32}
                  src="/viargos_full.svg"
                  style={{ width: 'auto', height: 'auto' }}
                  width={130}
                />
              )
            : null}
        </Link>
      </div>

      <nav className="flex-1 p-2 lg:p-4">
        <ul className="space-y-2">
          {mainItems.map((item) => {
            const active = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  className={`dashboard-sidebar-item group relative flex items-center ${collapsed ? 'justify-center' : 'justify-center lg:justify-start'} rounded-full px-2 py-3 text-base transition-colors lg:px-3 ${
                    active ? 'font-semibold text-gray-950 dark:text-slate-100' : 'font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`}
                  href={item.href}
                  title={item.label}
                >
                  <span className={collapsed ? '' : 'lg:mr-3'}>{renderIcon(item.icon)}</span>
                  <span className={`${collapsed ? 'hidden' : 'hidden lg:inline'} flex-1`}>{item.label}</span>

                  {'badge' in item && item.badge && !collapsed
                    ? <span className="ml-2 hidden rounded-full border border-[#f8d775]/20 bg-[#f8d775]/12 px-2 py-0.5 text-[10px] font-semibold text-[#f8d775] shadow-[0_10px_24px_-18px_rgba(248,215,117,0.9)] lg:inline">{item.badge}</span>
                    : null}

                  {showTooltips
                    ? (
                        <span className="dashboard-sidebar-tooltip pointer-events-none absolute top-1/2 left-full z-50 ml-3 -translate-y-1/2 rounded-md bg-gray-900 px-3 py-1.5 text-xs whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                          {item.label}
                          {'badge' in item && item.badge
                            ? <span className="ml-2 rounded-full bg-blue-500 px-1.5 py-0.5 text-[9px] font-semibold text-white">{item.badge}</span>
                            : null}
                          <span className="absolute top-1/2 right-full -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                        </span>
                      )
                    : null}
                </Link>
              </li>
            );
          })}
        </ul>

        <button
          aria-label="Create post"
          className={cn(
            'mt-5 flex h-12 w-full items-center justify-center rounded-full bg-[#160E53] text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#241a7a] active:scale-[0.98]',
            collapsed ? 'px-0' : 'px-4',
          )}
          type="button"
          onClick={() => setShowCreatePostModal(true)}
        >
          <AddPostIcon className={cn('h-5 w-5', collapsed ? '' : 'lg:hidden')} size={20} />
          <span className={collapsed ? 'hidden' : 'hidden lg:inline'}>Post</span>
        </button>
      </nav>

      {settingsItem || notificationsItem
        ? (
            <div className="space-y-1 p-2 lg:p-4">
              {notificationsItem
                ? (
                    <NotificationBell
                      active={pathname === notificationsItem.href}
                      collapsed={collapsed}
                      label={notificationsItem.label}
                    />
                  )
                : null}

              {settingsItem
                ? (
                    <Link
                      className={`dashboard-sidebar-item group relative flex items-center ${collapsed ? 'justify-center' : 'justify-center lg:justify-start'} rounded-full px-2 py-3 text-base transition-colors lg:px-3 ${
                        pathname === settingsItem.href ? 'font-semibold text-gray-950 dark:text-slate-100' : 'font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                      }`}
                      href={settingsItem.href}
                      title={settingsItem.label}
                    >
                      <span className={collapsed ? '' : 'lg:mr-3'}>{renderIcon(settingsItem.icon)}</span>
                      <span className={collapsed ? 'hidden' : 'hidden lg:inline'}>{settingsItem.label}</span>

                      {showTooltips
                        ? (
                            <span className="dashboard-sidebar-tooltip pointer-events-none absolute top-1/2 left-full z-50 ml-3 -translate-y-1/2 rounded-md bg-gray-900 px-3 py-1.5 text-xs whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                              {settingsItem.label}
                              <span className="absolute top-1/2 right-full -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                            </span>
                          )
                        : null}
                    </Link>
                  )
                : null}
            </div>
          )
        : null}

      {user
        ? (
            <div className="relative border-t border-gray-200 p-2 lg:p-4">
              {showPopup && (
                <div
                  ref={popupRef}
                  className={cn(
                    'absolute z-50 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150 dark:border-slate-800 dark:bg-slate-950',
                    collapsed
                      ? 'bottom-4 left-full ml-3 w-44'
                      : 'left-full ml-3 w-44 bottom-2 lg:right-2 lg:bottom-full lg:left-2 lg:mb-2 lg:ml-0 lg:w-auto',
                  )}
                >
                  <Link
                    href="/profile"
                    className="flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    onClick={() => setShowPopup(false)}
                  >
                    <UserProfileIcon className="mr-2.5 h-4.5 w-4.5 text-gray-500" />
                    View profile
                  </Link>
                  <button
                    type="button"
                    className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                    onClick={async () => {
                      setShowPopup(false);
                      await signOut();
                      router.push('/');
                    }}
                  >
                    <svg
                      className="mr-2.5 h-4.5 w-4.5 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}

              <button
                ref={buttonRef}
                type="button"
                onClick={() => setShowPopup(!showPopup)}
                className={cn(
                  'flex items-center rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-left focus:outline-none',
                  collapsed
                    ? 'mx-auto h-10 w-10 p-0 justify-center'
                    : 'mx-auto h-10 w-10 p-0 justify-center lg:w-full lg:p-2 lg:h-auto lg:justify-between',
                )}
              >
                <div className="flex min-w-0 items-center">
                  {user.profileImage
                    ? (
                        <Image
                          alt={user.username}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100 dark:ring-slate-800"
                          height={40}
                          src={user.profileImage}
                          unoptimized
                          width={40}
                        />
                      )
                    : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-900 text-sm font-bold text-white ring-2 ring-blue-100 dark:ring-blue-950">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}

                  {!collapsed && (
                    <div className="ml-3 hidden min-w-0 lg:block">
                      <p className="truncate text-sm leading-tight font-semibold text-gray-900 dark:text-slate-100">
                        {user.username.toUpperCase()}
                      </p>
                      <p className="truncate text-xs leading-tight text-gray-500 dark:text-slate-400">
                        @
                        {user.username}
                      </p>
                    </div>
                  )}
                </div>

                {!collapsed && (
                  <span className="hidden px-1 text-lg font-bold text-gray-400 lg:inline dark:text-slate-500">⋯</span>
                )}
              </button>
            </div>
          )
        : null}

      <DashboardCreatePostModal isOpen={showCreatePostModal} onClose={() => setShowCreatePostModal(false)} />
    </div>
  );
};
