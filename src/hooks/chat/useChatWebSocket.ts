/**
 * Chat WebSocket Hook
 *
 * Manages WebSocket connection lifecycle and real-time events.
 * Automatically updates React Query cache when events occur.
 *
 * Features:
 * - Auto-connect on mount (when authenticated)
 * - Auto-disconnect on unmount
 * - Event handlers that update React Query cache
 * - Connection status tracking
 */

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { WebSocketService } from '@/lib/services/websocket.service';
import { useAuthStore } from '@/store/auth.store';
import { ChatMessage, ChatConversation } from '@/types/chat.types';
import { messageKeys } from './useMessages';
import { conversationKeys } from './useConversations';

interface UseChatWebSocketOptions {
  /** Whether to auto-connect (default: true) */
  enabled?: boolean;
  /** Callback when connection status changes */
  onConnectionChange?: (isConnected: boolean) => void;
}

interface UseChatWebSocketReturn {
  /** Whether WebSocket is connected */
  isConnected: boolean;
  /** Connect to WebSocket */
  connect: () => Promise<void>;
  /** Disconnect from WebSocket */
  disconnect: () => void;
  /** Join a chat room for real-time updates */
  joinChatRoom: (conversationId: string) => void;
  /** Leave a chat room */
  leaveChatRoom: (conversationId: string) => void;
  /** Send message via WebSocket (if connected) */
  sendMessage: (data: { receiverId: string; content: string }) => void;
}

export function useChatWebSocket(
  options: UseChatWebSocketOptions = {}
): UseChatWebSocketReturn {
  const { enabled = true, onConnectionChange } = options;

  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);

  const [isConnected, setIsConnected] = useState(false);
  const wsServiceRef = useRef<WebSocketService | null>(null);
  const isConnectingRef = useRef(false);

  // Connect to WebSocket
  const connect = async () => {
    if (!user || isConnectingRef.current || wsServiceRef.current) {
      return;
    }

    try {
      isConnectingRef.current = true;

      // Create WebSocket service
      const wsService = new WebSocketService();
      wsServiceRef.current = wsService;

      // Connect
      await wsService.connect();
      setIsConnected(true);
      onConnectionChange?.(true);

      // Set up event handlers
      setupEventHandlers(wsService);
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setIsConnected(false);
      onConnectionChange?.(false);
      wsServiceRef.current = null;
    } finally {
      isConnectingRef.current = false;
    }
  };

  // Disconnect from WebSocket
  const disconnect = () => {
    if (wsServiceRef.current) {
      wsServiceRef.current.disconnect();
      wsServiceRef.current = null;
      setIsConnected(false);
      onConnectionChange?.(false);
    }
  };

  // Join chat room
  const joinChatRoom = (conversationId: string) => {
    if (wsServiceRef.current?.getConnectionStatus()) {
      wsServiceRef.current.joinChat(conversationId);
    }
  };

  // Leave chat room
  const leaveChatRoom = (conversationId: string) => {
    if (wsServiceRef.current?.getConnectionStatus()) {
      wsServiceRef.current.leaveChat(conversationId);
    }
  };

  // Send message via WebSocket
  const sendMessage = (data: { receiverId: string; content: string }) => {
    if (wsServiceRef.current?.getConnectionStatus()) {
      wsServiceRef.current.sendMessage(data);
    }
  };

  // Setup event handlers
  const setupEventHandlers = (wsService: WebSocketService) => {
    // Incoming message
    wsService.onMessage((message) => {
      const msg = message as ChatMessage;

      // Get conversation ID from sender
      const senderId = msg.senderId;
      const conversationId = getConversationIdForMessage(msg);

      // Add message to cache (if conversation is loaded)
      queryClient.setQueryData<ChatMessage[]>(
        messageKeys.list(conversationId),
        (old) => {
          if (!old) return old; // Don't create cache if it doesn't exist
          return [...old, msg].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        }
      );

      // Update conversation last message and unread count
      queryClient.setQueryData<ChatConversation[]>(
        conversationKeys.lists(),
        (old = []) => {
          return old.map(conv => {
            if (conv.user.id === senderId) {
              return {
                ...conv,
                lastMessage: msg,
                updatedAt: msg.createdAt,
                unreadCount: conv.unreadCount + 1,
              };
            }
            return conv;
          });
        }
      );

      // Re-sort conversations
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    });

    // Message sent confirmation
    wsService.onMessageSent((message) => {
      const msg = message as ChatMessage;
      const conversationId = getConversationIdForMessage(msg);

      // Replace temp message with real one
      queryClient.setQueryData<ChatMessage[]>(
        messageKeys.list(conversationId),
        (old = []) => {
          // Find and replace temp message by content match
          return old
            .filter(
              m =>
                !(
                  m.id.startsWith('temp-') &&
                  m.content === msg.content &&
                  m.receiverId === msg.receiverId
                )
            )
            .concat(msg)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        }
      );

      // Update conversation
      queryClient.setQueryData<ChatConversation[]>(
        conversationKeys.lists(),
        (old = []) => {
          return old.map(conv =>
            conv.id === conversationId
              ? { ...conv, lastMessage: msg, updatedAt: msg.createdAt }
              : conv
          );
        }
      );
    });

    // User online status
    wsService.onUserOnline((data) => {
      queryClient.setQueryData<ChatConversation[]>(
        conversationKeys.lists(),
        (old = []) => {
          return old.map(conv =>
            conv.user.id === data.userId
              ? { ...conv, user: { ...conv.user, isOnline: true } }
              : conv
          );
        }
      );
    });

    // User offline status
    wsService.onUserOffline((data) => {
      queryClient.setQueryData<ChatConversation[]>(
        conversationKeys.lists(),
        (old = []) => {
          return old.map(conv =>
            conv.user.id === data.userId
              ? { ...conv, user: { ...conv.user, isOnline: false } }
              : conv
          );
        }
      );
    });

    // WebSocket error
    wsService.onError((error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
      onConnectionChange?.(false);
    });
  };

  // Helper to get conversation ID from message
  const getConversationIdForMessage = (msg: ChatMessage): string => {
    if (!user) return '';
    const userId1 = msg.senderId;
    const userId2 = msg.receiverId;
    return userId1 < userId2 ? `${userId1}__${userId2}` : `${userId2}__${userId1}`;
  };

  // Auto-connect on mount
  useEffect(() => {
    if (enabled && user) {
      connect();
    }

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, user?.id]);

  return {
    isConnected,
    connect,
    disconnect,
    joinChatRoom,
    leaveChatRoom,
    sendMessage,
  };
}
