'use client';

import { motion } from 'framer-motion';
import { Journey } from '@/types/journey.types';
import { useRouter } from 'next/navigation';
import { JourneyIcon, XIcon, UserCircleIcon, CalendarIcon } from '@/components/icons';

interface JourneyCardProps {
  journey: Journey;
  onClose: () => void;
}

export default function JourneyCard({ journey, onClose }: JourneyCardProps) {
  const router = useRouter();

  const handleViewJourney = () => {
    router.push(`/journey/${journey.id}`);
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTotalPlaces = () => {
    if (!journey.days) return 0;
    return journey.days.reduce((total, day) => {
      return total + (day.places?.length || 0);
    }, 0);
  };

  const getJourneyDuration = () => {
    if (!journey.days || journey.days.length === 0) return 'No duration';
    if (journey.days.length === 1) return '1 day';
    return `${journey.days.length} days`;
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-xl overflow-hidden max-w-md w-full"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="relative">
        {journey.coverImage ? (
          <img
            src={journey.coverImage}
            alt={journey.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-[#3B82F6] to-[#160E53] flex items-center justify-center">
            <JourneyIcon className="w-16 h-16 text-white opacity-50" />
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title and Description */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {journey.title}
          </h3>
          {journey.description && (
            <p className="text-gray-600 text-sm line-clamp-3">
              {journey.description}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {getJourneyDuration()}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Duration
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {getTotalPlaces()}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Places
            </div>
          </div>
        </div>

        {/* Journey Details */}
        <div className="space-y-3 mb-6">
          {/* Author */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <UserCircleIcon className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {journey.user?.username || 'Unknown User'}
              </p>
              <p className="text-xs text-gray-500">Journey Creator</p>
            </div>
          </div>

          {/* Created Date */}
          {journey.createdAt && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(journey.createdAt)}
                </p>
                <p className="text-xs text-gray-500">Created</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <motion.button
            className="flex-1 bg-[#160E53] text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            onClick={handleViewJourney}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View Journey
          </motion.button>
          <motion.button
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Close
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
