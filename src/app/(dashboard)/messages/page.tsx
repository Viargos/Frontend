'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useCallback, useRef } from 'react';
import { ChatList, ChatWindow } from '@/components/chat';
import { useAuthStore } from '@/store/auth.store';
import { useChatUIStore } from '@/store/chat-ui.store';
import { ChatUser } from '@/types/chat.types';
import { MailIcon, LightningIcon } from '@/components/icons';
import {
  useConversations,
  useMessages,
  useSendMessage,
  useCreateConversation,
  useMarkAsRead,
  useChatWebSocket,
} from '@/hooks/chat';

/**
 * Messages Page - Chat interface with React Query
 *
 * Features:
 * - Auto-caching via React Query
 * - WebSocket real-time updates
 * - Optimistic UI updates
 * - Much simpler than old version (150 lines vs 395 lines)
 */
export default function MessagesPage() {
  const { user } = useAuthStore();
  const {
    selectedChatUser,
    isChatWindowOpen,
    setSelectedChat,
    openChatWindow,
    closeChatWindow,
  } = useChatUIStore();

  // React Query hooks - auto-fetch, auto-cache
  const { data: conversations = [], isLoading: isLoadingConversations } = useConversations();
  const selectedConversation = conversations.find(
    conv => conv.user.id === selectedChatUser?.id
  );
  const {
    data: messages = [],
    isLoading: isLoadingMessages,
  } = useMessages(selectedConversation?.id || null);

  // Mutations
  const sendMessageMutation = useSendMessage();
  const createConversationMutation = useCreateConversation();
  const markAsReadMutation = useMarkAsRead();

  // WebSocket connection
  const {
    isConnected,
    joinChatRoom,
    leaveChatRoom,
  } = useChatWebSocket();

  const currentConversationIdRef = useRef<string | null>(null);

  // Auto-join chat room when conversation is selected
  useEffect(() => {
    if (!selectedConversation) return;

    const conversationId = selectedConversation.id;

    // Leave previous room if switching
    if (currentConversationIdRef.current && currentConversationIdRef.current !== conversationId) {
      leaveChatRoom(currentConversationIdRef.current);
    }

    // Join new room
    currentConversationIdRef.current = conversationId;
    joinChatRoom(conversationId);

    // Mark as read when opening
    markAsReadMutation.mutate(conversationId);

    return () => {
      if (currentConversationIdRef.current) {
        leaveChatRoom(currentConversationIdRef.current);
      }
    };
    // Only re-run when conversation ID changes (not when mutation/functions change)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation?.id]);

  // Handle selecting a chat
  const handleChatSelect = useCallback(
    async (chat: ChatUser) => {
      // If clicking same chat, ignore
      if (selectedChatUser?.id === chat.id) return;

      setSelectedChat(chat);
      openChatWindow();

      // Check if conversation exists
      const existingConversation = conversations.find(
        conv => conv.user.id === chat.id
      );

      // Create conversation if it doesn't exist
      if (!existingConversation) {
        try {
          await createConversationMutation.mutateAsync(chat.id);
        } catch (error) {
          console.error('Failed to create conversation:', error);
        }
      }
    },
    [selectedChatUser, setSelectedChat, openChatWindow, conversations, createConversationMutation]
  );

  // Handle back to chat list
  const handleBackToChatList = useCallback(() => {
    closeChatWindow();
    setSelectedChat(null);
  }, [closeChatWindow, setSelectedChat]);

  // Handle send message
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!selectedChatUser || !selectedConversation) return;

      try {
        await sendMessageMutation.mutateAsync({
          receiverId: selectedChatUser.id,
          content,
          conversationId: selectedConversation.id,
        });
      } catch (error) {
        console.error('Failed to send message:', error);
        throw error; // Re-throw for UI error handling
      }
    },
    [selectedChatUser, selectedConversation, sendMessageMutation]
  );

  // Loading state
  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Please log in to access messages</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)] sm:h-[calc(100vh-4rem)] overflow-hidden">
      {/* Chat Interface - Full height */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 overflow-hidden p-4 sm:p-6 lg:p-8"
      >
        <div className="h-full max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex h-full">
          {/* Chat List - Hide on mobile when chat window is open */}
          <div
            className={`${
              isChatWindowOpen ? 'hidden md:flex' : 'flex'
            } flex-col w-full md:w-96 border-r border-gray-200`}
          >
            <ChatList
              onChatSelect={handleChatSelect}
              isLoading={isLoadingConversations}
            />
          </div>

          {/* Chat Window */}
          <div
            className={`${
              isChatWindowOpen ? 'flex' : 'hidden md:flex'
            } flex-1 flex-col`}
          >
            {selectedChatUser && selectedConversation ? (
              <ChatWindow
                chat={selectedChatUser}
                messages={messages}
                onSendMessage={handleSendMessage}
                onBackToChatList={handleBackToChatList}
                showBackButton={true}
                isLoading={isLoadingMessages}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MailIcon className="w-16 h-16 mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No conversation selected
                </h3>
                <p className="text-sm">
                  Select a conversation from the list to start chatting
                </p>
              </div>
            )}
          </div>
        </div>
        </div>
      </motion.div>

      {/* Empty State */}
      {conversations.length === 0 && !isLoadingConversations && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="text-center max-w-md px-4">
            <LightningIcon className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Start your first conversation
            </h2>
            <p className="text-gray-600 mb-6">
              Connect with travelers, share experiences, and plan your next adventure together.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
