'use client';

import { motion } from 'framer-motion';
import { ProfileTab, ProfileTabConfig } from '@/types/profile.types';

interface ProfileTabsProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}

const tabConfigs: ProfileTabConfig[] = [
  { id: 'journey', label: 'Journey' },
  { id: 'post', label: 'Post' },
  { id: 'map', label: 'Map' },
];

export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <motion.div 
      className="flex items-center gap-8 w-full border-b border-gray-200 px-4 sm:px-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {tabConfigs.map((tab, index) => (
        <motion.button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`pb-3 px-1 border-b-2 font-medium transition-colors relative ${
            activeTab === tab.id
              ? 'border-transparent text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 * index }}
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
        >
          {tab.label}
          
          {/* Active indicator */}
          {activeTab === tab.id && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
              layoutId="activeTab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
        </motion.button>
      ))}
    </motion.div>
  );
}
