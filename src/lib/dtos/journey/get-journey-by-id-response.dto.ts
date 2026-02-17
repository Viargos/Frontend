import type { Journey } from '@/types/journey.types';

/**
 * Response DTO for GET /api/journeys/:id
 * Backend returns single journey wrapped in { data: Journey }
 */
export interface GetJourneyByIdResponseDto {
  data: Journey;
}
