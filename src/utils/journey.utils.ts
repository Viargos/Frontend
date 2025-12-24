import { Journey, JourneyPlace } from '@/types/journey.types';
import { RecentJourney } from '@/types/profile.types';

/**
 * Converts a RecentJourney object to a Journey object for use with JourneyCard component
 * @param recentJourney - The recent journey data from profile API
 * @returns Journey object compatible with JourneyCard
 */
export function convertRecentJourneyToJourney(recentJourney: RecentJourney): Journey {
  return {
    id: recentJourney.id,
    title: recentJourney.title,
    description: recentJourney.description,
    user: {
      id: recentJourney.author.id,
      username: recentJourney.author.username,
      email: '', // Not available in RecentJourney, but required by Journey interface
    },
    days: recentJourney.daysCount > 0 ? 
      // Create mock days array based on daysCount to show proper timeline
      Array.from({ length: recentJourney.daysCount }, (_, index) => ({
        id: `mock-day-${index + 1}`,
        dayNumber: index + 1,
        date: new Date(Date.now() + index * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Mock dates
        journey: {} as Journey, // Circular reference, will be filled later if needed
        places: recentJourney.previewPlaces.length > 0 ? 
          recentJourney.previewPlaces.slice(0, 3).map((placeName, placeIndex) => ({
            id: `mock-place-${placeIndex + 1}`,
            type: 'ACTIVITY' as const,
            name: placeName,
            location: placeName, // Use place name as location for now
            day: {} as any, // Circular reference
          })) : []
      })) : undefined,
    createdAt: recentJourney.createdAt,
    updatedAt: recentJourney.createdAt, // Use createdAt as updatedAt since not available
  };
}

/**
 * Converts an array of RecentJourney objects to Journey objects
 * @param recentJourneys - Array of recent journey data from profile API
 * @returns Array of Journey objects compatible with JourneyCard
 */
export function convertRecentJourneysToJourneys(recentJourneys: RecentJourney[]): Journey[] {
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
export function extractCityState(address: string | undefined | null): { city: string | null; state: string | null } {
  if (!address) {
    return { city: null, state: null };
  }

  // Remove common suffixes like "India", "USA", etc.
  let cleanedAddress = address
    .replace(/,\s*(India|USA|United States|United Kingdom|UK|Canada|Australia)$/i, '')
    .trim();

  // Split by commas and clean up each part
  const parts = cleanedAddress.split(',').map(part => part.trim()).filter(part => {
    // Filter out empty parts, parts that are just colons/special characters, 
    // and parts that end with just a colon (like "District:")
    return part.length > 0 && 
           !/^[:\-]+$/.test(part) && 
           !/^[A-Za-z\s]*:\s*$/.test(part);
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
    if (stateCandidate && 
        stateCandidate.split(/\s+/).length <= 2 && 
        !/^\d+$/.test(stateCandidate) &&
        stateCandidate.length >= 3) {
      state = stateCandidate;
      
      // City is likely the part before state (second to last)
      if (parts.length >= 2) {
        const cityCandidate = parts[parts.length - 2];
        // City should be a single word or short phrase, not a postal code
        if (cityCandidate && 
            cityCandidate.split(/\s+/).length <= 3 && 
            !/^\d+$/.test(cityCandidate) &&
            !cityCandidate.match(/^[A-Z0-9]+\+[A-Z0-9]+/)) { // Exclude plus codes like "JV6R+8W"
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
    if (candidate && 
        candidate.split(/\s+/).length <= 3 && 
        !/^\d+$/.test(candidate) &&
        !candidate.match(/^[A-Z0-9]+\+[A-Z0-9]+/)) {
      city = candidate;
    }
  }

  // Additional fallback: if no state found, try to identify city from last meaningful part
  if (!city && !state && parts.length >= 1) {
    const lastPart = parts[parts.length - 1];
    // If last part doesn't look like a postal code or plus code, it might be city
    if (lastPart && 
        !/^\d+$/.test(lastPart) && 
        !lastPart.match(/^[A-Z0-9]+\+[A-Z0-9]+/) &&
        lastPart.split(/\s+/).length <= 3) {
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
  const firstDay = journey.days?.find(day => day.dayNumber === 0) || journey.days?.[0];
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
  const firstDay = journey.days?.find(day => day.dayNumber === 0) || journey.days?.[0];
  const firstPlace = firstDay?.places?.[0];

  if (!firstPlace?.name) {
    return journey.description || 'Explore amazing places';
  }

  const placeName = firstPlace.name;
  
  // Generate a simple subtitle
  return `${placeName} visited which gives calmness.`;
}
