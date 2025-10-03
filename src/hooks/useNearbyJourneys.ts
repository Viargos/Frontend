'use client';

import { useState, useCallback, useEffect } from 'react';
import apiClient from '@/lib/api.legacy';
import {
  LocationCoordinates,
  NearbyJourneysParams,
  NearbyJourneysResponse,
} from '@/types/user.types';

export interface UseNearbyJourneysOptions {
  autoFetch?: boolean;
  onSuccess?: (journeys: any[]) => void;
  onError?: (error: string) => void;
}

export interface UseNearbyJourneysReturn {
  journeys: any[];
  isLoading: boolean;
  error: string | null;
  fetchNearbyJourneys: (params: NearbyJourneysParams) => Promise<void>;
  fetchByLocation: (
    coordinates: LocationCoordinates,
    radius?: number,
    limit?: number
  ) => Promise<void>;
  clearError: () => void;
  refresh: () => Promise<void>;
}

export function useNearbyJourneys(
  initialLocation?: LocationCoordinates | null,
  initialRadius: number = 50,
  options: UseNearbyJourneysOptions = {}
): UseNearbyJourneysReturn {
  const { autoFetch = false, onSuccess, onError } = options;

  const [journeys, setJourneys] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastParams, setLastParams] = useState<NearbyJourneysParams | null>(
    null
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchNearbyJourneys = useCallback(
    async (params: NearbyJourneysParams) => {
      try {
        setIsLoading(true);
        setError(null);
        setLastParams(params);

        const response = await apiClient.getNearbyJourneys(params);

        // Handle double-wrapped response from API client
        let journeysData;
        if (response.statusCode === 10000 && response.data) {
          // API client wrapper - extract the nested data
          const nestedResponse = response.data as any;
          if (nestedResponse.statusCode === 200 && nestedResponse.data) {
            journeysData = nestedResponse.data;
          } else {
            throw new Error(
              nestedResponse.message || 'Failed to fetch nearby journeys'
            );
          }
        } else if (response.statusCode === 200 && response.data) {
          // Direct backend response
          journeysData = response.data;
        } else {
          throw new Error(
            response.message || 'Failed to fetch nearby journeys'
          );
        }

        setJourneys(journeysData);
        onSuccess?.(journeysData);
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to fetch nearby journeys';
        setError(errorMessage);
        onError?.(errorMessage);
        setJourneys([]);
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError]
  );

  const fetchByLocation = useCallback(
    async (
      coordinates: LocationCoordinates,
      radius: number = 50,
      limit: number = 20
    ) => {
      await fetchNearbyJourneys({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        radius,
        limit,
      });
    },
    [fetchNearbyJourneys]
  );

  const refresh = useCallback(async () => {
    if (lastParams) {
      await fetchNearbyJourneys(lastParams);
    }
  }, [lastParams, fetchNearbyJourneys]);

  // Auto-fetch if initial location is provided and autoFetch is enabled
  useEffect(() => {
    if (autoFetch && initialLocation) {
      fetchByLocation(initialLocation, initialRadius);
    }
  }, [autoFetch, initialLocation, initialRadius]);

  return {
    journeys,
    isLoading,
    error,
    fetchNearbyJourneys,
    fetchByLocation,
    clearError,
    refresh,
  };
}
