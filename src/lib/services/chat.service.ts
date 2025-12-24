/**
 * Chat Service - Migrated Version
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Handles only chat-related operations
 * - Open/Closed: Open for extension through interfaces, closed for modification
 * - Liskov Substitution: Implements IChatService interface correctly
 * - Interface Segregation: Depends only on required interface (IHttpClient)
 * - Dependency Inversion: Depends on abstractions (IHttpClient), not concrete implementations
 *
 * Improvements:
 * - Centralized error messages (ERROR_MESSAGES)
 * - Structured logging with logger
 * - Better error handling with ErrorHandler
 * - Type-safe implementations (removed `any` type)
 * - Event tracking for analytics
 * - Input validation for better error messages
 */

import { IChatService } from '@/lib/interfaces/chat.interface';
import {
  ChatConversation,
  ChatMessage,
  ChatUser,
  CreateMessageDto,
  MarkReadDto,
  SearchUsersDto,
  GetMessagesDto,
} from '@/types/chat.types';
import { serviceFactory } from './service-factory';
import { logger } from '@/utils/logger';
import { ErrorHandler } from '@/utils/error-handler';
import { ERROR_MESSAGES } from '@/constants';

/**
 * Pagination metadata for chat messages
 */
interface PaginationMetadata {
  limit: number;
  offset: number;
  total?: number;
  hasMore?: boolean;
}

export class ChatService implements IChatService {
  private httpClient = serviceFactory.httpClient;

  constructor() {
    logger.debug('ChatService initialized');
  }

