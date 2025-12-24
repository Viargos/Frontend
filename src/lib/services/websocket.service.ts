/**
 * WebSocket Service - Migrated Version
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Handles only WebSocket connection and messaging
 * - Open/Closed: Open for extension through event listeners, closed for modification
 * - Liskov Substitution: Implements WebSocketService correctly
 * - Interface Segregation: Minimal dependencies (Socket.io client only)
 * - Dependency Inversion: Depends on Socket.io abstractions
 *
 * Improvements:
 * - Centralized error messages (ERROR_MESSAGES)
 * - Structured logging with logger (replaced 22 console.log statements)
 * - Better error handling with ErrorHandler
 * - Type-safe implementations (removed `any` type)
 * - Event tracking for analytics
 * - Input validation for better error messages
 */

import { io, Socket } from 'socket.io-client';
import { logger } from '@/utils/logger';
import { ErrorHandler } from '@/utils/error-handler';
import { ERROR_MESSAGES } from '@/constants';

/**
 * WebSocket message data
 */
interface WebSocketMessageData {
  receiverId: string;
  content: string;
}

/**
 * WebSocket acknowledgment response
 */
interface WebSocketAckResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * User online/offline data
 */
interface UserStatusData {
  userId: string;
  isOnline: boolean;
  lastSeen?: string;
}

/**
 * Typing event data
 */
interface TypingData {
  conversationId: string;
  userId?: string;
}

export class WebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(private token: string) {
    logger.debug('WebSocketService instance created', {
      hasToken: !!token,
    });
    this.validateToken(token);
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Connect to the /chat namespace on the backend
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';
        const chatNamespace = `${wsUrl}/chat`;

        logger.info('WebSocket connecting', {
          namespace: chatNamespace,
          hasToken: !!this.token,
        });

        this.socket = io(chatNamespace, {
          auth: {
            token: this.token,
          },
          transports: ['websocket', 'polling'],
        });

        this.socket.on('connect', () => {
          logger.info('WebSocket connected successfully', {
            socketId: this.socket?.id,
          });
          logger.trackEvent('websocket_connected', {
            socketId: this.socket?.id,
          });
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        });

        // Set a timeout to resolve even if connection doesn't succeed immediately
        setTimeout(() => {
          if (!this.isConnected) {
            logger.warn('WebSocket connection timeout, continuing without WebSocket');
            resolve();
          }
        }, 5000);

        this.socket.on('disconnect', () => {
          logger.info('WebSocket disconnected');
          logger.trackEvent('websocket_disconnected');
          this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
          logger.error('WebSocket connection error', error as Error);
          this.isConnected = false;
          logger.warn('WebSocket connection failed, will retry', {
            reconnectAttempts: this.reconnectAttempts,
          });
        });

        this.socket.on('reconnect', () => {
          logger.info('WebSocket reconnected successfully');
          logger.trackEvent('websocket_reconnected', {
            previousAttempts: this.reconnectAttempts,
          });
          this.isConnected = true;
          this.reconnectAttempts = 0;
        });

