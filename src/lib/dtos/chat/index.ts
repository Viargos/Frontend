/**
 * Chat API Data Transfer Objects
 *
 * Defines the contract between frontend and backend for chat endpoints.
 * Note: Chat backend returns non-standard format { data: { conversations: [...] } }
 * instead of standard { data: [...] }
 */

import type { ChatConversation, ChatMessage } from '@/types/chat.types';

/**
 * GET /api/chat/conversations response
 * Non-standard format: { data: { conversations: ChatConversation[] } }
 */
export interface GetConversationsResponseDto {
  data: {
    conversations: ChatConversation[];
  };
}

/**
 * GET /api/chat/conversations/:id/messages response
 * Expected format: { data: { messages: ChatMessage[] } }
 */
export interface GetMessagesResponseDto {
  data: {
    messages: ChatMessage[];
  };
}

/**
 * POST /api/chat/messages response
 * Expected format: { data: { message: ChatMessage } }
 */
export interface SendMessageResponseDto {
  data: {
    message: ChatMessage;
  };
}

/**
 * POST /api/chat/conversations response
 * Expected format: { data: { conversation: ChatConversation } }
 */
export interface CreateConversationResponseDto {
  data: {
    conversation: ChatConversation;
  };
}

/**
 * PUT /api/chat/conversations/:id/read response
 * Expected format: { data: { message: string } }
 */
export interface MarkAsReadResponseDto {
  data: {
    message: string;
  };
}