  async getCurrentUser(): Promise<{ user: ChatUser }> {
    logger.debug('Fetching current chat user');

    try {
      const response = await this.httpClient.get<{ user: ChatUser }>('/chat/me');

      logger.info('Current chat user fetched successfully', {
        userId: response.data?.user?.id,
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to fetch current chat user', error as Error);
      throw new Error(
        ErrorHandler.extractMessage(error) ||
        ERROR_MESSAGES.CHAT.FETCH_FAILED
      );
    }
  }

  async searchUsers(
    searchUsersDto: SearchUsersDto
  ): Promise<{ users: ChatUser[] }> {
    logger.debug('Searching chat users', {
      query: searchUsersDto.q,
      limit: searchUsersDto.limit,
      offset: searchUsersDto.offset,
    });

    try {
      this.validateSearchUsersDto(searchUsersDto);

      const queryParams = new URLSearchParams();
      if (searchUsersDto.q) queryParams.append('q', searchUsersDto.q);
      if (searchUsersDto.limit)
        queryParams.append('limit', searchUsersDto.limit.toString());
      if (searchUsersDto.offset)
        queryParams.append('offset', searchUsersDto.offset.toString());

      const response = await this.httpClient.get<{ users: ChatUser[] }>(
        `/chat/users/search?${queryParams.toString()}`
      );

      const userCount = response.data?.users?.length || 0;

      logger.info('Chat users searched successfully', {
        userCount,
        query: searchUsersDto.q,
      });

      logger.trackEvent('chat_users_searched', {
        userCount,
        hasQuery: !!searchUsersDto.q,
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to search chat users', error as Error, {
        searchDto: searchUsersDto,
      });
      throw new Error(
        ErrorHandler.extractMessage(error) ||
        ERROR_MESSAGES.CHAT.SEARCH_USERS_FAILED
      );
    }
  }

  async getUserById(userId: string): Promise<{ user: ChatUser }> {
    logger.debug('Fetching chat user by ID', { userId });

    try {
      this.validateUserId(userId);

      const response = await this.httpClient.get<{ user: ChatUser }>(
        `/chat/users/${userId}`
      );

      logger.info('Chat user fetched successfully', { userId });

      return response.data;
    } catch (error) {
      logger.error('Failed to fetch chat user', error as Error, { userId });
      throw new Error(
        ErrorHandler.extractMessage(error) ||
        ERROR_MESSAGES.CHAT.FETCH_USER_FAILED
      );
    }
  }

  async getConversations(): Promise<{ conversations: ChatConversation[] }> {
    logger.debug('Fetching chat conversations');

    try {
      const response = await this.httpClient.get<{
        conversations: ChatConversation[];
      }>('/chat/conversations');

      const conversationCount = response.data?.conversations?.length || 0;

      logger.info('Chat conversations fetched successfully', {
        conversationCount,
      });

      logger.trackEvent('chat_conversations_fetched', { conversationCount });

      return response.data;
    } catch (error) {
      logger.error('Failed to fetch chat conversations', error as Error);
      throw new Error(
        ErrorHandler.extractMessage(error) ||
        ERROR_MESSAGES.CHAT.FETCH_CONVERSATIONS_FAILED
      );
    }
  }

  async createConversation(
    userId: string
  ): Promise<{ conversation: ChatConversation }> {
    logger.info('Creating chat conversation', { userId });

    try {
      this.validateUserId(userId);

      const response = await this.httpClient.post<{
        conversation: ChatConversation;
      }>('/chat/conversations', { userId });

      logger.info('Chat conversation created successfully', {
        conversationId: response.data?.conversation?.id,
        userId,
      });

      logger.trackEvent('chat_conversation_created', {
        conversationId: response.data?.conversation?.id,
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to create chat conversation', error as Error, {
        userId,
      });
      throw new Error(
        ErrorHandler.extractMessage(error) ||
        ERROR_MESSAGES.CHAT.CREATE_CONVERSATION_FAILED
      );
    }
  }

  async getConversation(
    conversationId: string
  ): Promise<{ conversation: ChatConversation }> {
    logger.debug('Fetching chat conversation', { conversationId });

    try {
      this.validateConversationId(conversationId);

      const response = await this.httpClient.get<{
        conversation: ChatConversation;
      }>(`/chat/conversations/${conversationId}`);

      logger.info('Chat conversation fetched successfully', {
        conversationId,
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to fetch chat conversation', error as Error, {
        conversationId,
      });
      throw new Error(
        ErrorHandler.extractMessage(error) ||
        ERROR_MESSAGES.CHAT.FETCH_CONVERSATION_FAILED
      );
    }
  }

  async markConversationAsRead(
    conversationId: string
  ): Promise<{ success: boolean }> {
    logger.debug('Marking conversation as read', { conversationId });

    try {
      this.validateConversationId(conversationId);

      const response = await this.httpClient.put<{ success: boolean }>(
        `/chat/conversations/${conversationId}/read`
      );

      logger.info('Conversation marked as read', { conversationId });

      logger.trackEvent('chat_conversation_read', { conversationId });

      return response.data;
    } catch (error) {
      logger.error('Failed to mark conversation as read', error as Error, {
        conversationId,
      });
      throw new Error(
        ErrorHandler.extractMessage(error) ||
        ERROR_MESSAGES.CHAT.MARK_READ_FAILED
      );
    }
  }

  async deleteConversation(
    conversationId: string
  ): Promise<{ success: boolean }> {
    logger.info('Deleting conversation', { conversationId });

    try {
      this.validateConversationId(conversationId);

      const response = await this.httpClient.delete<{ success: boolean }>(
        `/chat/conversations/${conversationId}`
      );

      logger.info('Conversation deleted successfully', { conversationId });

      logger.trackEvent('chat_conversation_deleted', { conversationId });

      return response.data;
    } catch (error) {
      logger.error('Failed to delete conversation', error as Error, {
        conversationId,
      });
      throw new Error(
        ErrorHandler.extractMessage(error) ||
        ERROR_MESSAGES.CHAT.DELETE_CONVERSATION_FAILED
      );
    }
  }

  async getMessages(
    conversationId: string,
    getMessagesDto: GetMessagesDto
  ): Promise<{ messages: ChatMessage[]; pagination: PaginationMetadata }> {
    logger.debug('Fetching messages', {
      conversationId,
      limit: getMessagesDto.limit,
      offset: getMessagesDto.offset,
    });

    try {
      this.validateConversationId(conversationId);
      this.validateGetMessagesDto(getMessagesDto);

      const queryParams = new URLSearchParams();
      if (getMessagesDto.limit)
        queryParams.append('limit', getMessagesDto.limit.toString());
      if (getMessagesDto.offset)
        queryParams.append('offset', getMessagesDto.offset.toString());

      const response = await this.httpClient.get<{
        messages: ChatMessage[];
        pagination: PaginationMetadata;
      }>(
        `/chat/conversations/${conversationId}/messages?${queryParams.toString()}`
      );

      const messageCount = response.data?.messages?.length || 0;

      logger.info('Messages fetched successfully', {
        conversationId,
        messageCount,
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to fetch messages', error as Error, {
        conversationId,
        getMessagesDto,
      });
      throw new Error(
        ErrorHandler.extractMessage(error) ||
        ERROR_MESSAGES.CHAT.FETCH_MESSAGES_FAILED
      );
    }
  }

  async sendMessage(
    createMessageDto: CreateMessageDto
  ): Promise<{ message: ChatMessage }> {
    logger.info('Sending message', {
      receiverId: createMessageDto.receiverId,
      hasContent: !!createMessageDto.content,
    });

    try {
      this.validateCreateMessageDto(createMessageDto);

      const response = await this.httpClient.post<{ message: ChatMessage }>(
        '/chat/messages',
        createMessageDto
      );

      logger.info('Message sent successfully', {
        messageId: response.data?.message?.id,
        receiverId: createMessageDto.receiverId,
      });

      logger.trackEvent('chat_message_sent', {
        messageId: response.data?.message?.id,
        receiverId: createMessageDto.receiverId,
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to send message', error as Error, {
        createMessageDto,
      });
      throw new Error(
        ErrorHandler.extractMessage(error) ||
        ERROR_MESSAGES.CHAT.SEND_MESSAGE_FAILED
      );
    }
  }

  async markMessageAsRead(messageId: string): Promise<{ success: boolean }> {
    logger.debug('Marking message as read', { messageId });

    try {
      this.validateMessageId(messageId);

      const response = await this.httpClient.put<{ success: boolean }>(
        `/chat/messages/${messageId}/read`
      );

      logger.info('Message marked as read', { messageId });

      return response.data;
    } catch (error) {
      logger.error('Failed to mark message as read', error as Error, {
        messageId,
      });
      throw new Error(
        ErrorHandler.extractMessage(error) ||
        ERROR_MESSAGES.CHAT.MARK_READ_FAILED
      );
    }
  }

  async markMessagesAsRead(
    markReadDto: MarkReadDto
  ): Promise<{ success: boolean }> {
    logger.debug('Marking multiple messages as read', {
      messageCount: markReadDto.messageIds?.length,
    });

    try {
      this.validateMarkReadDto(markReadDto);

      const response = await this.httpClient.put<{ success: boolean }>(
        '/chat/messages/read',
        markReadDto
      );

      logger.info('Messages marked as read', {
        messageCount: markReadDto.messageIds?.length,
      });

      logger.trackEvent('chat_messages_marked_read', {
        messageCount: markReadDto.messageIds?.length,
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to mark messages as read', error as Error, {
        markReadDto,
      });
      throw new Error(
        ErrorHandler.extractMessage(error) ||
        ERROR_MESSAGES.CHAT.MARK_READ_FAILED
      );
    }
  }

  async updateMessage(
    messageId: string,
    content: string
  ): Promise<{ message: ChatMessage }> {
    logger.info('Updating message', { messageId, hasContent: !!content });

    try {
      this.validateMessageId(messageId);
      this.validateMessageContent(content);

      const response = await this.httpClient.put<{ message: ChatMessage }>(
        `/chat/messages/${messageId}`,
        { content }
      );

      logger.info('Message updated successfully', { messageId });

      logger.trackEvent('chat_message_updated', { messageId });

      return response.data;
    } catch (error) {
      logger.error('Failed to update message', error as Error, { messageId });
      throw new Error(
        ErrorHandler.extractMessage(error) ||
        ERROR_MESSAGES.CHAT.UPDATE_MESSAGE_FAILED
      );
    }
  }

  async deleteMessage(messageId: string): Promise<{ success: boolean }> {
    logger.info('Deleting message', { messageId });

    try {
      this.validateMessageId(messageId);

      const response = await this.httpClient.delete<{ success: boolean }>(
        `/chat/messages/${messageId}`
      );

      logger.info('Message deleted successfully', { messageId });

      logger.trackEvent('chat_message_deleted', { messageId });

      return response.data;
    } catch (error) {
      logger.error('Failed to delete message', error as Error, { messageId });
      throw new Error(
        ErrorHandler.extractMessage(error) ||
        ERROR_MESSAGES.CHAT.DELETE_MESSAGE_FAILED
      );
    }
  }

  async getOnlineUsers(): Promise<{ users: ChatUser[] }> {
    logger.debug('Fetching online users');

    try {
      const response = await this.httpClient.get<{ users: ChatUser[] }>(
        '/chat/users/online'
      );

      const userCount = response.data?.users?.length || 0;

      logger.info('Online users fetched successfully', { userCount });

      return response.data;
    } catch (error) {
      logger.error('Failed to fetch online users', error as Error);
      throw new Error(
        ErrorHandler.extractMessage(error) ||
        ERROR_MESSAGES.CHAT.FETCH_ONLINE_USERS_FAILED
      );
    }
  }

  async updateUserStatus(isOnline: boolean): Promise<{ success: boolean }> {
    logger.info('Updating user status', { isOnline });

    try {
      const response = await this.httpClient.put<{ success: boolean }>(
        '/chat/users/status',
        { isOnline }
      );

      logger.info('User status updated successfully', { isOnline });

      logger.trackEvent('chat_user_status_updated', { isOnline });

      return response.data;
    } catch (error) {
      logger.error('Failed to update user status', error as Error, {
        isOnline,
      });
      throw new Error(
        ErrorHandler.extractMessage(error) ||
        ERROR_MESSAGES.CHAT.UPDATE_STATUS_FAILED
      );
    }
  }

  // ========================================
  // Private Validation Methods (SRP)
  // ========================================

  /**
   * Validate user ID
   */
  private validateUserId(userId: string): void {
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD('User ID'));
    }
  }

