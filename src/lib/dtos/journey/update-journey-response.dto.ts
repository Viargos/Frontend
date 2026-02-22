import type { Journey } from '@/types/journey.types';

/**
 * Response DTO for PATCH /api/journeys/:id
 * Backend returns updated journey wrapped in { data: Journey }
 */
export interface UpdateJourneyResponseDto {
  data: Journey;
}
