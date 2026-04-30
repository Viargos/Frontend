'use client';

import type {
  DashboardProfileRecommendation,
} from '@/modules/dashboard/types/dashboard.types';
import { useCallback, useMemo, useState } from 'react';
import {
  DASHBOARD_RECOMMENDATIONS_INITIAL_LIMIT,
  DASHBOARD_RECOMMENDATIONS_LOAD_MORE_LIMIT,
} from '@/modules/dashboard/constants/dashboard.constants';
import { dashboardService } from '@/modules/dashboard/services/dashboard.service';

type UseDashboardRecommendationsOptions = {
  initialProfiles: DashboardProfileRecommendation[];
};

export function useDashboardRecommendations(options: UseDashboardRecommendationsOptions) {
  const { initialProfiles } = options;
  const [profiles, setProfiles] = useState(initialProfiles);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [canShowMore, setCanShowMore] = useState(
    initialProfiles.length >= DASHBOARD_RECOMMENDATIONS_INITIAL_LIMIT,
  );

  const profileIds = useMemo(() => profiles.map(profile => profile.id), [profiles]);

  const updateProfile = useCallback((
    profileId: string,
    nextState: { followersCount: number; isFollowing: boolean },
  ) => {
    setProfiles(currentProfiles => currentProfiles.map(profile => (
      profile.id === profileId
        ? {
            ...profile,
            followersCount: nextState.followersCount,
            isFollowing: nextState.isFollowing,
          }
        : profile
    )));
  }, []);

  const fetchRecommendations = useCallback(async (options?: {
    excludeUserIds?: string[];
    limit?: number;
  }) => {
    try {
      return await dashboardService.getRecommendedProfiles({
        excludeUserIds: options?.excludeUserIds,
        limit: options?.limit,
      });
    } catch (caughtError) {
      if (caughtError instanceof Error) {
        throw caughtError;
      }

      throw new Error('Unable to load profile recommendations right now.');
    }
  }, []);

  const refreshRecommendations = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      let nextProfiles = await fetchRecommendations({
        excludeUserIds: profileIds,
        limit: DASHBOARD_RECOMMENDATIONS_INITIAL_LIMIT,
      });

      if (nextProfiles.length === 0) {
        nextProfiles = await fetchRecommendations({
          limit: DASHBOARD_RECOMMENDATIONS_INITIAL_LIMIT,
        });
      }

      setProfiles(nextProfiles);
      setCanShowMore(nextProfiles.length >= DASHBOARD_RECOMMENDATIONS_INITIAL_LIMIT);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to refresh suggestions.');
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchRecommendations, profileIds]);

  const loadMoreRecommendations = useCallback(async () => {
    setIsLoadingMore(true);
    setError(null);

    try {
      const nextProfiles = await fetchRecommendations({
        excludeUserIds: profileIds,
        limit: DASHBOARD_RECOMMENDATIONS_LOAD_MORE_LIMIT,
      });

      if (nextProfiles.length === 0) {
        setCanShowMore(false);
        return;
      }

      setProfiles(currentProfiles => [...currentProfiles, ...nextProfiles]);
      setCanShowMore(nextProfiles.length >= DASHBOARD_RECOMMENDATIONS_LOAD_MORE_LIMIT);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to load more suggestions.');
    } finally {
      setIsLoadingMore(false);
    }
  }, [fetchRecommendations, profileIds]);

  return {
    canShowMore,
    error,
    isLoadingMore,
    isRefreshing,
    loadMoreRecommendations,
    profileIds,
    profiles,
    refreshRecommendations,
    updateProfile,
  };
}
