'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useCallback, useRef } from 'react';
import { ChatList, ChatWindow } from '@/components/chat';
import { useChatStore } from '@/store/chat.store';
import { useAuthStore } from '@/store/auth.store';
import { ChatUser } from '@/types/chat.types';

/**
 * Messages Page - Main chat interface for authenticated users
 * This page provides a complete chat experience with conversation list and chat window
 *
 * 🔄 FIX: All state updates trigger automatic UI re-renders via Zustand
 * 🔄 FIX: Proper dependency arrays prevent stale closures
 * 🔄 FIX: Automatic refetch after mutations
 */
export default function MessagesPage() {
  const { user } = useAuthStore();
  const {
    selectedChat,
    messages,
    conversations,
    isLoadingMessages,
    setSelectedChat,
    setMessages,
    sendMessage,
    connect,
    disconnect,
    fetchMessages,
    fetchConversations,
    createConversation,
    joinChatRoom,
    leaveChatRoom,
    markConversationAsRead,
  } = useChatStore();

  const [showChatWindow, setShowChatWindow] = useState(false);
  const currentConversationIdRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);
  const isConnectingRef = useRef(false);

  // 🔄 FIX: Connect to WebSocket and fetch conversations on mount
  useEffect(() => {
    if (!user || isConnectingRef.current) return;

    const initializeChat = async () => {
      isConnectingRef.current = true;
      try {
        await connect();
        await fetchConversations();
        isInitializedRef.current = true;
      } catch (error) {
        console.error('Failed to initialize chat:', error);
      } finally {
        isConnectingRef.current = false;
      }
    };

    initializeChat();

    // Cleanup on unmount
    return () => {
      if (currentConversationIdRef.current) {
        leaveChatRoom(currentConversationIdRef.current);
      }
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Re-initialize if user changes

  // 🔄 FIX: Load messages for selected chat when it changes or conversations are loaded
  useEffect(() => {
    if (!selectedChat || !isInitializedRef.current) return;

    const loadChat = async () => {
      // Find the conversation
      const conversation = conversations.find(
        conv => conv.user.id === selectedChat.id
      );

      if (conversation) {
        // Leave previous chat room if switching
        if (
          currentConversationIdRef.current &&
          currentConversationIdRef.current !== conversation.id
        ) {
          leaveChatRoom(currentConversationIdRef.current);
        }

        currentConversationIdRef.current = conversation.id;
        setShowChatWindow(true);

        // Join the chat room for real-time updates
        joinChatRoom(conversation.id);

        // Load existing messages
        try {
          await fetchMessages(conversation.id);
          // Mark conversation as read when opening
          await markConversationAsRead(conversation.id);
        } catch (error) {
          console.error('Failed to load messages:', error);
          setMessages([]);
        }
      } else {
        // Conversation doesn't exist yet, clear messages
        setMessages([]);
        currentConversationIdRef.current = null;
      }
    };

    loadChat();
    // 🔄 FIX: Proper dependency array - includes all used values
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat?.id, conversations.length, isInitializedRef.current]);

  // 🔄 FIX: Memoized callback with proper dependencies to prevent stale closures
  const handleChatSelect = useCallback(
    async (chat: ChatUser) => {
      // If clicking on the same chat, do nothing
      if (selectedChat && selectedChat.id === chat.id) {
        return;
      }

      // Leave previous chat room if switching chats
      if (currentConversationIdRef.current) {
        leaveChatRoom(currentConversationIdRef.current);
        currentConversationIdRef.current = null;
      }

      // Clear messages first to avoid showing old messages
      setMessages([]);

      setSelectedChat(chat);
      setShowChatWindow(true);

      // Find or create the conversation
      let conversation = conversations.find(conv => conv.user.id === chat.id);

      if (!conversation) {
        // Create conversation if it doesn't exist
        try {
          conversation = await createConversation(chat.id);
          // 🔄 FIX: After creating, refresh conversations to ensure sync
          await fetchConversations();
          // Find again after refresh
          conversation =
            conversations.find(conv => conv.user.id === chat.id) ||
            conversation;
        } catch (error) {
          console.error('Failed to create conversation:', error);
          // Try to find it again in case it was created
          await fetchConversations();
          conversation = conversations.find(conv => conv.user.id === chat.id);
        }
      }

      if (conversation) {
        try {
          currentConversationIdRef.current = conversation.id;
          // Join the chat room for real-time updates
          joinChatRoom(conversation.id);
          // Load existing messages
          await fetchMessages(conversation.id);
          // Mark conversation as read
          await markConversationAsRead(conversation.id);
        } catch (error) {
          console.error('Failed to load messages:', error);
          setMessages([]);
        }
      }
    },
    [
      selectedChat,
      conversations,
      leaveChatRoom,
      setMessages,
      setSelectedChat,
      joinChatRoom,
      fetchMessages,
      createConversation,
      fetchConversations,
      markConversationAsRead,
    ]
  );

  const handleBackToChatList = useCallback(() => {
    // Leave the current chat room
    if (currentConversationIdRef.current) {
      leaveChatRoom(currentConversationIdRef.current);
      currentConversationIdRef.current = null;
    }

    setShowChatWindow(false);
    setSelectedChat(null);
    setMessages([]);
  }, [leaveChatRoom, setSelectedChat, setMessages]);

  // 🔄 FIX: Memoized send message handler - ensures UI updates instantly
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!selectedChat || !user || !content.trim()) return;

      try {
        // 🔄 FIX: sendMessage automatically updates UI via Zustand store
        // The store handles optimistic updates and real message replacement
        // No need to fetchConversations - the store already updates conversations
        // when a message is sent (see addMessage in chat.store.ts)
        await sendMessage({
          receiverId: selectedChat.id,
          content: content.trim(),
          senderId: user.id,
        });
        // 🔄 FIX: Don't fetch conversations after sending - this causes the
        // unread count to be reset from backend which may have stale data.
        // The local store already updates the conversation list correctly.
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    },
    [selectedChat, user, sendMessage]
  );

  return (
    <motion.div
      className="flex-1 p-4 sm:p-6 w-full bg-gradient-to-br from-blue-50/30 via-white to-yellow-50/20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Page Header */}
      <motion.div
        className="w-full max-w-7xl mx-auto mb-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
            <p className="text-gray-600 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Connect with fellow travelers
            </p>
          </div>

          {/* Online Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
            <div className="relative">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
            </div>
            <span className="text-sm font-medium text-green-700">Online</span>
          </div>
        </div>
      </motion.div>

      <div className="w-full max-w-7xl mx-auto h-[calc(100vh-12rem)]">
        <div className="flex flex-col md:flex-row gap-4 h-full">
          {/* Chat List - Left Side - Hidden on mobile when chat is open */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`w-full md:w-80 flex-shrink-0 ${
              showChatWindow ? 'hidden md:block' : 'block'
            }`}
          >
            <ChatList
              onChatSelect={handleChatSelect}
              selectedChatId={selectedChat?.id}
            />
          </motion.div>

          {/* Chat Window - Right Side - Hidden on mobile when no chat selected */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className={`flex-1 min-h-0 ${
              showChatWindow ? 'block' : 'hidden md:block'
            }`}
          >
            {selectedChat ? (
              <ChatWindow
                chat={selectedChat}
                messages={messages}
                onSendMessage={handleSendMessage}
                onBackToChatList={handleBackToChatList}
                showBackButton={showChatWindow}
                isLoading={isLoadingMessages}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden relative">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-10 right-10 w-32 h-32 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
                  <div className="absolute bottom-10 left-10 w-40 h-40 bg-yellow-100 rounded-full opacity-20 blur-3xl"></div>
                </div>

                <motion.div
                  className="text-center max-w-lg mx-auto px-6 relative z-10"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Animated Icon */}
                  <motion.div
                    className="relative w-32 h-32 mx-auto mb-8"
                    initial={{ rotate: -10 }}
                    animate={{ rotate: 0 }}
                    transition={{ duration: 0.8, type: 'spring' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-yellow-500/20 rounded-3xl rotate-6"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl flex items-center justify-center shadow-xl">
                      <svg
                        className="w-16 h-16 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    {/* Floating elements */}
                    <motion.div
                      className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full shadow-lg"
                      animate={{
                        y: [0, -10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                    <motion.div
                      className="absolute -bottom-1 -left-1 w-6 h-6 bg-blue-300 rounded-full shadow-lg"
                      animate={{
                        y: [0, 8, 0],
                        scale: [1, 1.15, 1],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 0.5,
                      }}
                    />
                  </motion.div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Welcome to Your Travel Network
                  </h3>
                  <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                    Connect with fellow explorers, share travel tips, and plan
                    adventures together.
                  </p>

                  {/* Feature Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-left">
                      <div className="w-10 h-10 bg-[#001A6E] rounded-lg flex items-center justify-center mb-3">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Start Conversations
                      </h4>
                      <p className="text-sm text-gray-600">
                        Visit profiles to connect with travelers
                      </p>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-left">
                      <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center mb-3">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Instant Messaging
                      </h4>
                      <p className="text-sm text-gray-600">
                        Real-time chat with your network
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Ready to chat • Select a conversation to begin</span>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
