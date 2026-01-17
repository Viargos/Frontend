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

<<<<<<< HEAD
export const mapStyles: google.maps.MapTypeStyle[] = [
  // Water features - subtle blue tint matching blue-600
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [
      {
        color: '#e3ebf5', // Very light blue with white tint
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#fffff', // Blue-600
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#ffffff',
      },
      {
        weight: 2,
      },
    ],
  },

  // Landscape - clean white base with subtle blue tint
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [
      {
        color: '#fafbff', // Pure white with very subtle blue tint
      },
    ],
  },

  // Parks and natural features - light blue-gray tint
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [
      {
        color: '#f5f7fb', // Blue-tinted gray for subtle variation
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [
      {
        color: '#00000', // Indigo-50 for parks
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#001a6e', // Blue-600
      },
    ],
  },

  // Roads - subtle blue-gray tones
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: '#eff2f9', // Blue-tinted gray-100
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#e6ebf5', // Blue-tinted gray-200
      },
      {
        weight: 0.5,
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#4a5574', // Blue-tinted gray-600
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#ffffff',
      },
      {
        weight: 2,
      },
    ],
  },

  // Highways - more prominent with blue tint
  {
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: '#e6ebf5', // Blue-tinted gray-200
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#d0dae8', // Blue-tinted gray-300
      },
      {
        weight: 1,
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#001a6e', // Blue-600
      },
    ],
  },

  // Arterial roads
  {
    featureType: 'road.arterial',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: '#f5f7fb', // Blue-tinted gray-50
      },
    ],
  },
  {
    featureType: 'road.arterial',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#3d4a5e', // Blue-tinted gray-700
      },
    ],
  },

  // Buildings - subtle white/blue-gray
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [
      {
        color: '#eff2f9', // Blue-tinted gray-100
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#4a5574', // Blue-tinted gray-600
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#ffffff',
      },
      {
        weight: 1.5,
      },
    ],
  },

  // Points of interest - business
  {
    featureType: 'poi.business',
    stylers: [
      {
        visibility: 'off', // Hide to reduce clutter
      },
    ],
  },

  // Transit stations - blue accent
  {
    featureType: 'transit.station',
    elementType: 'geometry',
    stylers: [
      {
        color: '#eef4ff', // Indigo-50
      },
    ],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#001a6e', // Blue-600
      },
    ],
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry',
    stylers: [
      {
        color: '#d0dae8', // Blue-tinted gray-300
      },
    ],
  },

  // Administrative boundaries - subtle blue
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#d0dae8', // Blue-tinted gray-300
      },
      {
        weight: 0.5,
      },
    ],
  },
  {
    featureType: 'administrative',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#001a6e', // Blue-600
      },
    ],
  },
  {
    featureType: 'administrative',
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#ffffff',
      },
      {
        weight: 2,
      },
    ],
  },

  // Administrative level 1 (states/provinces) - more prominent
  {
    featureType: 'administrative.province',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#001456', // Blue-700 (darker)
      },
    ],
  },

  // Country borders - blue accent
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#001a6e', // Blue-600
      },
      {
        weight: 1,
      },
    ],
  },

  // Reduce label density for cleaner look
  {
    featureType: 'poi.attraction',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi.government',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi.medical',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi.place_of_worship',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi.school',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi.sports_complex',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
];
=======
/**
 * Default map styles - uses Google Maps default appearance
 * Empty array means no custom styling is applied
 */
export const mapStyles: google.maps.MapTypeStyle[] = [];
>>>>>>> 2f046bdd461abb2fc1954e90cc123f1676d3f4e3

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
<<<<<<< HEAD
    stylers: [
      {
        color: '#001a6e', // Blue-tinted gray
      },
    ],
  },
  {
    featureType: 'poi',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'transit',
    stylers: [
      {
        visibility: 'on',
      },
    ],
=======
    stylers: [{ color: '#eff2f9' }],
  },
  {
    featureType: 'poi',
    stylers: [{ visibility: 'simplified' }],
>>>>>>> 2f046bdd461abb2fc1954e90cc123f1676d3f4e3
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
  minZoom: 2, // Prevent zooming out too far to avoid world duplication
  maxZoom: 20, // Allow detailed zoom
  restriction: {
    latLngBounds: {
      north: 85,
      south: -85,
      west: -180,
      east: 180,
    },
    strictBounds: false, // Allow some panning beyond bounds but prevent wrapping
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
