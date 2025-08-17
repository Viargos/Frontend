"use client";

import { useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
  Polyline,
} from "@react-google-maps/api";
import { Journey, JourneyPlace } from '@/types/journey.types';

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
  onLocationClick?: (location: MapLocation) => void;
  onMapClick?: (event: google.maps.MapMouseEvent) => void;
}

const containerStyle = {
  width: "100%",
  height: "100%",
};

// Default center coordinates (world center)
const defaultCenter = {
  lat: 20.0, 
  lng: 0.0,
};

// Static libraries array to prevent LoadScript reloading
const GOOGLE_MAPS_LIBRARIES: ("places")[] = ["places"];

// Mock coordinates for different cities/countries (in a real app, you'd use geocoding)
const mockCoordinates: { [key: string]: { lat: number; lng: number } } = {
  // Popular cities
  'paris': { lat: 48.8566, lng: 2.3522 },
  'london': { lat: 51.5074, lng: -0.1278 },
  'new york': { lat: 40.7128, lng: -74.0060 },
  'tokyo': { lat: 35.6762, lng: 139.6503 },
  'delhi': { lat: 28.6139, lng: 77.2090 },
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'hyderabad': { lat: 17.3850, lng: 78.4867 },
  'chennai': { lat: 13.0827, lng: 80.2707 },
  'kolkata': { lat: 22.5726, lng: 88.3639 },
  'pune': { lat: 18.5204, lng: 73.8567 },
  'ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'jaipur': { lat: 26.9124, lng: 75.7873 },
  'surat': { lat: 21.1702, lng: 72.8311 },
  'lucknow': { lat: 26.8467, lng: 80.9462 },
  'kanpur': { lat: 26.4499, lng: 80.3319 },
  'nagpur': { lat: 21.1458, lng: 79.0882 },
  'indore': { lat: 22.7196, lng: 75.8577 },
  'thane': { lat: 19.2183, lng: 72.9781 },
  'bhopal': { lat: 23.2599, lng: 77.4126 },
  'visakhapatnam': { lat: 17.6868, lng: 83.2185 },
  'pimpri': { lat: 18.6298, lng: 73.7997 },
  'patna': { lat: 25.5941, lng: 85.1376 },
  'vadodara': { lat: 22.3072, lng: 73.1812 },
  'ghaziabad': { lat: 28.6692, lng: 77.4538 },
  'ludhiana': { lat: 30.9010, lng: 75.8573 },
  'agra': { lat: 27.1767, lng: 78.0081 },
  'nashik': { lat: 19.9975, lng: 73.7898 },
  'faridabad': { lat: 28.4089, lng: 77.3178 },
  'meerut': { lat: 28.9845, lng: 77.7064 },
  'rajkot': { lat: 22.3039, lng: 70.8022 },
  'kalyan': { lat: 19.2437, lng: 73.1355 },
  'vasai': { lat: 19.4912, lng: 72.8054 },
  'varanasi': { lat: 25.3176, lng: 82.9739 },
  'srinagar': { lat: 34.0837, lng: 74.7973 },
  'aurangabad': { lat: 19.8762, lng: 75.3433 },
  'dhanbad': { lat: 23.7957, lng: 86.4304 },
  'amritsar': { lat: 31.6340, lng: 74.8723 },
  'navi mumbai': { lat: 19.0330, lng: 73.0297 },
  'allahabad': { lat: 25.4358, lng: 81.8463 },
  'ranchi': { lat: 23.3441, lng: 85.3096 },
  'howrah': { lat: 22.5958, lng: 88.2636 },
  'coimbatore': { lat: 11.0168, lng: 76.9558 },
  'jabalpur': { lat: 23.1815, lng: 79.9864 },
  'gwalior': { lat: 26.2183, lng: 78.1828 },
  'vijayawada': { lat: 16.5062, lng: 80.6480 },
  'jodhpur': { lat: 26.2389, lng: 73.0243 },
  'madurai': { lat: 9.9252, lng: 78.1198 },
  'raipur': { lat: 21.2514, lng: 81.6296 },
  'kota': { lat: 25.2138, lng: 75.8648 },
  'guwahati': { lat: 26.1445, lng: 91.7362 },
  'chandigarh': { lat: 30.7333, lng: 76.7794 },
  'solapur': { lat: 17.6599, lng: 75.9064 },
  'hubli': { lat: 15.3647, lng: 75.1240 },
  'tiruchirappalli': { lat: 10.7905, lng: 78.7047 },
  'bareilly': { lat: 28.3670, lng: 79.4304 },
  'mysore': { lat: 12.2958, lng: 76.6394 },
  'tiruppur': { lat: 11.1085, lng: 77.3411 },
  'gurgaon': { lat: 28.4595, lng: 77.0266 },
  'aligarh': { lat: 27.8974, lng: 78.0880 },
  'jalandhar': { lat: 31.3260, lng: 75.5762 },
  'bhubaneswar': { lat: 20.2961, lng: 85.8245 },
  'salem': { lat: 11.6643, lng: 78.1460 },
  'warangal': { lat: 17.9689, lng: 79.5941 },
  'mira bhayandar': { lat: 19.2952, lng: 72.8544 },
  'thiruvananthapuram': { lat: 8.5241, lng: 76.9366 },
  'bhiwandi': { lat: 19.3002, lng: 73.0582 },
  'saharanpur': { lat: 29.9680, lng: 77.5552 },
  'gorakhpur': { lat: 26.7606, lng: 83.3732 },
  'guntur': { lat: 16.3067, lng: 80.4365 },
  'bikaner': { lat: 28.0229, lng: 73.3119 },
  'amravati': { lat: 20.9319, lng: 77.7523 },
  'noida': { lat: 28.5355, lng: 77.3910 },
  'jamshedpur': { lat: 22.8046, lng: 86.2029 },
  'bhilai nagar': { lat: 21.1938, lng: 81.3509 },
  'cuttack': { lat: 20.4625, lng: 85.8828 },
  'firozabad': { lat: 27.1592, lng: 78.3957 },
  'kochi': { lat: 9.9312, lng: 76.2673 },
  'nellore': { lat: 14.4426, lng: 79.9865 },
  'bhavnagar': { lat: 21.7645, lng: 72.1519 },
  'dehradun': { lat: 30.3165, lng: 78.0322 },
  'durgapur': { lat: 23.5204, lng: 87.3119 },
  'asansol': { lat: 23.6839, lng: 86.9523 },
  'rourkela': { lat: 22.2604, lng: 84.8536 },
  'nanded': { lat: 19.1383, lng: 77.2975 },
  'kolhapur': { lat: 16.7050, lng: 74.2433 },
  'ajmer': { lat: 26.4499, lng: 74.6399 },
  'akola': { lat: 20.7002, lng: 77.0082 },
  'gulbarga': { lat: 17.3297, lng: 76.8343 },
  'jamnagar': { lat: 22.4707, lng: 70.0577 },
  'ujjain': { lat: 23.1765, lng: 75.7885 },
  'loni': { lat: 28.7333, lng: 77.2833 },
  'siliguri': { lat: 26.7271, lng: 88.3953 },
  'jhansi': { lat: 25.4484, lng: 78.5685 },
  'ulhasnagar': { lat: 19.2215, lng: 73.1645 },
  'jammu': { lat: 32.7266, lng: 74.8570 },
  'sangli miraj kupwad': { lat: 16.8524, lng: 74.5815 },
  'mangalore': { lat: 12.9141, lng: 74.8560 },
  'erode': { lat: 11.3410, lng: 77.7172 },
  'belgaum': { lat: 15.8497, lng: 74.4977 },
  'ambattur': { lat: 13.0982, lng: 80.1592 },
  'tirunelveli': { lat: 8.7139, lng: 77.7567 },
  'malegaon': { lat: 20.5579, lng: 74.5287 },
  'gaya': { lat: 24.7914, lng: 84.9787 },
  'jalgaon': { lat: 21.0077, lng: 75.5626 },
  'udaipur': { lat: 24.5854, lng: 73.7125 },
  'maheshtala': { lat: 22.4978, lng: 88.2516 },
};

