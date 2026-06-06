'use client';

import type { UserProfile } from '@/modules/profile/types/profile.types';
import { useQuery } from '@tanstack/react-query';
import { profileQueryKeys } from '@/modules/profile/query-keys';
import { profileService } from '@/modules/profile/services/profile.service';

type UseProfileQueryOptions = {
  initialProfile?: UserProfile;
  userId?: string;
};

export function useProfileQuery(options: UseProfileQueryOptions) {
  const { initialProfile, userId } = options;

  return useQuery({
    enabled: !initialProfile,
    initialData: initialProfile,
    queryFn: () => (userId
      ? profileService.getUserProfileById(userId)
      : profileService.getCurrentUserProfile()),
    queryKey: userId ? profileQueryKeys.detail(userId) : profileQueryKeys.current(),
  });
}
