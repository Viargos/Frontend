'use client';

import type { DiscoverCoordinates, DiscoverJourney } from '@/modules/discover/types/discover.types';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { appConfig } from '@/lib/app-config';
import { DISCOVER_DEFAULT_RADIUS_KM } from '@/modules/discover/constants/discover.constants';
import { discoverQueryKeys } from '@/modules/discover/query-keys';
import { discoverService } from '@/modules/discover/services/discover.service';

async function canUseBrowserGeolocation(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return false;
  }

  if (typeof document !== 'undefined') {
    const policyContainer = document as Document & {
      featurePolicy?: { allowsFeature: (feature: string) => boolean };
      permissionsPolicy?: { allowsFeature: (feature: string) => boolean };
    };
    const policy = policyContainer.permissionsPolicy ?? policyContainer.featurePolicy;

    if (policy && typeof policy.allowsFeature === 'function' && !policy.allowsFeature('geolocation')) {
      return false;
    }
  }

  if (!('permissions' in navigator) || typeof navigator.permissions?.query !== 'function') {
    return true;
  }

  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
    return permission.state !== 'denied';
  } catch {
    return false;
  }
}

export function useDiscover() {
  const [coordinates, setCoordinates] = useState<DiscoverCoordinates | null>(null);
  const [radius, setRadius] = useState(DISCOVER_DEFAULT_RADIUS_KM);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  const journeysQuery = useQuery<DiscoverJourney[]>({
    enabled: coordinates !== null,
    queryFn: () => discoverService.getNearbyJourneys({
      latitude: coordinates!.latitude,
      longitude: coordinates!.longitude,
      radius,
    }),
    queryKey: [...discoverQueryKeys.journeys(), coordinates?.latitude ?? 0, coordinates?.longitude ?? 0, radius],
    staleTime: appConfig.reactQuery.staleTimeMs,
  });

  const resolveCoordinates = useCallback(async () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    try {
      const fallback = await discoverService.getCurrentLocation();
      setCoordinates(fallback);
    } catch {
      try {
        if (await canUseBrowserGeolocation()) {
          const geoCoordinates = await new Promise<DiscoverCoordinates>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              position => resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              }),
              reject,
              { enableHighAccuracy: true, timeout: 8000 },
            );
          });

          setCoordinates(geoCoordinates);
          return;
        }

        setLocationError('Unable to determine location');
      } catch (caught) {
        setLocationError(caught instanceof Error ? caught.message : 'Unable to determine location');
      }
    } finally {
      setIsLoadingLocation(false);
    }
  }, []);

  useEffect(() => {
    void resolveCoordinates();
  }, [resolveCoordinates]);

  const updateRadius = async (nextRadius: number) => {
    setRadius(nextRadius);
  };

  return {
    coordinates,
    error: locationError ?? (journeysQuery.error instanceof Error ? journeysQuery.error.message : null),
    isLoadingJourneys: journeysQuery.isLoading || journeysQuery.isFetching,
    isLoadingLocation,
    journeys: journeysQuery.data ?? [],
    radius,
    refresh: async () => {
      await resolveCoordinates();
      await journeysQuery.refetch();
    },
    updateRadius,
  };
}
