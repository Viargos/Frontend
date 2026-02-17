/**
 * Request DTO for journey list filters
 */
export interface JourneyFiltersDto {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
