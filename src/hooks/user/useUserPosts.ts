import { useQuery } from '@tanstack/react-query';
import { PostApi } from '@/lib/api';
import { Post } from '@/types/post.types';

interface UseUserPostsOptions {
  userId: string;
  enabled?: boolean;
}

/**
 * Fetch all posts for a specific user
 * @param options Configuration options
 * @returns React Query result with user's posts
 */
export const useUserPosts = ({
  userId,
  enabled = true,
}: UseUserPostsOptions) => {
  return useQuery({
    queryKey: ['user-posts', userId],
    queryFn: async (): Promise<Post[]> => {
      try {
        console.log('[FETCHING_ALL_POSTS]', { userId });

        // Fetch ALL posts - using 1000 as upper bound
        const list = await PostApi.listByUser(userId, {
          limit: 1000,
          offset: 0,
        });

        if (Array.isArray(list) && list.length > 0) {
          console.log('[STATE_POSTS_COUNT]', {
            count: list.length,
            posts: list,
          });
          return list as Post[];
        }

        return [];
      } catch (err) {
        console.error('Failed to fetch posts:', err);
        return [];
      }
    },
    enabled: !!userId && enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes - posts change more frequently than journeys
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });
};
