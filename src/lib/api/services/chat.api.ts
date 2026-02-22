import { httpClient } from '../core/api-client';
import { API_ENDPOINTS } from '../config/endpoints';
import { HttpMethod } from '@/enums';
import { buildUrl } from '@/lib/utils/url.utils';
import type { ChatConversation, ChatMessage } from '@/types/chat.types';
import type { GetConversationsResponseDto } from '@/lib/dtos/chat/get-conversations-response.dto';
import type { GetMessagesResponseDto } from '@/lib/dtos/chat/get-messages-response.dto';
import type { SendMessageResponseDto } from '@/lib/dtos/chat/send-message-response.dto';
import type { CreateConversationResponseDto } from '@/lib/dtos/chat/create-conversation-response.dto';

export class ChatApiService {
  /**
   * Get all conversations for current user
   * @returns Array of chat conversations with last message
   *
   * Backend contract: { data: { conversations: ChatConversation[] } }
   * Route Handler: GET /api/chat/conversations
   *
   * NOTE: Chat backend uses non-standard nested format
   */
  async getConversations(): Promise<ChatConversation[]> {
    const response = await httpClient.get<GetConversationsResponseDto>(
      API_ENDPOINTS.CHAT.CONVERSATIONS
    );
    return response.data.conversations;
  }

  /**
   * Get messages for a specific conversation
   * @param conversationId Conversation ID
   * @param params Pagination parameters (limit, offset)
   * @returns Array of chat messages
   *
   * Backend contract: { data: { messages: ChatMessage[] } }
   * Route Handler: GET /api/chat/conversations/[id]/messages
   *
   * NOTE: Chat backend uses non-standard nested format
   */
  async getMessages(
    conversationId: string,
    params?: { limit?: number; offset?: number }
  ): Promise<ChatMessage[]> {
    const url = buildUrl(
      API_ENDPOINTS.CHAT.MESSAGES(conversationId),
      params
    );
    const response = await httpClient.get<GetMessagesResponseDto>(url);
    return response.data.messages;
  }

  /**
   * Send message to another user
   * @param data Message data (receiverId, content)
   * @returns Created message
   *
   * Backend contract: { message: ChatMessage }
   * Route Handler: POST /api/chat/messages
   *
   * NOTE: This endpoint returns DIFFERENT format than getConversations!
   * No data wrapper - returns { message: {...} } directly
   */
  async sendMessage(data: {
    receiverId: string;
    content: string;
  }): Promise<ChatMessage> {
    const response = await httpClient.post<SendMessageResponseDto>(
      API_ENDPOINTS.CHAT.SEND_MESSAGE,
      data
    );
    return response.message;
  }

  /**
   * Create new conversation with user
   * @param userId User ID to start conversation with
   * @returns Created conversation
   *
   * Backend contract: { data: { conversation: ChatConversation } }
   * Route Handler: POST /api/chat/conversations
   *
   * NOTE: Chat backend uses non-standard nested format
   */
  async createConversation(userId: string): Promise<ChatConversation> {
    const response = await httpClient.post<CreateConversationResponseDto>(
      API_ENDPOINTS.CHAT.CREATE_CONVERSATION,
      { userId }
    );
    return response.data.conversation;
  }

  /**
   * Mark conversation as read
   * Updates unread count to zero
   * @param conversationId Conversation ID to mark as read
   */
  async markConversationAsRead(conversationId: string): Promise<void> {
    await httpClient.request(
      API_ENDPOINTS.CHAT.MARK_CONVERSATION_READ(conversationId),
      { method: HttpMethod.PUT }
    );
  }
}

export const ChatApi = new ChatApiService();
