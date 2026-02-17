import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config/endpoints';
import { PostComment } from '@/types/post.types';

interface CreateCommentResponse {
  message: string;
  comment: PostComment;
}

interface CreateCommentRequest {
  postId: string;
  content: string;
  parentCommentId?: string;
}

/**
 * Mutation hook for creating comments
 * 
 * Responsibilities:
 * - Create a comment on a post
 * - Invalidate posts query on success
 * 
 * MUST NOT:
 * - Handle auth errors (API client does this)
 * - Retry requests (API client does this)
 * - Show toast notifications (UI component does this)
 */
export function useCreateCommentMutation() {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return useMutation<CreateCommentResponse, Error, CreateCommentRequest>({
    mutationFn: async ({ postId, content, parentCommentId }) => {
      const endpoint = API_ENDPOINTS.POSTS.COMMENTS(postId);
      return apiClient.post<CreateCommentResponse>(endpoint, {
        content,
        parentCommentId,
      });
    },
    onSuccess: (data, variables) => {
      // Invalidate posts query to refetch with new comment
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', variables.postId] });
    },
  });
}
