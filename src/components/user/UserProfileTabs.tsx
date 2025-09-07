"use client";

import { motion } from "framer-motion";

interface UserProfileTabsProps {
  activeTab: 'journey' | 'post' | 'map';
  onTabChange: (tab: 'journey' | 'post' | 'map') => void;
}

export default function UserProfileTabs({ activeTab, onTabChange }: UserProfileTabsProps) {
  const tabs = [
    { id: 'journey' as const, label: 'Journeys', icon: '🗺️' },
    { id: 'post' as const, label: 'Posts', icon: '📝' },
    { id: 'map' as const, label: 'Map', icon: '📍' },
  ];

  return (
    <div className="flex items-center justify-center gap-1 w-full">
      <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative px-6 py-3 rounded-md text-sm font-medium transition-colors duration-200
              ${activeTab === tab.id
                ? 'text-white'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {activeTab === tab.id && (
              <motion.div
                className="absolute inset-0 bg-blue-600 rounded-md"
                layoutId="activeTab"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
