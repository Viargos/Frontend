'use client';

import type { JourneyDayInput } from '@/modules/journey/types/journey.types';
import { useMemo } from 'react';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_CONTAINER_STYLE, DEFAULT_MAP_OPTIONS, GoogleMap, MarkerF } from '@/modules/journey/infra/map-adapter';

type JourneyCreateMapPanelProps = {
  days: JourneyDayInput[];
  hasApiKey: boolean;
  isLoaded: boolean;
  loadError?: Error;
};

type MapPin = {
  id: string;
  lat: number;
  lng: number;
  title: string;
};

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function JourneyCreateMapPanel(props: JourneyCreateMapPanelProps) {
  const {
    days,
    hasApiKey,
    isLoaded,
    loadError,
  } = props;
  const pins = useMemo<MapPin[]>(
    () =>
      days.flatMap(day =>
        day.places.flatMap((place) => {
          const lat = toNumber(place.latitude);
          const lng = toNumber(place.longitude);

          if (lat === null || lng === null) {
            return [];
          }

          return [
            {
              id: `${day.id}-${place.id}`,
              lat,
              lng,
              title: place.name || `Day ${day.dayNumber} place`,
            },
          ];
        }),
      ),
    [days],
  );

  const mapCenter = useMemo(() => {
    const firstPin = pins[0];
    if (firstPin) {
      return {
        lat: firstPin.lat,
        lng: firstPin.lng,
      };
    }

    return DEFAULT_MAP_CENTER;
  }, [pins]);

  if (!hasApiKey) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-100 px-4 text-center text-sm text-gray-600">
        Google Maps key is missing. Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to `.env.local`.
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center bg-red-50 px-4 text-center text-sm text-red-700">
        Failed to load Google Maps. Check API key restrictions and enabled APIs.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#160E53]" />
      </div>
    );
  }

  return (
    <GoogleMap
      center={mapCenter}
      mapContainerStyle={DEFAULT_MAP_CONTAINER_STYLE}
      options={DEFAULT_MAP_OPTIONS}
      zoom={pins.length > 0 ? 10 : 2}
    >
      {pins.map(pin => <MarkerF key={pin.id} position={{ lat: pin.lat, lng: pin.lng }} title={pin.title} />)}
    </GoogleMap>
  );
}
