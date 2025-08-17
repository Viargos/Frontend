import { Journey } from '@/types/journey.types';
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
