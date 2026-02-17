/**
 * Request DTO for dashboard post filters
 */
export interface DashboardFiltersDto {
  cursor?: string;
  limit?: number;
  location?: string;
  search?: string;
}
