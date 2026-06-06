'use client';

import type { UserProfile } from '@/modules/profile/types/profile.types';
import { ProfileContent } from '@/modules/profile/components/ProfileContent';
import { ProfilePageSkeleton } from '@/modules/profile/components/ProfilePageSkeleton';
import { UserProfileSkeleton } from '@/modules/profile/components/UserProfileSkeleton';
import { useProfileQuery } from '@/modules/profile/hooks/use-profile-query';

type ProfileQueryViewProps = {
  heading?: string;
  initialProfile?: UserProfile;
  isOwnProfile: boolean;
  userId?: string;
};

export function ProfileQueryView(props: ProfileQueryViewProps) {
  const { heading, initialProfile, isOwnProfile, userId } = props;
  const query = useProfileQuery({ initialProfile, userId });

  if (query.isLoading || query.isPending) {
    return isOwnProfile ? <ProfilePageSkeleton /> : <UserProfileSkeleton />;
  }

  if (!query.data) {
    return (
      <div className="flex w-full flex-1 items-center justify-center py-16 text-sm text-gray-500">
        Unable to load profile.
      </div>
    );
  }

  return (
    <ProfileContent
      heading={heading ?? (isOwnProfile ? undefined : `${query.data.user.username}'s Profile`)}
      isOwnProfile={isOwnProfile}
      profile={query.data}
    />
  );
}
