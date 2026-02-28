'use client';

import type { JourneyDetail, JourneyMedia, JourneyPlace } from '@/modules/journey/types/journey-detail.types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { JourneyHeader } from '@/modules/journey/components/JourneyHeader';
import { JourneyMapPanel } from '@/modules/journey/components/JourneyMapPanel';
import { JourneyPostsSection } from '@/modules/journey/components/JourneyPostsSection';
import { JourneyTabs } from '@/modules/journey/components/JourneyTabs';
import { MediaViewerModal } from '@/modules/journey/components/MediaViewerModal';
import { PlaceGroup } from '@/modules/journey/components/PlaceGroup';
import { PlaceType } from '@/modules/journey/enums/place-type.enum';

type JourneyDetailViewProps = {
  journey: JourneyDetail;
};

type GroupedPlaces = {
  activities: JourneyPlace[];
  food: JourneyPlace[];
  notes: JourneyPlace[];
  stay: JourneyPlace[];
  transport: JourneyPlace[];
};

function groupPlacesByType(places: JourneyPlace[]): GroupedPlaces {
  return places.reduce<GroupedPlaces>((accumulator, place) => {
    if (place.type === PlaceType.STAY) {
      accumulator.stay.push(place);
      return accumulator;
    }

    if (place.type === PlaceType.ACTIVITY) {
      accumulator.activities.push(place);
      return accumulator;
    }

    if (place.type === PlaceType.FOOD) {
      accumulator.food.push(place);
      return accumulator;
    }

    if (place.type === PlaceType.TRANSPORT) {
      accumulator.transport.push(place);
      return accumulator;
    }

    accumulator.notes.push(place);
    return accumulator;
  }, {
    activities: [],
    food: [],
    notes: [],
    stay: [],
    transport: [],
  });
}

function formatDayDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
    year: 'numeric',
  });
}

export const JourneyDetailView = (props: JourneyDetailViewProps) => {
  const { journey } = props;
  const router = useRouter();
  const [activeDayNumber, setActiveDayNumber] = useState<number>(journey.days[0]?.dayNumber ?? 0);
  const [selectedMedia, setSelectedMedia] = useState<JourneyMedia[]>([]);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number>(0);

  const currentDay = useMemo(
    () => journey.days.find(day => day.dayNumber === activeDayNumber) ?? journey.days[0],
    [activeDayNumber, journey.days],
  );

  const groupedPlaces = useMemo(
    () => groupPlacesByType(currentDay?.places ?? []),
    [currentDay?.places],
  );

  const allPlaces = useMemo(
    () => journey.days.flatMap(day => day.places),
    [journey.days],
  );

  const isMediaViewerOpen = selectedMedia.length > 0;

  return (
    <div className="max-w-none flex-1 bg-gray-50 p-4 sm:p-6">
      <JourneyHeader
        journey={journey}
        onBack={() => {
          router.back();
        }}
      />

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-lg bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:mb-6 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">Journey Details</h2>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  className="rounded-md border border-[#160E53] px-3 py-1.5 text-sm font-medium text-[#160E53] transition-colors hover:bg-[#160E53] hover:text-white"
                  href={`/edit-journey/${journey.id}`}
                >
                  Edit Journey
                </Link>
              </div>
            </div>

            <JourneyTabs activeDayNumber={activeDayNumber} days={journey.days} onSelectDay={setActiveDayNumber} />

            {currentDay
              ? (
                  <div>
                    <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                      <h2 className="text-base font-semibold text-gray-900 sm:text-lg md:text-xl">
                        Day
                        {' '}
                        {currentDay.dayNumber + 1}
                      </h2>
                      <span className="hidden text-gray-400 sm:inline">-</span>
                      <p className="text-sm text-gray-600 sm:text-base sm:font-semibold sm:text-gray-900">{formatDayDate(currentDay.date)}</p>
                    </div>

                    {currentDay.places.length > 0
                      ? (
                          <div className="relative">
                            <div className="absolute top-0 bottom-0 left-5 hidden w-0.5 bg-gray-200 sm:block md:left-6" />

                            <div className="space-y-6">
                              <PlaceGroup
                                places={groupedPlaces.stay}
                                title="Place to Stay"
                                onOpenMedia={(media, index) => {
                                  setSelectedMedia(media);
                                  setSelectedMediaIndex(index);
                                }}
                              />
                              <PlaceGroup
                                places={groupedPlaces.activities}
                                title="Places to Go"
                                onOpenMedia={(media, index) => {
                                  setSelectedMedia(media);
                                  setSelectedMediaIndex(index);
                                }}
                              />
                              <PlaceGroup
                                places={groupedPlaces.food}
                                title="Food"
                                onOpenMedia={(media, index) => {
                                  setSelectedMedia(media);
                                  setSelectedMediaIndex(index);
                                }}
                              />
                              <PlaceGroup
                                places={groupedPlaces.transport}
                                title="Transport"
                                onOpenMedia={(media, index) => {
                                  setSelectedMedia(media);
                                  setSelectedMediaIndex(index);
                                }}
                              />
                              <PlaceGroup
                                places={groupedPlaces.notes}
                                title="Notes"
                                onOpenMedia={(media, index) => {
                                  setSelectedMedia(media);
                                  setSelectedMediaIndex(index);
                                }}
                              />

                              {currentDay.notes
                                ? (
                                    <div className="relative flex items-start">
                                      <div className="relative z-10 hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#160E53] bg-white sm:flex md:h-12 md:w-12">
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#160E53] md:h-6 md:w-6">
                                          <span className="text-[10px] font-semibold text-white md:text-xs">N</span>
                                        </div>
                                      </div>

                                      <div className="w-full flex-1 sm:ml-4 md:ml-6">
                                        <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4">
                                          <div className="flex items-start gap-2 sm:gap-3">
                                            <div className="flex-shrink-0 text-[#160E53]">
                                              <span className="text-xs font-semibold">N</span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                              <h4 className="mb-1 text-sm font-medium text-[#160E53] sm:text-base">Notes</h4>
                                              <p className="text-xs break-words text-gray-700 sm:text-sm">{currentDay.notes}</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                : null}
                            </div>
                          </div>
                        )
                      : (
                          <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50 p-4 text-center sm:p-6">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#160E53]/10 p-0 sm:h-14 sm:w-14">
                              <span className="text-2xl text-[#160E53] sm:text-3xl">•</span>
                            </div>
                            <h3 className="mb-1 text-sm font-medium text-gray-900 sm:text-base">No places added yet</h3>
                            <p className="mx-auto mb-4 max-w-xs text-xs text-gray-500 sm:text-sm">
                              Start planning your day by adding places to visit, restaurants, or accommodations.
                            </p>
                          </div>
                        )}
                  </div>
                )
              : null}
          </div>

          <div className="rounded-lg bg-white p-4 shadow-sm sm:p-6">
            <JourneyPostsSection journeyTitle={journey.title} mode="list" />
          </div>
        </div>

        <JourneyMapPanel places={allPlaces} />
      </div>

      <MediaViewerModal
        activeIndex={selectedMediaIndex}
        isOpen={isMediaViewerOpen}
        media={selectedMedia}
        onClose={() => {
          setSelectedMedia([]);
          setSelectedMediaIndex(0);
        }}
      />
    </div>
  );
};
