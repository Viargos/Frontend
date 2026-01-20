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
import { viargoMapOptions } from '@/constants/map-styles';
import { detectAccommodationType, getAccommodationColor } from '@/utils/accommodation-detector';
import { generateViargosMarker, generatePlaceMarker } from '@/utils/map-markers';

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
  onJourneyHover?: (journey: Journey) => void;
  onJourneyHoverEnd?: () => void;
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
  montreal: { lat: 45.5017, lng: -73.5673 },
  toronto: { lat: 43.6532, lng: -79.3832 },
  vancouver: { lat: 49.2827, lng: -123.1207 },
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

// Helper function to parse coordinate (handles string or number from DB)
const parseCoordinate = (value: number | string | null | undefined): number | null => {
  if (value === null || value === undefined) return null;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? null : num;
};

// Helper function to validate coordinates
const isValidCoordinate = (
  lat: number | string | null | undefined,
  lng: number | string | null | undefined
): boolean => {
  const parsedLat = parseCoordinate(lat);
  const parsedLng = parseCoordinate(lng);
  
  return (
    parsedLat !== null &&
    parsedLng !== null &&
    parsedLat >= -90 &&
    parsedLat <= 90 &&
    parsedLng >= -180 &&
    parsedLng <= 180
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
  onJourneyHover,
  onJourneyHoverEnd,
  selectedJourney,
}: AllJourneysMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(
    null
  );
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
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

      console.log(`🗺️ Processing journey: "${journey.title}"`);

      if (journey.days && journey.days.length > 0) {
        const firstDay = journey.days[0];
        if (firstDay.places && firstDay.places.length > 0) {
          const firstPlace = firstDay.places[0];

          console.log(
            `  First place: "${firstPlace.name}"`,
            `lat: ${firstPlace.latitude}, lng: ${firstPlace.longitude}`
          );
          console.log(
            `  Is valid? ${isValidCoordinate(
              firstPlace.latitude,
              firstPlace.longitude
            )}`
          );

          // Use real coordinates if available and valid
          if (isValidCoordinate(firstPlace.latitude, firstPlace.longitude)) {
            journeyCoords = {
              lat: parseCoordinate(firstPlace.latitude)!,
              lng: parseCoordinate(firstPlace.longitude)!,
            };
            console.log('  ✅ Using real coordinates:', journeyCoords);
          } else {
            // Fallback to mock coordinates
            journeyCoords = getCoordinatesForPlace(
              firstPlace.name,
              journey.title
            );
            console.log('  ⚠️ Using mock coordinates:', journeyCoords);
          }
        } else {
          journeyCoords = getCoordinatesForPlace(journey.title, journey.title);
          console.log(
            '  📍 No places, using title-based coordinates:',
            journeyCoords
          );
        }
      } else {
        journeyCoords = getCoordinatesForPlace(journey.title, journey.title);
        console.log(
          '  📍 No days, using title-based coordinates:',
          journeyCoords
        );
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
        console.log(
          `  📌 Journey selected, adding ${journey.days.length} days of places`
        );
        journey.days.forEach((day, dayIndex) => {
          if (day.places) {
            console.log(`    Day ${dayIndex + 1}: ${day.places.length} places`);
            day.places.forEach((place, placeIndex) => {
              let coords = { lat: 0, lng: 0 };

              console.log(
                `      Place ${placeIndex + 1}: "${place.name}"`,
                `lat: ${place.latitude}, lng: ${place.longitude}`
              );

              // Use real coordinates if available and valid
              if (isValidCoordinate(place.latitude, place.longitude)) {
                coords = {
                  lat: parseCoordinate(place.latitude)!,
                  lng: parseCoordinate(place.longitude)!,
                };
                console.log('      ✅ Using real coordinates:', coords);
              } else {
                // Fallback to mock coordinates
                coords = getCoordinatesForPlace(place.name, journey.title);
                console.log('      ⚠️ Using mock coordinates:', coords);
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
                console.log('      ✅ Place marker added');
              } else {
                console.log(
                  '      ❌ Invalid coordinates, place marker NOT added'
                );
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

  const getMarkerIcon = (
    type: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isSelected: boolean = false,
    location?: MapLocation,
    isHovered: boolean = false
  ) => {
    // For stay types, detect if it's hotel or rental
    let stayColor = '#1e40af'; // Default deep blue for stays
    if (type === 'stay' && location?.place) {
      const accommodationType = detectAccommodationType(
        location.place.name,
        location.place.description
      );
      stayColor = getAccommodationColor(accommodationType);
    }

    // Brand color themed markers - using #001A6E as primary
    const colors = {
      journeyStart: '#001A6E', // Brand navy blue for journey start
      stay: stayColor,         // Varies: Hotel (deep blue) or Rental (teal)
      activity: '#001A6E',     // Brand blue (activities)
      food: '#001A6E',         // Brand blue (food)
      transport: '#001A6E',    // Brand blue (transport)
      note: '#001A6E',         // Brand blue (notes)
    };

    const markerColor = colors[type as keyof typeof colors] || '#001A6E';
    const baseSize = type === 'journeyStart' ? 36 : 30;

    if (type === 'journeyStart') {
      return generateViargosMarker({
        size: baseSize,
        color: markerColor,
        isHovered,
      });
    }

    // Regular place markers
    return generatePlaceMarker({
      size: baseSize,
      isHovered,
    });
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

  // Blue-themed journey colors for polylines
  const journeyColors = ['#001a6e', '#1e40af', '#2563eb', '#3b82f6', '#0ea5e9', '#06b6d4', '#0891b2'];

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={1}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        ...viargoMapOptions,
        fullscreenControl: true, // Override for this specific map
        disableDefaultUI: true,  // Override for this specific map
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
        const isHovered = hoveredLocation === location.id;
        return (
          <Marker
            key={location.id}
            position={{ lat: location.lat, lng: location.lng }}
            icon={getMarkerIcon(location.type, isSelected, location, isHovered)}
            onClick={() => handleMarkerClick(location)}
            onMouseOver={() => {
              setHoveredLocation(location.id);
              // Show journey card on hover for journey start markers
              if (location.isJourneyStart && onJourneyHover) {
                onJourneyHover(location.journey);
              }
            }}
            onMouseOut={() => {
              setHoveredLocation(null);
              // Hide journey card when hover ends
              if (location.isJourneyStart && onJourneyHoverEnd) {
                onJourneyHoverEnd();
              }
            }}
            zIndex={isHovered ? 1000 : isSelected ? 999 : 1}
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
