import { Journey } from '@/types/journey.types';
import { RecentJourney } from '@/types/profile.types';

// City coordinates for journey location extraction
const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
  // Middle East
  dubai: { lat: 25.2048, lng: 55.2708 },
  'abu dhabi': { lat: 24.4539, lng: 54.3773 },
  doha: { lat: 25.2854, lng: 51.5310 },
  riyadh: { lat: 24.7136, lng: 46.6753 },
  jeddah: { lat: 21.4858, lng: 39.1925 },
  muscat: { lat: 23.5880, lng: 58.3829 },
  // Europe
  paris: { lat: 48.8566, lng: 2.3522 },
  london: { lat: 51.5074, lng: -0.1278 },
  rome: { lat: 41.9028, lng: 12.4964 },
  barcelona: { lat: 41.3851, lng: 2.1734 },
  amsterdam: { lat: 52.3676, lng: 4.9041 },
  berlin: { lat: 52.5200, lng: 13.4050 },
  vienna: { lat: 48.2082, lng: 16.3738 },
  prague: { lat: 50.0755, lng: 14.4378 },
  istanbul: { lat: 41.0082, lng: 28.9784 },
  // Americas
  'new york': { lat: 40.7128, lng: -74.006 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  'san francisco': { lat: 37.7749, lng: -122.4194 },
  chicago: { lat: 41.8781, lng: -87.6298 },
  miami: { lat: 25.7617, lng: -80.1918 },
  'las vegas': { lat: 36.1699, lng: -115.1398 },
  montreal: { lat: 45.5017, lng: -73.5673 },
  toronto: { lat: 43.6532, lng: -79.3832 },
  vancouver: { lat: 49.2827, lng: -123.1207 },
  // Asia
  tokyo: { lat: 35.6762, lng: 139.6503 },
  seoul: { lat: 37.5665, lng: 126.9780 },
  beijing: { lat: 39.9042, lng: 116.4074 },
  shanghai: { lat: 31.2304, lng: 121.4737 },
  'hong kong': { lat: 22.3193, lng: 114.1694 },
  singapore: { lat: 1.3521, lng: 103.8198 },
  bangkok: { lat: 13.7563, lng: 100.5018 },
  bali: { lat: -8.3405, lng: 115.0920 },
  // India
  delhi: { lat: 28.6139, lng: 77.209 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  goa: { lat: 15.2993, lng: 74.1240 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  // Australia/Oceania
  sydney: { lat: -33.8688, lng: 151.2093 },
  melbourne: { lat: -37.8136, lng: 144.9631 },
  // Islands
  maldives: { lat: 3.2028, lng: 73.2207 },
  phuket: { lat: 7.9519, lng: 98.3381 },
  hawaii: { lat: 19.8968, lng: -155.5828 },
  // Africa
  cairo: { lat: 30.0444, lng: 31.2357 },
  'cape town': { lat: -33.9249, lng: 18.4241 },
  marrakech: { lat: 31.6295, lng: -7.9811 },
};

/**
 * Extract coordinates from a journey title by matching city names
 */
function extractCoordinatesFromTitle(title: string): { lat: number; lng: number } | null {
  const titleLower = title.toLowerCase();
  
  // Try to find a city name in the title
  for (const [city, coords] of Object.entries(cityCoordinates)) {
    if (titleLower.includes(city)) {
      console.log(`  📍 Extracted coordinates for "${title}" from city "${city}":`, coords);
      return coords;
    }
  }
  
  // Try word-by-word matching
  const words = titleLower.split(/[\s,\-]+/).filter(w => w.length > 2);
  for (const word of words) {
    if (cityCoordinates[word]) {
      console.log(`  📍 Extracted coordinates for "${title}" from word "${word}":`, cityCoordinates[word]);
      return cityCoordinates[word];
    }
  }
  
  return null;
}

/**
 * Converts a RecentJourney object to a Journey object for use with JourneyCard component
 * @param recentJourney - The recent journey data from profile API
 * @returns Journey object compatible with JourneyCard
 */
export function convertRecentJourneyToJourney(
  recentJourney: RecentJourney
): Journey {
  // Try to extract coordinates from the journey title
  const titleCoords = extractCoordinatesFromTitle(recentJourney.title);
  
  return {
    id: recentJourney.id,
    title: recentJourney.title,
    description: recentJourney.description,
    coverImage: recentJourney.coverImage,
    user: {
      id: recentJourney.author.id,
      username: recentJourney.author.username,
      email: '', // Not available in RecentJourney, but required by Journey interface
    },
    days:
      recentJourney.daysCount > 0
        ? // Create mock days array based on daysCount to show proper timeline
          Array.from({ length: recentJourney.daysCount }, (_, index) => ({
            id: `mock-day-${index + 1}`,
            dayNumber: index + 1,
            date: new Date(Date.now() + index * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0], // Mock dates
            journey: {} as Journey, // Circular reference, will be filled later if needed
            places:
              recentJourney.previewPlaces.length > 0
                ? recentJourney.previewPlaces
                    .slice(0, 3)
                    .map((placeName, placeIndex) => {
                      // Try to get coordinates from the place name or fall back to title coords
                      const placeCoords = extractCoordinatesFromTitle(placeName) || titleCoords;
                      
                      return {
                        id: `mock-place-${placeIndex + 1}`,
                        type: 'ACTIVITY' as const,
                        name: placeName,
                        location: placeName, // Use place name as location for now
                        day: {} as any, // Circular reference
                        // Include coordinates if we found them
                        ...(placeCoords && {
                          latitude: placeCoords.lat,
                          longitude: placeCoords.lng,
                        }),
                      };
                    })
                : // If no preview places, create a single mock place with title coordinates
                  titleCoords ? [{
                    id: 'mock-place-1',
                    type: 'ACTIVITY' as const,
                    name: recentJourney.title,
                    location: recentJourney.title,
                    day: {} as any,
                    latitude: titleCoords.lat,
                    longitude: titleCoords.lng,
                  }] : [],
          }))
        : // If no days count, still create one day with a place if we have title coordinates
          titleCoords ? [{
            id: 'mock-day-1',
            dayNumber: 1,
            date: new Date().toISOString().split('T')[0],
            journey: {} as Journey,
            places: [{
              id: 'mock-place-1',
              type: 'ACTIVITY' as const,
              name: recentJourney.title,
              location: recentJourney.title,
              day: {} as any,
              latitude: titleCoords.lat,
              longitude: titleCoords.lng,
            }],
          }] : undefined,
    createdAt: recentJourney.createdAt,
    updatedAt: recentJourney.createdAt, // Use createdAt as updatedAt since not available
  };
}

/**
 * Converts an array of RecentJourney objects to Journey objects
 * @param recentJourneys - Array of recent journey data from profile API
 * @returns Array of Journey objects compatible with JourneyCard
 */
export function convertRecentJourneysToJourneys(
  recentJourneys: RecentJourney[]
): Journey[] {
  return recentJourneys.map(convertRecentJourneyToJourney);
}

/**
 * Extracts city and state from an address string
 * @param address - The address string to parse
 * @returns Object with city and state, or null if not found
 *
 * @example
 * extractCityState("JV6R+8W, District:, near Tithal Beach, Kosamba, Valsad, Gujarat 396030, India")
 * // Returns: { city: "Valsad", state: "Gujarat" }
 */
export function extractCityState(address: string | undefined | null): {
  city: string | null;
  state: string | null;
} {
  if (!address) {
    return { city: null, state: null };
  }

  // Remove common suffixes like "India", "USA", etc.
  const cleanedAddress = address
    .replace(
      /,\s*(India|USA|United States|United Kingdom|UK|Canada|Australia)$/i,
      ''
    )
    .trim();

  // Split by commas and clean up each part
  const parts = cleanedAddress
    .split(',')
    .map(part => part.trim())
    .filter(part => {
      // Filter out empty parts, parts that are just colons/special characters,
      // and parts that end with just a colon (like "District:")
      return (
        part.length > 0 &&
        !/^[:\-]+$/.test(part) &&
        !/^[A-Za-z\s]*:\s*$/.test(part)
      );
    });

  if (parts.length === 0) {
    return { city: null, state: null };
  }

  let city: string | null = null;
  let state: string | null = null;

  // Pattern: Last part often contains state with optional postal code
  // Second to last part is often the city
  // Example: "..., Valsad, Gujarat 396030"

  // Check the last part for state (may contain postal code)
  const lastPart = parts[parts.length - 1];
  if (lastPart) {
    // Remove postal code pattern (4-6 digits at the end)
    const stateCandidate = lastPart.replace(/\s+\d{4,6}(\s|$)/, '').trim();

    // State should be a single word or two words, not a postal code, and not too short
    if (
      stateCandidate &&
      stateCandidate.split(/\s+/).length <= 2 &&
      !/^\d+$/.test(stateCandidate) &&
      stateCandidate.length >= 3
    ) {
      state = stateCandidate;

      // City is likely the part before state (second to last)
      if (parts.length >= 2) {
        const cityCandidate = parts[parts.length - 2];
        // City should be a single word or short phrase, not a postal code
        if (
          cityCandidate &&
          cityCandidate.split(/\s+/).length <= 3 &&
          !/^\d+$/.test(cityCandidate) &&
          !cityCandidate.match(/^[A-Z0-9]+\+[A-Z0-9]+/)
        ) {
          // Exclude plus codes like "JV6R+8W"
          city = cityCandidate;
        }
      }
    }
  }

  // Fallback: if we found state but not city, look for city in earlier parts
  if (state && !city && parts.length >= 2) {
    // Try the part before state
    const candidateIndex = parts.length - 2;
    const candidate = parts[candidateIndex];
    if (
      candidate &&
      candidate.split(/\s+/).length <= 3 &&
      !/^\d+$/.test(candidate) &&
      !candidate.match(/^[A-Z0-9]+\+[A-Z0-9]+/)
    ) {
      city = candidate;
    }
  }

  // Additional fallback: if no state found, try to identify city from last meaningful part
  if (!city && !state && parts.length >= 1) {
    const lastPart = parts[parts.length - 1];
    // If last part doesn't look like a postal code or plus code, it might be city
    if (
      lastPart &&
      !/^\d+$/.test(lastPart) &&
      !lastPart.match(/^[A-Z0-9]+\+[A-Z0-9]+/) &&
      lastPart.split(/\s+/).length <= 3
    ) {
      city = lastPart;
    }
  }

  return { city, state };
}

/**
 * Generates a journey title based on the first location's address
 * @param journey - The journey object
 * @returns Generated title or fallback
 */
export function generateJourneyTitle(journey: Journey | null): string {
  if (!journey) {
    return 'Journey';
  }

  // Get the first place from the first day
  const firstDay =
    journey.days?.find(day => day.dayNumber === 0) || journey.days?.[0];
  const firstPlace = firstDay?.places?.[0];

  if (!firstPlace?.address) {
    return journey.title || 'Journey';
  }

  const { city, state } = extractCityState(firstPlace.address);
  // Prefer state name for title format as requested
  const location = state || city;

  if (location) {
    return `A Wonderful Trip to ${location}`;
  }

  return journey.title || 'Journey';
}

/**
 * Generates a journey subtitle based on the first place name
 * @param journey - The journey object
 * @returns Generated subtitle or fallback
 */
export function generateJourneySubtitle(journey: Journey | null): string {
  if (!journey) {
    return 'Explore amazing places';
  }

  // Get the first place from the first day
  const firstDay =
    journey.days?.find(day => day.dayNumber === 0) || journey.days?.[0];
  const firstPlace = firstDay?.places?.[0];

  if (!firstPlace?.name) {
    return journey.description || 'Explore amazing places';
  }

  const placeName = firstPlace.name;

  // Generate a simple subtitle
  return `${placeName} visited which gives calmness.`;
}
