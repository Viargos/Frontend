"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import type {
  AnimatedCurvedRouteProps,
  PathData,
} from "./AnimatedCurvedRoute.types";

/**
 * AnimatedCurvedRoute - Reusable animated curved dotted path for maps
 *
 * Features:
 * - Smooth Bezier curve between two points
 * - Animated dotted line using stroke-dashoffset
 * - Automatically syncs with map zoom/pan/resize
 * - SSR-safe for Next.js
 * - Performant with proper memoization
 *
 * @example
 * <AnimatedCurvedRoute
 *   map={mapInstance}
 *   from={{ lat: 40.7128, lng: -74.0060 }}
 *   to={{ lat: 34.0522, lng: -118.2437 }}
 *   curvature={0.35}
 *   strokeWidth={3}
 *   animationSpeed={2}
 * />
 */
export function AnimatedCurvedRoute({
  map,
  from,
  to,
  curvature = 0.35,
  strokeWidth = 3,
  dashLength = 12,
  gapLength = 8,
  animationSpeed = 2,
  color = "#3b82f6", // Tailwind blue-500
  showMarkers = true,
  markerRadius = 6,
  animationMode = "continuous",
  travelingDotSize = 8,
}: AnimatedCurvedRouteProps) {
  const [pathData, setPathData] = useState<PathData | null>(null);
  const [markerPoints, setMarkerPoints] = useState<{ start: { x: number; y: number }; end: { x: number; y: number } } | null>(null);
  const [pathDrawComplete, setPathDrawComplete] = useState(false);
  const pathRef = useRef<SVGPathElement>(null);
  const animationKeyRef = useRef(0); // Force re-render key for animation

  /**
   * Calculate the curved path between two points
   * Uses quadratic Bezier curve with calculated control point
   */
  const calculatePath = useCallback(() => {
    if (!map) return null;

    try {
      let startPoint: { x: number; y: number };
      let endPoint: { x: number; y: number };
      let controlPoint: { x: number; y: number };

      // Handle different map libraries
      if (map.project) {
        // Mapbox / Leaflet style
        startPoint = map.project([from.lng, from.lat]);
        endPoint = map.project([to.lng, to.lat]);

        // Calculate control point in pixel space for Mapbox/Leaflet
        const midX = (startPoint.x + endPoint.x) / 2;
        const midY = (startPoint.y + endPoint.y) / 2;
        const dx = endPoint.x - startPoint.x;
        const dy = endPoint.y - startPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const perpX = -dy;
        const perpY = dx;
        const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
        if (perpLength === 0) return null;
        const curveOffset = distance * curvature;
        controlPoint = {
          x: midX + (perpX / perpLength) * curveOffset,
          y: midY + (perpY / perpLength) * curveOffset,
        };
      } else if (map.getProjection) {
        // Google Maps style - project to pixels first, then calculate curve
        const projection = map.getProjection();
        if (!projection) return null;

        const bounds = map.getBounds();
        if (!bounds) return null;

        const mapDiv = map.getDiv();
        const mapWidth = mapDiv.offsetWidth;
        const mapHeight = mapDiv.offsetHeight;

        // Get the northeast and southwest corners
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();

        // Convert corners to world coordinates
        const scale = Math.pow(2, map.getZoom() || 0);
        const nePoint = projection.fromLatLngToPoint(ne);
        const swPoint = projection.fromLatLngToPoint(sw);

        if (!nePoint || !swPoint) return null;

        // Convert our lat/lng points to world coordinates
        const startLatLng = new google.maps.LatLng(from.lat, from.lng);
        const endLatLng = new google.maps.LatLng(to.lat, to.lng);
        const startWorld = projection.fromLatLngToPoint(startLatLng);
        const endWorld = projection.fromLatLngToPoint(endLatLng);

        if (!startWorld || !endWorld) return null;

        // Calculate pixel positions
        // World coordinates range, scaled by zoom
        const worldWidth = (nePoint.x - swPoint.x) * scale;
        const worldHeight = (swPoint.y - nePoint.y) * scale;

        // Helper function to convert world to pixel
        const worldToPixel = (worldPoint: google.maps.Point) => ({
          x: ((worldPoint.x - swPoint.x) * scale / worldWidth) * mapWidth,
          y: ((swPoint.y - worldPoint.y) * scale / worldHeight) * mapHeight,
        });

        // Convert to pixel coordinates (0,0 at top-left of map)
        startPoint = worldToPixel(startWorld);
        endPoint = worldToPixel(endWorld);

        // Calculate control point in pixel space (for even curves)
        const midX = (startPoint.x + endPoint.x) / 2;
        const midY = (startPoint.y + endPoint.y) / 2;
        const dx = endPoint.x - startPoint.x;
        const dy = endPoint.y - startPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const perpX = -dy;
        const perpY = dx;
        const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
        if (perpLength === 0) return null;
        const curveOffset = distance * curvature;
        controlPoint = {
          x: midX + (perpX / perpLength) * curveOffset,
          y: midY + (perpY / perpLength) * curveOffset,
        };
      } else if (map.latLngToContainerPoint) {
        // Leaflet specific
        startPoint = map.latLngToContainerPoint({ lat: from.lat, lng: from.lng });
        endPoint = map.latLngToContainerPoint({ lat: to.lat, lng: to.lng });

        // Calculate control point in pixel space for Leaflet
        const midX = (startPoint.x + endPoint.x) / 2;
        const midY = (startPoint.y + endPoint.y) / 2;
        const dx = endPoint.x - startPoint.x;
        const dy = endPoint.y - startPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const perpX = -dy;
        const perpY = dx;
        const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
        if (perpLength === 0) return null;
        const curveOffset = distance * curvature;
        controlPoint = {
          x: midX + (perpX / perpLength) * curveOffset,
          y: midY + (perpY / perpLength) * curveOffset,
        };
      } else {
        console.error("Unsupported map type");
        return null;
      }

      // Create SVG path using quadratic Bezier curve
      // M = move to start, Q = quadratic curve to end with control point
      const d = `M ${startPoint.x} ${startPoint.y} Q ${controlPoint.x} ${controlPoint.y} ${endPoint.x} ${endPoint.y}`;

      // Store marker positions
      setMarkerPoints({ start: startPoint, end: endPoint });

      // Calculate path length for animation
      // Note: This will be calculated after the path is rendered
      return { d, length: 0 };
    } catch (error) {
      console.error("Error calculating path:", error);
      return null;
    }
  }, [map, from, to, curvature]);

  /**
   * Update path data when map changes or coordinates change
   */
  const updatePath = useCallback(() => {
    const newPathData = calculatePath();
    if (newPathData) {
      setPathData(newPathData);

      // Calculate actual path length after render
      // This is needed for proper stroke-dasharray animation
      setTimeout(() => {
        if (pathRef.current) {
          const length = pathRef.current.getTotalLength();
          setPathData((prev) => prev ? { ...prev, length } : null);
        }
      }, 0);
    }
  }, [calculatePath]);

  /**
   * Set up map event listeners
   * Re-calculate path on zoom, pan, or resize
   */
  useEffect(() => {
    if (!map) return;

    // Initial calculation
    updatePath();

    // Map event handlers
    const handleMapChange = () => {
      updatePath();
    };

    // Store listener references for cleanup
    const listeners: google.maps.MapsEventListener[] = [];

    // Listen to map events
    // Adjust these based on your map library (Mapbox/Google Maps/Leaflet)
    try {
      // Mapbox style
      if (map.on) {
        map.on("zoom", handleMapChange);
        map.on("move", handleMapChange);
        map.on("resize", handleMapChange);
      }

      // Google Maps style
      if (map.addListener) {
        const zoomListener = map.addListener("zoom_changed", handleMapChange);
        const boundsListener = map.addListener("bounds_changed", handleMapChange);
        const centerListener = map.addListener("center_changed", handleMapChange);
        listeners.push(zoomListener, boundsListener, centerListener);
      }

      // Leaflet style
      if (map.addEventListener) {
        map.addEventListener("zoomend", handleMapChange);
        map.addEventListener("moveend", handleMapChange);
      }
    } catch (error) {
      console.error("Error setting up map listeners:", error);
    }

    // Cleanup
    return () => {
      try {
        if (map.off) {
          map.off("zoom", handleMapChange);
          map.off("move", handleMapChange);
          map.off("resize", handleMapChange);
        }
        // Google Maps: Remove listeners using stored references
        if (listeners.length > 0) {
          listeners.forEach((listener) => {
            if (listener && listener.remove) {
              listener.remove();
            }
          });
        }
        if (map.removeEventListener) {
          map.removeEventListener("zoomend", handleMapChange);
          map.removeEventListener("moveend", handleMapChange);
        }
      } catch (error) {
        console.error("Error removing map listeners:", error);
      }
    };
  }, [map, updatePath]);

  // Handle sequential animation timing
  useEffect(() => {
    if (animationMode === "sequential" && pathData) {
      // Reset when path data changes
      setPathDrawComplete(false);

      // Wait for path drawing animation to complete
      const timer = setTimeout(() => {
        setPathDrawComplete(true);
      }, animationSpeed * 1000);

      return () => clearTimeout(timer);
    }
  }, [animationMode, pathData, animationSpeed]);

  // Don't render if no path data
  if (!pathData) return null;

  const { d, length } = pathData;
  const totalDashLength = dashLength + gapLength;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      style={{
        overflow: "visible",
      }}
    >
      {animationMode === "continuous" ? (
        /* Continuous Mode: Animated dotted line */
        <path
          ref={pathRef}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={`${dashLength} ${gapLength}`}
          strokeDashoffset={0}
          className="animate-dotted-path"
          style={{
            // Set CSS variable for animation
            // @ts-ignore
            "--path-length": length || 1000,
            "--animation-speed": `${animationSpeed}s`,
          }}
        />
      ) : animationMode === "sequential" ? (
        /* Sequential Mode: Draw dotted path first, then traveling dot */
        <>
          <defs>
            {/* Mask path that draws to reveal the dotted line */}
            <mask id={`path-mask-${from.lat}-${from.lng}-${to.lat}-${to.lng}`}>
              <path
                d={d}
                fill="none"
                stroke="white"
                strokeWidth={strokeWidth + 4}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={length || 1000}
                strokeDashoffset={length || 1000}
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from={length || 1000}
                  to="0"
                  dur={`${animationSpeed}s`}
                  fill="freeze"
                />
              </path>
            </mask>
          </defs>

          {/* Dotted path that gets revealed by the mask */}
          <path
            ref={pathRef}
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${dashLength} ${gapLength}`}
            mask={`url(#path-mask-${from.lat}-${from.lng}-${to.lat}-${to.lng})`}
          />

          {/* Traveling dot - only show after path is drawn */}
          {pathDrawComplete && (
            <circle
              r={travelingDotSize}
              fill={color}
              stroke="white"
              strokeWidth={2}
              className="drop-shadow-lg"
            >
              <animateMotion
                dur={`${animationSpeed}s`}
                repeatCount="indefinite"
                path={d}
              />
            </circle>
          )}
        </>
      ) : (
        /* Traveling Mode: Static dotted line + traveling dot */
        <>
          {/* Static dotted path */}
          <path
            ref={pathRef}
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${dashLength} ${gapLength}`}
            opacity={0.5}
          />

          {/* Traveling dot */}
          <circle
            r={travelingDotSize}
            fill={color}
            stroke="white"
            strokeWidth={2}
            className="drop-shadow-lg"
          >
            <animateMotion
              dur={`${animationSpeed}s`}
              repeatCount="indefinite"
              path={d}
            />
          </circle>
        </>
      )}

      {/* Markers at start and end points */}
      {showMarkers && markerPoints && (
        <>
          {/* Start marker */}
          <circle
            cx={markerPoints.start.x}
            cy={markerPoints.start.y}
            r={markerRadius}
            fill={color}
            stroke="white"
            strokeWidth={2}
            className="drop-shadow-md"
          />

          {/* End marker */}
          <circle
            cx={markerPoints.end.x}
            cy={markerPoints.end.y}
            r={markerRadius}
            fill={color}
            stroke="white"
            strokeWidth={2}
            className="drop-shadow-md"
          />
        </>
      )}
    </svg>
  );
}
