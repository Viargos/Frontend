import type { ChatMessage } from '@/types/chat.types';

/**
 * Response DTO for POST /api/chat/messages
 *
 * Backend contract: { data: ChatMessage }
 *
 * This DTO is for type assertions in route handlers only.
 * API service methods should unwrap `response.data` and return ChatMessage directly.
 */
export interface SendMessageResponseDto {
  data: ChatMessage;
}
