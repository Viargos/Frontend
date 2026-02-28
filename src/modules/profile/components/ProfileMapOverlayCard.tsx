'use client';

import type { ProfileJourney } from '@/modules/profile/types/profile.types';
import * as motion from 'framer-motion/client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CalendarIcon, JourneyIcon, UsersIcon, XIcon } from '@/modules/common/icons';

type ProfileMapOverlayCardProps = {
  journey: ProfileJourney;
  ownerName: string;
  onClose: () => void;
};

export const ProfileMapOverlayCard = (props: ProfileMapOverlayCardProps) => {
  const { journey, ownerName, onClose } = props;
  const router = useRouter();

  const handleViewJourney = () => {
    router.push(`/journey/${journey.id}`);
    onClose();
  };

  const getCoverImageUrl = (coverImage?: string): string | null => {
    if (!coverImage) {
      return null;
    }

    if (coverImage.startsWith('http')) {
      return coverImage;
    }

    return `https://viargos-sandbox.s3.us-east-2.amazonaws.com/${coverImage}`;
  };

  return (
    <motion.div
      className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative h-48 w-full">
        {getCoverImageUrl(journey.coverImage)
          ? (
              <Image
                alt={journey.title}
                className="object-cover"
                fill
                sizes="100vw"
                src={getCoverImageUrl(journey.coverImage)!}
              />
            )
          : (
              <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-[#3B82F6] to-[#160E53]">
                <JourneyIcon className="h-16 w-16 text-white opacity-50" />
              </div>
            )}

        <button
          aria-label="Close journey preview"
          onClick={onClose}
          className="bg-opacity-50 hover:bg-opacity-70 absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-colors"
          type="button"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <h3 className="mb-2 text-xl font-bold text-gray-900">{journey.title}</h3>
          {journey.description
            ? (
                <p className="line-clamp-3 text-sm text-gray-600">
                  {journey.description}
                </p>
              )
            : null}
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.max(journey.daysCount, 1)}
              {' '}
              day
              {journey.daysCount === 1 ? '' : 's'}
            </div>
            <div className="text-xs tracking-wide text-gray-500 uppercase">Duration</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{journey.previewPlaces.length}</div>
            <div className="text-xs tracking-wide text-gray-500 uppercase">Places</div>
          </div>
        </div>

        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
              <UsersIcon className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{ownerName}</p>
              <p className="text-xs text-gray-500">Journey Creator</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
              <CalendarIcon className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {new Date(journey.createdAt).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <p className="text-xs text-gray-500">Created</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <motion.button
            className="flex-1 rounded-lg bg-[#160E53] px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
            onClick={handleViewJourney}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
          >
            View Journey
          </motion.button>
          <motion.button
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
          >
            Close
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
