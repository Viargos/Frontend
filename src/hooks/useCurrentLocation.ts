'use client';

import { useState, useEffect, useCallback } from 'react';
import { LocationCoordinates } from '@/types/user.types';
import { LocationApi } from '@/lib/api';

export interface UseCurrentLocationReturn {
  location: LocationCoordinates | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to get current user location with automatic fallback
 * - First tries browser geolocation
 * - Falls back to IP-based location if geolocation is denied/unavailable
 */
export function useCurrentLocation(
  autoFetch: boolean = true
): UseCurrentLocationReturn {
  const [location, setLocation] = useState<LocationCoordinates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try browser geolocation first
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              maximumAge: 300000, // Cache for 5 minutes
            });
          });

          const currentLocation: LocationCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          setLocation(currentLocation);
          setIsLoading(false);
          return;
        } catch (geoError) {
          // Browser geolocation failed, fall back to IP-based
          console.warn('Browser geolocation failed, falling back to IP-based location');
        }
      }

      // Fallback to IP-based location via LocationApi
      const currentLocation = await LocationApi.getCurrentLocation();

      if (currentLocation) {
        setLocation(currentLocation);
      } else {
        setError('Unable to determine location');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchLocation();
    }
  }, [autoFetch, fetchLocation]);

  return {
    location,
    isLoading,
    error,
    refresh: fetchLocation,
  };
}

