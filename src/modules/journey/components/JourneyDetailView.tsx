'use client';

import type { JourneyDetail, JourneyMedia, JourneyPlace } from '@/modules/journey/types/journey-detail.types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useAuthSession } from '@/modules/auth';
import {
  Badge,
  CalendarIcon,
  ClipboardListIcon,
  EditIcon,
  FileTextIcon,
  ImageIcon,
  MapPinIcon,
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

function getTotalMediaCount(days: JourneyDetail['days']): number {
  return days.reduce(
    (sum, day) => sum + day.places.reduce((placeSum, place) => placeSum + place.media.length, 0),
    0,
  );
}

export const JourneyDetailView = (props: JourneyDetailViewProps) => {
  const { journey } = props;
  const router = useRouter();
  const { session } = useAuthSession();
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
  const totalMediaCount = useMemo(() => getTotalMediaCount(journey.days), [journey.days]);
  const daysWithNotes = useMemo(
    () => journey.days.filter(day => Boolean(day.notes?.trim())).length,
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
  const currentUserId = session.user?.id;
  const ownerId = journey.user?.id;
  const isOwner = Boolean(currentUserId && ownerId && String(currentUserId) === String(ownerId));
  const hasDayNotes = Boolean(currentDay?.notes?.trim());
  const hasCurrentDayPlaces = (currentDay?.places.length ?? 0) > 0;
  const hasCurrentDayContent = hasCurrentDayPlaces || hasDayNotes;

  return (
    <div className="max-w-none flex-1 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_30%),linear-gradient(180deg,#0f172a_0%,#111827_45%,#020617_100%)] p-4 sm:p-6">
      <JourneyHeader
        journey={journey}
        onBack={() => {
          router.back();
        }}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.75fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_60px_-36px_rgba(0,0,0,0.9)] ring-1 ring-white/5 backdrop-blur-xl sm:p-6">
            <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">Itinerary overview</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-100">Plan at a glance</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Review the structure of the trip before diving into each day and stop.
                </p>
              </div>

              {isOwner
                ? (
                    <Link
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-slate-200 transition-all hover:border-[#f8d775]/30 hover:bg-[#f8d775]/10 hover:text-[#f8d775]"
                      href={`/edit-journey/${journey.id}`}
                    >
                      <EditIcon size={16} />
                      Edit journey
                    </Link>
                  )
                : null}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                  <CalendarIcon size={14} />
                  Trip length
                </div>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-100">{journey.days.length}</p>
                <p className="mt-1 text-sm text-slate-400">Planned travel days</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                  <MapPinIcon size={14} />
                  Stops
                </div>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-100">{allPlaces.length}</p>
                <p className="mt-1 text-sm text-slate-400">Locations across the itinerary</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                  <ImageIcon size={14} />
                  Media and notes
                </div>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-100">
                  {totalMediaCount}
                  <span className="mx-2 text-slate-600">/</span>
                  {daysWithNotes}
                </p>
                <p className="mt-1 text-sm text-slate-400">Photos and days with notes</p>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/[0.04] shadow-[0_24px_60px_-36px_rgba(0,0,0,0.9)] ring-1 ring-white/5 backdrop-blur-xl">
            <div className="border-b border-white/10 px-5 py-5 sm:px-6">
              <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">Daily schedule</p>
              <div className="mt-2 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-100">Day-by-day itinerary</h2>
                  <p className="mt-1 text-sm text-slate-400">Browse each day to review the planned route, places, and notes.</p>
                </div>
                {currentDay
                  ? (
                      <Badge className="border-[#f8d775]/20 bg-[#f8d775]/10 text-[#f8d775]" variant="muted">
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
                      <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-4 sm:p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <Badge className="border-white/10 bg-white/[0.06] text-slate-200" variant="muted">
                              Day
                              {' '}
                              {currentDay.dayNumber + 1}
                            </Badge>
                            <h3 className="mt-3 text-xl font-semibold tracking-tight text-slate-100">{formatDayDate(currentDay.date)}</h3>
                            <p className="mt-1 text-sm text-slate-400">
                              {currentDay.places.length}
                              {' '}
                              planned stop
                              {currentDay.places.length === 1 ? '' : 's'}
                              {hasDayNotes ? ' with supporting notes for the day.' : '.'}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3 sm:min-w-[280px]">
                            <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
                              <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">Places</p>
                              <p className="mt-1 text-lg font-semibold text-slate-100">{currentDay.places.length}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
                              <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">Media</p>
                              <p className="mt-1 text-lg font-semibold text-slate-100">
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
                                <div className="absolute top-14 bottom-4 left-[21.5px] hidden w-px bg-white/10 sm:block" />

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
                                <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] shadow-[0_12px_30px_-20px_rgba(0,0,0,0.85)] sm:flex">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f8d775] text-slate-950">
                                    <FileTextIcon size={16} />
                                  </div>
                                </div>

                                <div className="w-full min-w-0 flex-1 sm:ml-4 md:ml-5">
                                  <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
                                    <div className="flex items-start gap-3">
                                      <div className="mt-0.5 hidden text-[#f8d775] sm:block">
                                        <FileTextIcon size={16} />
                                      </div>
                                      <div>
                                        <h4 className="text-base font-semibold text-slate-100">Day notes</h4>
                                        <p className="mt-2 text-sm leading-6 whitespace-pre-wrap text-slate-400">{currentDay.notes}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          : null}

                        {!hasCurrentDayContent
                          ? (
                              <div className="rounded-3xl border border-dashed border-white/12 bg-white/[0.04] p-8 text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.07] text-[#f8d775] shadow-[0_12px_30px_-20px_rgba(0,0,0,0.85)]">
                                  <ClipboardListIcon size={22} />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-slate-100">This day is still empty</h3>
                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
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

          <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_60px_-36px_rgba(0,0,0,0.9)] ring-1 ring-white/5 backdrop-blur-xl sm:p-6">
            <JourneyPostsSection journeyTitle={journey.title} mode="list" />
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
