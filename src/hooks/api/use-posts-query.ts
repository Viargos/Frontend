import { useInfiniteQuery, UseInfiniteQueryOptions } from '@tanstack/react-query';
import { getApiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config/endpoints';
import { Post } from '@/types/post.types';

interface PostsPage {
  posts: Post[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

interface UsePostsInfiniteQueryOptions {
  initialData?: {
    pages: PostsPage[];
    pageParams: (string | null)[];
  };
  filters?: {
    search?: string;
    location?: string;
  };
}

/**
 * Infinite query hook for posts feed
 * 
 * Responsibilities:
 * - Fetch posts with pagination
 * - Handle infinite scroll
 * - Use API client (inherits retry + refresh logic)
 * 
 * MUST NOT:
 * - Handle auth errors (API client does this)
 * - Implement retry logic (API client does this)
 * - Call logout (API client does this)
 */
export function usePostsInfiniteQuery(options: UsePostsInfiniteQueryOptions = {}) {
  const apiClient = getApiClient();
  const { initialData, filters } = options;

  return useInfiniteQuery<PostsPage>({
    queryKey: ['posts', 'feed', filters],
    queryFn: async ({ pageParam = null }) => {
      // Build query string
      const params = new URLSearchParams({
        limit: '10',
      });

      if (pageParam) {
        params.append('cursor', pageParam);
      }

      if (filters?.search) {
        params.append('search', filters.search);
      }

      if (filters?.location) {
        params.append('location', filters.location);
      }

      const endpoint = `${API_ENDPOINTS.DASHBOARD.POSTS}?${params.toString()}`;
      const response = await apiClient.get<any>(endpoint);

      // Backend returns: { statusCode, message, data: { posts, hasMore, nextCursor } }
      // Extract the actual data
      const actualData = response.data || response;

      // Handle nested structure (backend wraps in data object)
      if (actualData.posts && Array.isArray(actualData.posts)) {
        return {
          posts: actualData.posts,
          nextCursor: actualData.nextCursor || null,
          hasNextPage: actualData.hasMore ?? false,
        };
      }

      // Handle flat structure (direct posts array)
      if ('posts' in response && Array.isArray(response.posts)) {
        return {
          posts: response.posts,
          nextCursor: response.nextCursor || null,
          hasNextPage: response.hasMore ?? false,
        };
      }

      // Fallback
      return {
        posts: [],
        nextCursor: null,
        hasNextPage: false,
      };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.nextCursor : undefined;
    },
    initialData,
    staleTime: 5 * 60 * 1000, // 5 minutes - prevents immediate refetch when initialData is provided
    refetchOnWindowFocus: false,
    // Only fetch if we don't have initialData (prevents double loading on initial page load)
    enabled: !initialData || initialData.pages.length === 0,
  });
}
