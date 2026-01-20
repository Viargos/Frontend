import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreateJourneyPlace, PlaceType } from '@/types/journey.types';
import { Hotel, Trees, UtensilsCrossed, Car, FileText } from 'lucide-react';
import { PlaceForm } from './PlaceForm';

interface PlaceCardProps {
  place: CreateJourneyPlace;
  index: number;
  dayKey: string;
  isExpanded: boolean;
  onToggleExpansion: () => void;
  onRemove: () => void;
  onUpdateField: (field: keyof CreateJourneyPlace, value: string | number) => void;
  onAddPhoto: (photoKey: string) => void;
  onRemovePhoto: (photoIndex: number) => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  index,
  dayKey,
  isExpanded,
  onToggleExpansion,
  onRemove,
  onUpdateField,
  onAddPhoto,
  onRemovePhoto
}) => {
  const getPlaceIcon = () => {
    switch (place.type) {
      case PlaceType.STAY:
        return <Hotel className="w-6 h-6" strokeWidth={2} color="#001A6E" />;
      case PlaceType.ACTIVITY:
        return <Trees className="w-6 h-6" strokeWidth={2} color="#001A6E" />;
      case PlaceType.FOOD:
        return <UtensilsCrossed className="w-6 h-6" strokeWidth={2} color="#001A6E" />;
      case PlaceType.TRANSPORT:
        return <Car className="w-6 h-6" strokeWidth={2} color="#001A6E" />;
      case PlaceType.NOTE:
        return <FileText className="w-6 h-6" strokeWidth={2} color="#001A6E" />;
      default:
        return <Hotel className="w-6 h-6" strokeWidth={2} color="#001A6E" />;
    }
  };

  return (
    <motion.div
      className="w-full rounded-lg border border-gray-200 bg-white overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      {/* Accordion Header - Always Visible */}
      <motion.div
        className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggleExpansion}
        whileHover={{ backgroundColor: "rgba(249, 250, 251, 1)" }}
        whileTap={{ scale: 0.998 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="flex min-w-10 min-h-10 w-10 h-10 flex-col justify-center items-center gap-0 rounded-full border border-gray-200 bg-gray-100 p-0 m-0"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="w-full h-full flex items-center justify-center p-0 m-0 opacity-70" style={{ maxWidth: '20px', maxHeight: '20px' }}>
              {getPlaceIcon()}
            </div>
          </motion.div>
          <div className="flex flex-col items-start gap-1">
            <div className="text-black font-manrope text-sm font-semibold leading-5">
              {place.name}
            </div>
            <AnimatePresence>
              {!isExpanded && place.startTime && place.endTime && (
                <motion.div
                  className="text-gray-500 font-manrope text-xs font-normal leading-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {place.startTime} - {place.endTime}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Remove Button */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1 hover:bg-red-50 rounded transition-colors"
            title="Remove place"
            whileHover={{ scale: 1.1, backgroundColor: "rgba(254, 242, 242, 1)" }}
            whileTap={{ scale: 0.95 }}
          >
<TrashIcon className="w-4 h-4 text-red-500" />
          </motion.button>
          {/* Expand/Collapse Icon */}
<motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <ChevronDownIcon className="w-4 h-4 text-gray-500" />
          </motion.div>
        </div>
      </motion.div>

      {/* Accordion Content - Form Fields */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="border-t border-gray-200 p-4"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <motion.div
              className="w-full space-y-3"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              exit={{ y: -20 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <PlaceForm
                place={place}
                dayKey={dayKey}
                index={index}
                onUpdateField={onUpdateField}
                onAddPhoto={onAddPhoto}
                onRemovePhoto={onRemovePhoto}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
