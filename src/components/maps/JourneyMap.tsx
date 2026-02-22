'use client';

import { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
  Polyline,
} from '@react-google-maps/api';
import { viargoMapOptions } from '@/constants/map-styles';
import { generateViargosPinMarker } from '@/utils/map-markers';
import { WarningIcon } from '@/components/icons';

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  address?: string;
  day?: string; // Add day property to identify which day the location belongs to
  description?: string; // For accommodation type detection
  photos?: string[]; // Photos for the location
}

interface JourneyMapProps {
  locations: Location[];
  center?: { lat: number; lng: number };
  onLocationClick?: (location: Location) => void;
  onMapClick?: (event: google.maps.MapMouseEvent) => void;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 17.385, // Hyderabad coordinates
  lng: 78.4867,
};

// Static libraries array to prevent LoadScript reloading
const GOOGLE_MAPS_LIBRARIES: 'places'[] = ['places'];

export default function JourneyMap({
  locations,
  center = defaultCenter,
  onLocationClick,
  onMapClick,
}: JourneyMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [animatedPaths, setAnimatedPaths] = useState<{
    [key: string]: { path: { lat: number; lng: number }[]; progress: number };
  }>({});
  const prevLocationsRef = useRef<Location[]>([]);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  if (loadError) {
    console.error('Google Maps load error:', loadError);
  }

  // Group locations by day for drawing polylines - use useMemo to prevent infinite loops
  const pathsByDay = useMemo(() => {
    const paths: { [key: string]: { lat: number; lng: number }[] } = {};

    // First group locations by day
    const locationsByDay: { [key: string]: Location[] } = {};

    locations.forEach(location => {
      const day = location.day || 'unknown';
      if (!locationsByDay[day]) {
        locationsByDay[day] = [];
      }
      locationsByDay[day].push(location);
    });

    // For each day, create a path using the array order (already correct after drag-and-drop)
    Object.entries(locationsByDay).forEach(([day, dayLocations]) => {
      // Use dayLocations directly - no sorting needed
      // The parent component already provides locations in the correct order
      console.log('🗺️ Creating path for', day, ':', dayLocations.map(l => ({
        id: l.id,
        name: l.name,
        lat: l.lat,
        lng: l.lng
      })));

      paths[day] = dayLocations.map(loc => ({
        lat: loc.lat,
        lng: loc.lng,
      }));
    });

    return paths;
  }, [locations]);

  // Helper function to get paths by day from location array - moved to top level
  const getPathsByDayFromLocations = useCallback((locs: Location[]) => {
    const paths: { [key: string]: { lat: number; lng: number }[] } = {};
    const locationsByDay: { [key: string]: Location[] } = {};

    locs.forEach(location => {
      const day = location.day || 'unknown';
      if (!locationsByDay[day]) {
        locationsByDay[day] = [];
      }
      locationsByDay[day].push(location);
    });

    Object.entries(locationsByDay).forEach(([day, dayLocations]) => {
      // Use dayLocations directly - respect the order from parent component
      paths[day] = dayLocations.map(loc => ({
        lat: loc.lat,
        lng: loc.lng,
      }));
    });

    return paths;
  }, []);

  // Detect new points and trigger line drawing animation - always called
  useEffect(() => {
    if (!locations.length) {
      setAnimatedPaths({}); // Clear all animated paths
      prevLocationsRef.current = [];
      return;
    }

    // Find newly added locations by comparing with previous locations
    const prevLocationIds = new Set(
      prevLocationsRef.current.map(loc => loc.id)
    );
    const newLocationIds = locations
      .filter(loc => !prevLocationIds.has(loc.id))
      .map(loc => loc.id);

    // Find removed locations
    const currentLocationIds = new Set(locations.map(loc => loc.id));
    const removedLocationIds = prevLocationsRef.current
      .filter(loc => !currentLocationIds.has(loc.id))
      .map(loc => loc.id);

    // Clean up animated paths for days that no longer have enough points
    if (removedLocationIds.length > 0) {
      console.log('🗑️ Locations removed:', removedLocationIds);
      const currentPathsByDay = pathsByDay;
      
      setAnimatedPaths(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(day => {
          const currentPath = currentPathsByDay[day];
          // Remove animation if path doesn't exist or has less than 2 points
          if (!currentPath || currentPath.length < 2) {
            console.log('🗑️ Removing animated path for', day);
            delete updated[day];
          }
        });
        return updated;
      });
    }

    if (newLocationIds.length > 0) {
      // Only trigger path animation for new points
      const prevLocationsByDay = getPathsByDayFromLocations(
        prevLocationsRef.current
      );
      const currentPathsByDay = pathsByDay;

      // Check for new points or paths for each day
      Object.entries(currentPathsByDay).forEach(([day, currentPath]) => {
        const prevPath = prevLocationsByDay[day] || [];

        // If the path now has more points than before, it's a new point
        if (currentPath.length > prevPath.length) {
          // Start animation for this path
          setAnimatedPaths(prev => ({
            ...prev,
            [day]: {
              path: currentPath,
              progress: 0,
            },
          }));
        }
      });
    }

    // Update previous locations ref
    prevLocationsRef.current = [...locations];
  }, [locations, pathsByDay, getPathsByDayFromLocations]); // Added dependencies back

  // Animation progress effect - always called
  useEffect(() => {
    // Skip if there are no animated paths
    if (Object.keys(animatedPaths).length === 0) return;

    const animationInterval = setInterval(() => {
      setAnimatedPaths(prev => {
        const updated = { ...prev };
        let allComplete = true;

        Object.entries(updated).forEach(([day, pathData]) => {
          if (pathData.progress < 1) {
            updated[day] = {
              ...pathData,
              progress: Math.min(pathData.progress + 0.05, 1), // Increment by 5% each frame
            };
            allComplete = false;
          }
        });

        // If all animations are complete, return empty object to stop the interval
        return allComplete ? {} : updated;
      });
    }, 50); // Update every 50ms for a smooth animation

    return () => clearInterval(animationInterval);
  }, [animatedPaths]);

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      if (
        locations &&
        locations.length > 0 &&
        window.google &&
        window.google.maps
      ) {
        try {
          const bounds = new window.google.maps.LatLngBounds();
          locations.forEach(location => {
            if (
              location &&
              typeof location.lat === 'number' &&
              typeof location.lng === 'number'
            ) {
              bounds.extend({ lat: location.lat, lng: location.lng });
            }
          });

          // Only fit bounds if we have valid bounds
          if (!bounds.isEmpty()) {
            map.fitBounds(bounds);

            // Add some padding to the bounds for better visibility
            const padding = {
              top: 50,
              right: 50,
              bottom: 50,
              left: 50,
            };
            map.fitBounds(bounds, padding);
          }
        } catch (error) {
          console.error('Error setting map bounds:', error);
        }
      }
    },
    [locations]
  );

  const onUnmount = useCallback(() => {
    // Cleanup if needed
  }, []);

  const handleMarkerClick = useCallback(
    (location: Location) => {
      setSelectedLocation(location);
      onLocationClick?.(location);
    },
    [onLocationClick]
  );

  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      // Close the info window when clicking on the map
      setSelectedLocation(null);
      // Call the parent's onMapClick handler if provided
      onMapClick?.(event);
    },
    [onMapClick]
  );

  const getMarkerIcon = useCallback(() => {
    if (!isLoaded) {
      return undefined;
    }
    return generateViargosPinMarker({ size: 44, color: '#160e53' }) || undefined;
  }, [isLoaded]);

  if (loadError) {
    return (
      <motion.div
        className="h-full flex items-center justify-center bg-red-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <WarningIcon className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-red-800 mb-2">Map Error</h3>
          <p className="text-red-600 text-sm mb-4">
            Google Maps failed to load. Please check your API key configuration.
          </p>
          <p className="text-xs text-red-500">
            {loadError.message || 'Invalid API key or insufficient permissions'}
          </p>
        </div>
      </motion.div>
    );
  }

  if (!isLoaded || !window.google?.maps) {
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

  // Generate blue-themed colors for each day's path
  const dayColors = {
    'Day 1': '#001a6e', // Primary blue (blue-600)
    'Day 2': '#1e40af', // Deep blue
    'Day 3': '#2563eb', // Bright blue
    'Day 4': '#3b82f6', // Sky blue
    'Day 5': '#0ea5e9', // Cyan blue
    'Day 6': '#06b6d4', // Teal blue
    'Day 7': '#0891b2', // Darker teal
    unknown: '#4a5574', // Blue-gray for unknown day
  };

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={handleMapClick}
      options={viargoMapOptions}
    >
      {/* Draw polylines connecting points for each day */}
      {Object.entries(pathsByDay).map(([day, path]) => {
        if (path.length < 2) return null; // Need at least 2 points to draw a line

        // Check if we have an animated path for this day
        const animatedPath = animatedPaths[day];

        if (animatedPath) {
          // Calculate how much of the path to draw based on animation progress
          const numPoints = path.length;
          const animatedPathLength = Math.max(
            2,
            Math.ceil(1 + (numPoints - 1) * animatedPath.progress)
          );
          const visiblePath = path.slice(0, animatedPathLength);

          return (
            <Polyline
              key={`animated-path-${day}`}
              path={visiblePath}
              options={{
                strokeColor:
                  dayColors[day as keyof typeof dayColors] || '#888888',
                strokeOpacity: 0.8,
                strokeWeight: 4,
                geodesic: true,
                icons: [
                  {
                    icon: {
                      path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                      scale: 3,
                      strokeColor: '#FFFFFF',
                      strokeWeight: 2,
                    },
                    offset: '100%', // Place arrow at the end of the animated path
                    repeat: '0px', // Don't repeat arrows during animation
                  },
                ],
              }}
            />
          );
        }

        // Normal non-animated path
        return (
          <Polyline
            key={`path-${day}`}
            path={path}
            options={{
              strokeColor:
                dayColors[day as keyof typeof dayColors] || '#888888',
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
      {locations.map(location => (
        <Marker
          key={location.id}
          position={{ lat: location.lat, lng: location.lng }}
          icon={getMarkerIcon()}
          onClick={() => handleMarkerClick(location)}
        />
      ))}

      {selectedLocation && (
        <InfoWindow
          position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
          onCloseClick={() => setSelectedLocation(null)}
        >
          <div className="p-3 min-w-[280px] max-w-[320px]">
            {/* Place Type and Day */}
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-lg text-xs font-semibold text-white bg-[#160E53] capitalize">
                {selectedLocation.type === 'journeyLocation'
                  ? 'Journey Location'
                  : selectedLocation.type.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              {selectedLocation.day && (
                <span className="text-xs text-gray-500 font-medium">
                  {selectedLocation.day}
                </span>
              )}
            </div>

            {/* Place Name */}
            <h3 className="font-bold text-gray-900 text-base mb-2">
              {selectedLocation.name}
            </h3>

            {/* Address */}
            {selectedLocation.address && (
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                {selectedLocation.address}
              </p>
            )}

            {/* Photos Preview */}
            {selectedLocation.photos && selectedLocation.photos.length > 0 && (
              <div className="mb-3">
                <div className="flex gap-1.5 overflow-x-auto">
                  {selectedLocation.photos.slice(0, 3).map((photo, index) => (
                    <div
                      key={index}
                      className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100"
                    >
                      <img
                        src={photo}
                        alt={`${selectedLocation.name} photo ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                  {selectedLocation.photos.length > 3 && (
                    <div className="w-20 h-20 flex-shrink-0 rounded-md bg-gray-100 flex items-center justify-center">
                      <span className="text-xs text-gray-600 font-medium">
                        +{selectedLocation.photos.length - 3}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
