"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Edit3, Trash2, Copy, Share2, MoreHorizontal } from 'lucide-react';
import { Journey } from '@/types/journey.types';
import { useJourneyStore } from '@/store/journey.store';
import { useRouter } from 'next/navigation';

interface JourneyCardProps {
  journey: Journey;
  index: number;
  onEdit?: (journey: Journey) => void;
  onDelete?: (journeyId: string) => void;
  onDuplicate?: (journeyId: string) => void;
}

export default function JourneyCard({
  journey,
  index,
  onEdit,
  onDelete,
  onDuplicate,
}: JourneyCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  
  const { 
    deleteJourney, 
    duplicateJourney, 
    isDeleting, 
    isCreating 
  } = useJourneyStore();

  const handleCardClick = () => {
    router.push(`/journey/${journey.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(journey);
    }
    setShowDropdown(false);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(journey.id);
    } else {
      const success = await deleteJourney(journey.id);
      if (success) {
        // Optionally show success message
      }
    }
    setShowDropdown(false);
  };

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDuplicate) {
      onDuplicate(journey.id);
    } else {
      await duplicateJourney(journey.id);
    }
    setShowDropdown(false);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const url = `${window.location.origin}/journey/${journey.id}`;
      await navigator.share({
        title: journey.title,
        text: journey.description || 'Check out this journey!',
        url,
      });
    } catch {
      // Fallback to clipboard
      const url = `${window.location.origin}/journey/${journey.id}`;
      await navigator.clipboard.writeText(url);
      // Could show toast notification here
    }
    setShowDropdown(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getLocationFromJourney = () => {
    // Try to extract location from days/places if available
    if (journey.days && journey.days.length > 0) {
      const firstDay = journey.days[0];
      if (firstDay.places && firstDay.places.length > 0) {
        const firstPlace = firstDay.places[0];
        return firstPlace.address || firstPlace.name || 'Unknown location';
      }
    }
    // Fallback to extracting from description
    if (journey.description && journey.description.includes('to ')) {
      const location = journey.description.split('to ')[1]?.split(' on')[0];
      return location || 'Unknown location';
    }
    return 'Unknown location';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        type: "spring",
        damping: 25,
        stiffness: 200
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={handleCardClick}
    >
      {/* Card Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1">
            {journey.title}
          </h3>
          
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="w-5 h-5" />
            </motion.button>

            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20"
                onMouseLeave={() => setShowDropdown(false)}
              >
                <div className="py-1">
                  <button
                    onClick={handleEdit}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Edit3 className="w-4 h-4 mr-3" />
                    Edit Journey
                  </button>
                  <button
                    onClick={handleDuplicate}
                    disabled={isCreating}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <Copy className="w-4 h-4 mr-3" />
                    Duplicate
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Share2 className="w-4 h-4 mr-3" />
                    Share Journey
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 mr-3" />
                    Delete Journey
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Description */}
        {journey.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {journey.description}
          </p>
        )}

        {/* Journey Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{getLocationFromJourney()}</span>
          </div>
          
          {journey.days && journey.days.length > 0 && (
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{journey.days.length} day{journey.days.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Timeline */}
        {journey.days && journey.days.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-700 mb-2">Journey Timeline</div>
            <div className="flex gap-1">
              {journey.days.slice(0, 7).map((day, dayIndex) => (
                <div
                  key={day.id}
                  className="flex-1 h-2 bg-green-100 rounded-full overflow-hidden"
                  title={`Day ${dayIndex + 1}: ${day.date}`}
                >
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                    style={{
                      width: day.places && day.places.length > 0 ? '100%' : '30%'
                    }}
                  />
                </div>
              ))}
              {journey.days.length > 7 && (
                <div className="text-xs text-gray-500 self-center ml-2">
                  +{journey.days.length - 7}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-lg">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span>By {journey.user.username}</span>
            <span>•</span>
            <span>{formatDate(journey.updatedAt || journey.createdAt)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {journey.days && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                {journey.days.reduce((total, day) => total + (day.places?.length || 0), 0)} places
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
