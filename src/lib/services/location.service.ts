import apiClient from '@/lib/api.legacy';
import { LocationCoordinates } from '@/types/user.types';

export interface CurrentLocationResponse {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  region?: string;
}

class LocationService {
  /**
   * Get current location using browser geolocation API
   */
  async getBrowserLocation(): Promise<LocationCoordinates | null> {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          // User denied permission or error occurred
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }

  /**
   * Get current location from backend based on IP address
   * Fallback when browser geolocation is not available or denied
   */
  async getIPLocation(): Promise<LocationCoordinates | null> {
    try {
      const response = await apiClient.request<CurrentLocationResponse>(
        '/location/current'
      );

      if (response.data && response.data.latitude && response.data.longitude) {
        return {
          latitude: response.data.latitude,
          longitude: response.data.longitude,
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to get location from IP:', error);
      return null;
    }
  }

  /**
   * Get current location with fallback strategy:
   * 1. Try browser geolocation first
   * 2. If denied/unavailable, fall back to IP-based location
   */
  async getCurrentLocation(): Promise<LocationCoordinates | null> {
    // Try browser geolocation first
    const browserLocation = await this.getBrowserLocation();
    if (browserLocation) {
      return browserLocation;
    }

    // Fallback to IP-based location
    return this.getIPLocation();
  }
}

export const locationService = new LocationService();

