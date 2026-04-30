'use client';

import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useReducer } from 'react';
import { profileService } from '@/modules/profile/services/profile.service';

type FollowUserOptions = {
  initialFollowers: number;
  initialIsFollowing: boolean;
  userId: string;
};

type FollowSnapshot = {
  followers: number;
  isFollowing: boolean;
};

type FollowState = FollowSnapshot;

type FollowAction = { type: 'optimistic'; nextIsFollowing: boolean }
  | { type: 'rollback'; snapshot: FollowSnapshot }
  | { type: 'sync'; snapshot: FollowSnapshot };

function followStateReducer(state: FollowState, action: FollowAction): FollowState {
  if (action.type === 'sync' || action.type === 'rollback') {
    return action.snapshot;
  }

  const delta = action.nextIsFollowing ? 1 : -1;
  return {
    followers: Math.max(0, state.followers + delta),
    isFollowing: action.nextIsFollowing,
  };
}

export function useFollowUser(options: FollowUserOptions) {
  const { initialFollowers, initialIsFollowing, userId } = options;
  const [state, dispatch] = useReducer(followStateReducer, {
    followers: initialFollowers,
    isFollowing: initialIsFollowing,
  });

  useEffect(() => {
    dispatch({
      type: 'sync',
      snapshot: {
        followers: initialFollowers,
        isFollowing: initialIsFollowing,
      },
    });
  }, [initialFollowers, initialIsFollowing]);

  const toggleFollowMutation = useMutation<void, Error, boolean, FollowSnapshot>({
    mutationFn: async (nextIsFollowing) => {
      if (nextIsFollowing) {
        await profileService.followUser(userId);
        return;
      }

      await profileService.unfollowUser(userId);
    },
    onMutate: (nextIsFollowing) => {
      const snapshot: FollowSnapshot = {
        followers: state.followers,
        isFollowing: state.isFollowing,
      };

      dispatch({
        type: 'optimistic',
        nextIsFollowing,
      });

      return snapshot;
    },
    onError: (_error, _nextIsFollowing, context) => {
      if (!context) {
        return;
      }

      dispatch({
        type: 'rollback',
        snapshot: context,
      });
    },
  });

  const toggleFollow = useCallback(async () => {
    if (toggleFollowMutation.isPending) {
      return;
    }

    const nextIsFollowing = !state.isFollowing;
    await toggleFollowMutation.mutateAsync(nextIsFollowing);
  }, [state.isFollowing, toggleFollowMutation]);

  return {
    followers: state.followers,
    isFollowing: state.isFollowing,
    isPending: toggleFollowMutation.isPending,
    toggleFollow,
  };
}
