import { httpClient } from '../core/api-client';
import { API_ENDPOINTS } from '../config/endpoints';
import { HttpMethod } from '@/enums';
import { buildUrl } from '@/lib/utils/url.utils';
import type {
  GetConversationsResponseDto,
  GetMessagesResponseDto,
  CreateConversationResponseDto,
  SendMessageResponseDto,
} from '@/lib/dtos/chat';
import type { ChatConversation, ChatMessage } from '@/types/chat.types';

export class ChatApiService {
  /**
   * Get all conversations for current user
   * @returns Array of chat conversations with last message
   */
  async getConversations(): Promise<ChatConversation[]> {
    const response = await httpClient.get<GetConversationsResponseDto>(
      API_ENDPOINTS.CHAT.CONVERSATIONS
    );
    return response.data;
  }

  /**
   * Get messages for a specific conversation
   * @param conversationId Conversation ID
   * @param params Pagination parameters (limit, offset)
   * @returns Array of chat messages
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
    return response.data;
  }

  /**
   * Send message to another user
   * @param data Message data (receiverId, content)
   * @returns Created message
   */
  async sendMessage(data: {
    receiverId: string;
    content: string;
  }): Promise<ChatMessage> {
    const response = await httpClient.post<SendMessageResponseDto>(
      API_ENDPOINTS.CHAT.SEND_MESSAGE,
      data
    );
    return response.data;
  }

  /**
   * Create new conversation with user
   * @param userId User ID to start conversation with
   * @returns Created conversation
   */
  async createConversation(userId: string): Promise<ChatConversation> {
    const response = await httpClient.post<CreateConversationResponseDto>(
      API_ENDPOINTS.CHAT.CREATE_CONVERSATION,
      { userId }
    );
    return response.data;
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
