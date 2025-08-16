"use client";

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Map, Calendar, MapPin, Star } from 'lucide-react';
import { JourneyStats } from '@/types/journey.types';
import { useJourneyStore } from '@/store/journey.store';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface JourneysStatsProps {
  className?: string;
}

export default function JourneysStats({ className = '' }: JourneysStatsProps) {
  const { stats, isLoadingStats, loadStats } = useJourneyStore();
  
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const AnimatedNumber = ({ 
    value, 
    duration = 1000 
  }: { 
    value: number; 
    duration?: number; 
  }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
      let startTime: number;
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        setDisplayValue(Math.floor(progress * value));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }, [value, duration]);

    return <span>{formatNumber(displayValue)}</span>;
  };

  const statsItems = [
    {
      icon: Map,
      label: 'Total Journeys',
      value: stats?.totalJourneys || 0,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      delay: 0.1,
    },
    {
      icon: Calendar,
      label: 'Journey Days',
      value: stats?.totalDays || 0,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      delay: 0.2,
    },
    {
      icon: MapPin,
      label: 'Places Visited',
      value: stats?.totalPlaces || 0,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      delay: 0.3,
    },
    {
      icon: Star,
      label: 'Published',
      value: stats?.publishedJourneys || 0,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      delay: 0.4,
    },
  ];

  if (isLoadingStats) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}
    >
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-lg font-semibold text-gray-900 mb-6"
      >
        Journey Statistics
      </motion.h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsItems.map((item, index) => {
          const Icon = item.icon;
          
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: item.delay,
                duration: 0.5,
                type: "spring",
                damping: 20,
              }}
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
              className="relative p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200"
            >
              {/* Background Icon */}
              <div className={`absolute top-2 right-2 p-2 rounded-full ${item.bgColor}`}>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>

              {/* Value */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: item.delay + 0.2, duration: 0.5 }}
                className={`text-2xl font-bold ${item.color} mb-1`}
              >
                <AnimatedNumber value={item.value} duration={1200} />
              </motion.div>

              {/* Label */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: item.delay + 0.3, duration: 0.5 }}
                className="text-sm text-gray-600 font-medium"
              >
                {item.label}
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Most Visited Location */}
      {stats.mostVisitedLocation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-full shadow-sm">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Most Visited Location</div>
              <div className="text-lg font-semibold text-gray-900">
                {stats.mostVisitedLocation}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Stats Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-6 pt-4 border-t border-gray-100"
      >
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Average places per journey:</span>
          <span className="font-medium">
            {stats.totalJourneys > 0 
              ? Math.round(stats.totalPlaces / stats.totalJourneys) 
              : 0}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
          <span>Average days per journey:</span>
          <span className="font-medium">
            {stats.totalJourneys > 0 
              ? Math.round(stats.totalDays / stats.totalJourneys) 
              : 0}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
