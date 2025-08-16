'use client';

import { motion } from 'framer-motion';
import { UserStats } from '@/types/profile.types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ProfileStatsProps {
  stats: UserStats | null;
  isLoading: boolean;
}

export default function ProfileStats({ stats, isLoading }: ProfileStatsProps) {
  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const statItems = [
    { label: 'Posts', value: stats?.posts || 0, key: 'posts' },
    { label: 'Journeys', value: stats?.journeys || 0, key: 'journeys' },
    { label: 'Followers', value: stats?.followers || 0, key: 'followers' },
    { label: 'Following', value: stats?.following || 0, key: 'following' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center gap-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex flex-col items-center gap-1">
            <div className="animate-pulse bg-gray-200 h-6 w-12 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div 
      className="flex items-center gap-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {statItems.map((item, index) => (
        <motion.div
          key={item.key}
          className="flex flex-col items-center gap-1 cursor-pointer group"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 * index }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {formatCount(item.value)}
          </span>
          <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
            {item.label}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}
