'use client';

import type { JourneyDetail, JourneyMedia, JourneyPlace } from '@/modules/journey/types/journey-detail.types';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  Badge,
  ClipboardListIcon,
  FileTextIcon,
} from '@/modules/common';
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
  const daySections = useMemo(
    () => [
      { places: groupedPlaces.stay, title: 'Place to stay' },
      { places: groupedPlaces.activities, title: 'Places to go' },
      { places: groupedPlaces.food, title: 'Food' },
      { places: groupedPlaces.transport, title: 'Transport' },
      { places: groupedPlaces.notes, title: 'Notes' },
    ],
    [groupedPlaces],
  );

  const isMediaViewerOpen = selectedMedia.length > 0;
  const hasDayNotes = Boolean(currentDay?.notes?.trim());
  const hasCurrentDayPlaces = (currentDay?.places.length ?? 0) > 0;
  const hasCurrentDayContent = hasCurrentDayPlaces || hasDayNotes;

  return (
    <div className="journey-planner-shell max-w-none flex-1 p-4 sm:p-6">
      <JourneyHeader
        journey={journey}
        onBack={() => {
          router.back();
        }}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.75fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <section className="journey-planner-card rounded-[28px] border">
            <div className="border-b px-5 py-5 sm:px-6">
              <p className="journey-planner-label text-xs font-semibold tracking-[0.22em] uppercase">Daily schedule</p>
              <div className="mt-2 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="journey-planner-title text-2xl font-semibold tracking-tight">Day-by-day itinerary</h2>
                  <p className="journey-planner-copy mt-1 text-sm">Browse each day to review the planned route, places, and notes.</p>
                </div>
                {currentDay
                  ? (
                      <Badge className="border-[var(--journey-planner-accent-border)] bg-[var(--journey-planner-accent-soft)] text-[var(--journey-planner-accent)]" variant="muted">
                        Day
                        {' '}
                        {currentDay.dayNumber + 1}
                        {' '}
                        selected
                      </Badge>
                    )
                  : null}
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <JourneyTabs activeDayNumber={activeDayNumber} days={journey.days} onSelectDay={setActiveDayNumber} />

              {currentDay
                ? (
                    <div className="mt-6">
                      <div className="journey-planner-subcard rounded-[24px] border p-4 sm:p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <Badge variant="muted">
                              Day
                              {' '}
                              {currentDay.dayNumber + 1}
                            </Badge>
                            <h3 className="journey-planner-title mt-3 text-xl font-semibold tracking-tight">{formatDayDate(currentDay.date)}</h3>
                            <p className="journey-planner-copy mt-1 text-sm">
                              {currentDay.places.length}
                              {' '}
                              planned stop
                              {currentDay.places.length === 1 ? '' : 's'}
                              {hasDayNotes ? ' with supporting notes for the day.' : '.'}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3 sm:min-w-[280px]">
                            <div className="journey-planner-card rounded-2xl border px-4 py-3">
                              <p className="journey-planner-label text-xs font-medium tracking-wide uppercase">Places</p>
                              <p className="journey-planner-title mt-1 text-lg font-semibold">{currentDay.places.length}</p>
                            </div>
                            <div className="journey-planner-card rounded-2xl border px-4 py-3">
                              <p className="journey-planner-label text-xs font-medium tracking-wide uppercase">Media</p>
                              <p className="journey-planner-title mt-1 text-lg font-semibold">
                                {currentDay.places.reduce((sum, place) => sum + place.media.length, 0)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 space-y-6">
                        {hasCurrentDayPlaces
                          ? (
                              <div className="relative">
                                <div className="absolute top-14 bottom-4 left-[21.5px] hidden w-px bg-[var(--journey-planner-card-border)] sm:block" />

                                <div className="space-y-6">
                                  {daySections.map(section => (
                                    <PlaceGroup
                                      key={section.title}
                                      places={section.places}
                                      title={section.title}
                                      onOpenMedia={(media, index) => {
                                        setSelectedMedia(media);
                                        setSelectedMediaIndex(index);
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>
                            )
                          : null}

                        {hasDayNotes
                          ? (
                              <div className="relative flex items-start">
                                <div className="hidden shrink-0 sm:flex">
                                  <div className="journey-planner-icon-tile flex h-11 w-11 items-center justify-center rounded-2xl">
                                    <FileTextIcon size={18} />
                                  </div>
                                </div>

                                <div className="w-full min-w-0 flex-1 sm:ml-4 md:ml-5">
                                  <div className="journey-planner-subcard rounded-3xl border p-5">
                                    <div className="flex items-start gap-3">
                                      <div className="journey-planner-accent-link mt-0.5 hidden sm:block">
                                        <FileTextIcon size={16} />
                                      </div>
                                      <div>
                                        <h4 className="journey-planner-title text-base font-semibold">Day notes</h4>
                                        <p className="journey-planner-copy mt-2 text-sm leading-6 whitespace-pre-wrap">{currentDay.notes}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          : null}

                        {!hasCurrentDayContent
                          ? (
                              <div className="journey-planner-empty-state rounded-3xl border border-dashed p-8 text-center">
                                <div className="journey-planner-icon-tile mx-auto flex h-14 w-14 items-center justify-center rounded-2xl">
                                  <ClipboardListIcon size={22} />
                                </div>
                                <h3 className="journey-planner-title mt-4 text-lg font-semibold">This day is still empty</h3>
                                <p className="journey-planner-copy mx-auto mt-2 max-w-md text-sm leading-6">
                                  Add places, transport, or notes to turn this into a complete daily plan.
                                </p>
                              </div>
                            )
                          : null}
                      </div>
                    </div>
                  )
                : null}
            </div>
          </section>

          <section className="journey-planner-card rounded-[28px] border p-5 sm:p-6">
            <JourneyPostsSection journeyImageSrc={journey.coverImage} journeyTitle={journey.title} mode="list" />
          </section>
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
