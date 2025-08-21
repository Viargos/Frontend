"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
  Polyline,
} from "@react-google-maps/api";

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  address?: string;
  day?: string; // Add day property to identify which day the location belongs to
}

interface JourneyMapProps {
  locations: Location[];
  center?: { lat: number; lng: number };
  onLocationClick?: (location: Location) => void;
  onMapClick?: (event: google.maps.MapMouseEvent) => void;
}

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 17.385, // Hyderabad coordinates
  lng: 78.4867,
};

// Static libraries array to prevent LoadScript reloading
const GOOGLE_MAPS_LIBRARIES: "places"[] = ["places"];

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
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // Debug API key
  console.log(
    "Google Maps API Key:",
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? "Present" : "Missing"
  );
  console.log(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
  if (loadError) {
    console.error("Google Maps load error:", loadError);
  }

  // Group locations by day for drawing polylines - moved to top level
  const getPathsByDay = useCallback(() => {
    const pathsByDay: { [key: string]: { lat: number; lng: number }[] } = {};

    // First group locations by day
    const locationsByDay: { [key: string]: Location[] } = {};

    locations.forEach((location) => {
      const day = location.day || "unknown";
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
        const indexA = parseInt(a.id.split("-")[1]);
        const indexB = parseInt(b.id.split("-")[1]);
        return indexA - indexB;
      });

      pathsByDay[day] = sortedLocations.map((loc) => ({
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

    locs.forEach((location) => {
      const day = location.day || "unknown";
      if (!locationsByDay[day]) {
        locationsByDay[day] = [];
      }
      locationsByDay[day].push(location);
    });

    Object.entries(locationsByDay).forEach(([day, dayLocations]) => {
      const sortedLocations = [...dayLocations].sort((a, b) => {
        const indexA = parseInt(a.id.split("-")[1]);
        const indexB = parseInt(b.id.split("-")[1]);
        return indexA - indexB;
      });

      paths[day] = sortedLocations.map((loc) => ({
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
      prevLocationsRef.current = [];
      return;
    }

    // Find newly added locations by comparing with previous locations
    const prevLocationIds = new Set(
      prevLocationsRef.current.map((loc) => loc.id)
    );
    const newLocationIds = locations
      .filter((loc) => !prevLocationIds.has(loc.id))
      .map((loc) => loc.id);

    if (newLocationIds.length > 0) {
      // Mark these as newly added markers for animation
      setNewlyAddedMarkers(new Set(newLocationIds));

      // Remove the highlight after 2 seconds
      setTimeout(() => {
        setNewlyAddedMarkers((prev) => {
          const updated = new Set(prev);
          newLocationIds.forEach((id) => updated.delete(id));
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
          setAnimatedPaths((prev) => ({
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
  }, [locations]); // Removed pathsByDay and getPathsByDayFromLocations dependencies

  // Animation progress effect - always called
  useEffect(() => {
    // Skip if there are no animated paths
    if (Object.keys(animatedPaths).length === 0) return;

    const animationInterval = setInterval(() => {
      setAnimatedPaths((prev) => {
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
          locations.forEach((location) => {
            if (
              location &&
              typeof location.lat === "number" &&
              typeof location.lng === "number"
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
          console.error("Error setting map bounds:", error);
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

  const getMarkerIcon = (type: string, isNew: boolean = false) => {
    // Use primary-blue for all markers
    const primaryBlue = "#001a6e"; // Primary blue color from CSS variables
    const newMarkerColor = "#FF6B35"; // Orange for new markers

    const colors = {
      journeyLocation: primaryBlue,
      stay: primaryBlue,
      activity: primaryBlue,
      food: primaryBlue,
      transport: primaryBlue,
      note: primaryBlue,
      // Legacy support
      placeToStay: primaryBlue,
      placesToGo: primaryBlue,
      notes: primaryBlue,
    };

    const markerColor = isNew
      ? newMarkerColor
      : colors[type as keyof typeof colors] || colors.notes;
    const markerSize = isNew ? 28 : 24; // Slightly larger for new markers

    if (type === "journeyLocation") {
      // Special marker for journey location
      return {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            ${
              isNew
                ? '<circle cx="12" cy="12" r="11" fill="' +
                  newMarkerColor +
                  '" opacity="0.3"><animate attributeName="r" values="11;15;11" dur="1s" repeatCount="indefinite"/></circle>'
                : ""
            }
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="${markerColor}" stroke="white" stroke-width="1"/>
            <circle cx="12" cy="9" r="2" fill="white"/>
          </svg>
        `)}`,
        scaledSize: window.google?.maps?.Size
          ? new window.google.maps.Size(32, 32)
          : undefined,
        anchor: window.google?.maps?.Point
          ? new window.google.maps.Point(16, 32)
          : undefined,
      };
    }

    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="${markerSize}" height="${markerSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          ${
            isNew
              ? '<circle cx="12" cy="12" r="11" fill="' +
                newMarkerColor +
                '" opacity="0.3"><animate attributeName="r" values="11;15;11" dur="1s" repeatCount="indefinite"/></circle>'
              : ""
          }
          <circle cx="12" cy="12" r="10" fill="${markerColor}" stroke="white" stroke-width="2"/>
          <circle cx="12" cy="12" r="4" fill="white"/>
        </svg>
      `)}`,
      scaledSize: window.google?.maps?.Size
        ? new window.google.maps.Size(markerSize, markerSize)
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
            {loadError.message || "Invalid API key or insufficient permissions"}
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
              type: "spring",
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

  // Generate colors for each day's path
  const dayColors = {
    "Day 1": "#FF6B35", // Orange
    "Day 2": "#45B7D1", // Blue
    "Day 3": "#4ECDC4", // Teal
    "Day 4": "#96CEB4", // Green
    "Day 5": "#FF6B6B", // Red
    "Day 6": "#6B66FF", // Purple
    "Day 7": "#FFD166", // Yellow
    unknown: "#888888", // Gray for unknown day
  };

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={onMapClick}
      options={{
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
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
                  dayColors[day as keyof typeof dayColors] || "#888888",
                strokeOpacity: 0.8,
                strokeWeight: 4,
                geodesic: true,
                icons: [
                  {
                    icon: {
                      path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                      scale: 3,
                      strokeColor: "#FFFFFF",
                      strokeWeight: 2,
                    },
                    offset: "100%", // Place arrow at the end of the animated path
                    repeat: "0px", // Don't repeat arrows during animation
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
                dayColors[day as keyof typeof dayColors] || "#888888",
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
                        strokeColor: "#FFFFFF",
                        strokeWeight: 2,
                      },
                      offset: "50%",
                      repeat: "100px",
                    },
                  ]
                : undefined,
            }}
          />
        );
      })}

      {/* Render map markers */}
      {locations.map((location) => {
        const isNewMarker = newlyAddedMarkers.has(location.id);
        return (
          <Marker
            key={location.id}
            position={{ lat: location.lat, lng: location.lng }}
            icon={getMarkerIcon(location.type, isNewMarker)}
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
              {selectedLocation.type === "journeyLocation"
                ? "Journey Location"
                : selectedLocation.type.replace(/([A-Z])/g, " $1").trim()}
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
