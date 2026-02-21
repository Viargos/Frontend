import type { ChatMessage } from '@/types/chat.types';

/**
 * Response DTO for POST /api/chat/messages
 *
 * Backend contract: { message: ChatMessage }
 *
 * NOTE: This endpoint returns DIFFERENT format than getConversations!
 * - getConversations: { data: { conversations: [...] } }
 * - sendMessage: { message: {...} }  ← No data wrapper!
 *
 * API service methods should unwrap to: response.message
 */
export interface SendMessageResponseDto {
  message: ChatMessage;
}
