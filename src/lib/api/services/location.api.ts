import { httpClient } from '../core/api-client';
import { API_ENDPOINTS } from '../config/endpoints';
import type { LocationCoordinates } from '@/types/user.types';
import type { LocationResponseDto } from '@/lib/dtos/location';

export class LocationApiService {
  /**
   * Get current user's location based on IP address
   * @returns Location coordinates or null if unavailable
   */
  async getCurrentLocation(): Promise<LocationCoordinates | null> {
    const location = await httpClient.get<LocationResponseDto>(
      API_ENDPOINTS.LOCATION.CURRENT
    );

    if (!location || typeof location.latitude !== 'number') {
      return null;
    }

    return {
      latitude: location.latitude,
      longitude: location.longitude,
    };
  }
}

export const LocationApi = new LocationApiService();
