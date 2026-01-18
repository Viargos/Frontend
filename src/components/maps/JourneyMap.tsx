'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
  Polyline,
} from '@react-google-maps/api';
import { viargoMapOptions } from '@/constants/map-styles';
import {
  detectAccommodationType,
  getAccommodationColor,
} from '@/utils/accommodation-detector';

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  address?: string;
  day?: string; // Add day property to identify which day the location belongs to
  description?: string; // For accommodation type detection
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
  const [newlyAddedMarkers, setNewlyAddedMarkers] = useState<Set<string>>(
    new Set()
  );
  const prevLocationsRef = useRef<Location[]>([]);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  if (loadError) {
    console.error('Google Maps load error:', loadError);
  }

  // Group locations by day for drawing polylines - moved to top level
  const getPathsByDay = useCallback(() => {
    const pathsByDay: { [key: string]: { lat: number; lng: number }[] } = {};

    // First group locations by day
    const locationsByDay: { [key: string]: Location[] } = {};

    locations.forEach(location => {
      const day = location.day || 'unknown';
      if (!locationsByDay[day]) {
        locationsByDay[day] = [];
      }
      locationsByDay[day].push(location);
    });

    // For each day, sort locations and create a path
    Object.entries(locationsByDay).forEach(([day, dayLocations]) => {
      // Sort by ID which contains day and index information
      const sortedLocations = [...dayLocations].sort((a, b) => {
        // Extract index from ID (assuming format 'Day X-Y' where Y is the index)
        const partsA = a.id.split('-');
        const partsB = b.id.split('-');
        const indexA = parseInt(partsA[partsA.length - 1]) || 0;
        const indexB = parseInt(partsB[partsB.length - 1]) || 0;
        
        console.log('📍 Sorting locations:', {
          a: { id: a.id, index: indexA, lat: a.lat, lng: a.lng },
          b: { id: b.id, index: indexB, lat: b.lat, lng: b.lng }
        });
        
        return indexA - indexB;
      });

      console.log('🗺️ Creating path for', day, ':', sortedLocations.map(l => ({
        id: l.id,
        name: l.name,
        lat: l.lat,
        lng: l.lng
      })));

      pathsByDay[day] = sortedLocations.map(loc => ({
        lat: loc.lat,
        lng: loc.lng,
      }));
    });

    return pathsByDay;
  }, [locations]);

  const pathsByDay = getPathsByDay();

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
      const sortedLocations = [...dayLocations].sort((a, b) => {
        const partsA = a.id.split('-');
        const partsB = b.id.split('-');
        const indexA = parseInt(partsA[partsA.length - 1]) || 0;
        const indexB = parseInt(partsB[partsB.length - 1]) || 0;
        return indexA - indexB;
      });

      paths[day] = sortedLocations.map(loc => ({
        lat: loc.lat,
        lng: loc.lng,
      }));
    });

    return paths;
  }, []);

  // Detect new points and trigger line drawing animation - always called
  useEffect(() => {
    if (!locations.length) {
      setNewlyAddedMarkers(new Set());
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
      // Mark these as newly added markers for animation
      setNewlyAddedMarkers(new Set(newLocationIds));

      // Remove the highlight after 2 seconds
      setTimeout(() => {
        setNewlyAddedMarkers(prev => {
          const updated = new Set(prev);
          newLocationIds.forEach(id => updated.delete(id));
          return updated;
        });
      }, 2000);

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

  const getMarkerIcon = (
    type: string,
    isNew: boolean = false,
    location?: Location
  ) => {
    const markerSize = isNew ? 56 : 50; // Increased size from 44/40 to 56/50
    const pulseAnimation = isNew ? '<circle cx="25" cy="25" r="23" fill="#001A6E" opacity="0.3"><animate attributeName="r" values="23;28;23" dur="1.5s" repeatCount="indefinite"/></circle>' : '';

    // Icon SVGs for each category (Lucide-style icons)
    const icons: { [key: string]: string } = {
      stay: `
        <!-- Hotel/Building icon -->
        <rect x="9" y="6" width="8" height="10" stroke="white" stroke-width="1.5" fill="none" rx="1"/>
        <line x1="11" y1="8" x2="11" y2="10" stroke="white" stroke-width="1.5"/>
        <line x1="13" y1="8" x2="13" y2="10" stroke="white" stroke-width="1.5"/>
        <line x1="15" y1="8" x2="15" y2="10" stroke="white" stroke-width="1.5"/>
        <line x1="11" y1="12" x2="11" y2="14" stroke="white" stroke-width="1.5"/>
        <line x1="13" y1="12" x2="13" y2="14" stroke="white" stroke-width="1.5"/>
        <line x1="15" y1="12" x2="15" y2="14" stroke="white" stroke-width="1.5"/>
        <rect x="11" y="14" width="4" height="2" fill="white"/>
      `,
      activity: `
        <!-- Trees icon -->
        <path d="M13 3 L15 6 L14 6 L16 9 L15 9 L17 12 L11 12 L13 9 L12 9 L14 6 L13 6 Z" fill="white"/>
        <rect x="12.5" y="12" width="1" height="4" fill="white"/>
      `,
      food: `
        <!-- Utensils Crossed icon -->
        <path d="M11 4 v6 M11 4 L9 6 M11 4 L13 6 M11 10 v6" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <path d="M15 4 v4 c0 1-1 2-2 2 v6" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      `,
      transport: `
        <!-- Car icon -->
        <path d="M7 11 L8 7 L18 7 L19 11 M5 11 h16 v5 h-16 z" stroke="white" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
        <circle cx="9" cy="14" r="1.5" fill="white"/>
        <circle cx="17" cy="14" r="1.5" fill="white"/>
        <line x1="5" y1="16" x2="5" y2="17" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="21" y1="16" x2="21" y2="17" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
      `,
      note: `
        <!-- Document/Note icon -->
        <path d="M9 4 h6 l3 3 v9 h-9 z" stroke="white" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
        <path d="M15 4 v3 h3" stroke="white" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
        <line x1="11" y1="10" x2="15" y2="10" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="11" y1="12" x2="15" y2="12" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="11" y1="14" x2="13" y2="14" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
      `,
    };

    // Get the icon based on type
    const iconPath = icons[type] || icons['note'];
    const markerColor = '#001A6E'; // Brand blue for all markers

    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="${markerSize}" height="${markerSize}" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
          ${pulseAnimation}
          <g transform="translate(25, 25)">
            <!-- Pin shape -->
            <path d="M 0,-18 C -10,-18 -15,-10 -15,0 C -15,8 0,18 0,18 C 0,18 15,8 15,0 C 15,-10 10,-18 0,-18 Z" 
                  fill="${markerColor}" 
                  stroke="white" 
                  stroke-width="2.5"/>
            <!-- Icon -->
            <g transform="translate(-13, -15)">
              ${iconPath}
            </g>
          </g>
        </svg>
      `)}`,
      scaledSize: window.google?.maps?.Size
        ? new window.google.maps.Size(markerSize, markerSize)
        : undefined,
      anchor: window.google?.maps?.Point
        ? new window.google.maps.Point(markerSize / 2, markerSize)
        : undefined,
    };
  };

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
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
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
      onClick={onMapClick}
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
      {locations.map(location => {
        const isNewMarker = newlyAddedMarkers.has(location.id);
        return (
          <Marker
            key={location.id}
            position={{ lat: location.lat, lng: location.lng }}
            icon={getMarkerIcon(location.type, isNewMarker, location)}
            onClick={() => handleMarkerClick(location)}
          />
        );
      })}

      {selectedLocation && (
        <InfoWindow
          position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
          onCloseClick={() => setSelectedLocation(null)}
        >
          <div className="p-2">
            <h3 className="font-semibold text-gray-900">
              {selectedLocation.name}
            </h3>
            {selectedLocation.address && (
              <p className="text-sm text-gray-600 mt-1">
                {selectedLocation.address}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1 capitalize">
              {selectedLocation.type === 'journeyLocation'
                ? 'Journey Location'
                : selectedLocation.type.replace(/([A-Z])/g, ' $1').trim()}
            </p>
            {selectedLocation.day && (
              <p className="text-xs font-medium text-blue-600 mt-1">
                {selectedLocation.day}
              </p>
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
