'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { User } from '@/types/auth.types';
import { HomeIcon, ExploreIcon, UserProfileIcon, ChatBubbleIcon, SettingsIcon } from '@/components/icons';

interface BottomNavigationProps {
  user: User;
  onLogout: () => void;
}

const BottomNavigation = ({ user: _user, onLogout: _onLogout }: BottomNavigationProps) => {
  const pathname = usePathname();

  // Main navigation items (same as sidebar but without labels on mobile)
  const navigationItems = [
    {
      name: 'Home',
      href: '/dashboard',
      icon: <HomeIcon className="w-6 h-6" />,
    },
    {
      name: 'Explore',
      href: '/discover',
      icon: <ExploreIcon className="w-6 h-6" />,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: <UserProfileIcon className="w-6 h-6" />,
    },
    {
      name: 'Messages',
      href: '/messages',
      icon: <ChatBubbleIcon className="w-6 h-6" />,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: <SettingsIcon className="w-6 h-6" />,
    },
  ];

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 sm:hidden"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="flex items-center justify-around py-2 px-2">
        {navigationItems.map(item => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 ${
              isActive(item.href)
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.1 }}
            >
              {item.icon}
            </motion.div>

            {/* Active indicator */}
            {isActive(item.href) && (
              <motion.div
                className="w-1 h-1 bg-[#001A6E] rounded-full mt-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </Link>
        ))}
      </div>

      {/* Safe area padding for phones with home indicator */}
      <div className="h-safe-area-inset-bottom bg-white"></div>
    </motion.div>
  );
};

export default BottomNavigation;
