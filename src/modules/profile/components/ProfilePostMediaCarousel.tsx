'use client';

import * as motion from 'framer-motion/client';
import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@/modules/common/icons';

type ProfilePostMediaCarouselProps = {
  mediaUrls: string[];
  /** When true, carousel fills parent (e.g. h-40); otherwise uses aspect-square */
  fillContainer?: boolean;
};

export function ProfilePostMediaCarousel(props: ProfilePostMediaCarouselProps) {
  const { mediaUrls, fillContainer = false } = props;
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerClass = fillContainer ? 'relative h-full w-full' : 'relative aspect-square';

  if (mediaUrls.length === 0) {
    return null;
  }

  if (mediaUrls.length === 1) {
    return (
      <div className={containerClass}>
        <Image
          alt="Post media"
          className="object-cover"
          quality={70}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          src={mediaUrls[0]!}
        />
      </div>
    );
  }

  const currentUrl = mediaUrls[currentIndex];
  if (!currentUrl) {
    return null;
  }

  return (
    <div className={`${containerClass} overflow-hidden`}>
      <div className="relative h-full w-full">
        <motion.div
          key={currentIndex}
          animate={{ opacity: 1 }}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Image
            alt={`Post image ${currentIndex + 1} of ${mediaUrls.length}`}
            className="object-cover select-none"
            draggable={false}
            fill
            quality={70}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            src={currentUrl}
          />
        </motion.div>

        <button
          aria-label="Previous image"
          className="absolute top-1/2 left-2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white shadow-lg transition-all hover:scale-110 hover:bg-black/65 active:scale-95 sm:left-3 sm:h-10 sm:w-10"
          type="button"
          onClick={() => setCurrentIndex(prev => (prev - 1 + mediaUrls.length) % mediaUrls.length)}
        >
          <ChevronLeftIcon size={22} className="shrink-0" />
        </button>
        <button
          aria-label="Next image"
          className="absolute top-1/2 right-2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white shadow-lg transition-all hover:scale-110 hover:bg-black/65 active:scale-95 sm:right-3 sm:h-10 sm:w-10"
          type="button"
          onClick={() => setCurrentIndex(prev => (prev + 1) % mediaUrls.length)}
        >
          <ChevronRightIcon size={22} className="shrink-0" />
        </button>

        <div className="absolute top-2 left-2 z-10 rounded-full bg-black/55 px-2 py-1 text-[10px] font-medium text-white tabular-nums backdrop-blur-sm sm:top-2.5 sm:left-2.5 sm:px-2.5 sm:py-1 sm:text-xs">
          {currentIndex + 1}
          <span className="text-white/80"> / </span>
          {mediaUrls.length}
        </div>

        <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center justify-center gap-1.5 sm:bottom-2.5 sm:gap-2">
          {mediaUrls.map((mediaUrl, index) => (
            <button
              key={mediaUrl}
              aria-label={`Go to image ${index + 1}`}
              className={`rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-black/30 ${
                index === currentIndex
                  ? 'h-2 w-2 bg-white shadow-md sm:h-2.5 sm:w-2.5'
                  : 'h-1.5 w-1.5 bg-white/60 hover:bg-white/80 sm:h-2 sm:w-2'
              }`}
              type="button"
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
