'use client';

import type { DashboardPostMedia } from '@/modules/dashboard/types/dashboard.types';
import * as motion from 'framer-motion/client';
import Image from 'next/image';
import { useState } from 'react';

type DashboardMediaCarouselProps = {
  media: DashboardPostMedia[];
};

export const DashboardMediaCarousel = (props: DashboardMediaCarouselProps) => {
  const { media } = props;
  const [currentIndex, setCurrentIndex] = useState(0);

  if (media.length === 0) {
    return null;
  }

  if (media.length === 1) {
    const item = media[0];
    if (!item) {
      return null;
    }

    return (
      <div className="relative aspect-square">
        {item.kind === 'video'
          ? (
              <video className="h-full w-full object-cover" controls poster={item.thumbnailUrl} src={item.url}>
                <track default kind="captions" label="English captions" srcLang="en" />
              </video>
            )
          : <Image alt="Post media" className="object-cover" fill sizes="100vw" src={item.thumbnailUrl ?? item.url} />}
      </div>
    );
  }

  const currentItem = media[currentIndex];
  if (!currentItem) {
    return null;
  }

  return (
    <div className="relative aspect-square overflow-hidden">
      <div className="relative h-full w-full">
        <motion.div
          key={currentIndex}
          animate={{ opacity: 1 }}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {currentItem.kind === 'video'
            ? (
                <video className="h-full w-full object-cover" controls poster={currentItem.thumbnailUrl} src={currentItem.url}>
                  <track default kind="captions" label="English captions" srcLang="en" />
                </video>
              )
            : <Image alt={`Post media ${currentIndex + 1}`} className="object-cover select-none" draggable={false} fill sizes="100vw" src={currentItem.thumbnailUrl ?? currentItem.url} />}
        </motion.div>

        <button
          aria-label="Previous media"
          className="absolute top-1/2 left-2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-all duration-200 hover:bg-black/70"
          type="button"
          onClick={() => setCurrentIndex(previous => (previous - 1 + media.length) % media.length)}
        >
          <span className="block h-4 w-4">‹</span>
        </button>
        <button
          aria-label="Next media"
          className="absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-all duration-200 hover:bg-black/70"
          type="button"
          onClick={() => setCurrentIndex(previous => (previous + 1) % media.length)}
        >
          <span className="block h-4 w-4">›</span>
        </button>

        <div className="absolute top-2 right-2 z-10 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
          {currentIndex + 1}
          {' '}
          /
          {' '}
          {media.length}
        </div>

        {media.length <= 5
          ? (
              <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 space-x-1">
                {media.map((item, index) => (
                  <button
                    key={item.id}
                    aria-label={`Go to media ${index + 1}`}
                    className={`h-2 w-2 rounded-full transition-all duration-200 ${index === currentIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/70'}`}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
            )
          : null}
      </div>

      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 animate-pulse rounded bg-black px-2 py-1 text-xs text-white opacity-0">
        Swipe or use arrows
      </div>
    </div>
  );
};
