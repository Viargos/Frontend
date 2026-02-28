'use client';

import type { DiscoverCoordinates, DiscoverJourney } from '@/modules/discover/types/discover.types';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { CheckIcon, MapPinIcon } from '@/modules/common/icons';
import { ControlStack } from '@/modules/discover/components/ControlStack';
import { DiscoverMapCanvas } from '@/modules/discover/components/DiscoverMapCanvas';
import { DEFAULT_MAP_CENTER, useGoogleMapsLoader } from '@/modules/discover/infra';

type MapPanelProps = {
  autoSearch: boolean;
  coordinates: DiscoverCoordinates | null;
  isLoadingLocation: boolean;
  isSidebarOpen: boolean;
  journeys: DiscoverJourney[];
  onRefreshLocation: () => void;
  onSearchGlobal: () => void;
  onSelectJourney: (journey: DiscoverJourney) => void;
  onToggleAutoSearch: () => void;
  onToggleSidebar: () => void;
  selectedJourney: DiscoverJourney | null;
};

export const MapPanel = (props: MapPanelProps) => {
  const {
    autoSearch,
    coordinates,
    isLoadingLocation,
    isSidebarOpen,
    journeys,
    onRefreshLocation,
    onSearchGlobal,
    onSelectJourney,
    onToggleAutoSearch,
    onToggleSidebar,
    selectedJourney,
  } = props;
  const { hasApiKey, isLoaded, loadError } = useGoogleMapsLoader('discover-map-loader');
  const mapRef = useRef<google.maps.Map | null>(null);
  const mapSurfaceRef = useRef<HTMLDivElement | null>(null);
  const mapPins = useMemo(() => journeys.flatMap(journey => journey.places
    .filter(place => Number.isFinite(place.latitude) && Number.isFinite(place.longitude))
    .map(place => ({
      id: `${journey.id}-${place.id}`,
      isSelected: selectedJourney?.id === journey.id,
      position: {
        lat: place.latitude as number,
        lng: place.longitude as number,
      },
      title: place.name || journey.title,
    }))), [journeys, selectedJourney?.id]);
  const mapCenter = useMemo(() => {
    if (coordinates) {
      return {
        lat: coordinates.latitude,
        lng: coordinates.longitude,
      };
    }

    const firstPin = mapPins[0];
    if (firstPin) {
      return {
        lat: firstPin.position.lat,
        lng: firstPin.position.lng,
      };
    }

    return DEFAULT_MAP_CENTER;
  }, [coordinates, mapPins]);
  const centerRef = useRef(mapCenter);
  useEffect(() => {
    centerRef.current = mapCenter;
  }, [mapCenter]);

  const triggerMapResize = useCallback(() => {
    if (typeof window === 'undefined' || !window.google?.maps || !mapRef.current) {
      return;
    }

    window.google.maps.event.trigger(mapRef.current, 'resize');
    mapRef.current.setCenter(centerRef.current);
  }, []);

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    window.setTimeout(() => {
      triggerMapResize();
    }, 100);
  }, [triggerMapResize]);

  const handleMapUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      triggerMapResize();
    }, 100);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    coordinates?.latitude,
    coordinates?.longitude,
    isLoaded,
    isSidebarOpen,
    mapPins.length,
    triggerMapResize,
  ]);

  useEffect(() => {
    if (!isLoaded || !mapSurfaceRef.current || !mapRef.current || typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(() => {
      triggerMapResize();
    });
    observer.observe(mapSurfaceRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isLoaded, triggerMapResize]);

  return (
    <div
      data-parity="discover-map-panel"
      className={`relative h-full flex-1 overflow-hidden transition-all duration-300 ${
        isSidebarOpen ? 'w-full lg:w-[calc(100%-24rem)]' : 'w-full'
      }`}
    >
      <div ref={mapSurfaceRef} className="absolute inset-0 border-2" data-parity="discover-map-container">
        <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-[#160E53]/10 via-white to-[#0891b2]/10">
          <div className="absolute inset-0">
            {!hasApiKey
              ? (
                  <div className="flex h-full items-center justify-center bg-gray-100 px-4 text-center text-sm text-gray-600">
                    Google Maps key is missing. Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to `.env.local`.
                  </div>
                )
              : null}

            {hasApiKey && !isLoaded && !loadError
              ? (
                  <div className="flex h-full items-center justify-center bg-gray-100">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#160E53]" />
                  </div>
                )
              : null}

            {hasApiKey && loadError
              ? (
                  <div className="flex h-full items-center justify-center bg-red-50 px-4 text-center text-sm text-red-700">
                    Failed to load Google Maps. Check API key restrictions and enabled APIs.
                  </div>
                )
              : null}

            {hasApiKey && isLoaded && !loadError
              ? (
                  <DiscoverMapCanvas
                    center={mapCenter}
                    hasCoordinates={Boolean(coordinates)}
                    markers={mapPins}
                    onLoad={handleMapLoad}
                    onUnmount={handleMapUnmount}
                  />
                )
              : null}
          </div>

          <div className="absolute inset-0 [background-image:radial-gradient(#160E53_1px,transparent_1px)] [background-size:22px_22px] opacity-20" />

          <div className="relative h-full w-full p-4">
            <div className="rounded-xl border border-white/60 bg-white/80 p-3 shadow-sm backdrop-blur-sm">
              <p className="text-xs font-medium text-gray-700">
                {coordinates
                  ? `Map Center: ${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`
                  : 'Waiting for location...'}
              </p>
            </div>

            <div className="mt-3 grid max-h-[calc(100%-3.5rem)] grid-cols-1 gap-2 overflow-y-auto rounded-xl border border-white/50 bg-white/70 p-3 backdrop-blur-sm sm:grid-cols-2 lg:grid-cols-3" data-parity="discover-map-cards">
              {journeys.map((journey) => {
                const isSelected = selectedJourney?.id === journey.id;

                return (
                  <button
                    key={journey.id}
                    className={`w-full rounded-lg border p-3 text-left transition-all ${
                      isSelected
                        ? 'border-blue-900/40 bg-white shadow-lg ring-2 ring-blue-900/20'
                        : 'border-gray-200 bg-white/95 hover:border-blue-900/20 hover:shadow-md'
                    }`}
                    onClick={() => onSelectJourney(journey)}
                    type="button"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="line-clamp-2 text-sm font-bold text-gray-900">{journey.title}</h3>
                      {isSelected
                        ? (
                            <CheckIcon aria-hidden="true" className="h-4 w-4 text-blue-900" />
                          )
                        : null}
                    </div>
                    <p className="line-clamp-2 text-xs text-gray-600">
                      {journey.description || 'No description available.'}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                      <MapPinIcon aria-hidden="true" className="h-3 w-3" />
                      <span>
                        {journey.places.length}
                        {' '}
                        places
                      </span>
                    </div>
                  </button>
                );
              })}

              {journeys.length === 0
                ? (
                    <div className="col-span-full py-8 text-center text-sm text-gray-500">
                      No nearby journeys to display on map.
                    </div>
                  )
                : null}
            </div>
          </div>
        </div>
      </div>

      <ControlStack
        autoSearch={autoSearch}
        isLoadingLocation={isLoadingLocation}
        isSidebarOpen={isSidebarOpen}
        onRefreshLocation={onRefreshLocation}
        onSearchGlobal={onSearchGlobal}
        onToggleAutoSearch={onToggleAutoSearch}
        onToggleSidebar={onToggleSidebar}
      />
    </div>
  );
};
