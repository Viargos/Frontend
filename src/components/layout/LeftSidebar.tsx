'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      name: 'Explore',
      href: '/discover',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
      ),
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      name: 'Messages',
      href: '/messages',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
    },
    {
      name: 'Plan Your Journey',
      href: '/plan-your-journey',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
      badge: 'Coming Soon',
    },
  ];

  // Settings section (separate)
  const settingsItem = {
    name: 'Settings',
    href: '/settings',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
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
          <svg
            className={`w-3 h-3 text-gray-600 transition-transform duration-200 ${
              isCollapsed ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
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
