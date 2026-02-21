import { useQuery } from '@tanstack/react-query';
import { JourneyApi } from '@/lib/api';
import { Journey } from '@/types/journey.types';
import { convertRecentJourneysToJourneys } from '@/utils/journey.utils';

interface UseUserJourneysOptions {
  userId: string;
  isOwnProfile: boolean;
  enabled?: boolean;
  recentJourneys?: any[]; // Fallback data from user details
}

/**
 * Fetch all journeys for a specific user
 * - For own profile: uses getMyJourneys API
 * - For other users: uses recentJourneys from user details (already fetched)
 * @param options Configuration options
 * @returns React Query result with user's journeys
 */
export const useUserJourneys = ({
  userId,
  isOwnProfile,
  enabled = true,
  recentJourneys = [],
}: UseUserJourneysOptions) => {
  return useQuery({
    queryKey: ['user-journeys', userId, isOwnProfile, recentJourneys.length],
    queryFn: async (): Promise<Journey[]> => {
      console.log('[FETCHING_USER_JOURNEYS]', {
        userId,
        isOwnProfile,
        recentJourneysCount: recentJourneys.length,
      });

      if (isOwnProfile) {
        // For own profile, fetch ALL journeys using getMyJourneys (no limit)
        const allJourneysData = await JourneyApi.getMyJourneys({
          limit: undefined,
          offset: undefined,
        });

        console.log('[STATE_JOURNEYS_COUNT_OWN_PROFILE]', {
          count: allJourneysData.length,
          journeys: allJourneysData,
        });

        return allJourneysData;
      } else {
        // For other users, use recentJourneys from user details API
        // No need to fetch all public journeys - that's inefficient and incorrect
        const convertedJourneys = convertRecentJourneysToJourneys(
          recentJourneys
        );

        console.log('[STATE_JOURNEYS_COUNT_OTHER_USER]', {
          count: convertedJourneys.length,
          journeys: convertedJourneys,
        });

        return convertedJourneys;
      }
    },
    enabled: !!userId && enabled,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
};
