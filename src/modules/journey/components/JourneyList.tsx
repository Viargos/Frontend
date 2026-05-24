'use client';

import type { JourneyListItem } from '@/modules/journey/types/journey.types';
import * as motion from 'framer-motion/client';
import { JourneyCard } from '@/modules/journey/components/JourneyCard';

type JourneyListProps = {
  currentUserId?: string;
  isLoading?: boolean;
  journeys: JourneyListItem[];
  onCreateJourney?: () => void;
  onDeleteJourney?: (journeyId: string) => void;
  onDuplicateJourney?: (journeyId: string) => void;
  onEditJourney?: (journey: JourneyListItem) => void;
};

export const JourneyList = (props: JourneyListProps) => {
  const {
    currentUserId,
    isLoading = false,
    journeys,
    onCreateJourney,
    onDeleteJourney,
    onDuplicateJourney,
    onEditJourney,
  } = props;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  if (journeys.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center justify-center px-4 py-16"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ damping: 20, delay: 0.2, type: 'spring' }}
          className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-blue-100"
        >
          <span className="text-5xl leading-none text-green-600" aria-hidden="true"></span>
        </motion.div>

        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-2 text-2xl font-semibold text-gray-900"
        >
          No journeys yet
        </motion.h3>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-8 max-w-md text-center text-gray-600"
        >
          Start creating your first journey to document and share your travel experiences with the world.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{
            boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.3)',
            scale: 1.05,
          }}
          whileTap={{ scale: 0.95 }}
          onClick={onCreateJourney}
          className="flex items-center rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:from-green-700 hover:to-green-800"
          type="button"
        >
          <span className="mr-2 text-lg leading-none" aria-hidden="true">+</span>
          Create Your First Journey
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 grid max-w-2xl grid-cols-1 gap-4 text-center sm:grid-cols-3"
        >
          <div className="p-4">
            <div className="mb-2 text-2xl"></div>
            <div className="mb-1 text-sm font-medium text-gray-700">Plan</div>
            <div className="text-xs text-gray-500">Create detailed itineraries</div>
          </div>
          <div className="p-4">
            <div className="mb-2 text-2xl"></div>
            <div className="mb-1 text-sm font-medium text-gray-700">Document</div>
            <div className="text-xs text-gray-500">Add photos and memories</div>
          </div>
          <div className="p-4">
            <div className="mb-2 text-2xl"></div>
            <div className="mb-1 text-sm font-medium text-gray-700">Share</div>
            <div className="text-xs text-gray-500">Inspire other travelers</div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      {journeys.map((journey, index) => (
        <JourneyCard
          key={journey.id}
          currentUserId={currentUserId}
          journey={journey}
          index={index}
          onDelete={onDeleteJourney}
          onDuplicate={onDuplicateJourney}
          onEdit={onEditJourney}
        />
      ))}
    </motion.div>
  );
};
