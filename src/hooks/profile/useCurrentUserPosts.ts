import { useQuery } from '@tanstack/react-query';
import { PostApi } from '@/lib/api';
import { Post } from '@/types/post.types';

interface UseCurrentUserPostsOptions {
  enabled?: boolean;
}

/**
 * Fetch all posts for the current authenticated user
 * @param options Configuration options
 * @returns React Query result with current user's posts
 */
export const useCurrentUserPosts = ({
  enabled = true,
}: UseCurrentUserPostsOptions = {}) => {
  return useQuery({
    queryKey: ['current-user-posts'],
    queryFn: async (): Promise<Post[]> => {
      try {
        // Fetch current user's posts using "me" identifier
        const list = await PostApi.listByUser('me', {
          limit: 1000,
          offset: 0,
        });

        if (Array.isArray(list) && list.length > 0) {
          return list as Post[];
        }

        return [];
      } catch (err) {
        console.error('Failed to fetch current user posts:', err);
        return [];
      }
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes - posts change more frequently than profile
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });
};
