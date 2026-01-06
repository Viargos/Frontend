/**
 * Reusable Google Maps Styles
 *
 * Custom map styling that matches the Viargos application theme
 * with white and blue-600 (#001a6e) color scheme.
 *
 * Usage:
 * import { mapStyles } from '@/constants/map-styles';
 * <GoogleMap options={{ styles: mapStyles }} />
 */

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
        color: '#001a6e', // Blue-600
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
        color: '#eef4ff', // Indigo-50 for parks
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

/**
 * Alternative minimal style with even less visual noise
 * Perfect for focus on custom markers
 */
export const mapStylesMinimal: google.maps.MapTypeStyle[] = [
  {
    featureType: 'all',
    elementType: 'labels',
    stylers: [
      {
        visibility: 'simplified',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [
      {
        color: '#e3ebf5', // Blue-tinted water
      },
    ],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [
      {
        color: '#fafbff', // White with subtle blue tint
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [
      {
        color: '#eff2f9', // Blue-tinted gray
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
        visibility: 'off',
      },
    ],
  },
];

/**
 * Map options preset for Viargos theme
 */
export const viargoMapOptions = {
  styles: mapStyles,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
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