  /**
   * Validate conversation ID
   */
  private validateConversationId(conversationId: string): void {
    if (
      !conversationId ||
      typeof conversationId !== 'string' ||
      conversationId.trim().length === 0
    ) {
      throw new Error(
        ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD('Conversation ID')
      );
    }
  }

  /**
   * Validate message ID
   */
  private validateMessageId(messageId: string): void {
    if (
      !messageId ||
      typeof messageId !== 'string' ||
      messageId.trim().length === 0
    ) {
      throw new Error(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD('Message ID'));
    }
  }

  /**
   * Validate message content
   */
  private validateMessageContent(content: string): void {
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      throw new Error(
        ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD('Message content')
      );
    }
  }

  /**
   * Validate search users DTO
   */
  private validateSearchUsersDto(dto: SearchUsersDto): void {
    if (dto.limit !== undefined && (dto.limit < 1 || dto.limit > 100)) {
      throw new Error('Search limit must be between 1 and 100');
    }
    if (dto.offset !== undefined && dto.offset < 0) {
      throw new Error('Search offset must be non-negative');
    }
  }

  /**
   * Validate get messages DTO
   */
  private validateGetMessagesDto(dto: GetMessagesDto): void {
    if (dto.limit !== undefined && (dto.limit < 1 || dto.limit > 100)) {
      throw new Error('Message limit must be between 1 and 100');
    }
    if (dto.offset !== undefined && dto.offset < 0) {
      throw new Error('Message offset must be non-negative');
    }
  }

  /**
   * Validate create message DTO
   */
  private validateCreateMessageDto(dto: CreateMessageDto): void {
    if (!dto.receiverId || typeof dto.receiverId !== 'string' || dto.receiverId.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD('Receiver ID'));
    }
    this.validateMessageContent(dto.content);
  }

  /**
   * Validate mark read DTO
   */
  private validateMarkReadDto(dto: MarkReadDto): void {
    if (!dto.messageIds || !Array.isArray(dto.messageIds)) {
      throw new Error('Message IDs must be an array');
    }
    if (dto.messageIds.length === 0) {
      throw new Error('At least one message ID is required');
    }
    dto.messageIds.forEach((id, index) => {
      if (!id || typeof id !== 'string' || id.trim().length === 0) {
        throw new Error(`Invalid message ID at index ${index}`);
      }
    });
  }
}
