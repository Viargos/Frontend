import type { JourneyLocation } from '@/types/journey.types';

/**
 * Response DTO for PUT /api/journeys/:id/activities/:locationId
 * Backend returns updated activity location
 */
export interface UpdateActivityResponseDto {
  data: JourneyLocation;
}
