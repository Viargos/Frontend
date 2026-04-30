'use client';

import type { ProfileJourney } from '@/modules/profile/types/profile.types';
import * as motion from 'framer-motion/client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { JourneyIcon } from '@/modules/common/icons';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_CONTAINER_STYLE, GoogleMap, MarkerF, useGoogleMapsLoader } from '@/modules/common/infra';
import { ProfileMapOverlayCard } from '@/modules/profile/components/ProfileMapOverlayCard';

type ProfileMapPanelProps = {
  isLoading?: boolean;
  isOwnProfile?: boolean;
  journeys: ProfileJourney[];
  ownerName: string;
};

type MapJourneyLocation = {
  id: string;
  journey: ProfileJourney;
  lat: number;
  lng: number;
  year: number;
};

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'abu dhabi': { lat: 24.4539, lng: 54.3773 },
  'agra': { lat: 27.1767, lng: 78.0081 },
  'amsterdam': { lat: 52.3676, lng: 4.9041 },
  'athens': { lat: 37.9838, lng: 23.7275 },
  'auckland': { lat: -36.8509, lng: 174.7645 },
  'bali': { lat: -8.3405, lng: 115.0920 },
  'bangkok': { lat: 13.7563, lng: 100.5018 },
  'barcelona': { lat: 41.3851, lng: 2.1734 },
  'beijing': { lat: 39.9042, lng: 116.4074 },
  'berlin': { lat: 52.52, lng: 13.405 },
  'boston': { lat: 42.3601, lng: -71.0589 },
  'cairo': { lat: 30.0444, lng: 31.2357 },
  'cancun': { lat: 21.1619, lng: -86.8515 },
  'chennai': { lat: 13.0827, lng: 80.2707 },
  'chicago': { lat: 41.8781, lng: -87.6298 },
  'delhi': { lat: 28.6139, lng: 77.209 },
  'doha': { lat: 25.2854, lng: 51.531 },
  'dubai': { lat: 25.2048, lng: 55.2708 },
  'goa': { lat: 15.2993, lng: 74.124 },
  'hanoi': { lat: 21.0285, lng: 105.8542 },
  'istanbul': { lat: 41.0082, lng: 28.9784 },
  'jakarta': { lat: -6.2088, lng: 106.8456 },
  'kyoto': { lat: 35.0116, lng: 135.7681 },
  'lisbon': { lat: 38.7223, lng: -9.1393 },
  'london': { lat: 51.5074, lng: -0.1278 },
  'madrid': { lat: 40.4168, lng: -3.7038 },
  'maldives': { lat: 3.2028, lng: 73.2207 },
  'manila': { lat: 14.5995, lng: 120.9842 },
  'miami': { lat: 25.7617, lng: -80.1918 },
  'montreal': { lat: 45.5017, lng: -73.5673 },
  'mumbai': { lat: 19.076, lng: 72.8777 },
  'muscat': { lat: 23.588, lng: 58.3829 },
  'new york': { lat: 40.7128, lng: -74.006 },
  'osaka': { lat: 34.6937, lng: 135.5023 },
  'paris': { lat: 48.8566, lng: 2.3522 },
  'phuket': { lat: 7.9519, lng: 98.3381 },
  'prague': { lat: 50.0755, lng: 14.4378 },
  'queenstown': { lat: -45.0312, lng: 168.6626 },
  'riyadh': { lat: 24.7136, lng: 46.6753 },
  'rome': { lat: 41.9028, lng: 12.4964 },
  'seoul': { lat: 37.5665, lng: 126.978 },
  'shanghai': { lat: 31.2304, lng: 121.4737 },
  'singapore': { lat: 1.3521, lng: 103.8198 },
  'sydney': { lat: -33.8688, lng: 151.2093 },
  'taipei': { lat: 25.033, lng: 121.5654 },
  'tokyo': { lat: 35.6762, lng: 139.6503 },
  'toronto': { lat: 43.6532, lng: -79.3832 },
  'varanasi': { lat: 25.3176, lng: 82.9739 },
  'vienna': { lat: 48.2082, lng: 16.3738 },
  'zurich': { lat: 47.3769, lng: 8.5417 },
};

const POPULAR_DESTINATIONS = ['paris', 'london', 'tokyo', 'new york', 'dubai', 'singapore'] as const;

