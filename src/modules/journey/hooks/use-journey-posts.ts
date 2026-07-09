'use client';

import type { DashboardPost } from '@/modules/dashboard/types/dashboard.types';
import { useQuery } from '@tanstack/react-query';
import { appConfig } from '@/lib/app-config';
import { journeyQueryKeys } from '@/modules/journey/query-keys';
import { journeyService } from '@/modules/journey/services/journey.service';

export function useJourneyPosts(journeyId: string) {
  const query = useQuery<DashboardPost[]>({
    queryFn: () => journeyService.getPosts(journeyId),
    queryKey: journeyQueryKeys.posts(journeyId),
    staleTime: appConfig.reactQuery.staleTimeMs,
  });

  return {
    error: query.error instanceof Error ? query.error.message : null,
    isError: query.isError,
    isLoading: query.isLoading,
    posts: query.data ?? [],
    refetch: query.refetch,
  };
}
