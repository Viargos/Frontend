'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageIcon, XIcon } from '@/components/icons';

interface PhotoGalleryProps {
  photos: string[];
  onRemovePhoto?: (index: number) => void;
  className?: string;
  showRemoveButton?: boolean;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  onRemovePhoto,
  className = '',
  showRemoveButton = false,
}) => {
  if (!photos || photos.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        <p className="text-sm text-gray-500">No images available</p>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-3">
        <h4 className="text-sm font-medium text-gray-900">
          Photos ({photos.length})
        </h4>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
        <AnimatePresence>
          {photos.map((photo, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden"
            >
              {/* Actual image using final public URL, with graceful fallback */}
              {photo && typeof photo === 'string' ? (
                <img
                  src={photo}
                  alt={`Journey photo ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Hide broken image; gradient background from parent will show through
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}

              {/* Remove button */}
              {showRemoveButton && onRemovePhoto && (
                <motion.button
                  onClick={() => onRemovePhoto(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <XIcon className="w-3 h-3" />
                </motion.button>
              )}

              {/* Photo indicator */}
              <div className="absolute bottom-1 left-1 text-xs text-white bg-black/50 px-1 py-0.5 rounded text-[10px]">
                {index + 1}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PhotoGallery;
