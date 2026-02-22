/**
 * Response DTO for location data
 */
export interface LocationResponseDto {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  region?: string;
}
