import type { JourneyDetail } from '@/modules/journey/types/journey-detail.types';
import Image from 'next/image';
import { Badge, CalendarIcon, ClipboardListIcon, ImageIcon } from '@/modules/common';

type JourneyHeaderProps = {
  journey: JourneyDetail;
  onBack: () => void;
};

export const JourneyHeader = (props: JourneyHeaderProps) => {
  const { journey, onBack } = props;
  const coverImageSrc = journey.coverImage ?? '/london.png';
  const totalPlaces = journey.days.reduce((sum, day) => sum + day.places.length, 0);
  const totalMedia = journey.days.reduce(
    (sum, day) => sum + day.places.reduce((placeSum, place) => placeSum + place.media.length, 0),
    0,
  );

  const createdDate = new Date(journey.createdAt);
  const createdLabel = Number.isNaN(createdDate.getTime())
    ? 'Planned recently'
    : `Created ${createdDate.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })}`;

  return (
    <section className="relative mb-6 overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.7)] sm:mb-8">
      <div className="relative h-[300px] sm:h-[360px] lg:h-[400px]">
        <Image
          alt="Journey cover"
          className="object-cover"
          fill
          priority
          src={coverImageSrc}
          unoptimized
        />

        <div className="absolute inset-0 bg-linear-to-r from-slate-950/80 via-slate-950/55 to-slate-900/20" />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />

        <button
          className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-white/15 sm:top-6 sm:left-6"
          onClick={onBack}
          type="button"
        >
          <span aria-hidden="true" className="text-base">←</span>
          Back
        </button>

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 lg:p-8">
          <div className="max-w-4xl">
            <Badge className="mb-4 border-white/20 bg-white/10 text-white backdrop-blur-md" variant="muted">
              Journey overview
            </Badge>
            <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {journey.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
              {journey.description || 'A polished snapshot of the itinerary, places, and memories planned for this trip.'}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-slate-300 uppercase">
                  <CalendarIcon size={14} />
                  Duration
                </div>
                <p className="mt-1 text-sm font-semibold text-white">
                  {journey.days.length}
                  {' '}
                  day
                  {journey.days.length === 1 ? '' : 's'}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-slate-300 uppercase">
                  <ClipboardListIcon size={14} />
                  Stops
                </div>
                <p className="mt-1 text-sm font-semibold text-white">
                  {totalPlaces}
                  {' '}
                  planned locations
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-slate-300 uppercase">
                  <ImageIcon size={14} />
                  Media
                </div>
                <p className="mt-1 text-sm font-semibold text-white">
                  {totalMedia}
                  {' '}
                  uploaded moments
                </p>
              </div>
            </div>
          </div>

          <p className="mt-5 text-xs font-medium tracking-wide text-slate-300 uppercase">{createdLabel}</p>
        </div>
      </div>
    </section>
  );
};
