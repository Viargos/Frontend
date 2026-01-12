"use client";

import { useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { AnimatedCurvedRoute } from "./AnimatedCurvedRoute";
import { motion } from "framer-motion";

const containerStyle = {
  width: "100%",
  height: "100%",
};

// Sample travel routes for demonstration
const DEMO_ROUTES = [
  {
    id: "route-1",
    from: { lat: 48.8566, lng: 2.3522 }, // Paris
    to: { lat: 41.9028, lng: 12.4964 }, // Rome
    color: "#3b82f6", // Blue
    label: "Paris → Rome",
  },
  {
    id: "route-2",
    from: { lat: 41.9028, lng: 12.4964 }, // Rome
    to: { lat: 41.3851, lng: 2.1734 }, // Barcelona
    color: "#10b981", // Green
    label: "Rome → Barcelona",
  },
  {
    id: "route-3",
    from: { lat: 41.3851, lng: 2.1734 }, // Barcelona
    to: { lat: 51.5074, lng: -0.1278 }, // London
    color: "#f59e0b", // Amber
    label: "Barcelona → London",
  },
];

const GOOGLE_MAPS_LIBRARIES: "places"[] = ["places"];

interface AnimatedRouteDemoProps {
  className?: string;
}

/**
 * AnimatedRouteDemo - Demonstration of AnimatedCurvedRoute component
 * Shows multiple animated travel routes on a Google Map
 */
export function AnimatedRouteDemo({ className = "" }: AnimatedRouteDemoProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [animationMode, setAnimationMode] = useState<"sequential" | "traveling" | "continuous">("sequential");

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`relative ${className}`}
    >
      {/* Info Badge */}
      <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
        <p className="text-sm font-semibold text-gray-900">
          🌍 Animated Travel Routes
        </p>
        <p className="text-xs text-gray-600 mt-1">
          {animationMode === "sequential" && "Paths draw first, then dots travel"}
          {animationMode === "traveling" && "Dots travel along static paths"}
          {animationMode === "continuous" && "Continuous flowing dotted lines"}
        </p>
      </div>

      {/* Animation Mode Toggle */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg">
        <p className="text-xs font-semibold text-gray-900 mb-2">Animation Mode:</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setAnimationMode("sequential")}
            className={`px-3 py-2 rounded text-xs font-medium transition-all ${
              animationMode === "sequential"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Sequential
            <span className="block text-[10px] opacity-80 mt-0.5">
              Draw → Travel
            </span>
          </button>
          <button
            onClick={() => setAnimationMode("traveling")}
            className={`px-3 py-2 rounded text-xs font-medium transition-all ${
              animationMode === "traveling"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Traveling
            <span className="block text-[10px] opacity-80 mt-0.5">
              Dot travels
            </span>
          </button>
          <button
            onClick={() => setAnimationMode("continuous")}
            className={`px-3 py-2 rounded text-xs font-medium transition-all ${
              animationMode === "continuous"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Continuous
            <span className="block text-[10px] opacity-80 mt-0.5">
              Flowing line
            </span>
          </button>
        </div>
      </div>

      {/* Route Legend */}
      <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg max-w-xs">
        <p className="text-xs font-semibold text-gray-900 mb-2">Routes:</p>
        {DEMO_ROUTES.map((route) => (
          <div key={route.id} className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: route.color }}
            />
            <span className="text-xs text-gray-700">{route.label}</span>
          </div>
        ))}
      </div>

      {/* Map Container */}
      <div className="relative w-full h-full rounded-lg overflow-hidden shadow-lg">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{ lat: 46.2276, lng: 2.2137 }} // Center of Europe
          zoom={5}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            styles: [
              {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#e9e9e9" }, { lightness: 17 }],
              },
              {
                featureType: "landscape",
                elementType: "geometry",
                stylers: [{ color: "#f5f5f5" }, { lightness: 20 }],
              },
            ],
          }}
        >
          {/* Render Animated Routes */}
          {map &&
            DEMO_ROUTES.map((route) => (
              <AnimatedCurvedRoute
                key={`${route.id}-${animationMode}`}
                map={map}
                from={route.from}
                to={route.to}
                color={route.color}
                curvature={0.35}
                strokeWidth={3}
                animationSpeed={2.5}
                animationMode={animationMode}
                travelingDotSize={10}
                dashLength={12}
                gapLength={8}
              />
            ))}
        </GoogleMap>
      </div>
    </motion.div>
  );
}
