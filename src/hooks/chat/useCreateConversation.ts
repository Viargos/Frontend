/**
 * React Query mutation hook for creating chat conversations
 *
 * Features:
 * - Optimistic updates
 * - Auto cache invalidation
 * - Duplicate conversation handling
 */

import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { ChatApi } from '@/lib/api';
import { ChatConversation } from '@/types/chat.types';
import { conversationKeys } from './useConversations';

/**
 * Hook to create a new conversation
 *
 * @returns Mutation object with mutate/mutateAsync functions
 */
export function useCreateConversation(): UseMutationResult<
  ChatConversation,
  Error,
  string
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      // Check if conversation already exists in cache
      const cachedConversations = queryClient.getQueryData<ChatConversation[]>(
        conversationKeys.lists()
      );

      const existingConversation = cachedConversations?.find(
        conv => conv.user.id === userId
      );

      if (existingConversation) {
        return existingConversation;
      }

      // Create new conversation via API
      const conversation = await ChatApi.createConversation(userId);
      return conversation;
    },

    // Success - add to conversations list
    onSuccess: (newConversation) => {
      queryClient.setQueryData<ChatConversation[]>(
        conversationKeys.lists(),
        (old = []) => {
          // Check if already exists (avoid duplicates)
          const exists = old.some(conv => conv.id === newConversation.id);
          if (exists) return old;

          // Add to top of list
          return [newConversation, ...old];
        }
      );
    },

    // Error handling
    onError: (error, userId) => {
      // If error is "conversation already exists", try to refetch
      if (
        error.message?.includes('already exists') ||
        error.message?.includes('duplicate')
      ) {
        queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
      }
      console.error('Failed to create conversation:', error);
    },

    // Always refetch conversations after mutation
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
}
