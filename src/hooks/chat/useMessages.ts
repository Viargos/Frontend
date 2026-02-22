/**
 * React Query hook for managing chat messages
 *
 * Features:
 * - Per-conversation caching
 * - Automatic sorting (oldest first)
 * - Auto-refetching on window focus
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { ChatApi } from '@/lib/api';
import { ChatMessage } from '@/types/chat.types';

// Query keys for cache management
export const messageKeys = {
  all: ['messages'] as const,
  lists: () => [...messageKeys.all, 'list'] as const,
  list: (conversationId: string) => [...messageKeys.lists(), conversationId] as const,
};

/**
 * Hook to fetch messages for a specific conversation
 *
 * @param conversationId - ID of the conversation
 * @param enabled - Whether to auto-fetch (default: true when conversationId exists)
 * @returns Query result with messages array
 */
export function useMessages(
  conversationId: string | null,
  options?: { enabled?: boolean }
): UseQueryResult<ChatMessage[], Error> {
  return useQuery({
    queryKey: conversationId ? messageKeys.list(conversationId) : ['messages', 'empty'],
    queryFn: async () => {
      if (!conversationId) return [];

      const messages = await ChatApi.getMessages(conversationId, {
        limit: 50,
        offset: 0,
      });

      // Sort messages by timestamp ASC (oldest first for chat display)
      return messages.sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return timeA - timeB;
      });
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!conversationId,
    staleTime: 3 * 60 * 1000, // 3 minutes (messages are more dynamic)
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
