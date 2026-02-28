'use client';

import type { MouseEvent } from 'react';
import type { JourneyListItem } from '@/modules/journey/types/journey.types';
import * as motion from 'framer-motion/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getAppUrl } from '@/lib/app-config';

type JourneyCardProps = {
  index: number;
  journey: JourneyListItem;
  onDelete?: (journeyId: string) => void;
  onDuplicate?: (journeyId: string) => void;
  onEdit?: (journey: JourneyListItem) => void;
};

function formatDate(dateString?: string): string {
  if (!dateString) {
    return 'No date';
  }

  return new Date(dateString).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getLocationFromJourney(journey: JourneyListItem): string {
  const firstDay = journey.days?.[0];
  const firstPlace = firstDay?.places?.[0];

  if (firstPlace?.address) {
    return firstPlace.address;
  }

  if (firstPlace?.name) {
    return firstPlace.name;
  }

  if (journey.description && journey.description.includes('to ')) {
    const location = journey.description.split('to ')[1]?.split(' on')[0];
    if (location) {
      return location;
    }
  }

  return 'Unknown location';
}

export const JourneyCard = (props: JourneyCardProps) => {
  const { index, journey, onDelete, onDuplicate, onEdit } = props;
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  const placesCount = journey.days?.reduce((total, day) => total + (day.places?.length ?? 0), 0) ?? 0;

  const handleCardClick = () => {
    router.push(`/journey/${journey.id}`);
  };

  const handleEdit = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (onEdit) {
      onEdit(journey);
    } else {
      router.push(`/edit-journey/${journey.id}`);
    }
    setShowDropdown(false);
  };

  const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDelete?.(journey.id);
    setShowDropdown(false);
  };

  const handleDuplicate = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDuplicate?.(journey.id);
    setShowDropdown(false);
  };

  const handleShare = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    try {
      const baseUrl = getAppUrl().replace(/\/$/, '');
      const url = `${baseUrl}/journey/${journey.id}`;
      await navigator.clipboard.writeText(url);
    } catch {
      // intentionally ignored to preserve old behavior fallback tolerance
    }
    setShowDropdown(false);
  };

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
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group cursor-pointer rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md"
      onClick={handleCardClick}
    >
      <div className="p-6 pb-4">
        <div className="mb-3 flex items-start justify-between">
          <h3 className="line-clamp-1 text-xl font-semibold text-gray-900 transition-colors group-hover:text-green-600">
            {journey.title}
          </h3>

          <div className="flex items-center gap-1 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100">
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEdit}
              className="rounded-full border border-gray-200 bg-white p-1.5 text-gray-600 transition-colors hover:border-[#160E53]/30 hover:text-[#160E53]"
              title="Edit journey"
              type="button"
            >
              <span className="text-xs leading-none sm:text-sm" aria-hidden="true"></span>
            </motion.button>

            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(event) => {
                  event.stopPropagation();
                  setShowDropdown(!showDropdown);
                }}
                className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                type="button"
              >
                <span className="text-base leading-none" aria-hidden="true">⋯</span>
              </motion.button>

              {showDropdown
                ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg"
                      onMouseLeave={() => setShowDropdown(false)}
                    >
                      <div className="py-1">
                        <button
                          onClick={handleEdit}
                          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                          type="button"
                        >
                          <span className="mr-3 text-xs leading-none" aria-hidden="true"></span>
                          Edit Journey
                        </button>
                        <button
                          onClick={handleDuplicate}
                          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                          type="button"
                        >
                          <span className="mr-3 text-xs leading-none" aria-hidden="true">⧉</span>
                          Duplicate
                        </button>
                        <button
                          onClick={handleShare}
                          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                          type="button"
                        >
                          <span className="mr-3 text-xs leading-none" aria-hidden="true"></span>
                          Share Journey
                        </button>
                        <div className="my-1 border-t border-gray-100" />
                        <button
                          onClick={handleDelete}
                          className="flex w-full items-center px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                          type="button"
                        >
                          <span className="mr-3 text-xs leading-none" aria-hidden="true"></span>
                          Delete Journey
                        </button>
                      </div>
                    </motion.div>
                  )
                : null}
            </div>
          </div>
        </div>

        {journey.description
          ? (
              <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                {journey.description}
              </p>
            )
          : null}

        <div className="mb-4 flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <span className="text-xs leading-none" aria-hidden="true"></span>
            <span>{getLocationFromJourney(journey)}</span>
          </div>

          {journey.days && journey.days.length > 0
            ? (
                <div className="flex items-center gap-1">
                  <span className="text-xs leading-none" aria-hidden="true"></span>
                  <span>
                    {journey.days.length}
                    {' '}
                    day
                    {journey.days.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )
            : null}
        </div>

        {journey.days && journey.days.length > 0
          ? (
              <div className="space-y-2">
                <div className="mb-2 text-xs font-medium text-gray-700">Journey Timeline</div>
                <div className="flex gap-1">
                  {journey.days.slice(0, 7).map((day, dayIndex) => (
                    <div
                      key={day.id ?? `${journey.id}-day-${dayIndex}`}
                      className="h-2 flex-1 overflow-hidden rounded-full bg-green-100"
                      title={`Day ${dayIndex + 1}: ${day.date ?? ''}`}
                    >
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600"
                        style={{ width: day.places && day.places.length > 0 ? '100%' : '30%' }}
                      />
                    </div>
                  ))}
                  {journey.days.length > 7
                    ? (
                        <div className="ml-2 self-center text-xs text-gray-500">
                          +
                          {journey.days.length - 7}
                        </div>
                      )
                    : null}
                </div>
              </div>
            )
          : null}
      </div>

      <div className="rounded-b-lg border-t border-gray-100 bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span>
              By
              {journey.user?.username ?? 'Unknown user'}
            </span>
            <span>•</span>
            <span>{formatDate(journey.updatedAt ?? journey.createdAt)}</span>
          </div>

          <div className="flex items-center gap-2">
            {journey.days
              ? (
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                    {placesCount}
                    {' '}
                    places
                  </span>
                )
              : null}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
