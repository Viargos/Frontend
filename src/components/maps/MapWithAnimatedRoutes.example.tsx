"use client";

import { useRef, useEffect, useState } from "react";
import { AnimatedCurvedRoute } from "./AnimatedCurvedRoute";

/**
 * Example: Map with Multiple Animated Routes
 *
 * This demonstrates how to use AnimatedCurvedRoute with:
 * - Multiple routes at once
 * - Dynamic route data
 * - Proper map instance integration
 */

// Example route data
interface RouteData {
  id: string;
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  color?: string;
}

export function MapWithAnimatedRoutesExample() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);

  // Example routes (multiple cities)
  const routes: RouteData[] = [
    {
      id: "route-1",
      from: { lat: 40.7128, lng: -74.006 }, // New York
      to: { lat: 34.0522, lng: -118.2437 }, // Los Angeles
      color: "#3b82f6", // blue
    },
    {
      id: "route-2",
      from: { lat: 51.5074, lng: -0.1278 }, // London
      to: { lat: 48.8566, lng: 2.3522 }, // Paris
      color: "#ef4444", // red
    },
    {
      id: "route-3",
      from: { lat: 35.6762, lng: 139.6503 }, // Tokyo
      to: { lat: 1.3521, lng: 103.8198 }, // Singapore
      color: "#10b981", // green
    },
  ];

  /**
   * Initialize map (Mapbox example)
   * Replace with your actual map initialization
   */
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Example: Initialize Mapbox map
    // In real implementation, import mapboxgl and use actual initialization
    const initializeMap = async () => {
      try {
        // Simulated map instance
        // Replace with actual map initialization:
        /*
        const mapboxgl = (await import('mapbox-gl')).default;
        mapboxgl.accessToken = 'your-token';

        const mapInstance = new mapboxgl.Map({
          container: mapContainerRef.current!,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [-74.006, 40.7128],
          zoom: 3
        });

        mapInstance.on('load', () => {
          setMap(mapInstance);
        });
        */

        // For demo purposes, create a mock map object
        const mockMap = {
          project: (lngLat: [number, number]) => {
            // Mock projection - replace with actual map.project()
            const x = (lngLat[0] + 180) * 2;
            const y = (90 - lngLat[1]) * 2;
            return { x, y };
          },
          on: () => {},
          off: () => {},
        };

        setMap(mockMap);
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    initializeMap();

    // Cleanup
    return () => {
      // Clean up map instance
      if (map && map.remove) {
        map.remove();
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-gray-100">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Animated Routes Overlay */}
      {map &&
        routes.map((route) => (
          <AnimatedCurvedRoute
            key={route.id}
            map={map}
            from={route.from}
            to={route.to}
            color={route.color}
            curvature={0.35}
            strokeWidth={3}
            dashLength={12}
            gapLength={8}
            animationSpeed={2}
          />
        ))}
    </div>
  );
}

/**
 * Example: Single Route with Custom Styling
 */
export function SingleRouteExample() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);

  // Initialize map (same as above)
  useEffect(() => {
    // Initialize your map here
    // setMap(mapInstance);
  }, []);

  return (
    <div className="relative w-full h-[600px]">
      <div ref={mapContainerRef} className="w-full h-full" />

      {map && (
        <AnimatedCurvedRoute
          map={map}
          from={{ lat: 40.7128, lng: -74.006 }}
          to={{ lat: 34.0522, lng: -118.2437 }}
          curvature={0.4} // Higher curve
          strokeWidth={4} // Thicker line
          dashLength={16} // Longer dashes
          gapLength={10}
          animationSpeed={3} // Slower animation
          color="#8b5cf6" // Purple
        />
      )}
    </div>
  );
}

/**
 * Example: Dynamic Routes (e.g., from API)
 */
export function DynamicRoutesExample() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [routes, setRoutes] = useState<RouteData[]>([]);

  // Fetch routes from API
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        // const response = await fetch('/api/routes');
        // const data = await response.json();
        // setRoutes(data);

        // Mock data for example
        setRoutes([
          {
            id: "1",
            from: { lat: 40.7128, lng: -74.006 },
            to: { lat: 34.0522, lng: -118.2437 },
          },
        ]);
      } catch (error) {
        console.error("Error fetching routes:", error);
      }
    };

    fetchRoutes();
  }, []);

  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainerRef} className="w-full h-full" />

      {map &&
        routes.map((route) => (
          <AnimatedCurvedRoute
            key={route.id}
            map={map}
            from={route.from}
            to={route.to}
            color={route.color}
          />
        ))}
    </div>
  );
}
