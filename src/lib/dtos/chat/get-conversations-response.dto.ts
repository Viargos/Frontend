import type { ChatConversation } from '@/types/chat.types';

/**
 * Response DTO for GET /api/chat/conversations
 *
 * Backend contract: { data: ChatConversation[] }
 *
 * This DTO is for type assertions in route handlers only.
 * API service methods should unwrap `response.data` and return ChatConversation[] directly.
 */
export interface GetConversationsResponseDto {
  data: ChatConversation[];
}
