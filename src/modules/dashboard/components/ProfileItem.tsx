'use client';

import type { DashboardProfileRecommendation } from '@/modules/dashboard/types/dashboard.types';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback } from 'react';
import { cn } from '@/modules/common/components/ui/cn';
import { FollowButton } from './FollowButton';

type ProfileItemProps = {
  onProfileChange?: (
    profileId: string,
    nextState: { followersCount: number; isFollowing: boolean },
  ) => void;
  profile: DashboardProfileRecommendation;
};

function formatFollowers(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(count >= 10000000 ? 0 : 1).replace(/\.0$/, '')}M followers`;
  }

  if (count >= 1000) {
    return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1).replace(/\.0$/, '')}k followers`;
  }

  return `${count} followers`;
}

function RecommendationAvatar(props: Pick<DashboardProfileRecommendation, 'profileImage' | 'username'>) {
  const { profileImage, username } = props;

  if (profileImage) {
    return (
      <Image
        alt={username}
        className="h-10 w-10 rounded-full object-cover"
        height={40}
        src={profileImage}
        unoptimized
        width={40}
      />
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#160E53] text-sm font-semibold text-white">
      {username.charAt(0).toUpperCase()}
    </div>
  );
}

export const ProfileItem = (props: ProfileItemProps) => {
  const { onProfileChange, profile } = props;

  const handleProfileChange = useCallback((nextState: { followersCount: number; isFollowing: boolean }) => {
    onProfileChange?.(profile.id, nextState);
  }, [onProfileChange, profile.id]);

  return (
    <div className={cn(
      'group flex items-start gap-3 rounded-2xl px-3 py-3 transition-colors duration-200 hover:bg-gray-50/90',
      profile.isFollowing ? 'bg-gray-50/60' : undefined,
    )}
    >
      <Link className="min-w-0 flex-1" href={`/profile/${profile.username}`}>
        <div className="flex items-start gap-3">
          <RecommendationAvatar profileImage={profile.profileImage} username={profile.username} />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-semibold text-gray-950 transition-colors group-hover:text-[#160E53]">
                {profile.username}
              </span>
              {profile.category
                ? (
                    <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                      {profile.category}
                    </span>
                  )
                : null}
            </div>

            <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
              {profile.descriptor}
            </p>
            <p className="mt-1 text-[11px] font-medium text-gray-400">
              {formatFollowers(profile.followersCount)}
            </p>
          </div>
        </div>
      </Link>

      <div className="pt-0.5">
        <FollowButton
          initialFollowers={profile.followersCount}
          initialIsFollowing={profile.isFollowing}
          onChange={handleProfileChange}
          userId={profile.id}
        />
      </div>
    </div>
  );
};
