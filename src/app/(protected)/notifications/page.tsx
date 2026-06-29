'use client';

import * as motion from 'framer-motion/client';
import { useState } from 'react';
import { TrashIcon } from '@/modules/common/icons';
import { BellIcon } from '@/modules/dashboard/components/dashboard-icons';

type NotificationItem = {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'system';
  title: string;
  description: string;
  time: string;
  isUnread: boolean;
  avatarUrl?: string;
  initial?: string;
};

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    type: 'like',
    title: 'New Like on your Journey',
    description: 'Jane Doe and 4 others liked your journey "Kashmir Trip 2026"',
    time: '2 hours ago',
    isUnread: true,
    initial: 'J',
  },
  {
    id: '2',
    type: 'follow',
    title: 'New Follower',
    description: 'Alex River started following your profile.',
    time: '5 hours ago',
    isUnread: true,
    initial: 'A',
  },
  {
    id: '3',
    type: 'comment',
    title: 'New Comment',
    description: 'Sarah Jenkins commented on your post: "Absolutely stunning photos! I want to visit next month."',
    time: '1 day ago',
    isUnread: false,
    initial: 'S',
  },
  {
    id: '4',
    type: 'system',
    title: 'Welcome to Viargos!',
    description: 'Complete your profile and start sharing your first journey with the community.',
    time: '3 days ago',
    isUnread: false,
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
  };

  const handleToggleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isUnread: !n.isUnread } : n));
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => n.isUnread).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-4xl flex-1 p-4 sm:p-6 lg:p-8"
    >
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center dark:border-slate-800">
        <div>
          <h1 className="font-outfit text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            {unreadCount > 0 ? `You have ${unreadCount} unread notifications.` : 'You are all caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-800 focus:outline-none dark:text-blue-400 dark:hover:text-blue-300"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length > 0
        ? (
            <div className="space-y-3">
              {notifications.map((item, index) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={item.id}
                  className={`group flex items-start justify-between gap-4 rounded-2xl border p-4 transition-all duration-300 ${
                    item.isUnread
                      ? 'border-blue-100 bg-blue-50/50 shadow-xs dark:border-blue-900/30 dark:bg-blue-950/10'
                      : 'border-gray-100 bg-white dark:border-slate-800 dark:bg-slate-900'
                  }`}
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">
                      {item.initial
                        ? (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-900 text-sm font-bold text-white ring-2 ring-blue-100 dark:ring-blue-950">
                              {item.initial}
                            </div>
                          )
                        : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              <BellIcon className="h-5 w-5" />
                            </div>
                          )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                          {item.title}
                        </h2>
                        {item.isUnread && (
                          <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-600" />
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">
                        {item.description}
                      </p>
                      <span className="mt-2 inline-block text-[11px] text-gray-400 dark:text-slate-500">
                        {item.time}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => handleToggleRead(item.id)}
                      title={item.isUnread ? 'Mark as read' : 'Mark as unread'}
                      className="rounded-full p-2 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                      type="button"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      title="Delete notification"
                      className="rounded-full p-2 text-gray-400 transition-all hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-950/20 dark:hover:text-red-400"
                      type="button"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        : (
            <div className="px-4 py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                <BellIcon className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">No notifications</h2>
              <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500 dark:text-slate-400">
                When you get updates about your posts, journeys, or followers, they will appear here.
              </p>
            </div>
          )}
    </motion.div>
  );
}
