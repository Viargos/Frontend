import type { Journey } from '@/types/journey.types';

/**
 * Response DTO for POST /api/journeys
 * Backend returns created journey wrapped in { data: Journey }
 */
export interface CreateJourneyResponseDto {
  data: Journey;
}
