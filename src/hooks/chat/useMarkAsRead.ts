/**
 * React Query mutation hook for marking conversations as read
 *
 * Features:
 * - Optimistic updates (instant UI feedback)
 * - Auto rollback on error
 * - Silent background sync
 */

import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { ChatApi } from '@/lib/api';
import { conversationKeys } from './useConversations';
import { messageKeys } from './useMessages';
import { ChatConversation, ChatMessage } from '@/types/chat.types';
import { useAuthStore } from '@/store/auth.store';

/**
 * Hook to mark a conversation as read
 *
 * @returns Mutation object with mutate/mutateAsync functions
 */
export function useMarkAsRead(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore(state => state.user);

  return useMutation({
    mutationFn: async (conversationId: string) => {
      // API call to mark as read (silent - don't throw on error)
      try {
        await ChatApi.markConversationAsRead(conversationId);
      } catch (error) {
        // Silent fail - local state is already updated for good UX
        console.warn('Failed to mark conversation as read on backend:', error);
      }
    },

    // Optimistic update - mark as read immediately
    onMutate: async (conversationId) => {
      if (!currentUser) return;

      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: conversationKeys.lists() });
      await queryClient.cancelQueries({ queryKey: messageKeys.list(conversationId) });

      // Snapshot previous values
      const previousConversations = queryClient.getQueryData(conversationKeys.lists());
      const previousMessages = queryClient.getQueryData(messageKeys.list(conversationId));

      // Update conversation unreadCount to 0
      queryClient.setQueryData<ChatConversation[]>(
        conversationKeys.lists(),
        (old = []) =>
          old.map(conv =>
            conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
          )
      );

      // Update all messages in conversation to isRead: true
      queryClient.setQueryData<ChatMessage[]>(
        messageKeys.list(conversationId),
        (old = []) =>
          old.map(msg =>
            msg.receiverId === currentUser.id ? { ...msg, isRead: true } : msg
          )
      );

      return { previousConversations, previousMessages };
    },

    // Error - rollback (rare case)
    onError: (error, conversationId, context) => {
      if (!context) return;

      // Restore previous state
      if (context.previousConversations) {
        queryClient.setQueryData(conversationKeys.lists(), context.previousConversations);
      }
      if (context.previousMessages) {
        queryClient.setQueryData(
          messageKeys.list(conversationId),
          context.previousMessages
        );
      }
    },
  });
}
