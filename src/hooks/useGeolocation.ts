'use client';

import { useState, useEffect, useCallback } from 'react';
import { LocationCoordinates, GeolocationState } from '@/types/user.types';

export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean;
  onSuccess?: (coordinates: LocationCoordinates) => void;
  onError?: (error: string) => void;
}

export interface UseGeolocationReturn extends GeolocationState {
  getCurrentLocation: () => Promise<LocationCoordinates | null>;
  watchPosition: () => number | null;
  clearWatch: () => void;
  clearError: () => void;
}

export function useGeolocation(options: UseGeolocationOptions = {}): UseGeolocationReturn {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 60000,
    watch = false,
    onSuccess,
    onError,
  } = options;

  const [coordinates, setCoordinates] = useState<LocationCoordinates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Check if geolocation is supported
  const isSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    const coords: LocationCoordinates = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    
    setCoordinates(coords);
    setIsLoading(false);
    setError(null);
    onSuccess?.(coords);
  }, [onSuccess]);

  const handleError = useCallback((error: GeolocationPositionError) => {
    let errorMessage = 'Failed to get location';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location access denied by user';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information unavailable';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out';
        break;
      default:
        errorMessage = 'Unknown location error';
        break;
    }
    
    setError(errorMessage);
    setIsLoading(false);
    onError?.(errorMessage);
  }, [onError]);

  const getCurrentLocation = useCallback(async (): Promise<LocationCoordinates | null> => {
    if (!isSupported) {
      const errorMsg = 'Geolocation is not supported by this browser';
      setError(errorMsg);
      onError?.(errorMsg);
      return null;
    }

    setIsLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: LocationCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          handleSuccess(position);
          resolve(coords);
        },
        (error) => {
          handleError(error);
          resolve(null);
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        }
      );
    });
  }, [isSupported, enableHighAccuracy, timeout, maximumAge, handleSuccess, handleError, onError]);

  const watchPosition = useCallback((): number | null => {
    if (!isSupported) {
      const errorMsg = 'Geolocation is not supported by this browser';
      setError(errorMsg);
      onError?.(errorMsg);
      return null;
    }

    setIsLoading(true);
    setError(null);

    const id = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    );

    setWatchId(id);
    return id;
  }, [isSupported, enableHighAccuracy, timeout, maximumAge, handleSuccess, handleError, onError]);

  const clearWatch = useCallback(() => {
    if (watchId !== null && isSupported) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId, isSupported]);

  // Auto-start location watching if enabled
  useEffect(() => {
    if (watch && isSupported) {
      watchPosition();
    }

    return () => {
      clearWatch();
    };
  }, [watch, isSupported]);

  return {
    coordinates,
    isLoading,
    error,
    isSupported,
    getCurrentLocation,
    watchPosition,
    clearWatch,
    clearError,
  };
}
