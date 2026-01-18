'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from '@react-google-maps/api';
import { Journey, JourneyPlace } from '@/types/journey.types';
import { viargoMapOptions } from '@/constants/map-styles';

interface MapLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  address?: string;
  day?: string;
  journey: Journey;
  place: JourneyPlace;
}

interface ExploreMapProps {
  journeys: Journey[];
  selectedJourney?: Journey | null;
  onMapClick?: (event: google.maps.MapMouseEvent) => void;
  center?: { lat: number; lng: number };
  onBoundsChange?: (center: { lat: number; lng: number }, radius: number) => void;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

// Default center coordinates (world center)
const defaultCenter = {
  lat: 20.0,
  lng: 0.0,
};

// Static libraries array to prevent LoadScript reloading
const GOOGLE_MAPS_LIBRARIES: 'places'[] = ['places'];

// Mock coordinates for different cities/countries (in a real app, you'd use geocoding)
const mockCoordinates: { [key: string]: { lat: number; lng: number } } = {
  // Popular cities
  paris: { lat: 48.8566, lng: 2.3522 },
  london: { lat: 51.5074, lng: -0.1278 },
  'new york': { lat: 40.7128, lng: -74.006 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
  delhi: { lat: 28.6139, lng: 77.209 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  pune: { lat: 18.5204, lng: 73.8567 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  surat: { lat: 21.1702, lng: 72.8311 },
  lucknow: { lat: 26.8467, lng: 80.9462 },
  kanpur: { lat: 26.4499, lng: 80.3319 },
  nagpur: { lat: 21.1458, lng: 79.0882 },
  indore: { lat: 22.7196, lng: 75.8577 },
  thane: { lat: 19.2183, lng: 72.9781 },
  bhopal: { lat: 23.2599, lng: 77.4126 },
  visakhapatnam: { lat: 17.6868, lng: 83.2185 },
  pimpri: { lat: 18.6298, lng: 73.7997 },
  patna: { lat: 25.5941, lng: 85.1376 },
  vadodara: { lat: 22.3072, lng: 73.1812 },
  ghaziabad: { lat: 28.6692, lng: 77.4538 },
  ludhiana: { lat: 30.901, lng: 75.8573 },
  agra: { lat: 27.1767, lng: 78.0081 },
  nashik: { lat: 19.9975, lng: 73.7898 },
  faridabad: { lat: 28.4089, lng: 77.3178 },
  meerut: { lat: 28.9845, lng: 77.7064 },
  rajkot: { lat: 22.3039, lng: 70.8022 },
  kalyan: { lat: 19.2437, lng: 73.1355 },
  vasai: { lat: 19.4912, lng: 72.8054 },
  varanasi: { lat: 25.3176, lng: 82.9739 },
  srinagar: { lat: 34.0837, lng: 74.7973 },
  aurangabad: { lat: 19.8762, lng: 75.3433 },
  dhanbad: { lat: 23.7957, lng: 86.4304 },
  amritsar: { lat: 31.634, lng: 74.8723 },
  'navi mumbai': { lat: 19.033, lng: 73.0297 },
  allahabad: { lat: 25.4358, lng: 81.8463 },
  ranchi: { lat: 23.3441, lng: 85.3096 },
  howrah: { lat: 22.5958, lng: 88.2636 },
  coimbatore: { lat: 11.0168, lng: 76.9558 },
  jabalpur: { lat: 23.1815, lng: 79.9864 },
  gwalior: { lat: 26.2183, lng: 78.1828 },
  vijayawada: { lat: 16.5062, lng: 80.648 },
  jodhpur: { lat: 26.2389, lng: 73.0243 },
  madurai: { lat: 9.9252, lng: 78.1198 },
  raipur: { lat: 21.2514, lng: 81.6296 },
  kota: { lat: 25.2138, lng: 75.8648 },
  guwahati: { lat: 26.1445, lng: 91.7362 },
  chandigarh: { lat: 30.7333, lng: 76.7794 },
  solapur: { lat: 17.6599, lng: 75.9064 },
  hubli: { lat: 15.3647, lng: 75.124 },
  tiruchirappalli: { lat: 10.7905, lng: 78.7047 },
  bareilly: { lat: 28.367, lng: 79.4304 },
  mysore: { lat: 12.2958, lng: 76.6394 },
  tiruppur: { lat: 11.1085, lng: 77.3411 },
  gurgaon: { lat: 28.4595, lng: 77.0266 },
  aligarh: { lat: 27.8974, lng: 78.088 },
  jalandhar: { lat: 31.326, lng: 75.5762 },
  bhubaneswar: { lat: 20.2961, lng: 85.8245 },
  salem: { lat: 11.6643, lng: 78.146 },
  warangal: { lat: 17.9689, lng: 79.5941 },
  'mira bhayandar': { lat: 19.2952, lng: 72.8544 },
  thiruvananthapuram: { lat: 8.5241, lng: 76.9366 },
  bhiwandi: { lat: 19.3002, lng: 73.0582 },
  saharanpur: { lat: 29.968, lng: 77.5552 },
  gorakhpur: { lat: 26.7606, lng: 83.3732 },
  guntur: { lat: 16.3067, lng: 80.4365 },
  bikaner: { lat: 28.0229, lng: 73.3119 },
  amravati: { lat: 20.9319, lng: 77.7523 },
  noida: { lat: 28.5355, lng: 77.391 },
  jamshedpur: { lat: 22.8046, lng: 86.2029 },
  'bhilai nagar': { lat: 21.1938, lng: 81.3509 },
  cuttack: { lat: 20.4625, lng: 85.8828 },
  firozabad: { lat: 27.1592, lng: 78.3957 },
  kochi: { lat: 9.9312, lng: 76.2673 },
  nellore: { lat: 14.4426, lng: 79.9865 },
  bhavnagar: { lat: 21.7645, lng: 72.1519 },
  dehradun: { lat: 30.3165, lng: 78.0322 },
  durgapur: { lat: 23.5204, lng: 87.3119 },
  asansol: { lat: 23.6839, lng: 86.9523 },
  rourkela: { lat: 22.2604, lng: 84.8536 },
  nanded: { lat: 19.1383, lng: 77.2975 },
  kolhapur: { lat: 16.705, lng: 74.2433 },
  ajmer: { lat: 26.4499, lng: 74.6399 },
  akola: { lat: 20.7002, lng: 77.0082 },
  gulbarga: { lat: 17.3297, lng: 76.8343 },
  jamnagar: { lat: 22.4707, lng: 70.0577 },
  ujjain: { lat: 23.1765, lng: 75.7885 },
  loni: { lat: 28.7333, lng: 77.2833 },
  siliguri: { lat: 26.7271, lng: 88.3953 },
  jhansi: { lat: 25.4484, lng: 78.5685 },
  ulhasnagar: { lat: 19.2215, lng: 73.1645 },
  jammu: { lat: 32.7266, lng: 74.857 },
  'sangli miraj kupwad': { lat: 16.8524, lng: 74.5815 },
  mangalore: { lat: 12.9141, lng: 74.856 },
  erode: { lat: 11.341, lng: 77.7172 },
  belgaum: { lat: 15.8497, lng: 74.4977 },
  ambattur: { lat: 13.0982, lng: 80.1592 },
  tirunelveli: { lat: 8.7139, lng: 77.7567 },
  malegaon: { lat: 20.5579, lng: 74.5287 },
  gaya: { lat: 24.7914, lng: 84.9787 },
  jalgaon: { lat: 21.0077, lng: 75.5626 },
  udaipur: { lat: 24.5854, lng: 73.7125 },
  maheshtala: { lat: 22.4978, lng: 88.2516 },
};

// Function to get coordinates for a place name
const getCoordinatesForPlace = (
  placeName: string,
  journeyTitle: string
): { lat: number; lng: number } => {
  const searchTerm = placeName.toLowerCase();

  // First, try to match exact place name
  if (mockCoordinates[searchTerm]) {
    return mockCoordinates[searchTerm];
  }

  // Try to find a match in journey title
  const journeyTitleLower = journeyTitle.toLowerCase();
  for (const [city, coords] of Object.entries(mockCoordinates)) {
    if (journeyTitleLower.includes(city) || searchTerm.includes(city)) {
      return coords;
    }
  }

  // Default to a location with some randomness
  const baseIndex =
    Math.abs(placeName.length + journeyTitle.length) %
    Object.keys(mockCoordinates).length;
  const cities = Object.keys(mockCoordinates);
  const selectedCity = cities[baseIndex];
  const baseCoords = mockCoordinates[selectedCity];

  // Add small random offset to avoid overlapping markers
  return {
    lat: baseCoords.lat + (Math.random() - 0.5) * 0.01,
    lng: baseCoords.lng + (Math.random() - 0.5) * 0.01,
  };
};

export default function ExploreMap({
  journeys,
  selectedJourney,
  onMapClick,
  center,
  onBoundsChange,
}: ExploreMapProps) {
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(
    null
  );
  const [mapLocations, setMapLocations] = useState<MapLocation[]>([]);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const boundsChangeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true);
  const lastBoundsRef = useRef<{ center: { lat: number; lng: number }; radius: number } | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // Helper function to validate coordinates
  const isValidCoordinate = useCallback((lat: number, lng: number): boolean => {
    return (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      isFinite(lat) &&
      isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  }, []);

  // Convert journeys to map locations - Show ALL places from each journey
  useEffect(() => {
    const locations: MapLocation[] = [];
    const journeysToProcess = selectedJourney ? [selectedJourney] : journeys;

    console.log('[EXPLORE_MAP] Processing journeys for map display', {
      totalJourneys: journeysToProcess.length,
      selectedJourneyId: selectedJourney?.id,
    });

    journeysToProcess.forEach(journey => {
      if (!journey.days || journey.days.length === 0) {
        console.log('[EXPLORE_MAP] Journey has no days', { journeyId: journey.id });
        return;
      }

      // Iterate through all days and all places
      journey.days.forEach((day) => {
        if (!day.places || day.places.length === 0) {
          console.log('[EXPLORE_MAP] Day has no places', { 
            journeyId: journey.id, 
            dayId: day.id 
          });
          return;
        }

        day.places.forEach((place, placeIndex) => {
          // Get coordinates from the place
          let lat: number | null = null;
          let lng: number | null = null;
          let usedRealCoords = false;

          // Try to parse latitude and longitude from place
          if (place.latitude !== undefined && place.longitude !== undefined) {
            const latValue = typeof place.latitude === 'number' 
              ? place.latitude 
              : parseFloat(String(place.latitude));
            const lngValue = typeof place.longitude === 'number'
              ? place.longitude
              : parseFloat(String(place.longitude));
            
            if (!isNaN(latValue) && !isNaN(lngValue)) {
              lat = latValue;
              lng = lngValue;
              usedRealCoords = true;
            }
          }

          // Fallback to mock coordinates if no valid coords
          if (!lat || !lng || !isValidCoordinate(lat, lng)) {
            const mockCoords = getCoordinatesForPlace(place.name, journey.title);
            lat = mockCoords.lat + (placeIndex * 0.002); // Small offset to prevent overlap
            lng = mockCoords.lng + (placeIndex * 0.002);
            console.log('[EXPLORE_MAP] Using mock coordinates for place', {
              placeName: place.name,
              journeyId: journey.id,
              originalLat: place.latitude,
              originalLng: place.longitude,
            });
          }

          // Only add if we have valid coordinates
          if (lat && lng && isValidCoordinate(lat, lng)) {
            // Map place type to lowercase for consistency
            const placeType = place.type.toLowerCase();

            locations.push({
              id: `journey-${journey.id}-day-${day.id}-place-${place.id}`,
              name: place.name,
              lat: lat,
              lng: lng,
              type: placeType,
              address: place.address || place.description,
              day: `Day ${day.dayNumber + 1}`,
              journey: journey,
              place: place,
            });

            console.log('[EXPLORE_MAP] Added place to map', {
              placeName: place.name,
              placeType,
              coordinates: { lat, lng },
              usedRealCoords,
              journeyTitle: journey.title,
            });
          }
        });
      });
    });

    console.log('[EXPLORE_MAP] Map locations processed', {
      totalLocations: locations.length,
      realCoordinates: locations.filter(l => l.place.latitude && l.place.longitude).length,
      mockCoordinates: locations.filter(l => !l.place.latitude || !l.place.longitude).length,
    });

    setMapLocations(locations);
  }, [journeys, selectedJourney, isValidCoordinate]);

  const onLoad = useCallback(
    (mapInstance: google.maps.Map) => {
      setMap(mapInstance);

      if (mapLocations.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        mapLocations.forEach(location => {
          // Only add valid coordinates to bounds
          if (isValidCoordinate(location.lat, location.lng)) {
            bounds.extend({ lat: location.lat, lng: location.lng });
          }
        });

        // Only fit bounds if we have valid locations
        if (!bounds.isEmpty()) {
          // Add padding to the bounds for better visibility
          const padding = {
            top: 50,
            right: 50,
            bottom: 50,
            left: 50,
          };
          mapInstance.fitBounds(bounds, padding);
        }
      } else {
        // If no locations, use provided center or default to world center
        const mapCenter = center || defaultCenter;
        mapInstance.setZoom(center ? 10 : 2);
        mapInstance.setCenter(mapCenter);
      }

      // Enable bounds change tracking after map loads and settles
      setTimeout(() => {
        isInitialLoadRef.current = false;
        console.log('[EXPLORE_MAP] Map loaded, enabling bounds change tracking');
      }, 2000); // Wait 2 seconds for map to settle
    },
    [mapLocations, center, isValidCoordinate]
  );

  // Update map center when center prop changes (only if no locations to show)
  useEffect(() => {
    if (map && isLoaded && center && mapLocations.length === 0) {
      try {
        // Temporarily disable bounds tracking during programmatic updates
        isInitialLoadRef.current = true;
        
        map.setCenter(center);
        map.setZoom(11); // Zoom in a bit more to see local area
        
        // Re-enable after a short delay
        setTimeout(() => {
          isInitialLoadRef.current = false;
        }, 500);
      } catch (error) {
        console.error('Error updating map center:', error);
      }
    }
  }, [map, isLoaded, center, mapLocations.length]);

  const onUnmount = useCallback(() => {
    // Cleanup timer on unmount
    if (boundsChangeTimerRef.current) {
      clearTimeout(boundsChangeTimerRef.current);
    }
  }, []);

  // Calculate radius from map bounds
  const calculateRadiusFromBounds = useCallback((bounds: google.maps.LatLngBounds, center: google.maps.LatLng) => {
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    
    // Calculate the distance from center to corner (diagonal)
    const R = 6371; // Earth's radius in km
    const lat1 = center.lat() * Math.PI / 180;
    const lat2 = ne.lat() * Math.PI / 180;
    const deltaLat = (ne.lat() - center.lat()) * Math.PI / 180;
    const deltaLng = (ne.lng() - center.lng()) * Math.PI / 180;
    
    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.ceil(distance);
  }, []);

  // Handle map bounds change (zoom/pan)
  const handleBoundsChanged = useCallback(() => {
    if (!map || !onBoundsChange) return;

    // Skip initial map loads (first few bounds changes)
    if (isInitialLoadRef.current) {
      console.log('[EXPLORE_MAP] Skipping initial bounds change');
      return;
    }

    // Clear existing timer
    if (boundsChangeTimerRef.current) {
      clearTimeout(boundsChangeTimerRef.current);
    }

    // Debounce the bounds change event
    boundsChangeTimerRef.current = setTimeout(() => {
      const bounds = map.getBounds();
      const center = map.getCenter();
      
      if (bounds && center) {
        const newCenter = {
          lat: center.lat(),
          lng: center.lng(),
        };
        const radius = calculateRadiusFromBounds(bounds, center);
        
        // Check if the change is significant enough to warrant a new fetch
        const lastBounds = lastBoundsRef.current;
        if (lastBounds) {
          const centerDiff = Math.sqrt(
            Math.pow(newCenter.lat - lastBounds.center.lat, 2) +
            Math.pow(newCenter.lng - lastBounds.center.lng, 2)
          );
          const radiusDiff = Math.abs(radius - lastBounds.radius);
          
          // Only fetch if moved significantly (0.01 degrees ~= 1km) or radius changed by more than 5km
          if (centerDiff < 0.01 && radiusDiff < 5) {
            console.log('[EXPLORE_MAP] Change too small, skipping fetch', {
              centerDiff,
              radiusDiff,
            });
            return;
          }
        }
        
        console.log('[EXPLORE_MAP] Map bounds changed significantly', {
          center: newCenter,
          radius,
          zoom: map.getZoom(),
        });

        // Update refs
        lastBoundsRef.current = { center: newCenter, radius };
        onBoundsChange(newCenter, radius);
      }
    }, 1500); // 1.5 second debounce
  }, [map, onBoundsChange, calculateRadiusFromBounds]);

  const handleMarkerClick = useCallback(
    (location: MapLocation) => {
      // Show info window with place details
      setSelectedLocation(location);
    },
    []
  );

  // Generate marker icon based on place type with color coding
  const getMarkerIcon = useCallback((location: MapLocation) => {
    // Get color and icon based on place type - Light blue theme
    const getTypeColor = (type: string): string => {
      const typeColors: { [key: string]: string } = {
        'stay': '#3b82f6',      // Bright sky blue for hotels/stays
        'activity': '#60a5fa',  // Light blue for activities
        'food': '#2563eb',      // Medium blue for food
        'transport': '#0ea5e9', // Cyan blue for transport
        'note': '#06b6d4',      // Teal blue for notes
      };
      return typeColors[type.toLowerCase()] || '#3b82f6'; // Default to bright blue
    };

    const getTypeEmoji = (type: string): string => {
      const typeEmojis: { [key: string]: string } = {
        'stay': '🏨',
        'activity': '🎯',
        'food': '🍽️',
        'transport': '🚗',
        'note': '📝',
      };
      return typeEmojis[type.toLowerCase()] || '📍';
    };

    const backgroundColor = getTypeColor(location.type);
    const emoji = getTypeEmoji(location.type);

    // Modern marker dimensions - larger and more visible
    const markerWidth = 44;
    const markerHeight = 54;
    const circleRadius = 18;
    const circleCenterX = markerWidth / 2;
    const circleCenterY = circleRadius + 2;

    // Create modern SVG marker with pin shape
    const svgContent = `
      <svg width="${markerWidth}" height="${markerHeight}" viewBox="0 0 ${markerWidth} ${markerHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Shadow filter for depth -->
          <filter id="shadow-${location.id}" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <!-- Gradient for depth -->
          <linearGradient id="grad-${location.id}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:${backgroundColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${backgroundColor};stop-opacity:0.85" />
          </linearGradient>
        </defs>
        
        <!-- Pin shape with shadow -->
        <g filter="url(#shadow-${location.id})">
          <!-- Main pin body -->
          <path d="M ${circleCenterX} ${markerHeight - 2} 
                   Q ${circleCenterX} ${circleCenterY + circleRadius + 8}, 
                     ${circleCenterX} ${circleCenterY + circleRadius}
                   A ${circleRadius} ${circleRadius} 0 1 1 ${circleCenterX} ${circleCenterY + circleRadius}
                   Z" 
                fill="url(#grad-${location.id})" 
                stroke="white" 
                stroke-width="2.5"/>
          
          <!-- Inner white circle for emoji background -->
          <circle cx="${circleCenterX}" cy="${circleCenterY}" r="${circleRadius - 4}" 
                  fill="white" opacity="0.95"/>
          
          <!-- Colored circle behind emoji -->
          <circle cx="${circleCenterX}" cy="${circleCenterY}" r="${circleRadius - 6}" 
                  fill="${backgroundColor}" opacity="0.15"/>
        </g>
        
        <!-- Emoji icon -->
        <text x="${circleCenterX}" y="${circleCenterY + 1}" 
              text-anchor="middle" 
              font-size="20" 
              font-family="Arial, sans-serif" 
              dominant-baseline="middle">${emoji}</text>
        
        <!-- Subtle highlight on top -->
        <circle cx="${circleCenterX}" cy="${circleCenterY - 6}" r="4" 
                fill="white" opacity="0.4"/>
      </svg>
    `;

    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgContent)}`,
      scaledSize: new window.google.maps.Size(markerWidth, markerHeight),
      anchor: new window.google.maps.Point(markerWidth / 2, markerHeight - 2),
    };
  }, []);

  const getTypeLabel = (type: string) => {
    const labels = {
      stay: 'Stay',
      activity: 'Activity',
      food: 'Food',
      transport: 'Transport',
      note: 'Note',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      stay: '🏨',
      activity: '🎯',
      food: '🍽️',
      transport: '🚗',
      note: '📝',
    };
    return icons[type as keyof typeof icons] || '📍';
  };

  // Ensure center is always a valid object
  const mapCenter = center || defaultCenter;

  // Early return after all hooks (Rules of Hooks)
  if (!isLoaded) {
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

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={mapCenter}
      zoom={center ? 10 : 2}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={onMapClick}
      onBoundsChanged={handleBoundsChanged}
      options={viargoMapOptions}
    >
      {/* Render map markers */}
      {mapLocations
        .filter(location => isValidCoordinate(location.lat, location.lng))
        .map(location => (
          <Marker
            key={location.id}
            position={{ lat: location.lat, lng: location.lng }}
            icon={getMarkerIcon(location)}
            onClick={() => handleMarkerClick(location)}
            zIndex={1000} // Keep markers above map layers
          />
        ))}

      {selectedLocation && (
        <InfoWindow
          position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
          onCloseClick={() => setSelectedLocation(null)}
        >
          <div className="p-3 min-w-[280px] max-w-[320px]">
            {/* Place Type Badge */}
            <div className="flex items-center gap-2 mb-3">
              <span 
                className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                style={{
                  backgroundColor: 
                    selectedLocation.type === 'stay' ? '#2563eb' :
                    selectedLocation.type === 'activity' ? '#16a34a' :
                    selectedLocation.type === 'food' ? '#dc2626' :
                    selectedLocation.type === 'transport' ? '#7c3aed' :
                    selectedLocation.type === 'note' ? '#eab308' : '#6366f1'
                }}
              >
                {getTypeIcon(selectedLocation.type)} {getTypeLabel(selectedLocation.type)}
              </span>
              <span className="text-xs text-gray-500">{selectedLocation.day}</span>
            </div>

            {/* Place Name */}
            <h3 className="font-bold text-gray-900 text-base mb-2">
              {selectedLocation.name}
            </h3>

            {/* Address */}
            {selectedLocation.address && (
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                📍 {selectedLocation.address}
              </p>
            )}

            {/* Journey Info */}
            <div className="border-t border-gray-200 pt-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {selectedLocation.journey.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    by {selectedLocation.journey.user.username}
                  </p>
                </div>
              </div>

              {/* Time if available */}
              {selectedLocation.place.startTime && selectedLocation.place.endTime && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{selectedLocation.place.startTime} - {selectedLocation.place.endTime}</span>
                </div>
              )}

              {/* View Journey Button */}
              <button
                onClick={() => router.push(`/journey/${selectedLocation.journey.id}`)}
                className="w-full mt-2 px-3 py-2 bg-[#001A6E] text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                View Full Journey
              </button>
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
