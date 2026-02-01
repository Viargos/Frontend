'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  title?: string;
  initialIndex?: number;
}

export default function ImageViewerModal({
  isOpen,
  onClose,
  images,
  title = 'Images',
  initialIndex = 0,
}: ImageViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  // Reset index when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsZoomed(false);
    }
  }, [isOpen, initialIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsZoomed(false);
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsZoomed(false);
  }, [images.length]);

  if (!isOpen || images.length === 0) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Modal Container - Compact size */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-3xl mx-4 bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
              <div className="flex items-center gap-3">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-none">
                  {title}
                </h3>
                {images.length > 1 && (
                  <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {currentIndex + 1} / {images.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                  title={isZoomed ? 'Zoom out' : 'Zoom in'}
                >
                  {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Image Area */}
            <div className="relative bg-gray-900">
              <div 
                className={`relative flex items-center justify-center transition-all duration-300 ${
                  isZoomed ? 'h-[70vh] overflow-auto' : 'h-[50vh] sm:h-[55vh] md:h-[60vh]'
                }`}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    src={images[currentIndex]}
                    alt={`${title} - Image ${currentIndex + 1}`}
                    className={`transition-all duration-300 ${
                      isZoomed 
                        ? 'max-w-none w-auto h-auto min-h-full' 
                        : 'max-w-full max-h-full object-contain'
                    }`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-image.png';
                    }}
                  />
                </AnimatePresence>

                {/* Navigation Arrows */}
                {images.length > 1 && !isZoomed && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        goToPrevious();
                      }}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-lg transition-all hover:scale-105"
                    >
                      <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        goToNext();
                      }}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-lg transition-all hover:scale-105"
                    >
                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Thumbnail Strip - Only show if multiple images */}
            {images.length > 1 && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentIndex(index);
                        setIsZoomed(false);
                      }}
                      className={`relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden transition-all ${
                        index === currentIndex
                          ? 'ring-2 ring-[#160E53] ring-offset-2'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
