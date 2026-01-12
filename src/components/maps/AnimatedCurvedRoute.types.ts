/**
 * TypeScript Types for AnimatedCurvedRoute Component
 * Provides type safety for map-based route animations
 */

/**
 * Geographic coordinate (latitude, longitude)
 */
export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Screen coordinate (x, y pixels)
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Map instance interface
 * Supports Mapbox, Google Maps, and Leaflet
 */
export interface MapInstance {
  // Mapbox / Leaflet style
  project?: (lngLat: [number, number]) => Point;
  on?: (event: string, handler: () => void) => void;
  off?: (event: string, handler: () => void) => void;

  // Google Maps style
  getProjection?: () => {
    fromLatLngToPoint: (latLng: any) => Point;
  };
  addListener?: (event: string, handler: () => void) => any;
  removeListener?: (event: string, handler: () => void) => void;

  // Leaflet specific
  addEventListener?: (event: string, handler: () => void) => void;
  removeEventListener?: (event: string, handler: () => void) => void;
  latLngToContainerPoint?: (latLng: LatLng) => Point;
}

/**
 * Props for AnimatedCurvedRoute component
 */
export interface AnimatedCurvedRouteProps {
  /** Map instance (Mapbox/Google Maps/Leaflet) */
  map: MapInstance | any;

  /** Starting point (latitude, longitude) */
  from: LatLng;

  /** Ending point (latitude, longitude) */
  to: LatLng;

  /**
   * Curve intensity (0-1)
   * 0 = straight line, 1 = very curved
   * @default 0.35
   */
  curvature?: number;

  /**
   * Path line thickness in pixels
   * @default 3
   */
  strokeWidth?: number;

  /**
   * Length of each dash in pixels
   * @default 12
   */
  dashLength?: number;

  /**
   * Gap between dashes in pixels
   * @default 8
   */
  gapLength?: number;

  /**
   * Animation duration in seconds
   * @default 2
   */
  animationSpeed?: number;

  /**
   * Path color (CSS color value)
   * @default "#3b82f6" (Tailwind blue-500)
   */
  color?: string;

  /**
   * Show markers at start and end points
   * @default true
   */
  showMarkers?: boolean;

  /**
   * Marker radius in pixels
   * @default 6
   */
  markerRadius?: number;

  /**
   * Animation mode:
   * - "traveling": Animated dot travels from start to end
   * - "continuous": Dotted line animates continuously
   * - "sequential": Path draws first, then dot travels
   * @default "continuous"
   */
  animationMode?: "traveling" | "continuous" | "sequential";

  /**
   * Traveling dot size (only for traveling mode)
   * @default 8
   */
  travelingDotSize?: number;

  /**
   * Optional z-index for layering
   * @default 10
   */
  zIndex?: number;

  /**
   * Optional className for custom styling
   */
  className?: string;

  /**
   * Callback when path is calculated
   */
  onPathCalculated?: (pathData: PathData) => void;

  /**
   * Callback when animation completes one cycle
   */
  onAnimationCycle?: () => void;
}

/**
 * SVG path data with calculated length
 */
export interface PathData {
  /** SVG path d attribute string */
  d: string;

  /** Total path length in pixels */
  length: number;
}

/**
 * Route data for multiple routes
 */
export interface RouteData {
  /** Unique identifier for the route */
  id: string;

  /** Starting point */
  from: LatLng;

  /** Ending point */
  to: LatLng;

  /** Optional color override */
  color?: string;

  /** Optional label/description */
  label?: string;

  /** Optional metadata */
  metadata?: Record<string, any>;
}

/**
 * Map provider types
 */
export enum MapProvider {
  Mapbox = "mapbox",
  GoogleMaps = "google",
  Leaflet = "leaflet",
}

/**
 * Animation state
 */
export enum AnimationState {
  Idle = "idle",
  Running = "running",
  Paused = "paused",
  Completed = "completed",
}
