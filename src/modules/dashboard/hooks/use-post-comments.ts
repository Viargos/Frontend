'use client';

import type { DashboardPostComment } from '@/modules/dashboard/types/dashboard.types';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/modules/dashboard/services/dashboard.service';

type UsePostCommentsOptions = {
  enabled: boolean;
  postId: string;
};

export function usePostComments(options: UsePostCommentsOptions) {
  const { enabled, postId } = options;

  const commentsQuery = useQuery<DashboardPostComment[]>({
    enabled,
    queryFn: () => dashboardService.fetchPostComments(postId),
    queryKey: ['dashboard', 'post-comments', postId],
    staleTime: 0,
  });

  return {
    comments: commentsQuery.data ?? [],
    hasFetched: commentsQuery.data !== undefined,
    isLoadingComments: commentsQuery.isLoading,
  };
}
