import { useQuery } from '@tanstack/react-query';
import { UserApi } from '@/lib/api';
import { UserDetailsData } from '@/types/user.types';

/**
 * Fetch current user's profile including stats and recent data
 * Similar to useUserDetails but for the authenticated user
 * @returns React Query result with current user's profile data
 */
export const useCurrentUserProfile = () => {
  return useQuery({
    queryKey: ['current-user-profile'],
    queryFn: async (): Promise<UserDetailsData> => {
      const response = await UserApi.getProfile();

      // Support both top-level and nested { data: { user, stats, ... } } from backend
      const raw = (response as { data?: typeof response }).data ?? response;
      const user = raw?.user;
      const stats = raw?.stats;
      const relationshipStatus = raw?.relationshipStatus;
      const recentFollowers = Array.isArray(raw?.recentFollowers)
        ? raw.recentFollowers
        : [];
      const recentFollowing = Array.isArray(raw?.recentFollowing)
        ? raw.recentFollowing
        : [];
      const recentPostsRaw = Array.isArray(raw?.recentPosts)
        ? raw.recentPosts
        : [];
      const recentJourneysRaw = Array.isArray(raw?.recentJourneys)
        ? raw.recentJourneys
        : [];

      if (!user?.id) {
        throw new Error('User not found');
      }

      // Transform to UserDetailsData with safe defaults
      const userDetailsData: UserDetailsData = {
        user,
        stats: {
          followersCount: stats?.followersCount ?? 0,
          followingCount: stats?.followingCount ?? 0,
          postsCount: stats?.postsCount ?? 0,
          journeysCount: stats?.journeysCount ?? 0,
        },
        relationshipStatus: {
          isFollowing: relationshipStatus?.isFollowing ?? false,
          isFollowedBy: relationshipStatus?.isFollowedBy ?? false,
        },
        recentFollowers,
        recentFollowing,
        recentPosts: recentPostsRaw.map(
          (post: {
            id: string;
            description?: string;
            likeCount?: number;
            commentCount?: number;
            createdAt: string;
            mediaUrls?: string[];
          }) => ({
            id: post.id,
            description: post.description ?? '',
            likeCount: post.likeCount ?? 0,
            commentCount: post.commentCount ?? 0,
            createdAt: post.createdAt,
            mediaUrls: post.mediaUrls ?? [],
          })
        ),
        recentJourneys: recentJourneysRaw.map(
          (journey: {
            id: string;
            title: string;
            description?: string;
            coverImage?: string | null;
            daysCount?: number;
            createdAt: string;
            author: {
              id: string;
              username: string;
              profileImage?: string | null;
            };
            previewPlaces?: string[];
            type?: string;
          }) => ({
            id: journey.id,
            title: journey.title,
            description: journey.description ?? '',
            coverImage: journey.coverImage ?? null,
            daysCount: journey.daysCount ?? 0,
            createdAt: journey.createdAt,
            author: {
              id: journey.author?.id ?? '',
              username: journey.author?.username ?? '',
              profileImage: journey.author?.profileImage ?? null,
            },
            previewPlaces: journey.previewPlaces ?? [],
            type: journey.type ?? '',
          })
        ),
      };

      return userDetailsData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - profile data doesn't change frequently
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 1, // Only retry once on failure
  });
};