// Function to get coordinates for a place name
const getCoordinatesForPlace = (placeName: string, journeyTitle: string): { lat: number; lng: number } => {
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
  const baseIndex = Math.abs(placeName.length + journeyTitle.length) % Object.keys(mockCoordinates).length;
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
  onLocationClick,
  onMapClick,
}: ExploreMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [mapLocations, setMapLocations] = useState<MapLocation[]>([]);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // Convert journeys to map locations
  useEffect(() => {
    const locations: MapLocation[] = [];
    const journeysToProcess = selectedJourney ? [selectedJourney] : journeys;

    journeysToProcess.forEach(journey => {
      if (journey.days) {
        journey.days.forEach(day => {
          if (day.places) {
            day.places.forEach(place => {
              const coords = getCoordinatesForPlace(place.name, journey.title);
              
              locations.push({
                id: `${journey.id}-${day.id}-${place.id}`,
                name: place.name,
                lat: coords.lat,
                lng: coords.lng,
                type: place.type.toLowerCase(),
                day: `Day ${day.dayNumber}`,
                journey: journey,
                place: place,
              });
            });
          }
        });
      }
    });

    setMapLocations(locations);
  }, [journeys, selectedJourney]);

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      if (mapLocations.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        mapLocations.forEach((location) => {
          bounds.extend({ lat: location.lat, lng: location.lng });
        });
        map.fitBounds(bounds);
        
        // Add padding to the bounds for better visibility
        const padding = { 
          top: 50, 
          right: 50, 
          bottom: 50, 
          left: 50 
        };
        map.fitBounds(bounds, padding);
      } else {
        // If no locations, zoom to a reasonable level
        map.setZoom(3);
        map.setCenter(defaultCenter);
      }
    },
    [mapLocations]
  );

  const onUnmount = useCallback(() => {
    // Cleanup if needed
  }, []);

  const handleMarkerClick = useCallback(
    (location: MapLocation) => {
      setSelectedLocation(location);
      onLocationClick?.(location);
    },
    [onLocationClick]
  );

  const getMarkerIcon = (type: string) => {
    // Color coding for different place types
    const colors = {
      stay: '#FF6B35', // Orange
      activity: '#45B7D1', // Blue
      food: '#4ECDC4', // Teal
      transport: '#96CEB4', // Green
      note: '#FF6B6B', // Red
    };
    
    const markerColor = colors[type as keyof typeof colors] || '#001a6e';

    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="${markerColor}" stroke="white" stroke-width="1"/>
          <circle cx="12" cy="9" r="2" fill="white"/>
        </svg>
      `)}`,
      scaledSize: new window.google.maps.Size(24, 24),
      anchor: new window.google.maps.Point(12, 24),
    };
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      stay: 'Stay',
      activity: 'Activity', 
      food: 'Food',
      transport: 'Transport',
      note: 'Note'
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
            transition={{ duration: 0.3, delay: 0.4, type: "spring", stiffness: 200 }}
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

  // Group locations by journey for different colored paths
  const pathsByJourney = mapLocations.reduce((acc, location) => {
    const journeyId = location.journey.id;
    if (!acc[journeyId]) {
      acc[journeyId] = {
        journey: location.journey,
        locations: []
      };
    }
    acc[journeyId].locations.push(location);
    return acc;
  }, {} as Record<string, { journey: Journey; locations: MapLocation[] }>);

  // Generate colors for different journeys
  const journeyColors = [
    '#FF6B35', // Orange
    '#45B7D1', // Blue  
    '#4ECDC4', // Teal
    '#96CEB4', // Green
    '#FF6B6B', // Red
    '#6B66FF', // Purple
    '#FFD166', // Yellow
  ];

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={3}
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
      {/* Draw polylines for each journey */}
      {Object.entries(pathsByJourney).map(([journeyId, journeyData], index) => {
        const locations = journeyData.locations;
        if (locations.length < 2) return null;

        // Sort locations by day and then by place order
        const sortedLocations = [...locations].sort((a, b) => {
          const dayA = parseInt(a.day?.replace('Day ', '') || '0');
          const dayB = parseInt(b.day?.replace('Day ', '') || '0');
          if (dayA !== dayB) return dayA - dayB;
          
          // If same day, maintain original order
          return 0;
        });

        const path = sortedLocations.map(loc => ({ lat: loc.lat, lng: loc.lng }));
        const color = journeyColors[index % journeyColors.length];
        
        return (
          <Polyline
            key={`journey-path-${journeyId}`}
            path={path}
            options={{
              strokeColor: color,
              strokeOpacity: selectedJourney ? 1 : 0.6,
              strokeWeight: selectedJourney ? 4 : 2,
              geodesic: true,
            }}
          />
        );
      })}

      {/* Render map markers */}
      {mapLocations.map((location) => (
        <Marker
          key={location.id}
          position={{ lat: location.lat, lng: location.lng }}
          icon={getMarkerIcon(location.type)}
          onClick={() => handleMarkerClick(location)}
        />
      ))}

      {selectedLocation && (
        <InfoWindow
          position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
          onCloseClick={() => setSelectedLocation(null)}
        >
          <div className="p-2 min-w-[200px]">
            <div className="flex items-start gap-2 mb-2">
              <span className="text-lg">{getTypeIcon(selectedLocation.type)}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {selectedLocation.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {getTypeLabel(selectedLocation.type)}
                </p>
              </div>
            </div>
            
            <div className="border-t pt-2 mt-2 space-y-1">
              <div className="text-xs text-gray-600">
                <strong>Journey:</strong> {selectedLocation.journey.title}
              </div>
              <div className="text-xs text-gray-600">
                <strong>Day:</strong> {selectedLocation.day}
              </div>
              <div className="text-xs text-gray-600">
                <strong>By:</strong> {selectedLocation.journey.user.username}
              </div>
              {selectedLocation.place.description && (
                <div className="text-xs text-gray-600 mt-1">
                  <strong>Description:</strong> {selectedLocation.place.description}
                </div>
              )}
              {selectedLocation.place.startTime && selectedLocation.place.endTime && (
                <div className="text-xs text-gray-600">
                  <strong>Time:</strong> {selectedLocation.place.startTime} - {selectedLocation.place.endTime}
                </div>
              )}
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
