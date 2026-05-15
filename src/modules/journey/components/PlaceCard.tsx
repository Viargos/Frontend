import type { JourneyMedia, JourneyPlace } from '@/modules/journey/types/journey-detail.types';
import Image from 'next/image';
import {
  AirplaneIcon,
  Badge,
  ClockIcon,
  FileTextIcon,
  HikingIcon,
  HotelIcon,
  ImageIcon,
  MapPinIcon,
  UtensilsIcon,
} from '@/modules/common';
import { PlaceType } from '@/modules/journey/enums/place-type.enum';

type PlaceCardProps = {
  place: JourneyPlace;
  onOpenMedia: (media: JourneyMedia[], index: number) => void;
};

function getTypeLabel(type: PlaceType): string {
  switch (type) {
    case PlaceType.STAY:
      return 'Accommodation';
    case PlaceType.ACTIVITY:
      return 'Activity';
    case PlaceType.FOOD:
      return 'Restaurant';
    case PlaceType.TRANSPORT:
      return 'Transport';
    case PlaceType.NOTE:
      return 'Notes';
    default:
      return 'Place';
  }
}

function getTypeGlyph(type: PlaceType): string {
  switch (type) {
    case PlaceType.STAY:
      return 'H';
    case PlaceType.ACTIVITY:
      return 'A';
    case PlaceType.FOOD:
      return 'F';
    case PlaceType.TRANSPORT:
      return 'T';
    case PlaceType.NOTE:
      return 'N';
    default:
      return 'P';
  }
}

type PlaceTypeIconProps = {
  size: number;
  type: PlaceType;
};

function PlaceTypeIcon(props: PlaceTypeIconProps) {
  const { size, type } = props;

  switch (type) {
    case PlaceType.STAY:
      return <HotelIcon size={size} />;
    case PlaceType.ACTIVITY:
      return <HikingIcon size={size} />;
    case PlaceType.FOOD:
      return <UtensilsIcon size={size} />;
    case PlaceType.TRANSPORT:
      return <AirplaneIcon size={size} />;
    case PlaceType.NOTE:
      return <FileTextIcon size={size} />;
    default:
      return <MapPinIcon size={size} />;
  }
}

function formatTimeRange(startTime?: string, endTime?: string): string | null {
  if (!startTime && !endTime) {
    return null;
  }

  const formatTime = (value?: string) => {
    if (!value) {
      return null;
    }

    const parsedDate = new Date(`1970-01-01T${value}`);
    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    }

    return value;
  };

  const formattedStart = formatTime(startTime);
  const formattedEnd = formatTime(endTime);

  if (formattedStart && formattedEnd) {
    return `${formattedStart} - ${formattedEnd}`;
  }

  return formattedStart ?? formattedEnd;
}

function formatBookingRange(startDayNumber?: number, endDayNumber?: number): string | null {
  if (!startDayNumber || !endDayNumber || startDayNumber === endDayNumber) {
    return null;
  }

  return `Booked for Day ${startDayNumber} - Day ${endDayNumber}`;
}

export const PlaceCard = (props: PlaceCardProps) => {
  const { place, onOpenMedia } = props;
  const timeRange = formatTimeRange(place.startTime, place.endTime);
  const bookingRange = formatBookingRange(place.bookingStartDayNumber, place.bookingEndDayNumber);

  return (
    <div className="relative flex items-start">
      <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] shadow-[0_12px_30px_-20px_rgba(0,0,0,0.85)] sm:flex">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f8d775] text-slate-950">
          <PlaceTypeIcon size={16} type={place.type} />
        </div>
      </div>

      <div className="w-full min-w-0 flex-1 sm:ml-4 md:ml-5">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_24px_60px_-36px_rgba(0,0,0,0.9)] transition-all hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.06]">
          <div className="flex flex-col lg:flex-row">
            <div className="relative h-48 w-full shrink-0 bg-slate-900 lg:h-auto lg:w-[220px]">
              {place.media.length > 0 && place.media[0]
                ? <Image alt={place.name} className="object-cover" fill sizes="(max-width: 1024px) 100vw, 220px" src={place.media[0].url} />
                : (
                    <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(180deg,rgba(15,23,42,0.95)_0%,rgba(30,41,59,0.82)_100%)]">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f8d775] text-slate-950 shadow-[0_18px_38px_-24px_rgba(248,215,117,0.8)]">
                        <PlaceTypeIcon size={22} type={place.type} />
                      </div>
                    </div>
                  )}

              <div className="absolute top-3 left-3 sm:hidden">
                <Badge className="border-white/20 bg-slate-950/70 text-white backdrop-blur-sm">
                  {getTypeGlyph(place.type)}
                  {' '}
                  {getTypeLabel(place.type)}
                </Badge>
              </div>

              {place.media.length > 1
                ? (
                    <div className="absolute right-3 bottom-3 flex items-center gap-1 rounded-full bg-slate-950/70 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
                      <ImageIcon size={12} />
                      {place.media.length}
                    </div>
                  )
                : null}
            </div>

            <div className="min-w-0 flex-1 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="hidden sm:flex">
                    <Badge className="border-[#f8d775]/20 bg-[#f8d775]/10 text-[#f8d775]" variant="muted">
                      <PlaceTypeIcon size={12} type={place.type} />
                      {getTypeLabel(place.type)}
                    </Badge>
                  </div>

                  <h3 className="mt-2 line-clamp-2 text-lg font-semibold tracking-tight text-slate-100">
                    {place.name}
                  </h3>
                </div>

                {place.media.length > 0
                  ? (
                      <button
                        className="hidden shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-sm font-medium text-slate-200 transition-all hover:border-[#f8d775]/30 hover:bg-[#f8d775]/10 hover:text-[#f8d775] sm:inline-flex"
                        onClick={() => onOpenMedia(place.media, 0)}
                        type="button"
                      >
                        <ImageIcon size={14} />
                        View media
                      </button>
                    )
                  : null}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {bookingRange
                  ? (
                      <div className="inline-flex items-center gap-2 rounded-full border border-[#f8d775]/15 bg-[#f8d775]/10 px-3 py-1.5 text-xs text-[#f8d775]">
                        <HotelIcon size={12} />
                        <span>{bookingRange}</span>
                      </div>
                    )
                  : null}

                {place.address
                  ? (
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.05] px-3 py-1.5 text-xs text-slate-400">
                        <MapPinIcon size={12} />
                        <span className="line-clamp-1">{place.address}</span>
                      </div>
                    )
                  : null}

                {timeRange
                  ? (
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.05] px-3 py-1.5 text-xs text-slate-400">
                        <ClockIcon size={12} />
                        <span>{timeRange}</span>
                      </div>
                    )
                  : null}
              </div>

              {place.description
                ? <p className="mt-4 text-sm leading-6 text-slate-400">{place.description}</p>
                : null}

              {place.media.length > 0
                ? (
                    <button
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f8d775] px-4 py-3 text-sm font-medium text-slate-950 transition-colors hover:bg-[#f5cf54] sm:hidden"
                      onClick={() => onOpenMedia(place.media, 0)}
                      type="button"
                    >
                      <ImageIcon size={16} />
                      View media
                    </button>
                  )
                : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
