'use client';

import type { DiscoverJourney } from '@/modules/discover/types/discover.types';
import * as motion from 'framer-motion/client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MODAL_TRANSITION_DURATION_SECONDS, OVERLAY_BASE_CLASS } from '@/modules/common/constants';
import { CalendarIcon, ChevronRightIcon, GlobeIcon, MapPinIcon, UsersIcon, XIcon } from '@/modules/common/icons';

type JourneyDetailsModalProps = {
  disableMotion?: boolean;
  isOpen: boolean;
  journey: DiscoverJourney | null;
  onClose: () => void;
};

export const JourneyDetailsModal = (props: JourneyDetailsModalProps) => {
  const {
    disableMotion = false,
    isOpen,
    journey,
    onClose,
  } = props;
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
        className="relative mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white shadow-2xl"
        data-parity="discover-modal-panel"
        initial={{ opacity: 0, scale: 0.95 }}
        role="dialog"
        transition={{ duration: disableMotion ? 0 : MODAL_TRANSITION_DURATION_SECONDS }}
        onClick={event => event.stopPropagation()}
      >
        <div className="h-auto max-h-[90vh] w-full overflow-hidden rounded-xl bg-white shadow-xl md:h-[710px]" data-parity="discover-modal-card">
          <div className="relative h-48 bg-gradient-to-br from-[#160E53] via-[#001456] to-[#0891b2]">
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
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/50" />

            <button
              aria-label="Close journey details"
              className="absolute top-4 right-4 z-10 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
              onClick={onClose}
              type="button"
            >
              <XIcon aria-hidden="true" className="h-5 w-5" />
            </button>

            <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-white drop-shadow-lg">{journey.title}</h1>
                {journey.description
                  ? <p className="max-w-2xl text-lg text-white/90 drop-shadow-md">{journey.description}</p>
                  : null}
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 bg-white px-6 py-4">
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <UsersIcon aria-hidden="true" className="h-4 w-4" />
                <span className="font-medium">Journey Owner</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon aria-hidden="true" className="h-4 w-4" />
                <span>
                  {new Date(journey.createdAt).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPinIcon aria-hidden="true" className="h-4 w-4" />
                <span>
                  {journey.places.length}
                  {' '}
                  places
                </span>
              </div>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-6">
            {journey.places.length > 0
              ? (
                  <div className="space-y-6">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="h-0.5 w-8 rounded bg-gradient-to-r from-[#160E53] to-[#0891b2]" />
                      <h2 className="text-xl font-bold text-[#160E53]">Journey Itinerary</h2>
                      <div className="h-0.5 flex-1 rounded bg-gradient-to-r from-[#0891b2] to-transparent" />
                    </div>

                    <motion.div
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-[#160E53]/5 p-5 transition-colors hover:border-[#160E53]/30"
                      initial={{ opacity: 0, y: 20 }}
                      transition={{ duration: disableMotion ? 0 : 0.2 }}
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#160E53] to-[#001456] text-sm font-bold text-white shadow-md">
                            1
                          </div>
                          <h3 className="text-lg font-bold text-[#160E53]">Day 1</h3>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-gray-500">
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
                            className="rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-[#160E53]/40 hover:shadow-md"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#160E53] to-[#0891b2] text-lg shadow-sm">

                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{place.name}</h4>
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
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                      <GlobeIcon aria-hidden="true" className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-gray-900">No itinerary available</h3>
                    <p className="text-gray-600">This journey does not have detailed itinerary information yet.</p>
                  </div>
                )}
          </div>

          <div className="flex items-center justify-between rounded-b-xl border-t border-gray-200 bg-gradient-to-r from-gray-50 to-[#160E53]/5 px-6 py-4">
            <button
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 transition-colors hover:border-[#160E53] hover:bg-gray-50"
              onClick={onClose}
              type="button"
            >
              Close
            </button>
            <button
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#160E53] to-[#001456] px-5 py-2.5 font-medium text-white shadow-lg transition-all duration-200 hover:from-[#001456] hover:to-[#160E53] hover:shadow-xl"
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
