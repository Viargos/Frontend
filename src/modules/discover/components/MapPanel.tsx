'use client';

import type { DiscoverFeedItem } from '@/modules/discover/types/discover-ui.types';
import type { DiscoverCoordinates, DiscoverJourney } from '@/modules/discover/types/discover.types';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { ControlStack } from '@/modules/discover/components/ControlStack';
import { DiscoverMap } from '@/modules/discover/components/DiscoverMap';
import { DEFAULT_MAP_CENTER, useGoogleMapsLoader } from '@/modules/discover/infra';
import { mapDiscoverFeedItems } from '@/modules/discover/mappers/discover-feed.mapper';
import { useDiscoverStore } from '@/modules/discover/store/discover.store';

type MapPanelProps = {
  autoSearch: boolean;
  coordinates: DiscoverCoordinates | null;
  feedItems: DiscoverFeedItem[];
  isLoadingLocation: boolean;
  isSidebarOpen: boolean;
  journeys: DiscoverJourney[];
  onOpenJourneyDetails: (journey: DiscoverJourney) => void;
  onExpandSearchRadius: () => void;
  onRefreshLocation: () => void;
  onSelectJourney: (journey: DiscoverJourney) => void;
  onToggleAutoSearch: () => void;
  onToggleSidebar: () => void;
  selectedJourney: DiscoverJourney | null;
};

export const MapPanel = (props: MapPanelProps) => {
  const {
    autoSearch,
    coordinates,
    feedItems,
    isLoadingLocation,
    isSidebarOpen,
    journeys,
    onExpandSearchRadius,
    onOpenJourneyDetails,
    onRefreshLocation,
    onSelectJourney,
    onToggleAutoSearch,
    onToggleSidebar,
    selectedJourney,
  } = props;
  const { hasApiKey, isLoaded, loadError } = useGoogleMapsLoader('discover-map-loader');
  const mapRef = useRef<google.maps.Map | null>(null);
  const mapSurfaceRef = useRef<HTMLDivElement | null>(null);
  const hoveredItemId = useDiscoverStore(state => state.hoveredItemId);
  const selectedItemId = useDiscoverStore(state => state.selectedItemId);
  const setHoveredItemId = useDiscoverStore(state => state.setHoveredItemId);
  const setSelectedItemId = useDiscoverStore(state => state.setSelectedItemId);
  const mappedFeedItems = useMemo(
    () => (feedItems.length > 0 ? feedItems : mapDiscoverFeedItems(journeys)),
    [feedItems, journeys],
  );
  const hasUsableCoordinates = useMemo(() => {
    if (!coordinates) {
      return false;
    }

    return Math.abs(coordinates.latitude) > 0.0001 || Math.abs(coordinates.longitude) > 0.0001;
  }, [coordinates]);
  const mapCenter = useMemo(() => {
    if (coordinates && hasUsableCoordinates) {
      return {
        lat: coordinates.latitude,
        lng: coordinates.longitude,
      };
    }

    const firstItem = mappedFeedItems[0];
    if (firstItem) {
      return {
        lat: firstItem.latitude,
        lng: firstItem.longitude,
      };
    }

    return DEFAULT_MAP_CENTER;
  }, [coordinates, hasUsableCoordinates, mappedFeedItems]);
  const mapZoom = useMemo(() => {
    if (mappedFeedItems.length > 0) {
      return 11;
    }

    if (hasUsableCoordinates) {
      return 11;
    }

    return 2;
  }, [hasUsableCoordinates, mappedFeedItems.length]);
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
    mappedFeedItems.length,
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

  useEffect(() => {
    if (!selectedJourney || !mapRef.current) {
      return;
    }

    const selectedFeedItem = mappedFeedItems.find(item => item.id === selectedJourney.id);

    if (!selectedFeedItem) {
      return;
    }

    mapRef.current.panTo({
      lat: selectedFeedItem.latitude,
      lng: selectedFeedItem.longitude,
    });
  }, [mappedFeedItems, selectedJourney]);

  const activePreviewItem = useMemo(() => {
    if (hoveredItemId) {
      return mappedFeedItems.find(item => item.id === hoveredItemId) ?? null;
    }

    if (selectedItemId) {
      return mappedFeedItems.find(item => item.id === selectedItemId) ?? null;
    }

    return null;
  }, [hoveredItemId, mappedFeedItems, selectedItemId]);

  const handleMarkerSelect = useCallback((itemId: string) => {
    const journey = journeys.find(candidate => candidate.id === itemId);

    if (!journey) {
      return;
    }

    setSelectedItemId(itemId);
    onSelectJourney(journey);
  }, [journeys, onSelectJourney, setSelectedItemId]);

  return (
    <div
      data-parity="discover-map-panel"
      className={`relative h-full min-h-0 flex-1 overflow-hidden transition-all duration-300 ${
        isSidebarOpen ? 'w-full lg:w-[calc(100%-24rem)]' : 'w-full'
      }`}
    >
      <div ref={mapSurfaceRef} className="absolute inset-0 border-2" data-parity="discover-map-container">
        <div className="relative h-full w-full overflow-hidden bg-linear-to-br from-[#160E53]/10 via-white to-[#0891b2]/10">
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
                  <DiscoverMap
                    center={mapCenter}
                    hoveredItemId={hoveredItemId}
                    items={mappedFeedItems}
                    onLoad={handleMapLoad}
                    onMarkerHover={setHoveredItemId}
                    onMarkerSelect={handleMarkerSelect}
                    onPreviewAction={(itemId) => {
                      const journey = journeys.find(candidate => candidate.id === itemId);
                      if (journey) {
                        onOpenJourneyDetails(journey);
                      }
                    }}
                    previewItem={activePreviewItem}
                    onUnmount={handleMapUnmount}
                    selectedItemId={selectedItemId}
                    zoom={mapZoom}
                  />
                )
              : null}
          </div>

        </div>
      </div>

      <ControlStack
        autoSearch={autoSearch}
        isLoadingLocation={isLoadingLocation}
        isSidebarOpen={isSidebarOpen}
        onExpandSearchRadius={onExpandSearchRadius}
        onRefreshLocation={onRefreshLocation}
        onToggleAutoSearch={onToggleAutoSearch}
        onToggleSidebar={onToggleSidebar}
      />
    </div>
  );
};
