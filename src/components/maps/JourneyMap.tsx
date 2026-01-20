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
import { generateJourneyLocationMarker, generateSimpleMarker } from '@/utils/map-markers';
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
    const markerSize = 44;

    // Color for place types
    const colorMap: Record<string, string> = {
      stay: '#3b82f6',      // blue
      activity: '#10b981',  // green
      food: '#ef4444',      // red
      transport: '#8b5cf6', // purple
      note: '#f59e0b',      // amber
    };

    // Lucide-style icon SVGs
    const icons: { [key: string]: string } = {
      stay: `
        <!-- Hotel icon -->
        <rect x="18" y="16" width="8" height="8" stroke="currentColor" stroke-width="2" fill="none" rx="1"/>
        <line x1="20" y1="18" x2="20" y2="19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="22" y1="18" x2="22" y2="19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="24" y1="18" x2="24" y2="19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="20" y1="21" x2="20" y2="22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="22" y1="21" x2="22" y2="22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="24" y1="21" x2="24" y2="22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      `,
      activity: `
        <!-- Trees icon -->
        <path d="M 22 14 L 19 18 L 20 18 L 17 21 L 19 21 L 16 24 L 28 24 L 25 21 L 27 21 L 24 18 L 25 18 Z" fill="currentColor"/>
        <line x1="22" y1="24" x2="22" y2="27" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      `,
      food: `
        <!-- Utensils icon -->
        <path d="M 19 16 L 19 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M 19 16 L 17.5 17.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M 19 16 L 20.5 17.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M 19 20 L 19 26" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M 25 16 L 25 19 C 25 20 24 21 22.5 21 L 22.5 26" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      `,
      transport: `
        <!-- Car icon -->
        <path d="M 16 22 L 17 18 L 27 18 L 28 22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="14" y="22" width="16" height="4" stroke="currentColor" stroke-width="2" fill="none" rx="1"/>
        <circle cx="18" cy="24" r="1.5" fill="currentColor"/>
        <circle cx="26" cy="24" r="1.5" fill="currentColor"/>
      `,
      note: `
        <!-- Note icon -->
        <path d="M 18 16 L 23 16 L 26 19 L 26 27 L 18 27 Z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M 23 16 L 23 19 L 26 19" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="20" y1="21" x2="24" y2="21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="20" y1="23" x2="24" y2="23" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      `,
    };

    const iconPath = icons[type] || icons['note'];
    const accentColor = colorMap[type] || '#160E53';
    const locationId = location?.id || Math.random().toString();

    const svgContent = `
      <svg width="${markerSize}" height="${markerSize * 1.4}" viewBox="0 0 44 62" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Drop shadow -->
          <filter id="shadow-${locationId}" x="-50%" y="-30%" width="200%" height="160%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2.5"/>
            <feOffset dx="0" dy="4" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.35"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <!-- Gradient for 3D effect -->
          <linearGradient id="grad-${locationId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#f8f9fa;stop-opacity:1" />
          </linearGradient>
          <!-- Shine gradient -->
          <linearGradient id="shine-${locationId}" x1="30%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.7" />
            <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
          </linearGradient>
        </defs>
        
        <g filter="url(#shadow-${locationId})">
          <!-- Main white pin shape with gradient -->
          <path d="M 22,4 C 13,4 6,11 6,20 C 6,30 22,50 22,50 C 22,50 38,30 38,20 C 38,11 31,4 22,4 Z" 
                fill="url(#grad-${locationId})" 
                stroke="#d1d5db" 
                stroke-width="1.5"/>
          
          <!-- Inner colored circle with subtle gradient -->
          <circle cx="22" cy="19" r="11" fill="${accentColor}" opacity="0.12"/>
          <circle cx="22" cy="19" r="9" fill="${accentColor}" opacity="0.15"/>
          
          <!-- Shine/highlight for 3D effect -->
          <ellipse cx="18" cy="12" rx="8" ry="6" fill="url(#shine-${locationId})" opacity="0.6"/>
          
          <!-- Icon with color -->
          <g style="color: ${accentColor}">
            ${iconPath}
          </g>
          
          <!-- Subtle inner stroke for depth -->
          <path d="M 22,4 C 13,4 6,11 6,20 C 6,30 22,50 22,50 C 22,50 38,30 38,20 C 38,11 31,4 22,4 Z" 
                fill="none" 
                stroke="white" 
                stroke-width="2" 
                opacity="0.5"/>
        </g>
        ${isNew ? `<circle cx="22" cy="19" r="16" fill="${accentColor}" opacity="0.2"><animate attributeName="r" values="16;20;16" dur="1.5s" repeatCount="indefinite"/></circle>` : ''}
      </svg>
    `;

    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgContent)}`,
      scaledSize: window.google?.maps?.Size
        ? new window.google.maps.Size(markerSize, markerSize * 1.4)
        : undefined,
      anchor: window.google?.maps?.Point
        ? new window.google.maps.Point(markerSize / 2, markerSize * 1.4)
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
