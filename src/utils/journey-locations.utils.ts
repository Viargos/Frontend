/**
 * Utility functions for extracting and processing journey locations
 */

import { Journey, JourneyDay, JourneyPlace } from '@/types/journey.types';
import { isValidCoordinates } from './geocoding.utils';

export interface JourneyLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  address?: string;
  day?: string;
  dayNumber?: number;
  placeId?: string;
  startTime?: string;
  endTime?: string;
}

/**
 * Extract all locations from a journey's days
 * @param journey - The journey object
 * @returns Array of all locations from all days
 */
export const extractJourneyLocations = (journey: Journey | null): JourneyLocation[] => {
  if (!journey || !journey.days) {
    return [];
  }

  const locations: JourneyLocation[] = [];

  journey.days.forEach((day: JourneyDay) => {
    if (!day.places || day.places.length === 0) {
      return;
    }

    day.places.forEach((place: JourneyPlace) => {
      // Only include places with valid coordinates
      if (
        place.latitude &&
        place.longitude &&
        isValidCoordinates(place.latitude, place.longitude)
      ) {
        const location: JourneyLocation = {
          id: `${journey.id}-${day.id || day.dayNumber}-${place.id}`,
          name: place.name,
          lat:
            typeof place.latitude === 'string'
              ? parseFloat(place.latitude)
              : place.latitude,
          lng:
            typeof place.longitude === 'string'
              ? parseFloat(place.longitude)
              : place.longitude,
          type: mapPlaceTypeToLocationType(place.type),
          address: place.address || place.description || undefined,
          // ✅ Align displayed day label with UI (Day numbers are 0-based in data)
          day: `Day ${day.dayNumber + 1}`,
          dayNumber: day.dayNumber,
          placeId: place.id,
          startTime: place.startTime || undefined,
          endTime: place.endTime || undefined,
        };

        locations.push(location);
      }
    });
  });

  // Sort by day number, then by start time if available
  return locations.sort((a, b) => {
    if (a.dayNumber !== b.dayNumber) {
      return (a.dayNumber || 0) - (b.dayNumber || 0);
    }
    if (a.startTime && b.startTime) {
      return a.startTime.localeCompare(b.startTime);
    }
    return 0;
  });
};

/**
 * Extract locations from a single day
 */
export const extractDayLocations = (day: JourneyDay, journeyId: string): JourneyLocation[] => {
  if (!day.places || day.places.length === 0) {
    return [];
  }

  const locations: JourneyLocation[] = [];

  day.places.forEach((place: JourneyPlace) => {
    if (
      place.latitude &&
      place.longitude &&
      isValidCoordinates(place.latitude, place.longitude)
    ) {
      const location: JourneyLocation = {
        id: `${journeyId}-${day.id || day.dayNumber}-${place.id}`,
        name: place.name,
        lat:
          typeof place.latitude === 'string'
            ? parseFloat(place.latitude)
            : place.latitude,
        lng:
          typeof place.longitude === 'string'
            ? parseFloat(place.longitude)
            : place.longitude,
        type: mapPlaceTypeToLocationType(place.type),
        address: place.address || place.description || undefined,
        // ✅ Align displayed day label with UI
        day: `Day ${day.dayNumber + 1}`,
        dayNumber: day.dayNumber,
        placeId: place.id,
        startTime: place.startTime || undefined,
        endTime: place.endTime || undefined,
      };

      locations.push(location);
    }
  });

  // Sort by start time if available
  return locations.sort((a, b) => {
    if (a.startTime && b.startTime) {
      return a.startTime.localeCompare(b.startTime);
    }
    return 0;
  });
};

/**
 * Map place type enum to location type string
 */
const mapPlaceTypeToLocationType = (placeType: string): string => {
  const typeMap: { [key: string]: string } = {
    STAY: 'stay',
    ACTIVITY: 'activity',
    FOOD: 'food',
    TRANSPORT: 'transport',
    NOTE: 'note',
  };

  return typeMap[placeType] || placeType.toLowerCase() || 'activity';
};

/**
 * Calculate center point from locations
 */
export const calculateLocationsCenter = (locations: JourneyLocation[]): { lat: number; lng: number } => {
  if (locations.length === 0) {
    return { lat: 20.0, lng: 0.0 };
  }

  const validLocations = locations.filter(loc => 
    isValidCoordinates(loc.lat, loc.lng)
  );

  if (validLocations.length === 0) {
    return { lat: 20.0, lng: 0.0 };
  }

  if (validLocations.length === 1) {
    return { lat: validLocations[0].lat, lng: validLocations[0].lng };
  }

  // Calculate average center
  const sum = validLocations.reduce(
    (acc, loc) => ({
      lat: acc.lat + loc.lat,
      lng: acc.lng + loc.lng,
    }),
    { lat: 0, lng: 0 }
  );

  return {
    lat: sum.lat / validLocations.length,
    lng: sum.lng / validLocations.length,
  };
};

