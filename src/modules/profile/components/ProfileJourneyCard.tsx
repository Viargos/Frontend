'use client';

import type { ProfileJourney } from '@/modules/profile/types/profile.types';
import * as motion from 'framer-motion/client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ChevronRightIcon, FileTextIcon, JourneyIcon, TrashIcon } from '@/modules/common/icons';

type ProfileJourneyCardProps = {
  index: number;
  journey: ProfileJourney;
};

export const ProfileJourneyCard = (props: ProfileJourneyCardProps) => {
  const { index, journey } = props;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    router.push(`/journey/${journey.id}`);
  };

  const getJourneyImage = (): string | null => {
    if (!journey.coverImage) {
      return null;
    }

    if (journey.coverImage.startsWith('http')) {
      return journey.coverImage;
    }

    if (journey.coverImage.startsWith('/')) {
      return journey.coverImage;
    }

    return `https://viargos-sandbox.s3.us-east-2.amazonaws.com/${journey.coverImage}`;
  };

  const status = journey.daysCount > 0 ? 'completed' : 'ongoing';
  const journeyImage = getJourneyImage();
  const highlight = journey.previewPlaces[0] ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        damping: 25,
        delay: index * 0.1,
        duration: 0.5,
        stiffness: 200,
        type: 'spring',
      }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      onClick={handleClick}
      className="group h-full cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:border-gray-200 hover:shadow-lg"
    >
      <div className="flex h-full flex-col p-4">
        <div className="relative mb-4 h-[200px] w-full flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#160E53]/10 to-[#160E53]/5">
          {journeyImage && !imageError
            ? (
                <Image
                  alt={journey.title || 'Journey'}
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  fill
                  onError={() => setImageError(true)}
                  sizes="(max-width: 640px) 100vw, 400px"
                  src={journeyImage}
                  unoptimized
                />
              )
            : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#160E53]/10 via-[#160E53]/5 to-[#160E53]/10">
                  <div className="text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#160E53]">
                      <JourneyIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-xs font-medium text-gray-500">Journey</div>
                  </div>
                </div>
              )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 opacity-100 transition-opacity duration-200 sm:top-3 sm:right-3 sm:gap-2 sm:opacity-0 sm:group-hover:opacity-100">
            <button
              aria-label="Edit journey"
              onClick={(event) => {
                event.stopPropagation();
                router.push(`/edit-journey/${journey.id}`);
              }}
              className="rounded-full bg-white/90 p-1.5 text-[#160E53] shadow-md backdrop-blur-sm hover:bg-white sm:p-2"
              title="Edit journey"
              type="button"
            >
              <FileTextIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <button
              aria-label="Delete journey"
              onClick={(event) => {
                event.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              className="rounded-full bg-white/90 p-1.5 text-red-500 shadow-md backdrop-blur-sm hover:bg-white hover:text-red-600 sm:p-2"
              title="Delete journey"
              type="button"
            >
              <TrashIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between">
          <div className="space-y-3">
            <div className="text-sm font-semibold text-blue-600">
              {new Date(journey.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </div>

            <div className="flex items-start justify-between">
              <h3 className="line-clamp-2 flex-1 pr-4 text-lg font-bold text-gray-900 transition-colors duration-200 group-hover:text-[#160E53]">
                {journey.title || 'Journey'}
              </h3>
              <div className="flex-shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:text-[#160E53]" />
              </div>
            </div>

            {journey.description
              ? (
                  <div className="flex items-center gap-2">
                    <span className="line-clamp-2 text-sm text-gray-600">
                      {journey.description}
                    </span>
                  </div>
                )
              : null}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <div
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
                status === 'completed'
                  ? 'border-[#160E53]/20 bg-[#160E53]/10 text-[#160E53]'
                  : 'border-yellow-200 bg-yellow-100 text-yellow-700'
              }`}
            >
              {status === 'completed' ? 'Completed' : 'Ongoing'}
            </div>

            {highlight
              ? (
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-[#160E53]/20 bg-[#160E53]/10 px-3 py-1 text-xs font-medium text-[#160E53]">
                    <JourneyIcon className="h-3 w-3" />
                    <span className="max-w-[120px] truncate" title={`Highlight: ${highlight}`}>
                      Highlight:
                      {' '}
                      {highlight.length > 15 ? `${highlight.substring(0, 15)}...` : highlight}
                    </span>
                  </div>
                )
              : null}
          </div>
        </div>
      </div>

      {showDeleteConfirm
        ? (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
              onClick={(event) => {
                event.stopPropagation();
                setShowDeleteConfirm(false);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  event.stopPropagation();
                  setShowDeleteConfirm(false);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mx-4 max-w-md rounded-lg bg-white p-6 shadow-xl"
                role="dialog"
                aria-modal="true"
                aria-labelledby={`delete-journey-title-${journey.id}`}
                onClick={event => event.stopPropagation()}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <TrashIcon className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900" id={`delete-journey-title-${journey.id}`}>Delete Journey</h3>
                    <p className="text-sm text-gray-500">This action cannot be undone</p>
                  </div>
                </div>

                <p className="mb-6 text-gray-600">
                  Are you sure you want to delete
                  {' '}
                  <span className="font-medium">
                    &quot;
                    {journey.title}
                    &quot;
                  </span>
                  ?
                  This will permanently remove the journey and all its data.
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
                    disabled={isDeleting}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setIsDeleting(true);
                      setTimeout(() => {
                        setIsDeleting(false);
                        setShowDeleteConfirm(false);
                      }, 300);
                    }}
                    disabled={isDeleting}
                    className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    type="button"
                  >
                    {isDeleting
                      ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            Deleting...
                          </>
                        )
                      : (
                          <>
                            <TrashIcon className="h-4 w-4" />
                            Delete Journey
                          </>
                        )}
                  </button>
                </div>
              </motion.div>
            </div>
          )
        : null}
    </motion.div>
  );
};