function hashText(value: string): number {
  return value.split('').reduce((acc, character) => character.charCodeAt(0) + ((acc << 5) - acc), 0);
}

function getCoordinatesForPlace(placeName: string, journeyTitle: string): { lat: number; lng: number } {
  const placeTerm = placeName.toLowerCase().trim();
  const titleTerm = journeyTitle.toLowerCase().trim();

  if (CITY_COORDINATES[placeTerm]) {
    return CITY_COORDINATES[placeTerm];
  }

  for (const [city, coordinates] of Object.entries(CITY_COORDINATES)) {
    if (placeTerm.includes(city)) {
      return coordinates;
    }
  }

  for (const [city, coordinates] of Object.entries(CITY_COORDINATES)) {
    if (titleTerm.includes(city)) {
      return coordinates;
    }
  }

  const words = [...placeTerm.split(/[\s,\-]+/), ...titleTerm.split(/[\s,\-]+/)]
    .map(word => word.trim())
    .filter(word => word.length > 2);

  for (const word of words) {
    if (CITY_COORDINATES[word]) {
      return CITY_COORDINATES[word];
    }
  }

  const hash = hashText(`${journeyTitle}:${placeName}`);
  const fallbackCity = POPULAR_DESTINATIONS[Math.abs(hash) % POPULAR_DESTINATIONS.length] ?? 'paris';
  const baseCoordinates = CITY_COORDINATES[fallbackCity] ?? { lat: 48.8566, lng: 2.3522 };
  const offset = (Math.abs(hash) % 100) / 10000;

  return {
    lat: baseCoordinates.lat + offset,
    lng: baseCoordinates.lng + offset,
  };
}

function getJourneyMarkerCoordinates(journey: ProfileJourney): { lat: number; lng: number } {
  const primaryPlace = journey.previewPlaces[0] ?? journey.title;
  return getCoordinatesForPlace(primaryPlace, journey.title);
}

function getJourneyYear(createdAt: string): number {
  const parsedYear = new Date(createdAt).getFullYear();
  return Number.isFinite(parsedYear) ? parsedYear : new Date().getFullYear();
}

function generateYearLabelMarker(options: {
  isHovered: boolean;
  isSelected: boolean;
  year: number;
}): google.maps.Icon | undefined {
  if (typeof window === 'undefined' || !window.google?.maps) {
    return undefined;
  }

  const {
    isHovered,
    isSelected,
    year,
  } = options;
  const bgColor = isSelected ? '#1b1163' : isHovered ? '#221a72' : '#160E53';
  const borderColor = '#0f0a3a';
  const baseWidth = 52;
  const baseHeight = 28;
  const scale = isHovered ? 1.1 : 1;
  const width = baseWidth * scale;
  const height = baseHeight * scale;

  const svg = `
    <svg width="${width}" height="${height + 8}" viewBox="0 0 ${baseWidth} ${baseHeight + 8}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="year-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#241a7a"/>
          <stop offset="100%" stop-color="${bgColor}"/>
        </linearGradient>
        <filter id="year-shadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.2" flood-opacity="0.28"/>
        </filter>
      </defs>

      <g filter="url(#year-shadow)">
        <rect x="2" y="2" width="${baseWidth - 4}" height="${baseHeight - 4}" rx="12" ry="12" fill="url(#year-gradient)" stroke="${borderColor}" stroke-width="2"/>
        <rect x="4" y="4" width="${baseWidth - 8}" height="6" rx="6" ry="6" fill="rgba(255,255,255,0.18)"/>
        <text x="${baseWidth / 2}" y="${baseHeight / 2 + 1}" text-anchor="middle" dominant-baseline="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="13" font-weight="600">${year}</text>
        <path d="M ${baseWidth / 2 - 6} ${baseHeight - 2} L ${baseWidth / 2} ${baseHeight + 6} L ${baseWidth / 2 + 6} ${baseHeight - 2} Z" fill="${bgColor}" stroke="${borderColor}" stroke-width="2" stroke-linejoin="round"/>
        <rect x="${baseWidth / 2 - 7}" y="${baseHeight - 4}" width="14" height="4" fill="${bgColor}"/>
      </g>
    </svg>
  `;

  return {
    anchor: new window.google.maps.Point(width / 2, height + 8),
    scaledSize: new window.google.maps.Size(width, height + 8),
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
  };
}

