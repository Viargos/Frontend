'use client';

import { useCallback, useState, useEffect, useMemo, type ReactNode } from 'react';
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
import { generateViargosMarker, generatePlaceMarker, generateYearLabelMarker } from '@/utils/map-markers';

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
  year?: number;
}

interface AllJourneysMapProps {
  journeys: Journey[];
  onJourneyClick: (journey: Journey) => void;
  onJourneyHover?: (journey: Journey) => void;
  onJourneyHoverEnd?: () => void;
  selectedJourney?: Journey | null;
  overlay?: ReactNode;
}

const containerStyle = {
  width: '100%',
  height: '100%',
  position: 'relative' as const,
};

const defaultCenter = {
  lat: 20.0,
  lng: 0.0,
};

// Static libraries array to prevent LoadScript reloading
const GOOGLE_MAPS_LIBRARIES: 'places'[] = ['places'];

// Mock coordinates for different cities/countries
const mockCoordinates: { [key: string]: { lat: number; lng: number } } = {
  // Middle East
  dubai: { lat: 25.2048, lng: 55.2708 },
  'abu dhabi': { lat: 24.4539, lng: 54.3773 },
  doha: { lat: 25.2854, lng: 51.5310 },
  riyadh: { lat: 24.7136, lng: 46.6753 },
  jeddah: { lat: 21.4858, lng: 39.1925 },
  muscat: { lat: 23.5880, lng: 58.3829 },
  manama: { lat: 26.2285, lng: 50.5860 },
  kuwait: { lat: 29.3759, lng: 47.9774 },
  
  // Europe
  paris: { lat: 48.8566, lng: 2.3522 },
  london: { lat: 51.5074, lng: -0.1278 },
  rome: { lat: 41.9028, lng: 12.4964 },
  barcelona: { lat: 41.3851, lng: 2.1734 },
  amsterdam: { lat: 52.3676, lng: 4.9041 },
  berlin: { lat: 52.5200, lng: 13.4050 },
  vienna: { lat: 48.2082, lng: 16.3738 },
  prague: { lat: 50.0755, lng: 14.4378 },
  zurich: { lat: 47.3769, lng: 8.5417 },
  madrid: { lat: 40.4168, lng: -3.7038 },
  lisbon: { lat: 38.7223, lng: -9.1393 },
  athens: { lat: 37.9838, lng: 23.7275 },
  istanbul: { lat: 41.0082, lng: 28.9784 },
  
  // North America
  'new york': { lat: 40.7128, lng: -74.006 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  'san francisco': { lat: 37.7749, lng: -122.4194 },
  chicago: { lat: 41.8781, lng: -87.6298 },
  miami: { lat: 25.7617, lng: -80.1918 },
  'las vegas': { lat: 36.1699, lng: -115.1398 },
  montreal: { lat: 45.5017, lng: -73.5673 },
  toronto: { lat: 43.6532, lng: -79.3832 },
  vancouver: { lat: 49.2827, lng: -123.1207 },
  calgary: { lat: 51.0447, lng: -114.0719 },
  mexico: { lat: 19.4326, lng: -99.1332 },
  cancun: { lat: 21.1619, lng: -86.8515 },
  
  // Asia
  tokyo: { lat: 35.6762, lng: 139.6503 },
  kyoto: { lat: 35.0116, lng: 135.7681 },
  osaka: { lat: 34.6937, lng: 135.5023 },
  seoul: { lat: 37.5665, lng: 126.9780 },
  beijing: { lat: 39.9042, lng: 116.4074 },
  shanghai: { lat: 31.2304, lng: 121.4737 },
  'hong kong': { lat: 22.3193, lng: 114.1694 },
  singapore: { lat: 1.3521, lng: 103.8198 },
  bangkok: { lat: 13.7563, lng: 100.5018 },
  'kuala lumpur': { lat: 3.1390, lng: 101.6869 },
  bali: { lat: -8.3405, lng: 115.0920 },
  jakarta: { lat: -6.2088, lng: 106.8456 },
  hanoi: { lat: 21.0285, lng: 105.8542 },
  'ho chi minh': { lat: 10.8231, lng: 106.6297 },
  taipei: { lat: 25.0330, lng: 121.5654 },
  manila: { lat: 14.5995, lng: 120.9842 },
  
  // India
  delhi: { lat: 28.6139, lng: 77.209 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  pune: { lat: 18.5204, lng: 73.8567 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  goa: { lat: 15.2993, lng: 74.1240 },
  agra: { lat: 27.1767, lng: 78.0081 },
  varanasi: { lat: 25.3176, lng: 82.9739 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  kerala: { lat: 10.8505, lng: 76.2711 },
  
  // Australia & Oceania
  sydney: { lat: -33.8688, lng: 151.2093 },
  melbourne: { lat: -37.8136, lng: 144.9631 },
  brisbane: { lat: -27.4698, lng: 153.0251 },
  perth: { lat: -31.9505, lng: 115.8605 },
  auckland: { lat: -36.8509, lng: 174.7645 },
  queenstown: { lat: -45.0312, lng: 168.6626 },
  fiji: { lat: -17.7134, lng: 178.0650 },
  
  // Africa
  cairo: { lat: 30.0444, lng: 31.2357 },
  cape: { lat: -33.9249, lng: 18.4241 },
  'cape town': { lat: -33.9249, lng: 18.4241 },
  johannesburg: { lat: -26.2041, lng: 28.0473 },
  marrakech: { lat: 31.6295, lng: -7.9811 },
  nairobi: { lat: -1.2921, lng: 36.8219 },
  
  // South America
  'rio de janeiro': { lat: -22.9068, lng: -43.1729 },
  rio: { lat: -22.9068, lng: -43.1729 },
  'sao paulo': { lat: -23.5505, lng: -46.6333 },
  'buenos aires': { lat: -34.6037, lng: -58.3816 },
  lima: { lat: -12.0464, lng: -77.0428 },
  bogota: { lat: 4.7110, lng: -74.0721 },
  santiago: { lat: -33.4489, lng: -70.6693 },
  
  // Maldives & Islands
  maldives: { lat: 3.2028, lng: 73.2207 },
  male: { lat: 4.1755, lng: 73.5093 },
  mauritius: { lat: -20.3484, lng: 57.5522 },
  seychelles: { lat: -4.6796, lng: 55.4920 },
  phuket: { lat: 7.9519, lng: 98.3381 },
  hawaii: { lat: 19.8968, lng: -155.5828 },
  
  // Caribbean
  jamaica: { lat: 18.1096, lng: -77.2975 },
  bahamas: { lat: 25.0343, lng: -77.3963 },
  barbados: { lat: 13.1939, lng: -59.5432 },
  'dominican republic': { lat: 18.7357, lng: -70.1627 },
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
  const searchTerm = placeName.toLowerCase().trim();
  const journeyTitleLower = journeyTitle.toLowerCase().trim();

  // First, try to match exact place name
  if (mockCoordinates[searchTerm]) {
    console.log(`  🎯 Exact match for place "${placeName}":`, mockCoordinates[searchTerm]);
    return mockCoordinates[searchTerm];
  }

  // Try to find a city name contained in the place name
  for (const [city, coords] of Object.entries(mockCoordinates)) {
    if (searchTerm.includes(city)) {
      console.log(`  🎯 Place "${placeName}" contains city "${city}":`, coords);
      return coords;
    }
  }

  // Try to find a match in journey title (this is the most reliable for RecentJourneys)
  for (const [city, coords] of Object.entries(mockCoordinates)) {
    if (journeyTitleLower.includes(city)) {
      console.log(`  🎯 Journey title "${journeyTitle}" contains city "${city}":`, coords);
      return coords;
    }
  }

  // Try word-by-word matching for multi-word place names
  const placeWords = searchTerm.split(/[\s,\-]+/).filter(w => w.length > 2);
  const titleWords = journeyTitleLower.split(/[\s,\-]+/).filter(w => w.length > 2);
  const allWords = [...placeWords, ...titleWords];

  for (const word of allWords) {
    if (mockCoordinates[word]) {
      console.log(`  🎯 Word "${word}" matched city:`, mockCoordinates[word]);
      return mockCoordinates[word];
    }
    // Also check if the word is contained in any city name
    for (const [city, coords] of Object.entries(mockCoordinates)) {
      if (city.includes(word) || word.includes(city)) {
        console.log(`  🎯 Word "${word}" partially matched city "${city}":`, coords);
        return coords;
      }
    }
  }

  // Last resort: Use a hash-based selection but prefer popular destinations
  // This ensures consistent placement for the same journey
  const popularDestinations = ['paris', 'london', 'tokyo', 'new york', 'dubai', 'singapore'];
  const hashCode = (journeyTitle + placeName).split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const selectedCity = popularDestinations[Math.abs(hashCode) % popularDestinations.length];
  const baseCoords = mockCoordinates[selectedCity];

  console.log(`  ⚠️ No match found for "${placeName}" / "${journeyTitle}", using hash-based fallback:`, selectedCity, baseCoords);

  // Add small offset to avoid overlapping markers (deterministic based on hash)
  const offset = (Math.abs(hashCode) % 100) / 10000;
  return {
    lat: baseCoords.lat + offset,
    lng: baseCoords.lng + offset,
  };
};

export default function AllJourneysMap({
  journeys,
  onJourneyClick,
  onJourneyHover,
  onJourneyHoverEnd,
  selectedJourney,
  overlay,
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
        // Extract year from journey's createdAt
        const journeyYear = journey.createdAt 
          ? new Date(journey.createdAt).getFullYear() 
          : new Date().getFullYear();
        
        locations.push({
          id: `journey-${journey.id}`,
          name: journey.title,
          lat: journeyCoords.lat,
          lng: journeyCoords.lng,
          type: 'journeyStart',
          journey: journey,
          isJourneyStart: true,
          year: journeyYear,
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

  const handleMapClick = useCallback(() => {
    // Close the info window when clicking on the map
    setSelectedLocation(null);
  }, []);

  const getMarkerIcon = (
    type: string,
    isSelected: boolean = false,
    location?: MapLocation,
    isHovered: boolean = false
  ) => {
    // For journey start markers, use year label marker (like Google Hotels price labels)
    if (type === 'journeyStart' && location?.year) {
      return generateYearLabelMarker({
        year: location.year,
        isSelected,
        isHovered,
      });
    }

    // For stay types, detect if it's hotel or rental
    let stayColor = '#1e40af'; // Default deep blue for stays
    if (type === 'stay' && location?.place) {
      const accommodationType = detectAccommodationType(
        location.place.name,
        location.place.description
      );
      stayColor = getAccommodationColor(accommodationType);
    }

    // Brand color themed markers - using #160E53 as primary
    const colors = {
      journeyStart: '#160E53', // Brand navy blue for journey start
      stay: stayColor,         // Varies: Hotel (deep blue) or Rental (teal)
      activity: '#160E53',     // Brand blue (activities)
      food: '#160E53',         // Brand blue (food)
      transport: '#160E53',    // Brand blue (transport)
      note: '#160E53',         // Brand blue (notes)
    };

    const markerColor = colors[type as keyof typeof colors] || '#160E53';
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
      onClick={handleMapClick}
      options={{
        ...viargoMapOptions,
        fullscreenControl: true, // Override for this specific map
        disableDefaultUI: true,  // Override for this specific map
      }}
    >
      {overlay && <div className="absolute inset-0 z-50">{overlay}</div>}

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
            icon={getMarkerIcon(location.type, isSelected, location, isHovered) || undefined}
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
