'use client';

import { useCallback, useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
  Polyline,
} from '@react-google-maps/api';
import { Journey, JourneyPlace } from '@/types/journey.types';

interface MapLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  address?: string;
  journey: Journey;
  place?: JourneyPlace;
  isJourneyStart?: boolean;
}

interface AllJourneysMapProps {
  journeys: Journey[];
  onJourneyClick: (journey: Journey) => void;
  selectedJourney?: Journey | null;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 20.0,
  lng: 0.0,
};

// Static libraries array to prevent LoadScript reloading
const GOOGLE_MAPS_LIBRARIES: 'places'[] = ['places'];

// Mock coordinates for different cities/countries
const mockCoordinates: { [key: string]: { lat: number; lng: number } } = {
  paris: { lat: 48.8566, lng: 2.3522 },
  london: { lat: 51.5074, lng: -0.1278 },
  'new york': { lat: 40.7128, lng: -74.006 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
  delhi: { lat: 28.6139, lng: 77.209 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  pune: { lat: 18.5204, lng: 73.8567 },
  // Add more cities as needed
};

// Helper function to validate coordinates
const isValidCoordinate = (
  lat: number | null | undefined,
  lng: number | null | undefined
): boolean => {
  return (
    lat !== null &&
    lat !== undefined &&
    lng !== null &&
    lng !== undefined &&
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat !== 0 &&
    lng !== 0 &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

// Function to get coordinates for a place name
const getCoordinatesForPlace = (
  placeName: string,
  journeyTitle: string
): { lat: number; lng: number } => {
  const searchTerm = placeName.toLowerCase();

  // First, try to match exact place name
  if (mockCoordinates[searchTerm]) {
    return mockCoordinates[searchTerm];
  }

  // Try to find a match in journey title
  const journeyTitleLower = journeyTitle.toLowerCase();
  for (const [city, coords] of Object.entries(mockCoordinates)) {
    if (journeyTitleLower.includes(city) || searchTerm.includes(city)) {
      return coords;
    }
  }

  // Default to a location with some randomness based on journey
  const baseIndex =
    Math.abs(placeName.length + journeyTitle.length) %
    Object.keys(mockCoordinates).length;
  const cities = Object.keys(mockCoordinates);
  const selectedCity = cities[baseIndex];
  const baseCoords = mockCoordinates[selectedCity];

  // Add small random offset to avoid overlapping markers
  return {
    lat: baseCoords.lat + (Math.random() - 0.5) * 0.01,
    lng: baseCoords.lng + (Math.random() - 0.5) * 0.01,
  };
};

export default function AllJourneysMap({
  journeys,
  onJourneyClick,
  selectedJourney,
}: AllJourneysMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(
    null
  );
  const [mapLocations, setMapLocations] = useState<MapLocation[]>([]);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // Convert journeys to map locations
  useEffect(() => {
    const locations: MapLocation[] = [];

    journeys.forEach(journey => {
      // Add journey start marker (based on first place or journey title)
      let journeyCoords = { lat: 0, lng: 0 };

      if (journey.days && journey.days.length > 0) {
        const firstDay = journey.days[0];
        if (firstDay.places && firstDay.places.length > 0) {
          const firstPlace = firstDay.places[0];

          // Use real coordinates if available and valid
          if (isValidCoordinate(firstPlace.latitude, firstPlace.longitude)) {
            journeyCoords = {
              lat: firstPlace.latitude!,
              lng: firstPlace.longitude!,
            };
          } else {
            // Fallback to mock coordinates
            journeyCoords = getCoordinatesForPlace(
              firstPlace.name,
              journey.title
            );
          }
        } else {
          journeyCoords = getCoordinatesForPlace(journey.title, journey.title);
        }
      } else {
        journeyCoords = getCoordinatesForPlace(journey.title, journey.title);
      }

      // Only add journey marker if we have valid coordinates
      if (isValidCoordinate(journeyCoords.lat, journeyCoords.lng)) {
        locations.push({
          id: `journey-${journey.id}`,
          name: journey.title,
          lat: journeyCoords.lat,
          lng: journeyCoords.lng,
          type: 'journeyStart',
          journey: journey,
          isJourneyStart: true,
        });
      }

      // Add individual places if journey is selected
      if (
        selectedJourney &&
        selectedJourney.id === journey.id &&
        journey.days
      ) {
        journey.days.forEach(day => {
          if (day.places) {
            day.places.forEach(place => {
              let coords = { lat: 0, lng: 0 };

              // Use real coordinates if available and valid
              if (isValidCoordinate(place.latitude, place.longitude)) {
                coords = {
                  lat: place.latitude!,
                  lng: place.longitude!,
                };
              } else {
                // Fallback to mock coordinates
                coords = getCoordinatesForPlace(place.name, journey.title);
              }

              // Only add place marker if we have valid coordinates
              if (isValidCoordinate(coords.lat, coords.lng)) {
                locations.push({
                  id: `${journey.id}-${day.id}-${place.id}`,
                  name: place.name,
                  lat: coords.lat,
                  lng: coords.lng,
                  type: place.type.toLowerCase(),
                  journey: journey,
                  place: place,
                });
              }
            });
          }
        });
      }
    });

    console.log(
      'AllJourneysMap: Generated locations',
      locations.length,
      locations
    );
    setMapLocations(locations);
  }, [journeys, selectedJourney]);

  // Group locations by journey for polylines
  const pathsByJourney = useMemo(() => {
    const paths: { [journeyId: string]: { lat: number; lng: number }[] } = {};

    if (selectedJourney && selectedJourney.days) {
      const journeyLocations = mapLocations.filter(
        loc => loc.journey.id === selectedJourney.id && !loc.isJourneyStart
      );

      if (journeyLocations.length > 1) {
        // Sort by day and place order
        const sortedLocations = journeyLocations.sort((a, b) => {
          const dayA = parseInt(a.id.split('-')[2] || '0');
          const dayB = parseInt(b.id.split('-')[2] || '0');
          if (dayA !== dayB) return dayA - dayB;

          const placeA = parseInt(a.id.split('-')[3] || '0');
          const placeB = parseInt(b.id.split('-')[3] || '0');
          return placeA - placeB;
        });

        paths[selectedJourney.id] = sortedLocations.map(loc => ({
          lat: loc.lat,
          lng: loc.lng,
        }));
      }
    }

    return paths;
  }, [mapLocations, selectedJourney]);

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      if (mapLocations.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        mapLocations.forEach(location => {
          bounds.extend({ lat: location.lat, lng: location.lng });
        });
        map.fitBounds(bounds);

        // Add padding to the bounds for better visibility
        const padding = {
          top: 50,
          right: 50,
          bottom: 50,
          left: 50,
        };
        map.fitBounds(bounds, padding);
      }
    },
    [mapLocations]
  );

  const onUnmount = useCallback(() => {
    // Cleanup if needed
  }, []);

  const handleMarkerClick = useCallback(
    (location: MapLocation) => {
      if (location.isJourneyStart) {
        onJourneyClick(location.journey);
      } else {
        setSelectedLocation(location);
      }
    },
    [onJourneyClick]
  );

  const getMarkerIcon = (type: string, isSelected: boolean = false) => {
    const colors = {
      journeyStart: '#FF6B35', // Orange for journey start
      stay: '#4ECDC4', // Teal
      activity: '#45B7D1', // Blue
      food: '#96CEB4', // Green
      transport: '#6B66FF', // Purple
      note: '#FF6B6B', // Red
    };

    const markerColor = colors[type as keyof typeof colors] || '#001a6e';
    const markerSize = type === 'journeyStart' ? 32 : 24;
    const strokeWidth = isSelected ? 3 : 2;
    const strokeColor = isSelected ? '#000000' : '#ffffff';

    if (type === 'journeyStart') {
      return {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg width="${markerSize}" height="${markerSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            ${
              isSelected
                ? '<circle cx="12" cy="12" r="11" fill="' +
                  markerColor +
                  '" opacity="0.3"><animate attributeName="r" values="11;15;11" dur="1s" repeatCount="indefinite"/></circle>'
                : ''
            }
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="${markerColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
            <circle cx="12" cy="9" r="2" fill="white"/>
            <text x="12" y="20" text-anchor="middle" fill="${markerColor}" font-size="8" font-weight="bold">J</text>
          </svg>
        `)}`,
        scaledSize: window.google?.maps?.Size
          ? new window.google.maps.Size(markerSize, markerSize)
          : undefined,
        anchor: window.google?.maps?.Point
          ? new window.google.maps.Point(markerSize / 2, markerSize)
          : undefined,
      };
    }

    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="${markerSize}" height="${markerSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="${markerColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
          <circle cx="12" cy="12" r="4" fill="white"/>
        </svg>
      `)}`,
      scaledSize: window.google?.maps?.Size
        ? new window.google.maps.Size(markerSize, markerSize)
        : undefined,
    };
  };

  if (!isLoaded) {
    return (
      <motion.div
        className="h-full flex items-center justify-center bg-gray-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 0.3,
              delay: 0.4,
              type: 'spring',
              stiffness: 200,
            }}
          ></motion.div>
          <motion.p
            className="text-gray-500"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            Loading map...
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  // Journey colors for polylines
  const journeyColors = ['#FF6B35', '#45B7D1', '#4ECDC4', '#96CEB4', '#FF6B6B'];

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={3}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        // Optimize map rendering and data usage
        gestureHandling: 'cooperative',
        disableDefaultUI: false,
        clickableIcons: false, // Reduces unnecessary POI data
        restriction: {
          // Optional: restrict to specific region to reduce data
          latLngBounds: {
            north: 85,
            south: -85,
            west: -180,
            east: 180,
          },
        },
      }}
    >
      {/* Draw polylines for selected journey */}
      {Object.entries(pathsByJourney).map(([journeyId, path], index) => {
        if (path.length < 2) return null;

        const color = journeyColors[index % journeyColors.length];

        return (
          <Polyline
            key={`journey-path-${journeyId}`}
            path={path}
            options={{
              strokeColor: color,
              strokeOpacity: 0.8,
              strokeWeight: 4,
              geodesic: true,
              icons: window.google?.maps?.SymbolPath
                ? [
                    {
                      icon: {
                        path: window.google.maps.SymbolPath
                          .FORWARD_CLOSED_ARROW,
                        scale: 3,
                        strokeColor: '#FFFFFF',
                        strokeWeight: 2,
                      },
                      offset: '50%',
                      repeat: '100px',
                    },
                  ]
                : undefined,
            }}
          />
        );
      })}

      {/* Render map markers */}
      {mapLocations.map(location => {
        const isSelected =
          selectedJourney?.id === location.journey.id &&
          location.isJourneyStart;
        return (
          <Marker
            key={location.id}
            position={{ lat: location.lat, lng: location.lng }}
            icon={getMarkerIcon(location.type, isSelected)}
            onClick={() => handleMarkerClick(location)}
          />
        );
      })}

      {/* Info window for place details */}
      {selectedLocation && !selectedLocation.isJourneyStart && (
        <InfoWindow
          position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
          onCloseClick={() => setSelectedLocation(null)}
        >
          <div className="p-2 min-w-[200px]">
            <div className="flex items-start gap-2 mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {selectedLocation.name}
                </h3>
                <p className="text-xs text-blue-600 font-medium">
                  {selectedLocation.journey.title}
                </p>
              </div>
            </div>

            <div className="border-t pt-2 mt-2 space-y-1">
              <div className="text-xs text-gray-600">
                <strong>Type:</strong>{' '}
                <span className="capitalize">
                  {selectedLocation.type.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
              {selectedLocation.place?.description && (
                <div className="text-xs text-gray-600 mt-1">
                  <strong>Description:</strong>{' '}
                  {selectedLocation.place.description}
                </div>
              )}
              {selectedLocation.place?.startTime &&
                selectedLocation.place?.endTime && (
                  <div className="text-xs text-gray-600">
                    <strong>Time:</strong> {selectedLocation.place.startTime} -{' '}
                    {selectedLocation.place.endTime}
                  </div>
                )}
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
