"use client";

import { motion } from 'framer-motion';
import { Map, Plus } from 'lucide-react';
import { Journey } from '@/types/journey.types';
import JourneyCard from './JourneyCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface JourneysGridProps {
  journeys: Journey[];
  isLoading?: boolean;
  onCreateJourney?: () => void;
  onEditJourney?: (journey: Journey) => void;
  onDeleteJourney?: (journeyId: string) => void;
  onDuplicateJourney?: (journeyId: string) => void;
}

export default function JourneysGrid({
  journeys,
  isLoading = false,
  onCreateJourney,
  onEditJourney,
  onDeleteJourney,
  onDuplicateJourney,
}: JourneysGridProps) {

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (journeys.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center justify-center py-16 px-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", damping: 20 }}
          className="w-24 h-24 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mb-6"
        >
          <Map className="w-12 h-12 text-green-600" />
        </motion.div>

        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-semibold text-gray-900 mb-2"
        >
          No journeys yet
        </motion.h3>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-600 text-center max-w-md mb-8"
        >
          Start creating your first journey to document and share your travel experiences with the world.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.3)"
          }}
          whileTap={{ scale: 0.95 }}
          onClick={onCreateJourney}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium shadow-lg hover:from-green-700 hover:to-green-800 transition-all duration-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Your First Journey
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center max-w-2xl"
        >
          <div className="p-4">
            <div className="text-2xl mb-2">📝</div>
            <div className="text-sm font-medium text-gray-700 mb-1">Plan</div>
            <div className="text-xs text-gray-500">Create detailed itineraries</div>
          </div>
          <div className="p-4">
            <div className="text-2xl mb-2">📸</div>
            <div className="text-sm font-medium text-gray-700 mb-1">Document</div>
            <div className="text-xs text-gray-500">Add photos and memories</div>
          </div>
          <div className="p-4">
            <div className="text-2xl mb-2">🌍</div>
            <div className="text-sm font-medium text-gray-700 mb-1">Share</div>
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
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {journeys.map((journey, index) => (
        <JourneyCard
          key={journey.id}
          journey={journey}
          index={index}
          onEdit={onEditJourney}
          onDelete={onDeleteJourney}
          onDuplicate={onDuplicateJourney}
        />
      ))}
    </motion.div>
  );
}
