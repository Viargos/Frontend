import { PlaceType } from '@/enums';
import type {
  Journey,
  DetailedJourney,
  DetailedJourneyDay,
  JourneyStats,
  CreateJourneyDay,
  CreateComprehensiveJourneyDto,
} from '@/types/journey.types';

/**
 * Transforms basic Journey to DetailedJourney format
 * Groups places by activity type (STAY, ACTIVITY, FOOD, TRANSPORT, NOTE)
 * @param journey - Basic journey entity
 * @returns Detailed journey with activities grouped by type
 */
export function transformToDetailedJourney(
  journey: Journey
): DetailedJourney {
  const days = journey.days ?? [];
  const detailedDays: DetailedJourneyDay[] = days.map((day) => {
    const places = day.places ?? [];
    return {
      id: day.id,
      dayNumber: day.dayNumber,
      date: day.date,
      activities: {
        placeToStay: places.filter(
          (p) => p.type === PlaceType.STAY
        ) as unknown as DetailedJourneyDay['activities']['placeToStay'],
        placesToGo: places.filter(
          (p) => p.type === PlaceType.ACTIVITY
        ) as unknown as DetailedJourneyDay['activities']['placesToGo'],
        food: places.filter(
          (p) => p.type === PlaceType.FOOD
        ) as unknown as DetailedJourneyDay['activities']['food'],
        transport: places.filter(
          (p) => p.type === PlaceType.TRANSPORT
        ) as unknown as DetailedJourneyDay['activities']['transport'],
        notes: places.filter(
          (p) => p.type === PlaceType.NOTE
        ) as unknown as DetailedJourneyDay['activities']['notes'],
      },
      notes: day.notes,
    };
  });

  return {
    ...journey,
    days: detailedDays,
    banner: {
      title: journey.title,
      subtitle: `${detailedDays.length} ${detailedDays.length === 1 ? 'day' : 'days'}`,
      description: journey.description ?? '',
      imageUrl: journey.coverImage ?? '',
      gradientColors: {
        from: '#4F46E5',
        via: '#7C3AED',
        to: '#DB2777',
      },
    },
  };
}

/**
 * Creates duplicate journey payload from source journey
 * Strips IDs and relationship references to create new journey
 * @param source - Source journey to duplicate
 * @param newTitle - Optional new title (defaults to "Title (Copy)")
 * @returns Comprehensive journey creation DTO
 */
export function createDuplicateJourneyPayload(
  source: Journey,
  newTitle?: string
): CreateComprehensiveJourneyDto {
  const days = source.days ?? [];
  const createDays: CreateJourneyDay[] = days.map((day) => ({
    dayNumber: day.dayNumber,
    date: day.date,
    notes: day.notes,
    places: (day.places ?? []).map((place) => ({
      type: place.type,
      name: place.name,
      description: place.description,
      startTime: place.startTime,
      endTime: place.endTime,
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
      media: place.media,
    })),
  }));

  return {
    title: newTitle ?? `${source.title} (Copy)`,
    description: source.description,
    days: createDays,
  };
}

/**
 * Filters journeys by search query
 * Searches in title and description fields (case-insensitive)
 * @param journeys - Array of journeys to search
 * @param query - Search query string
 * @returns Filtered array of journeys
 */
export function filterJourneysBySearch(
  journeys: Journey[],
  query: string
): Journey[] {
  if (!query || query.trim() === '') {
    return journeys;
  }

  const searchTerm = query.toLowerCase().trim();
  return journeys.filter(
    (j) =>
      j.title.toLowerCase().includes(searchTerm) ||
      (j.description != null &&
        j.description.toLowerCase().includes(searchTerm))
  );
}

/**
 * Calculates journey statistics from journeys array
 * Computes totals for journeys, places, and days
 * @param journeys - Array of journeys to analyze
 * @returns Journey statistics object
 */
export function calculateJourneyStats(journeys: Journey[]): JourneyStats {
  const totalJourneys = journeys.length;

  const totalPlaces = journeys.reduce((sum, j) => {
    const placesCount = (j.days ?? []).reduce((daySum, d) => {
      return daySum + (d.places?.length ?? 0);
    }, 0);
    return sum + placesCount;
  }, 0);

  const totalDays = journeys.reduce((sum, j) => {
    return sum + (j.days?.length ?? 0);
  }, 0);

  return {
    totalJourneys,
    publishedJourneys: totalJourneys,
    draftJourneys: 0,
    archivedJourneys: 0,
    totalPlaces,
    totalDays,
  };
}
