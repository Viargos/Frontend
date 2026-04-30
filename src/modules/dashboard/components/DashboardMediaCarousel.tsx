'use client';

import type { DashboardPostMedia } from '@/modules/dashboard/types/dashboard.types';
import * as motion from 'framer-motion/client';
import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@/modules/dashboard/components/dashboard-icons';

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
          className="absolute top-1/2 left-3 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-black/70 active:scale-95"
          type="button"
          onClick={() => setCurrentIndex(previous => (previous - 1 + media.length) % media.length)}
        >
          <ChevronLeftIcon className="h-5 w-5 shrink-0" />
        </button>
        <button
          aria-label="Next media"
          className="absolute top-1/2 right-3 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-black/70 active:scale-95"
          type="button"
          onClick={() => setCurrentIndex(previous => (previous + 1) % media.length)}
        >
          <ChevronRightIcon className="h-5 w-5 shrink-0" />
        </button>

        <div className="absolute top-3 left-3 z-10 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white tabular-nums backdrop-blur-sm">
          {currentIndex + 1}
          <span className="text-white/80"> / </span>
          {media.length}
        </div>

        {media.length <= 5
          ? (
              <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center justify-center gap-1.5">
                {media.map((item, index) => (
                  <button
                    key={item.id}
                    aria-label={`Go to media ${index + 1}`}
                    className={`rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-black/30 ${
                      index === currentIndex ? 'h-2.5 w-2.5 bg-white shadow-md' : 'h-2 w-2 bg-white/60 hover:bg-white/80'
                    }`}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
            )
          : null}
      </div>
    </div>
  );
};
