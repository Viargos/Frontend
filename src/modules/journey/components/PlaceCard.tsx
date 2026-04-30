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
      <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm sm:flex">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#160E53] text-white">
          <PlaceTypeIcon size={16} type={place.type} />
        </div>
      </div>

      <div className="w-full min-w-0 flex-1 sm:ml-4 md:ml-5">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
          <div className="flex flex-col lg:flex-row">
            <div className="relative h-48 w-full shrink-0 bg-slate-100 lg:h-auto lg:w-[220px]">
              {place.media.length > 0 && place.media[0]
                ? <Image alt={place.name} className="object-cover" fill sizes="(max-width: 1024px) 100vw, 220px" src={place.media[0].url} />
                : (
                    <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-100 via-white to-slate-200">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#160E53] text-white shadow-lg">
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
                    <Badge className="border-[#160E53]/10 bg-[#160E53]/5 text-[#160E53]" variant="muted">
                      <PlaceTypeIcon size={12} type={place.type} />
                      {getTypeLabel(place.type)}
                    </Badge>
                  </div>

                  <h3 className="mt-2 line-clamp-2 text-lg font-semibold tracking-tight text-slate-900">
                    {place.name}
                  </h3>
                </div>

                {place.media.length > 0
                  ? (
                      <button
                        className="hidden shrink-0 items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-[#160E53]/30 hover:text-[#160E53] sm:inline-flex"
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
                      <div className="inline-flex items-center gap-2 rounded-full bg-[#160E53]/5 px-3 py-1.5 text-xs text-[#160E53]">
                        <HotelIcon size={12} />
                        <span>{bookingRange}</span>
                      </div>
                    )
                  : null}

                {place.address
                  ? (
                      <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-600">
                        <MapPinIcon size={12} />
                        <span className="line-clamp-1">{place.address}</span>
                      </div>
                    )
                  : null}

                {timeRange
                  ? (
                      <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-600">
                        <ClockIcon size={12} />
                        <span>{timeRange}</span>
                      </div>
                    )
                  : null}
              </div>

              {place.description
                ? <p className="mt-4 text-sm leading-6 text-slate-600">{place.description}</p>
                : null}

              {place.media.length > 0
                ? (
                    <button
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#160E53] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#241A7A] sm:hidden"
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
