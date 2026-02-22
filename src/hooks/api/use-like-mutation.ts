import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config/endpoints';
import { Post } from '@/types/post.types';

interface LikePostResponse {
  message: string;
  likeCount: number;
  isLiked: boolean;
}

/**
 * Mutation hook for liking/unliking posts
 * 
 * Responsibilities:
 * - Like/unlike a post
 * - Optimistically update UI
 * - Invalidate posts query on success
 * 
 * MUST NOT:
 * - Handle auth errors (API client does this)
 * - Retry requests (API client does this)
 * - Show toast notifications (UI component does this)
 */
export function useLikePostMutation() {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return useMutation<LikePostResponse, Error, { postId: string }>({
    mutationFn: async ({ postId }) => {
      return apiClient.post<LikePostResponse>(API_ENDPOINTS.POSTS.LIKE(postId));
    },
    onMutate: async ({ postId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      // Snapshot previous value
      const previousPages = queryClient.getQueryData<{
        pages: Array<{ posts: Post[] }>;
      }>(['posts', 'feed']);

      // Optimistically update
      if (previousPages) {
        queryClient.setQueryData(['posts', 'feed'], {
          ...previousPages,
          pages: previousPages.pages.map(page => ({
            ...page,
            posts: page.posts.map(post =>
              post.id === postId
                ? {
                    ...post,
                    isLikedByCurrentUser: !post.isLikedByCurrentUser,
                    likeCount: post.likeCount + (post.isLikedByCurrentUser ? -1 : 1),
                  }
                : post
            ),
          })),
        });
      }

      return { previousPages };
    },
    onError: (error, variables, context) => {
      // Revert optimistic update on error
      if (context?.previousPages) {
        queryClient.setQueryData(['posts', 'feed'], context.previousPages);
      }
    },
    onSuccess: () => {
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useUnlikePostMutation() {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return useMutation<LikePostResponse, Error, { postId: string }>({
    mutationFn: async ({ postId }) => {
      return apiClient.post<LikePostResponse>(API_ENDPOINTS.POSTS.UNLIKE(postId));
    },
    onMutate: async ({ postId }) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      const previousPages = queryClient.getQueryData<{
        pages: Array<{ posts: Post[] }>;
      }>(['posts', 'feed']);

      if (previousPages) {
        queryClient.setQueryData(['posts', 'feed'], {
          ...previousPages,
          pages: previousPages.pages.map(page => ({
            ...page,
            posts: page.posts.map(post =>
              post.id === postId
                ? {
                    ...post,
                    isLikedByCurrentUser: false,
                    likeCount: Math.max(0, post.likeCount - 1),
                  }
                : post
            ),
          })),
        });
      }

      return { previousPages };
    },
    onError: (error, variables, context) => {
      if (context?.previousPages) {
        queryClient.setQueryData(['posts', 'feed'], context.previousPages);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
