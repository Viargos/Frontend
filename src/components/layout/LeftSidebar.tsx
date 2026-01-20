'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, ExploreIcon, UserProfileIcon, ChatBubbleIcon, ClipboardListIcon, SettingsIcon, ChevronLeftIcon } from '@/components/icons';

interface LeftSidebarProps {
  onNavigate?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const LeftSidebar = ({
  onNavigate,
  isCollapsed = false,
  onToggleCollapse,
}: LeftSidebarProps) => {
  const pathname = usePathname();

  // Main navigation items (without settings)
  const mainNavigationItems: Array<{
    name: string;
    href: string;
    icon: React.ReactNode;
    badge?: string;
  }> = [
    {
      name: 'Home',
      href: '/dashboard',
      icon: <HomeIcon className="w-5 h-5" />,
    },
    {
      name: 'Explore',
      href: '/discover',
      icon: <ExploreIcon className="w-5 h-5" />,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: <UserProfileIcon className="w-5 h-5" />,
    },
    {
      name: 'Messages',
      href: '/messages',
      icon: <ChatBubbleIcon className="w-5 h-5" />,
    },
    {
      name: 'Plan Your Journey',
      href: '/plan-your-journey',
      icon: <ClipboardListIcon className="w-5 h-5" />,
      badge: 'Coming Soon',
    },
  ];

  // Settings section (separate)
  const settingsItem = {
    name: 'Settings',
    href: '/settings',
    icon: <SettingsIcon className="w-5 h-5" />,
  };

  const isActive = (href: string) => {
    return pathname === href;
  };

  // Determine if we should show tooltips (icon-only mode)
  const showTooltips = isCollapsed; // Only show tooltips when collapsed on desktop

  return (
    <div className="bg-white flex flex-col h-full shadow-[4px_0_12px_-2px_rgba(0,0,0,0.08)] relative">
      {/* Toggle Button */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3 top-6 z-50 w-6 h-6 bg-white border border-gray-300 rounded-full items-center justify-center hover:bg-gray-100 transition-colors shadow-md"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeftIcon
            className={`w-3 h-3 text-gray-600 transition-transform duration-200 ${
              isCollapsed ? 'rotate-180' : ''
            }`}
          />
        </button>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 p-2 lg:p-4">
        <ul className="space-y-2">
          {mainNavigationItems.map(item => (
            <li key={item.name}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center ${
                  isCollapsed
                    ? 'justify-center'
                    : 'justify-center lg:justify-start'
                } px-2 lg:px-3 py-3 lg:py-2 rounded-md text-sm font-medium transition-colors group relative ${
                  isActive(item.href)
                    ? 'bg-gray-200 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                }`}
                title={item.name}
              >
                <span className={isCollapsed ? '' : 'lg:mr-3'}>
                  {item.icon}
                </span>
                <span
                  className={`${
                    isCollapsed ? 'hidden' : 'hidden lg:inline'
                  } flex-1`}
                >
                  {item.name}
                </span>

                {/* Coming Soon Badge */}
                {item.badge && !isCollapsed && (
                  <span className="hidden lg:inline ml-2 px-2 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-600 rounded-full animate-pulse">
                    {item.badge}
                  </span>
                )}

                {/* Tooltip - Only show when sidebar is collapsed */}
                {showTooltips && (
                  <span className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none shadow-lg">
                    {item.name}
                    {item.badge && (
                      <span className="ml-2 px-1.5 py-0.5 text-[9px] font-semibold bg-blue-500 text-white rounded-full animate-pulse">
                        {item.badge}
                      </span>
                    )}
                    {/* Tooltip arrow */}
                    <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></span>
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Settings Section at Bottom */}
      <div className="p-2 lg:p-4 border-t border-gray-200">
        <Link
          href={settingsItem.href}
          onClick={onNavigate}
          className={`flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-center lg:justify-start'
          } px-2 lg:px-3 py-3 lg:py-2 rounded-md text-sm font-medium transition-colors group relative ${
            isActive(settingsItem.href)
              ? 'bg-gray-200 text-gray-900'
              : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
          }`}
          title={settingsItem.name}
        >
          <span className={isCollapsed ? '' : 'lg:mr-3'}>
            {settingsItem.icon}
          </span>
          <span className={`${isCollapsed ? 'hidden' : 'hidden lg:inline'}`}>
            {settingsItem.name}
          </span>

          {/* Tooltip - Only show when sidebar is collapsed */}
          {showTooltips && (
            <span className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none shadow-lg">
              {settingsItem.name}
              {/* Tooltip arrow */}
              <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></span>
            </span>
          )}
        </Link>
      </div>
    </div>
  );
};

export default LeftSidebar;