        this.socket.on('reconnect_error', (error) => {
          logger.error('WebSocket reconnection error', error as Error, {
            reconnectAttempts: this.reconnectAttempts,
          });
          this.reconnectAttempts++;
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            logger.error('Max WebSocket reconnection attempts reached', {
              maxAttempts: this.maxReconnectAttempts,
            });
            logger.trackEvent('websocket_max_reconnect_failed');
          }
        });
      } catch (error) {
        logger.error('Failed to create WebSocket connection', error as Error);
        reject(
          new Error(
            ErrorHandler.extractMessage(error) ||
            ERROR_MESSAGES.CHAT.CONNECTION_FAILED
          )
        );
      }
    });
  }

  disconnect(): void {
    logger.info('Disconnecting WebSocket', {
      wasConnected: this.isConnected,
    });

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      logger.trackEvent('websocket_disconnected_manually');
    }
  }

  sendMessage(data: WebSocketMessageData): void {
    logger.debug('Sending WebSocket message', {
      receiverId: data.receiverId,
      hasContent: !!data.content,
    });

    if (!this.socket || !this.isConnected) {
      const error = ERROR_MESSAGES.CHAT.CONNECTION_FAILED;
      logger.error(error);
      throw new Error(error);
    }

    try {
      this.validateMessageData(data);

      this.socket.emit('sendMessage', data, (response: WebSocketAckResponse) => {
        if (response.success) {
          logger.info('WebSocket message sent successfully', {
            messageId: response.messageId,
            receiverId: data.receiverId,
          });
          logger.trackEvent('websocket_message_sent', {
            messageId: response.messageId,
          });
        } else {
          logger.error('WebSocket message send failed', {
            error: response.error,
            receiverId: data.receiverId,
          });
        }
      });
    } catch (error) {
      logger.error('Failed to send WebSocket message', error as Error, { data });
      throw new Error(
        ErrorHandler.extractMessage(error) ||
        ERROR_MESSAGES.CHAT.SEND_MESSAGE_FAILED
      );
    }
  }

  joinChat(conversationId: string): void {
    logger.debug('Joining chat conversation', { conversationId });

    if (!this.socket || !this.isConnected) {
      const error = ERROR_MESSAGES.CHAT.CONNECTION_FAILED;
      logger.error(error);
      throw new Error(error);
    }

    try {
      this.validateConversationId(conversationId);

      this.socket.emit('join_chat', { conversationId });

      logger.info('Joined chat conversation', { conversationId });
      logger.trackEvent('websocket_chat_joined', { conversationId });
    } catch (error) {
      logger.error('Failed to join chat', error as Error, { conversationId });
      throw new Error(
        ErrorHandler.extractMessage(error) ||
        ERROR_MESSAGES.CHAT.CONNECTION_FAILED
      );
    }
  }

  leaveChat(conversationId: string): void {
    logger.debug('Leaving chat conversation', { conversationId });

    if (!this.socket || !this.isConnected) {
      const error = ERROR_MESSAGES.CHAT.CONNECTION_FAILED;
      logger.error(error);
      throw new Error(error);
    }

    try {
      this.validateConversationId(conversationId);

      this.socket.emit('leave_chat', { conversationId });

      logger.info('Left chat conversation', { conversationId });
      logger.trackEvent('websocket_chat_left', { conversationId });
    } catch (error) {
      logger.error('Failed to leave chat', error as Error, { conversationId });
      throw new Error(
        ErrorHandler.extractMessage(error) ||
        ERROR_MESSAGES.CHAT.CONNECTION_FAILED
      );
    }
  }

  onMessage(callback: (message: Record<string, unknown>) => void): void {
    logger.debug('Setting up newMessage listener');

    if (!this.socket) {
      logger.warn('Cannot set onMessage listener - socket not initialized');
      return;
    }

    logger.debug('Registering newMessage event listener');

    this.socket.on('newMessage', (message) => {
      logger.info('New message received', {
        messageId: (message as Record<string, unknown>)?.id,
      });
      callback(message as Record<string, unknown>);
    });

    logger.debug('newMessage event listener registered successfully');
  }

  onMessageSent(callback: (message: Record<string, unknown>) => void): void {
    logger.debug('Setting up messageSent listener');

    if (!this.socket) {
      logger.warn('Cannot set onMessageSent listener - socket not initialized');
      return;
    }

    this.socket.on('messageSent', (message) => {
      logger.debug('Message sent event received');
      callback(message as Record<string, unknown>);
    });
  }

  onError(callback: (error: Error) => void): void {
    logger.debug('Setting up error listener');

    if (!this.socket) {
      logger.warn('Cannot set onError listener - socket not initialized');
      return;
    }

    this.socket.on('error', (error) => {
      logger.error('WebSocket error event received', error as Error);
      callback(error as Error);
    });
  }

  onUserOnline(callback: (data: UserStatusData) => void): void {
    logger.debug('Setting up userOnline listener');

    if (!this.socket) {
      logger.warn('Cannot set onUserOnline listener - socket not initialized');
      return;
    }

    this.socket.on('userOnline', (data) => {
      logger.info('User came online', {
        userId: (data as UserStatusData)?.userId,
      });
      callback(data as UserStatusData);
    });
  }

  onUserOffline(callback: (data: UserStatusData) => void): void {
    logger.debug('Setting up userOffline listener');

    if (!this.socket) {
      logger.warn('Cannot set onUserOffline listener - socket not initialized');
      return;
    }

    this.socket.on('userOffline', (data) => {
      logger.info('User went offline', {
        userId: (data as UserStatusData)?.userId,
      });
      callback(data as UserStatusData);
    });
  }

  onTypingStart(callback: (data: TypingData) => void): void {
    logger.debug('Setting up typing_start listener');

    if (!this.socket) {
      logger.warn('Cannot set onTypingStart listener - socket not initialized');
      return;
    }

    this.socket.on('typing_start', (data) => {
      logger.debug('User started typing', {
        conversationId: (data as TypingData)?.conversationId,
      });
      callback(data as TypingData);
    });
  }

  onTypingStop(callback: (data: TypingData) => void): void {
    logger.debug('Setting up typing_stop listener');

    if (!this.socket) {
      logger.warn('Cannot set onTypingStop listener - socket not initialized');
      return;
    }

    this.socket.on('typing_stop', (data) => {
      logger.debug('User stopped typing', {
        conversationId: (data as TypingData)?.conversationId,
      });
      callback(data as TypingData);
    });
  }

  sendTypingStart(conversationId: string): void {
    if (!this.socket || !this.isConnected) {
      logger.warn('Cannot send typing_start - not connected');
      return;
    }

    try {
      this.validateConversationId(conversationId);
      this.socket.emit('typing_start', { conversationId });
      logger.debug('Sent typing_start event', { conversationId });
    } catch (error) {
      logger.error('Failed to send typing_start', error as Error, {
        conversationId,
      });
    }
  }

  sendTypingStop(conversationId: string): void {
    if (!this.socket || !this.isConnected) {
      logger.warn('Cannot send typing_stop - not connected');
      return;
    }

    try {
      this.validateConversationId(conversationId);
      this.socket.emit('typing_stop', { conversationId });
      logger.debug('Sent typing_stop event', { conversationId });
    } catch (error) {
      logger.error('Failed to send typing_stop', error as Error, {
        conversationId,
      });
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // ========================================
  // Private Validation Methods (SRP)
  // ========================================

  /**
   * Validate token
   */
  private validateToken(token: string): void {
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD('Token'));
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
   * Validate message data
   */
  private validateMessageData(data: WebSocketMessageData): void {
    if (!data.receiverId || typeof data.receiverId !== 'string') {
      throw new Error(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD('Receiver ID'));
    }
    if (!data.content || typeof data.content !== 'string' || data.content.trim().length === 0) {
      throw new Error(
        ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD('Message content')
      );
    }
  }
}
