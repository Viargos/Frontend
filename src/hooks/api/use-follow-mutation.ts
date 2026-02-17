import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config/endpoints';

interface FollowUserResponse {
  message: string;
}

/**
 * Mutation hooks for following/unfollowing users
 * 
 * Responsibilities:
 * - Follow/unfollow a user
 * - Optimistically update UI
 * - Invalidate user queries on success
 * 
 * MUST NOT:
 * - Handle auth errors (API client does this)
 * - Retry requests (API client does this)
 */
export function useFollowUserMutation() {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return useMutation<FollowUserResponse, Error, { userId: string }>({
    mutationFn: async ({ userId }) => {
      return apiClient.post<FollowUserResponse>(API_ENDPOINTS.USERS.FOLLOW(userId));
    },
    onSuccess: () => {
      // Invalidate user-related queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useUnfollowUserMutation() {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return useMutation<FollowUserResponse, Error, { userId: string }>({
    mutationFn: async ({ userId }) => {
      return apiClient.post<FollowUserResponse>(API_ENDPOINTS.USERS.UNFOLLOW(userId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
