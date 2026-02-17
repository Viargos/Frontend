import type { JourneyLocation } from '@/types/journey.types';

/**
 * Response DTO for POST /api/journeys/:id/activities
 * Backend returns created activity location
 */
export interface AddActivityResponseDto {
  data: JourneyLocation;
}
