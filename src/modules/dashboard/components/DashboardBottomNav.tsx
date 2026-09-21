'use client';

import * as motion from 'framer-motion/client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DASHBOARD_NAV_ITEMS } from '@/modules/dashboard/constants/dashboard.constants';
import { useNotifications } from '@/modules/notifications';
import { BellIcon, ChatBubbleIcon, ExploreIcon, HomeIcon, SettingsIcon, UserProfileIcon } from './dashboard-icons';

function renderIcon(icon: (typeof DASHBOARD_NAV_ITEMS)[number]['icon'], active: boolean) {
  const className = active ? 'h-6 w-6 text-[var(--surface-2)]' : 'h-6 w-6 text-[var(--surface-inverse)]';

  switch (icon) {
    case 'home':
      return <HomeIcon className={className} />;
    case 'explore':
      return <ExploreIcon className={className} />;
    case 'profile':
      return <UserProfileIcon className={className} />;
    case 'messages':
      return <ChatBubbleIcon className={className} />;
    case 'settings':
      return <SettingsIcon className={className} />;
    case 'notifications':
      return <BellIcon className={className} />;
    default:
      return null;
  }
}

export const DashboardBottomNav = () => {
  const pathname = usePathname();
  const { isPanelOpen, togglePanel, unreadCount } = useNotifications();
  const mobileItems = DASHBOARD_NAV_ITEMS.filter(item => ['home', 'explore', 'profile', 'messages', 'notifications', 'settings'].includes(item.icon));

  return (
    <motion.div
      animate={{ y: 0, opacity: 1 }}
      className="fixed right-0 bottom-0 left-0 z-50 border-t border-gray-200 bg-white sm:hidden"
      initial={{ y: 100, opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {mobileItems.map((item) => {
          const active = pathname === item.href || (item.icon === 'notifications' && isPanelOpen);
          const content = (
            <>
              <motion.div className="relative" transition={{ duration: 0.1 }} whileTap={{ scale: 0.9 }}>
                {renderIcon(item.icon, active)}
                {item.icon === 'notifications' && unreadCount > 0
                  ? (
                      <span className="absolute -top-2 -right-2 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )
                  : null}
              </motion.div>

              {active
                ? (
                    <motion.div
                      animate={{ scale: 1 }}
                      className="mt-1 h-1 w-1 rounded-full bg-[#160E53]"
                      initial={{ scale: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )
                : null}
            </>
          );

          if (item.icon === 'notifications') {
            return (
              <button
                key={item.href}
                aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
                className={`flex flex-col items-center justify-center rounded-xl p-3 transition-all duration-200 ${active ? 'bg-blue-50 text-[var(--surface-2)]' : 'text-[var(--surface-inverse)] hover:bg-gray-100'}`}
                type="button"
                onClick={togglePanel}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              className={`flex flex-col items-center justify-center rounded-xl p-3 transition-all duration-200 ${active ? 'bg-blue-50 text-[var(--surface-2)]' : 'text-[var(--surface-inverse)] hover:bg-gray-100'}`}
              href={item.href}
            >
              {content}
            </Link>
          );
        })}
      </div>

      <div className="h-[env(safe-area-inset-bottom)] bg-white" />
    </motion.div>
  );
};
