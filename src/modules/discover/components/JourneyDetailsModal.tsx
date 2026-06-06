'use client';

import type { DiscoverJourney } from '@/modules/discover/types/discover.types';
import * as motion from 'framer-motion/client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MODAL_TRANSITION_DURATION_SECONDS, OVERLAY_BASE_CLASS } from '@/modules/common/constants';
import {
  CalendarIcon,
  ChevronRightIcon,
  GlobeIcon,
  MapPinIcon,
  UsersIcon,
  XIcon,
} from '@/modules/common/icons';

type JourneyDetailsModalProps = {
  disableMotion?: boolean;
  isOpen: boolean;
  journey: DiscoverJourney | null;
  onClose: () => void;
};

export const JourneyDetailsModal = (props: JourneyDetailsModalProps) => {
  const { disableMotion = false, isOpen, journey, onClose } = props;
  const router = useRouter();

  if (!isOpen || !journey) {
    return null;
  }

  return (
    <div
      className={OVERLAY_BASE_CLASS}
      data-parity="discover-modal-overlay"
      onClick={onClose}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClose();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        aria-modal="true"
        aria-label="Journey details"
        className="journey-details-modal relative mx-4 flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl shadow-2xl"
        data-parity="discover-modal-panel"
        initial={{ opacity: 0, scale: 0.95 }}
        role="dialog"
        transition={{ duration: disableMotion ? 0 : MODAL_TRANSITION_DURATION_SECONDS }}
        onClick={event => event.stopPropagation()}
      >
        <div className="flex min-h-0 flex-1 flex-col" data-parity="discover-modal-card">
          <div className="journey-details-hero relative min-h-48 overflow-hidden px-6 py-10">
            {journey.coverImage
              ? (
                  <Image
                    alt={journey.title}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, 710px"
                    src={journey.coverImage}
                  />
                )
              : null}
            <div className="journey-details-hero-overlay absolute inset-0" />

            <button
              aria-label="Close journey details"
              className="journey-details-close-button absolute top-4 right-4 z-10 rounded-full p-2 transition-colors"
              onClick={onClose}
              type="button"
            >
              <XIcon aria-hidden="true" className="h-5 w-5" />
            </button>

            <div className="relative z-10 flex min-h-28 items-center justify-center text-center">
              <div className="max-w-sm">
                <h1 className="text-3xl leading-tight font-bold text-white">{journey.title}</h1>
                {journey.description
                  ? (
                      <p className="mt-3 text-base leading-relaxed text-white/86">
                        {journey.description}
                      </p>
                    )
                  : null}
              </div>
            </div>
          </div>

          <div className="journey-details-meta border-b px-6 py-4">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="journey-details-meta-item flex items-center gap-2">
                <UsersIcon aria-hidden="true" className="h-4 w-4" />
                <span className="truncate font-medium">Owner</span>
              </div>
              <div className="journey-details-meta-item flex items-center gap-2">
                <CalendarIcon aria-hidden="true" className="h-4 w-4" />
                <span className="truncate">
                  {new Date(journey.createdAt).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="journey-details-meta-item flex items-center gap-2">
                <MapPinIcon aria-hidden="true" className="h-4 w-4" />
                <span className="truncate">
                  {journey.places.length}
                  {' '}
                  places
                </span>
              </div>
            </div>
          </div>

          <div className="journey-details-body min-h-0 flex-1 overflow-y-auto p-6">
            {journey.places.length > 0
              ? (
                  <div className="space-y-5">
                    <div className="journey-details-section-heading flex items-center gap-3">
                      <div className="h-px w-8 rounded" />
                      <h2 className="text-lg font-bold">Journey Itinerary</h2>
                      <div className="h-px flex-1 rounded" />
                    </div>

                    <motion.div
                      animate={{ opacity: 1, y: 0 }}
                      className="journey-details-day-card rounded-2xl border p-4"
                      initial={{ opacity: 0, y: 20 }}
                      transition={{ duration: disableMotion ? 0 : 0.2 }}
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="journey-details-day-index flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold">
                            1
                          </div>
                          <h3 className="journey-details-day-title text-lg font-bold">Day 1</h3>
                        </div>
                        <span className="journey-details-date-pill rounded-full px-3 py-1 text-sm font-medium">
                          {new Date(journey.createdAt).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {journey.places.map(place => (
                          <div
                            key={place.id}
                            className="journey-details-place-row rounded-xl border p-4 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="journey-details-place-marker h-9 w-9 flex-shrink-0 rounded-lg" />
                              <div className="flex-1">
                                <h4 className="journey-details-place-title font-semibold">
                                  {place.name}
                                </h4>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                )
              : (
                  <div className="py-8 text-center">
                    <div className="journey-details-empty-icon mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                      <GlobeIcon aria-hidden="true" className="h-8 w-8" />
                    </div>
                    <h3 className="journey-details-place-title mb-2 text-lg font-medium">
                      No itinerary available
                    </h3>
                    <p className="journey-details-muted">
                      This journey does not have detailed itinerary information yet.
                    </p>
                  </div>
                )}
          </div>

          <div className="journey-details-footer flex items-center justify-between border-t px-6 py-4">
            <button
              className="journey-details-secondary-button rounded-lg border px-5 py-2.5 font-medium transition-colors"
              onClick={onClose}
              type="button"
            >
              Close
            </button>
            <button
              className="journey-details-primary-button flex items-center gap-2 rounded-lg px-5 py-2.5 font-medium shadow-lg transition-all duration-200"
              onClick={() => {
                router.push(`/journey/${journey.id}`);
                onClose();
              }}
              type="button"
            >
              View Full Journey
              <ChevronRightIcon aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