export const ProfileMapPanel = (props: ProfileMapPanelProps) => {
  const {
    isLoading = false,
    isOwnProfile = true,
    journeys,
    ownerName,
  } = props;
  const contentPaddingClass = isOwnProfile ? 'pb-12' : 'px-4 pb-12 sm:px-6';
  const mapHeightClass = isOwnProfile ? 'h-[600px]' : 'h-[400px] sm:h-[500px] md:h-[600px]';
  const { hasApiKey, isLoaded, loadError } = useGoogleMapsLoader('profile-map-loader');

  const [hoveredLocationId, setHoveredLocationId] = useState<string | null>(null);
  const [isHoverMode, setIsHoverMode] = useState(false);
  const [selectedJourney, setSelectedJourney] = useState<ProfileJourney | null>(null);
  const [showJourneyCard, setShowJourneyCard] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mapLocations = useMemo<MapJourneyLocation[]>(() => {
    return journeys.map((journey) => {
      const coordinates = getJourneyMarkerCoordinates(journey);

      return {
        id: `journey-${journey.id}`,
        journey,
        lat: coordinates.lat,
        lng: coordinates.lng,
        year: getJourneyYear(journey.createdAt),
      };
    });
  }, [journeys]);

  const mapCenter = useMemo(() => {
    const firstLocation = mapLocations[0];
    if (!firstLocation) {
      return DEFAULT_MAP_CENTER;
    }

    return {
      lat: firstLocation.lat,
      lng: firstLocation.lng,
    };
  }, [mapLocations]);

  const selectedLocationId = useMemo(
    () => (selectedJourney ? `journey-${selectedJourney.id}` : null),
    [selectedJourney],
  );

  const mapOptions = useMemo<google.maps.MapOptions>(() => ({
    clickableIcons: false,
    disableDefaultUI: true,
    fullscreenControl: true,
    gestureHandling: 'greedy',
    mapTypeControl: false,
    maxZoom: 20,
    minZoom: 2,
    restriction: {
      latLngBounds: {
        east: 180,
        north: 85,
        south: -85,
        west: -180,
      },
      strictBounds: false,
    },
    streetViewControl: false,
    zoomControl: true,
  }), []);

  useEffect(() => {
    return () => {
      if (!hoverTimeoutRef.current) {
        return;
      }

      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    };
  }, []);

  const clearHoverTimeout = useCallback(() => {
    if (!hoverTimeoutRef.current) {
      return;
    }

    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = null;
  }, []);

  const handleJourneyClick = useCallback((journey: ProfileJourney) => {
    clearHoverTimeout();
    setIsHoverMode(false);
    setSelectedJourney(journey);
    setShowJourneyCard(true);
  }, [clearHoverTimeout]);

  const handleJourneyHover = useCallback((journey: ProfileJourney) => {
    clearHoverTimeout();
    setIsHoverMode(true);
    setSelectedJourney(journey);
    setShowJourneyCard(true);
  }, [clearHoverTimeout]);

  const handleJourneyHoverEnd = useCallback(() => {
    if (!isHoverMode) {
      return;
    }

    clearHoverTimeout();
    hoverTimeoutRef.current = setTimeout(() => {
      setShowJourneyCard(false);
      setSelectedJourney(null);
      setIsHoverMode(false);
      hoverTimeoutRef.current = null;
    }, 500);
  }, [clearHoverTimeout, isHoverMode]);

  const handleCloseJourneyCard = useCallback(() => {
    clearHoverTimeout();
    setShowJourneyCard(false);
    setSelectedJourney(null);
    setIsHoverMode(false);
  }, [clearHoverTimeout]);

  const handleCardMouseEnter = useCallback(() => {
    clearHoverTimeout();
  }, [clearHoverTimeout]);

  const handleCardMouseLeave = useCallback(() => {
    if (!isHoverMode) {
      return;
    }

    handleJourneyHoverEnd();
  }, [handleJourneyHoverEnd, isHoverMode]);

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    if (mapLocations.length === 0) {
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    mapLocations.forEach((location) => {
      bounds.extend({ lat: location.lat, lng: location.lng });
    });
    map.fitBounds(bounds);
    map.fitBounds(bounds, {
      bottom: 50,
      left: 50,
      right: 50,
      top: 50,
    });
  }, [mapLocations]);

  return (
    <div className={`flex w-full flex-col gap-4 ${contentPaddingClass}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-outfit text-2xl leading-[120%] font-medium text-black">
            {isOwnProfile ? 'My Travel Map' : `${ownerName}'s Travel Map`}
          </h2>
          <p className="mt-1 text-gray-600">
            {isOwnProfile
              ? 'Explore all your journeys on the map - each marker shows the year'
              : `Explore ${ownerName}'s journeys on the map`}
            {journeys.length > 0
              ? (
                  <span className="ml-2 text-sm">
                    (
                    {journeys.length}
                    {' '}
                    journey
                    {journeys.length !== 1 ? 's' : ''}
                    )
                  </span>
                )
              : null}
          </p>
        </div>
      </div>

      <div className={`relative w-full overflow-hidden rounded-lg bg-gray-50 shadow-sm ${mapHeightClass}`}>
        {isLoading
          ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
              </div>
            )
          : journeys.length === 0
            ? (
                <div className="flex h-full items-center justify-center">
                  <div className="p-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
                      <JourneyIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-gray-900">No journeys yet</h3>
                    <p className="text-gray-600">
                      {isOwnProfile
                        ? 'Start creating your first journey to see it on the map.'
                        : `${ownerName} hasn't created any journeys to display on the map.`}
                    </p>
                  </div>
                </div>
              )
            : (
                <div className="relative h-full w-full">
                  {!hasApiKey
                    ? (
                        <div className="flex h-full items-center justify-center bg-gray-100 px-4 text-center text-sm text-gray-600">
                          Google Maps key is missing. Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to `.env.local`.
                        </div>
                      )
                    : null}

                  {hasApiKey && !isLoaded && !loadError
                    ? (
                        <motion.div
                          className="flex h-full items-center justify-center bg-gray-100"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <motion.div
                            className="text-center"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                          >
                            <motion.div
                              className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.4, duration: 0.3, type: 'spring', stiffness: 200 }}
                            />
                            <motion.p
                              className="text-gray-500"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.6, duration: 0.4 }}
                            >
                              Loading map...
                            </motion.p>
                          </motion.div>
                        </motion.div>
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
                        <GoogleMap
                          center={mapCenter}
                          mapContainerStyle={DEFAULT_MAP_CONTAINER_STYLE}
                          onLoad={handleMapLoad}
                          options={mapOptions}
                          zoom={2}
                        >
                          {showJourneyCard && selectedJourney
                            ? (
                                <motion.div
                                  className={`absolute inset-0 z-50 flex items-center justify-center p-4 ${
                                    isHoverMode ? 'pointer-events-none' : 'bg-white/30 backdrop-blur-md'
                                  }`}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  onClick={isHoverMode ? undefined : handleCloseJourneyCard}
                                >
                                  <motion.div
                                    className="pointer-events-auto w-full max-w-md"
                                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                    transition={{ duration: 0.2 }}
                                    onClick={event => event.stopPropagation()}
                                    onMouseEnter={handleCardMouseEnter}
                                    onMouseLeave={handleCardMouseLeave}
                                  >
                                    <div className={isHoverMode ? 'rounded-xl shadow-2xl' : ''}>
                                      <ProfileMapOverlayCard
                                        journey={selectedJourney}
                                        ownerName={ownerName}
                                        onClose={handleCloseJourneyCard}
                                      />
                                    </div>
                                  </motion.div>
                                </motion.div>
                              )
                            : null}

                          {mapLocations.map((location) => {
                            const isSelected = selectedLocationId === location.id;
                            const isHovered = hoveredLocationId === location.id;
                            return (
                              <MarkerF
                                key={location.id}
                                icon={generateYearLabelMarker({
                                  isHovered,
                                  isSelected,
                                  year: location.year,
                                })}
                                onClick={() => handleJourneyClick(location.journey)}
                                onMouseOut={() => {
                                  setHoveredLocationId(null);
                                  handleJourneyHoverEnd();
                                }}
                                onMouseOver={() => {
                                  setHoveredLocationId(location.id);
                                  handleJourneyHover(location.journey);
                                }}
                                position={{ lat: location.lat, lng: location.lng }}
                                zIndex={isHovered ? 1000 : isSelected ? 999 : 1}
                              />
                            );
                          })}
                        </GoogleMap>
                      )
                    : null}
                </div>
              )}
      </div>
    </div>
  );
};
