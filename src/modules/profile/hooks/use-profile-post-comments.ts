'use client';

import type { ProfilePostComment } from '@/modules/profile/types/profile.types';
import { useQuery } from '@tanstack/react-query';
import { profileQueryKeys } from '@/modules/profile/query-keys';
import { profileService } from '@/modules/profile/services/profile.service';

type UseProfilePostCommentsOptions = {
  enabled: boolean;
  postId: string;
};

export function useProfilePostComments(options: UseProfilePostCommentsOptions) {
  const { enabled, postId } = options;
  const queryKey = profileQueryKeys.postComments(postId);

  const commentsQuery = useQuery<ProfilePostComment[]>({
    enabled,
    queryFn: () => profileService.fetchPostComments(postId),
    queryKey,
    staleTime: 60 * 1000,
  });

  return {
    comments: commentsQuery.data ?? [],
    commentsError: commentsQuery.error instanceof Error ? commentsQuery.error.message : null,
    isLoadingComments: commentsQuery.isLoading,
  };
}
