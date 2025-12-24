'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
                  <svg 
                    className="w-8 h-8 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                    />
                  </svg>
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
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
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
