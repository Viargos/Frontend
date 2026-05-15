'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DASHBOARD_NAV_ITEMS } from '@/modules/dashboard/constants/dashboard.constants';
import {
  ChatBubbleIcon,
  ChevronLeftIcon,
  ClipboardListIcon,
  ExploreIcon,
  HomeIcon,
  SettingsIcon,
  UserProfileIcon,
} from './dashboard-icons';

type DashboardSidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

function renderIcon(icon: (typeof DASHBOARD_NAV_ITEMS)[number]['icon']) {
  const className = 'h-5 w-5';

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
    default:
      return null;
  }
}

export const DashboardSidebar = (props: DashboardSidebarProps) => {
  const { collapsed, onToggle } = props;
  const pathname = usePathname();
  const settingsItem = DASHBOARD_NAV_ITEMS.find(item => item.href === '/settings');
  const mainItems = DASHBOARD_NAV_ITEMS.filter(item => item.href !== '/settings');
  const showTooltips = collapsed;

  return (
    <div className="dashboard-sidebar relative flex h-full flex-col bg-white shadow-[4px_0_12px_-2px_rgba(0,0,0,0.08)]">
      <button
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute top-6 -right-3 z-50 hidden h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-white shadow-md transition-colors hover:bg-gray-100 lg:flex"
        type="button"
        onClick={onToggle}
      >
        <ChevronLeftIcon className={`h-3 w-3 text-gray-600 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
      </button>

      <nav className="flex-1 p-2 lg:p-4">
        <ul className="space-y-2">
          {mainItems.map((item) => {
            const active = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  className={`dashboard-sidebar-item group relative flex items-center ${collapsed ? 'justify-center' : 'justify-center lg:justify-start'} rounded-md px-2 py-3 text-sm font-medium transition-colors lg:px-3 lg:py-2 ${
                    active ? 'dashboard-sidebar-item-active bg-gray-200 text-gray-900' : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
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
                        <span className="pointer-events-none absolute top-1/2 left-full z-50 ml-3 -translate-y-1/2 rounded-md bg-gray-900 px-3 py-1.5 text-xs whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
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
      </nav>

      {settingsItem
        ? (
            <div className="border-t border-gray-200 p-2 lg:p-4">
              <Link
                className={`dashboard-sidebar-item group relative flex items-center ${collapsed ? 'justify-center' : 'justify-center lg:justify-start'} rounded-md px-2 py-3 text-sm font-medium transition-colors lg:px-3 lg:py-2 ${
                  pathname === settingsItem.href ? 'dashboard-sidebar-item-active bg-gray-200 text-gray-900' : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                }`}
                href={settingsItem.href}
                title={settingsItem.label}
              >
                <span className={collapsed ? '' : 'lg:mr-3'}>{renderIcon(settingsItem.icon)}</span>
                <span className={collapsed ? 'hidden' : 'hidden lg:inline'}>{settingsItem.label}</span>

                {showTooltips
                  ? (
                      <span className="pointer-events-none absolute top-1/2 left-full z-50 ml-3 -translate-y-1/2 rounded-md bg-gray-900 px-3 py-1.5 text-xs whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                        {settingsItem.label}
                        <span className="absolute top-1/2 right-full -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                      </span>
                    )
                  : null}
              </Link>
            </div>
          )
        : null}
    </div>
  );
};
