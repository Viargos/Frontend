"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "@/types/auth.types";

interface LeftSidebarProps {
  user: User;
  onLogout: () => void;
  onNavigate?: () => void;
}

const LeftSidebar = ({ user, onLogout, onNavigate }: LeftSidebarProps) => {
  const pathname = usePathname();

  // Main navigation items (without settings)
  const mainNavigationItems = [
    {
      name: "Home",
      href: "/dashboard",
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
      name: "Discover",
      href: "/discover",
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
      name: "Profile",
      href: "/profile",
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
      name: "Messages",
      href: "/messages",
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
  ];

  // Settings section (separate)
  const settingsItem = {
    name: "Settings",
    href: "/settings",
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

  return (
    <div className="bg-gray-100 flex flex-col h-full">
      {/* Main Navigation */}
      <nav className="flex-1 p-2 lg:p-4">
        <ul className="space-y-2">
          {mainNavigationItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center justify-center lg:justify-start px-2 lg:px-3 py-3 lg:py-2 rounded-md text-sm font-medium transition-colors group relative ${
                  isActive(item.href)
                    ? "bg-gray-200 text-gray-900"
                    : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                }`}
                title={item.name} // Tooltip for narrow sidebar
              >
                <span className="lg:mr-3">{item.icon}</span>
                <span className="hidden lg:inline">{item.name}</span>
                
                {/* Tooltip for sm to lg screens (narrow sidebar) */}
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 lg:hidden">
                  {item.name}
                </span>
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
          className={`flex items-center justify-center lg:justify-start px-2 lg:px-3 py-3 lg:py-2 rounded-md text-sm font-medium transition-colors group relative ${
            isActive(settingsItem.href)
              ? "bg-gray-200 text-gray-900"
              : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
          }`}
          title={settingsItem.name} // Tooltip for narrow sidebar
        >
          <span className="lg:mr-3">{settingsItem.icon}</span>
          <span className="hidden lg:inline">{settingsItem.name}</span>
          
          {/* Tooltip for sm to lg screens (narrow sidebar) */}
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 lg:hidden">
            {settingsItem.name}
          </span>
        </Link>
      </div>
    </div>
  );
};

export default LeftSidebar;
