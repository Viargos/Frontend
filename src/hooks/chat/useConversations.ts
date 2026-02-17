/**
 * React Query hook for managing chat conversations
 *
 * Features:
 * - Auto-caching (5 min stale time)
 * - Auto-refetching on window focus
 * - Automatic loading/error states
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { ChatApi } from '@/lib/api';
import { ChatConversation } from '@/types/chat.types';

// Query keys for cache management
export const conversationKeys = {
  all: ['conversations'] as const,
  lists: () => [...conversationKeys.all, 'list'] as const,
};

/**
 * Hook to fetch user's chat conversations
 *
 * @returns Query result with conversations array
 */
export function useConversations(): UseQueryResult<ChatConversation[], Error> {
  return useQuery({
    queryKey: conversationKeys.lists(),
    queryFn: async () => {
      const conversations = await ChatApi.getConversations();

      // Sort by last message time (newest first)
      return conversations.sort((a, b) => {
        const timeA = a.lastMessage
          ? new Date(a.lastMessage.createdAt).getTime()
          : new Date(a.updatedAt).getTime();
        const timeB = b.lastMessage
          ? new Date(b.lastMessage.createdAt).getTime()
          : new Date(b.updatedAt).getTime();
        return timeB - timeA;
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)
    refetchOnWindowFocus: true,
  });
}
