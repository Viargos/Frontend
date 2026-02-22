import type { DetailedJourney } from '@/types/journey.types';

/**
 * Response DTO for PUT /api/journeys/:id/banner
 * Backend returns updated detailed journey
 */
export interface UpdateBannerResponseDto {
  data: DetailedJourney;
}
