/**
 * Reusable Google Maps Styles
 *
 * Default Google Maps styling - uses Google's standard color scheme.
 * Locations with user journeys should be highlighted with blue markers/overlays.
 *
 * Usage:
 * import { mapStyles } from '@/constants/map-styles';
 * <GoogleMap options={{ styles: mapStyles }} />
 */

/**
 * Default map styles - uses Google Maps default appearance
 * Empty array means no custom styling is applied
 */
export const mapStyles: google.maps.MapTypeStyle[] = [];

/**
 * Journey-specific styling constants
 * Use these to mark locations where users have journeys
 */
export const journeyStyles = {
  // Blue color for journey markers and routes
  color: '#2563eb', // Blue-600
  colorLight: '#60a5fa', // Blue-400
  colorDark: '#1e40af', // Blue-700
  
  // Polyline styling for journey routes
  polylineOptions: {
    strokeColor: '#2563eb',
    strokeOpacity: 0.8,
    strokeWeight: 4,
  },
  
  // Polygon/circle styling for journey areas
  areaOptions: {
    fillColor: '#2563eb',
    fillOpacity: 0.2,
    strokeColor: '#2563eb',
    strokeOpacity: 0.8,
    strokeWeight: 2,
  },
};

/**
 * Get journey marker icon configuration
 * Call this function when google.maps is available
 */
export const getJourneyMarkerIcon = (): google.maps.Symbol => ({
  path: google.maps.SymbolPath.CIRCLE,
  fillColor: '#2563eb',
  fillOpacity: 1,
  strokeColor: '#ffffff',
  strokeWeight: 2,
  scale: 8,
});

/**
 * Custom Viargos theme map styles (alternative to default)
 * White and blue color scheme for branded appearance
 */
export const mapStylesCustom: google.maps.MapTypeStyle[] = [
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#e3ebf5' }],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#fafbff' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#eff2f9' }],
  },
  {
    featureType: 'poi',
    stylers: [{ visibility: 'simplified' }],
  },
];

/**
 * Map options preset for Viargos with default Google styling
 */
export const viargoMapOptions: google.maps.MapOptions = {
  styles: mapStyles, // Default Google Maps styles
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  gestureHandling: 'greedy' as const,
  disableDefaultUI: false,
  clickableIcons: false,
  restriction: {
    latLngBounds: {
      north: 85,
      south: -85,
      west: -180,
      east: 180,
    },
  },
};

/**
 * Helper function to create a journey marker
 * @param position - Latitude and longitude of the journey location
 * @param map - Google Maps instance
 * @param title - Optional title for the marker
 * @returns Google Maps Marker instance
 */
export const createJourneyMarker = (
  position: google.maps.LatLngLiteral,
  map: google.maps.Map,
  title?: string
): google.maps.Marker => {
  return new google.maps.Marker({
    position,
    map,
    title,
    icon: getJourneyMarkerIcon(),
  });
};

/**
 * Helper function to create a journey route polyline
 * @param path - Array of coordinates for the journey route
 * @param map - Google Maps instance
 * @returns Google Maps Polyline instance
 */
export const createJourneyPolyline = (
  path: google.maps.LatLngLiteral[],
  map: google.maps.Map
): google.maps.Polyline => {
  return new google.maps.Polyline({
    ...journeyStyles.polylineOptions,
    path,
    map,
  });
};

/**
 * Helper function to create a journey area circle
 * @param center - Center point of the journey area
 * @param radius - Radius in meters
 * @param map - Google Maps instance
 * @returns Google Maps Circle instance
 */
export const createJourneyArea = (
  center: google.maps.LatLngLiteral,
  radius: number,
  map: google.maps.Map
): google.maps.Circle => {
  return new google.maps.Circle({
    ...journeyStyles.areaOptions,
    center,
    radius,
    map,
  });
};
