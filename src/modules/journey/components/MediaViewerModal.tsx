'use client';

import type { JourneyMedia } from '@/modules/journey/types/journey-detail.types';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

type MediaViewerModalProps = {
  activeIndex: number;
  isOpen: boolean;
  media: JourneyMedia[];
  onClose: () => void;
};

export const MediaViewerModal = (props: MediaViewerModalProps) => {
  const {
    activeIndex,
    isOpen,
    media,
    onClose,
  } = props;
  const [currentIndex, setCurrentIndex] = useState(activeIndex);

  const activeMedia = useMemo(
    () => media[currentIndex] ?? media[0],
    [currentIndex, media],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }

      if (event.key === 'ArrowLeft') {
        setCurrentIndex(prev => (prev - 1 + media.length) % media.length);
      }

      if (event.key === 'ArrowRight') {
        setCurrentIndex(prev => (prev + 1) % media.length);
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [isOpen, media.length, onClose]);

  if (!isOpen || media.length === 0 || !activeMedia) {
    return null;
  }

  return (
    <div className="journey-media-portal-root fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} role="presentation" />

      <div className="relative z-10 flex h-full items-center justify-center px-4">
        <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div aria-label="Journey media viewer" aria-modal="true" className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3" role="dialog">
            <div className="flex items-center gap-3">
              <h3 className="max-w-[200px] truncate text-sm font-semibold text-gray-900 sm:max-w-none sm:text-base">Images</h3>
              {media.length > 1
                ? (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 sm:text-sm">
                      {currentIndex + 1}
                      {' '}
                      /
                      {' '}
                      {media.length}
                    </span>
                  )
                : null}
            </div>
            <div className="flex items-center gap-2">
              <button aria-label="Close media viewer" className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" onClick={onClose} type="button">
                <span aria-hidden="true">✕</span>
              </button>
            </div>
          </div>

          <div className="relative bg-gray-900">
            <div className="relative flex h-[50vh] items-center justify-center sm:h-[55vh] md:h-[60vh]">
              {activeMedia.type === 'video'
                ? (
                    <video className="h-full w-full" controls src={activeMedia.url}>
                      <track kind="captions" />
                    </video>
                  )
                : <Image alt="Selected media" className="max-h-full max-w-full object-contain" fill src={activeMedia.url} unoptimized />}

              {media.length > 1
                ? (
                    <>
                      <div className="absolute top-1/2 left-2 -translate-y-1/2 sm:left-4">
                        <button
                          aria-label="Previous media"
                          className="rounded-full bg-white/90 p-2 text-gray-800 shadow-lg transition-all hover:scale-105 hover:bg-white sm:p-3"
                          onClick={() => setCurrentIndex(prev => (prev - 1 + media.length) % media.length)}
                          type="button"
                        >
                          <span aria-hidden="true">‹</span>
                        </button>
                      </div>

                      <div className="absolute top-1/2 right-2 -translate-y-1/2 sm:right-4">
                        <button
                          aria-label="Next media"
                          className="rounded-full bg-white/90 p-2 text-gray-800 shadow-lg transition-all hover:scale-105 hover:bg-white sm:p-3"
                          onClick={() => setCurrentIndex(prev => (prev + 1) % media.length)}
                          type="button"
                        >
                          <span aria-hidden="true">›</span>
                        </button>
                      </div>
                    </>
                  )
                : null}
            </div>
          </div>

          {media.length > 1
            ? (
                <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                  <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
                    {media.map((item, index) => (
                      <button
                        key={item.id}
                        className={`relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg transition-all sm:h-16 sm:w-16 ${
                          index === currentIndex ? 'ring-2 ring-[#160E53] ring-offset-2' : 'opacity-60 hover:opacity-100'
                        }`}
                        onClick={() => setCurrentIndex(index)}
                        type="button"
                      >
                        {item.type === 'video'
                          ? <div className="flex h-full w-full items-center justify-center bg-gray-200 text-xs text-gray-600">Video</div>
                          : <Image alt={`Thumbnail ${index + 1}`} className="object-cover" fill sizes="56px" src={item.url} />}
                      </button>
                    ))}
                  </div>
                </div>
              )
            : null}
        </div>
      </div>
    </div>
  );
};
