"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PostMedia } from "@/types/post.types";

interface MediaCarouselProps {
  media: PostMedia[];
  className?: string;
}

export default function MediaCarousel({
  media,
  className = "",
}: MediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Handle touch/swipe gestures
  const handleDragEnd = (event: any, info: any) => {
    const threshold = 50; // Minimum drag distance to trigger slide change

    if (Math.abs(info.offset.x) > threshold) {
      if (info.offset.x > 0) {
        goToPrevious();
      } else {
        goToNext();
      }
    }
  };

  if (!media || media.length === 0) {
    return null;
  }

  if (media.length === 1) {
    // Single media item - no carousel needed
    const item = media[0];
    return (
      <div className={`aspect-square ${className}`}>
        {item.type === "image" ? (
          <img
            src={item.url}
            alt="Post media"
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            src={item.url}
            poster={item.thumbnailUrl}
            controls
            className="w-full h-full object-cover"
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative aspect-square overflow-hidden ${className}`}
      ref={containerRef}
    >
      {/* Main carousel container */}
      <div className="relative w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(event, info) => {
              setIsDragging(false);
              handleDragEnd(event, info);
            }}
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
          >
            {media[currentIndex].type === "image" ? (
              <img
                src={media[currentIndex].url}
                alt={`Post media ${currentIndex + 1}`}
                className="w-full h-full object-cover select-none"
                draggable={false}
              />
            ) : (
              <video
                src={media[currentIndex].url}
                poster={media[currentIndex].thumbnailUrl}
                controls
                className="w-full h-full object-cover"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        {media.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200 z-10"
              aria-label="Previous media"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200 z-10"
              aria-label="Next media"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Media counter */}
        {media.length > 1 && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full z-10">
            {currentIndex + 1} / {media.length}
          </div>
        )}

        {/* Dot indicators */}
        {media.length > 1 && media.length <= 5 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1 z-10">
            {media.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? "bg-white"
                    : "bg-white bg-opacity-50 hover:bg-opacity-70"
                }`}
                aria-label={`Go to media ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Swipe instruction (shows briefly on first load) */}
      {media.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded opacity-0 animate-pulse pointer-events-none">
          Swipe or use arrows
        </div>
      )}
    </div>
  );
}
