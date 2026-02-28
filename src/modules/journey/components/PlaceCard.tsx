import type { JourneyMedia, JourneyPlace } from '@/modules/journey/types/journey-detail.types';
import Image from 'next/image';
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

export const PlaceCard = (props: PlaceCardProps) => {
  const { place, onOpenMedia } = props;

  return (
    <div className="relative flex items-start">
      <div className="hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#160E53] bg-white sm:flex md:h-12 md:w-12">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#160E53] md:h-6 md:w-6">
          <span className="text-[10px] font-semibold text-white md:text-xs">{getTypeGlyph(place.type)}</span>
        </div>
      </div>

      <div className="w-full min-w-0 flex-1 sm:ml-4 md:ml-6">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
          <div className="flex flex-col sm:flex-row">
            <div className="relative h-32 w-full flex-shrink-0 bg-gray-100 sm:h-28 sm:w-28 md:h-32 md:w-32 lg:h-36 lg:w-36">
              {place.media.length > 0 && place.media[0]
                ? <Image alt={place.name} className="object-cover" fill sizes="(max-width: 640px) 100vw, 144px" src={place.media[0].url} />
                : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#160E53] sm:h-10 sm:w-10">
                        <span className="text-xs font-semibold text-white">{getTypeGlyph(place.type)}</span>
                      </div>
                    </div>
                  )}

              <div className="absolute top-2 left-2 sm:hidden">
                <span className="inline-flex items-center rounded-full bg-[#160E53] px-2 py-1 text-xs font-medium text-white">{getTypeLabel(place.type)}</span>
              </div>

              {place.media.length > 1
                ? (
                    <div className="absolute right-2 bottom-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
                      <span aria-hidden="true">◉</span>
                      {place.media.length}
                    </div>
                  )
                : null}
            </div>

            <div className="min-w-0 flex-1 p-3 sm:p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="line-clamp-2 text-sm leading-tight font-semibold text-gray-900 sm:text-base">{place.name}</h3>
                {place.media.length > 0
                  ? (
                      <button
                        className="hidden flex-shrink-0 items-center text-xs font-medium text-[#160E53] transition-colors hover:text-[#241A7A] sm:flex sm:text-sm"
                        onClick={() => onOpenMedia(place.media, 0)}
                        type="button"
                      >
                        <span aria-hidden="true" className="mr-1">◉</span>
                        <span className="hidden md:inline">View Images</span>
                        <span className="md:hidden">View</span>
                      </button>
                    )
                  : null}
              </div>

              <div className="mb-2 hidden items-center text-xs text-gray-500 sm:flex">
                <span aria-hidden="true" className="mr-1 text-gray-400">•</span>
                <span>{getTypeLabel(place.type)}</span>
              </div>

              {place.address || place.description
                ? <p className="line-clamp-3 flex-1 text-xs text-gray-500 sm:text-sm">{place.address ?? place.description}</p>
                : null}

              {place.media.length > 0
                ? (
                    <button
                      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#160E53] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#241A7A] sm:hidden"
                      onClick={() => onOpenMedia(place.media, 0)}
                      type="button"
                    >
                      <span aria-hidden="true">◉</span>
                      View All Images
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
