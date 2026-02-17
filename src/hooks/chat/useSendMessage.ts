/**
 * React Query mutation hook for sending chat messages
 *
 * Features:
 * - Optimistic updates (instant UI feedback)
 * - Auto rollback on error
 * - Auto cache invalidation
 * - WebSocket integration (when available)
 */

import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { ChatApi } from '@/lib/api';
import { ChatMessage, SendMessageData } from '@/types/chat.types';
import { useAuthStore } from '@/store/auth.store';
import { messageKeys } from './useMessages';
import { conversationKeys } from './useConversations';

// Helper to get conversation ID from user IDs
function getConversationId(userId1: string, userId2: string): string {
  return userId1 < userId2 ? `${userId1}__${userId2}` : `${userId2}__${userId1}`;
}

interface SendMessageVariables extends SendMessageData {
  conversationId: string;
}

/**
 * Hook to send a message with optimistic updates
 *
 * @returns Mutation object with mutate/mutateAsync functions
 */
export function useSendMessage(): UseMutationResult<
  ChatMessage,
  Error,
  SendMessageVariables
> {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore(state => state.user);

  return useMutation({
    mutationFn: async (variables: SendMessageVariables) => {
      // Send message via API
      const message = await ChatApi.sendMessage({
        receiverId: variables.receiverId,
        content: variables.content,
      });
      return message;
    },

    // Optimistic update - show message immediately
    onMutate: async (variables) => {
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const { conversationId, receiverId, content } = variables;

      // Cancel outgoing queries to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: messageKeys.list(conversationId) });
      await queryClient.cancelQueries({ queryKey: conversationKeys.lists() });

      // Snapshot previous values for rollback
      const previousMessages = queryClient.getQueryData<ChatMessage[]>(
        messageKeys.list(conversationId)
      );
      const previousConversations = queryClient.getQueryData(conversationKeys.lists());

      // Create temporary message
      const tempMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        senderId: currentUser.id,
        receiverId,
        content: content.trim(),
        isRead: false,
        createdAt: new Date(),
      };

      // Optimistically add message to cache
      queryClient.setQueryData<ChatMessage[]>(
        messageKeys.list(conversationId),
        (old = []) => [...old, tempMessage]
      );

      // Optimistically update conversation list (move to top, update lastMessage)
      queryClient.setQueryData(conversationKeys.lists(), (old: any) => {
        if (!old) return old;
        return old.map((conv: any) =>
          conv.id === conversationId
            ? { ...conv, lastMessage: tempMessage, updatedAt: new Date() }
            : conv
        );
      });

      return { previousMessages, previousConversations, tempMessage };
    },

    // Success - replace temp message with real one
    onSuccess: (realMessage, variables, context) => {
      const { conversationId } = variables;

      if (!context) return;

      // Replace temp message with real message
      queryClient.setQueryData<ChatMessage[]>(
        messageKeys.list(conversationId),
        (old = []) => {
          return old
            .filter(msg => msg.id !== context.tempMessage.id)
            .concat(realMessage)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        }
      );

      // Update conversation with real message
      queryClient.setQueryData(conversationKeys.lists(), (old: any) => {
        if (!old) return old;
        return old.map((conv: any) =>
          conv.id === conversationId
            ? { ...conv, lastMessage: realMessage, updatedAt: realMessage.createdAt }
            : conv
        );
      });
    },

    // Error - rollback optimistic update
    onError: (error, variables, context) => {
      if (!context) return;

      const { conversationId } = variables;

      // Restore previous messages
      if (context.previousMessages) {
        queryClient.setQueryData(
          messageKeys.list(conversationId),
          context.previousMessages
        );
      }

      // Restore previous conversations
      if (context.previousConversations) {
        queryClient.setQueryData(conversationKeys.lists(), context.previousConversations);
      }

      console.error('Failed to send message:', error);
    },

    // Always refetch after mutation settles (success or error)
    onSettled: (data, error, variables) => {
      const { conversationId } = variables;
      queryClient.invalidateQueries({ queryKey: messageKeys.list(conversationId) });
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
}
