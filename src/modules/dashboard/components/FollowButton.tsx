'use client';

import { useEffect } from 'react';
import { cn } from '@/modules/common/components/ui/cn';
import { useFollowUser } from '@/modules/profile/api';

type FollowButtonProps = {
  className?: string;
  initialFollowers: number;
  initialIsFollowing: boolean;
  onChange?: (state: { followersCount: number; isFollowing: boolean }) => void;
  userId: string;
};

export const FollowButton = (props: FollowButtonProps) => {
  const {
    className,
    initialFollowers,
    initialIsFollowing,
    onChange,
    userId,
  } = props;
  const {
    followers,
    isFollowing,
    isPending,
    toggleFollow,
  } = useFollowUser({
    initialFollowers,
    initialIsFollowing,
    userId,
  });

  useEffect(() => {
    onChange?.({ followersCount: followers, isFollowing });
  }, [followers, isFollowing, onChange]);

  return (
    <button
      className={cn(
        'inline-flex min-w-[78px] items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60',
        isFollowing
          ? 'dashboard-follow-button-following border'
          : 'dashboard-follow-button-primary',
        className,
      )}
      disabled={isPending}
      onClick={() => void toggleFollow()}
      type="button"
    >
      {isPending ? 'Saving' : isFollowing ? 'Following' : 'Follow'}
    </button>
  );
};
