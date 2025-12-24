'use client';

import { useState, useEffect, useCallback } from 'react';
import { LocationCoordinates } from '@/types/user.types';
import { locationService } from '@/lib/services/location.service';

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
      const currentLocation = await locationService.getCurrentLocation();
      
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

