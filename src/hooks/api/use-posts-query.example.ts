/**
 * Example React Query Hook using the new API client
 *
 * This is an example - create actual hooks in separate files:
 * - use-posts-query.ts
 * - use-journeys-query.ts
 * - use-profile-query.ts
 * etc.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config/endpoints';

/**
 * Example: Fetch posts
 *
 * Features:
 * - Automatically includes cookies (credentials: 'include')
 * - Automatically handles token refresh if access token expired
 * - Automatically logs out if refresh fails
 * - No manual error handling needed for auth errors
 */
export function usePostsQuery() {
  const apiClient = getApiClient();

  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      // API client handles:
      // 1. Adding credentials: 'include'
      // 2. Detecting 401 errors
      // 3. Refreshing token if TOKEN_EXPIRED
      // 4. Retrying request after refresh
      // 5. Logging out if refresh fails
      return apiClient.get(API_ENDPOINTS.POSTS.LIST);
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Example: Fetch user profile
 */
export function useProfileQuery() {
  const apiClient = getApiClient();

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      return apiClient.get(API_ENDPOINTS.AUTH.PROFILE);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Example: Create post mutation
 */
export function useCreatePostMutation() {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData: { content: string; media?: File[] }) => {
      return apiClient.post(API_ENDPOINTS.POSTS.CREATE, postData);
    },
    onSuccess: () => {
      // Invalidate posts query to refetch
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
