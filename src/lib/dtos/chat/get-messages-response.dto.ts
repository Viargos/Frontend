import type { ChatMessage } from '@/types/chat.types';

/**
 * Response DTO for GET /api/chat/conversations/[id]/messages
 *
 * Backend contract: { data: { messages: ChatMessage[] } }
 *
 * NOTE: Chat backend uses NON-STANDARD nested format,
 * unlike other APIs (PostApi, UserApi, etc.) which use { data: T }
 *
 * API service methods should unwrap to: response.data.messages
 */
export interface GetMessagesResponseDto {
  data: {
    messages: ChatMessage[];
  };
}
