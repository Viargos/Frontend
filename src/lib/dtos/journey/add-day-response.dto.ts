import type { DetailedJourney } from '@/types/journey.types';

/**
 * Response DTO for POST /api/journeys/:id/days
 * Backend returns updated detailed journey with new day
 */
export interface AddDayResponseDto {
  data: DetailedJourney;
}
